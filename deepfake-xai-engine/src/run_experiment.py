"""
run_experiment.py
------------------
Main entry point for the "Explanation Faithfulness Under Distribution Shift"
experiment.

WHAT IT DOES
1. Loads all generators found under data/<generator_name>/real|fake/
2. Trains SimpleDetector on ONE source generator
3. Evaluates accuracy + Grad-CAM faithfulness on:
     - the source generator itself (in-distribution, ID)
     - every OTHER generator (out-of-distribution, OOD)
4. Computes, for every (source -> target) pair:
     - Cross-Generator Faithfulness Drop (CGFD)
     - Faithfulness-Accuracy Decoupling Index (FADI)
5. Saves:
     - outputs/results.csv                 (all raw numbers)
     - outputs/cgfd_matrix.png             (heatmap)
     - outputs/fadi_matrix.png             (heatmap)
     - outputs/gradcam_samples/*.png       (example explanations per generator)
     - outputs/summary.txt                 (human-readable summary)

USAGE
    python src/run_experiment.py --source StyleGAN2
    python src/run_experiment.py --source StyleGAN2 --epochs 8 --n_eval 40
    python src/run_experiment.py --all_as_source     # repeats the whole study
                                                       # once per generator as source
"""

import os
import sys
import argparse
import json
import numpy as np
import torch
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

sys.path.append(os.path.dirname(__file__))
from dataset import build_generator_datasets, list_generators
from model import build_model
from gradcam import GradCAM
from train import train_detector
from faithfulness import (
    evaluate_faithfulness_on_dataset,
    cross_generator_faithfulness_drop,
    faithfulness_accuracy_decoupling_index,
)

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_ROOT = os.path.join(ROOT, "data")
OUT_ROOT = os.path.join(ROOT, "outputs")


def save_gradcam_examples(model, gradcam, dataset, gen_name, device, n=3):
    os.makedirs(os.path.join(OUT_ROOT, "gradcam_samples"), exist_ok=True)
    model.eval()
    idxs = np.random.default_rng(0).choice(len(dataset), size=min(n, len(dataset)), replace=False)
    for i in idxs:
        img, label, path = dataset[i]
        cam, pred_class, probs = gradcam(img.unsqueeze(0).to(device), class_idx=None)
        cam_np = cam[0].cpu().numpy()

        img_np = img.permute(1, 2, 0).numpy()
        fig, axes = plt.subplots(1, 2, figsize=(4, 2))
        axes[0].imshow(img_np); axes[0].set_title("input", fontsize=8); axes[0].axis("off")
        axes[1].imshow(img_np); axes[1].imshow(cam_np, cmap="jet", alpha=0.5)
        pred_label = "fake" if pred_class.item() == 1 else "real"
        true_label = "fake" if label.item() == 1 else "real"
        axes[1].set_title(f"pred={pred_label} true={true_label}", fontsize=8)
        axes[1].axis("off")
        fname = f"{gen_name}_{os.path.basename(path)}.png"
        plt.tight_layout()
        plt.savefig(os.path.join(OUT_ROOT, "gradcam_samples", fname), dpi=120)
        plt.close(fig)


def run_single_source_study(source_gen, datasets, device, epochs, n_eval, img_size,
                             backbone="efficientnet_b0", pretrained=True, freeze_backbone=False):
    """Train on `source_gen`, evaluate faithfulness/accuracy on every generator."""
    print(f"\n{'='*70}\nTRAINING SOURCE GENERATOR: {source_gen}  (backbone={backbone})\n{'='*70}")

    model = build_model(backbone=backbone, pretrained=pretrained, freeze_backbone=freeze_backbone).to(device)
    train_detector(model, [datasets[source_gen]], device, epochs=epochs)

    gradcam = GradCAM(model, model.get_last_conv_module())

    per_generator_results = {}
    for gen_name, ds in datasets.items():
        print(f"  Evaluating on generator: {gen_name} "
              f"({'ID' if gen_name == source_gen else 'OOD'})")
        res = evaluate_faithfulness_on_dataset(model, gradcam, ds, device, n_samples=n_eval)
        res["is_source"] = (gen_name == source_gen)
        per_generator_results[gen_name] = res
        save_gradcam_examples(model, gradcam, ds, gen_name, device, n=2)

    gradcam.remove_hooks()
    return per_generator_results


def compute_pairwise_metrics(source_gen, per_generator_results):
    """Builds CGFD & FADI for (source_gen -> every other generator)."""
    src_f = per_generator_results[source_gen]["faithfulness"]
    src_acc = per_generator_results[source_gen]["accuracy"]

    pairs = []
    for target_gen, res in per_generator_results.items():
        if target_gen == source_gen:
            continue
        cgfd = cross_generator_faithfulness_drop(src_f, res["faithfulness"])
        acc_drop = src_acc - res["accuracy"]
        pairs.append({
            "source": source_gen,
            "target": target_gen,
            "src_faithfulness": src_f,
            "target_faithfulness": res["faithfulness"],
            "CGFD": cgfd,
            "src_accuracy": src_acc,
            "target_accuracy": res["accuracy"],
            "accuracy_drop": acc_drop,
        })

    all_cgfd = [p["CGFD"] for p in pairs]
    all_accd = [p["accuracy_drop"] for p in pairs]
    for p in pairs:
        p["FADI"] = faithfulness_accuracy_decoupling_index(all_cgfd, all_accd, p["CGFD"], p["accuracy_drop"])
    return pairs


def plot_matrix(values_dict, generators, title, fname, cmap="RdYlGn_r"):
    """values_dict: {(src, tgt): value}"""
    n = len(generators)
    mat = np.full((n, n), np.nan)
    for i, src in enumerate(generators):
        for j, tgt in enumerate(generators):
            if (src, tgt) in values_dict:
                mat[i, j] = values_dict[(src, tgt)]

    fig, ax = plt.subplots(figsize=(1.4 * n + 2, 1.2 * n + 2))
    im = ax.imshow(mat, cmap=cmap)
    ax.set_xticks(range(n)); ax.set_xticklabels(generators, rotation=45, ha="right")
    ax.set_yticks(range(n)); ax.set_yticklabels(generators)
    ax.set_xlabel("Target generator (test)")
    ax.set_ylabel("Source generator (train)")
    ax.set_title(title)
    for i in range(n):
        for j in range(n):
            if not np.isnan(mat[i, j]):
                ax.text(j, i, f"{mat[i,j]:.2f}", ha="center", va="center", fontsize=9)
    fig.colorbar(im, ax=ax, shrink=0.8)
    plt.tight_layout()
    plt.savefig(fname, dpi=130)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=str, default=None,
                         help="Generator name to train on. If omitted, uses the first found.")
    parser.add_argument("--all_as_source", action="store_true",
                         help="Repeat the study once per generator as source, building the full matrix.")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--n_eval", type=int, default=30, help="images sampled per generator for faithfulness eval")
    parser.add_argument("--img_size", type=int, default=64)
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--backbone", type=str, default="efficientnet_b0", choices=["simple", "efficientnet_b0"],
                         help="'simple' = fast toy CNN (any image size). "
                              "'efficientnet_b0' = real pretrained backbone, recommended for real datasets.")
    parser.add_argument("--no_pretrained", action="store_true",
                         help="Train efficientnet_b0 from random init instead of ImageNet weights "
                              "(use this if you have no internet access, e.g. an offline sandbox).")
    parser.add_argument("--freeze_backbone", action="store_true",
                         help="Only train the classification head on top of efficientnet_b0 (faster, "
                              "needs less data; good default for small real datasets).")
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)

    os.makedirs(OUT_ROOT, exist_ok=True)

    generators = list_generators(DATA_ROOT)
    if not generators:
        print(f"ERROR: no generators found under {DATA_ROOT}. "
              f"Expected data/<generator_name>/real/ and data/<generator_name>/fake/. "
              f"Run generate_synthetic_data.py first, or add your real dataset.")
        sys.exit(1)
    print("Found generators:", generators)

    datasets = build_generator_datasets(DATA_ROOT, img_size=args.img_size)

    sources = generators if args.all_as_source else [args.source or generators[0]]

    all_rows = []
    all_pairs = []
    cgfd_map, fadi_map = {}, {}

    for source_gen in sources:
        per_gen_results = run_single_source_study(
            source_gen, datasets, device, args.epochs, args.n_eval, args.img_size,
            backbone=args.backbone, pretrained=not args.no_pretrained, freeze_backbone=args.freeze_backbone
        )

        for gen_name, res in per_gen_results.items():
            all_rows.append({
                "source": source_gen,
                "evaluated_on": gen_name,
                "is_source": res["is_source"],
                "accuracy": res["accuracy"],
                "faithfulness": res["faithfulness"],
                "n_eval": res["n_eval"],
            })

        pairs = compute_pairwise_metrics(source_gen, per_gen_results)
        all_pairs.extend(pairs)
        for p in pairs:
            cgfd_map[(p["source"], p["target"])] = p["CGFD"]
            fadi_map[(p["source"], p["target"])] = p["FADI"]

    # ---------------- Save raw results CSV ----------------
    import csv
    with open(os.path.join(OUT_ROOT, "results_per_generator.csv"), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
        writer.writeheader()
        writer.writerows(all_rows)

    with open(os.path.join(OUT_ROOT, "results_pairwise_CGFD_FADI.csv"), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(all_pairs[0].keys()))
        writer.writeheader()
        writer.writerows(all_pairs)

    # ---------------- Save matrices (only meaningful if --all_as_source) ----------------
    if args.all_as_source:
        plot_matrix(cgfd_map, generators, "Cross-Generator Faithfulness Drop (CGFD)\n(higher = faithfulness collapses more)",
                    os.path.join(OUT_ROOT, "cgfd_matrix.png"))
        plot_matrix(fadi_map, generators, "Faithfulness-Accuracy Decoupling Index (FADI)\n(higher = model right for wrong reasons)",
                    os.path.join(OUT_ROOT, "fadi_matrix.png"))

    # ---------------- Human-readable summary ----------------
    lines = []
    lines.append("EXPLANATION FAITHFULNESS UNDER DISTRIBUTION SHIFT -- RESULTS SUMMARY")
    lines.append("=" * 70)
    for p in all_pairs:
        lines.append(
            f"{p['source']:>16s} -> {p['target']:<16s} | "
            f"Acc: {p['src_accuracy']:.2f} -> {p['target_accuracy']:.2f} "
            f"(drop {p['accuracy_drop']:+.2f})  |  "
            f"Faithfulness: {p['src_faithfulness']:.2f} -> {p['target_faithfulness']:.2f} "
            f"(CGFD {p['CGFD']:+.2f})  |  FADI {p['FADI']:+.2f}"
        )
    summary_text = "\n".join(lines)
    print("\n" + summary_text)
    with open(os.path.join(OUT_ROOT, "summary.txt"), "w") as f:
        f.write(summary_text)

    print(f"\nAll outputs saved under: {OUT_ROOT}")


if __name__ == "__main__":
    main()
