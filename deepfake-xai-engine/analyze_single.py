#!/usr/bin/env python3
"""
analyze_single.py
-----------------
Live single-image Deepfake + Grad-CAM + Deletion/Insertion Faithfulness analyzer
for TRINETRA Panel 11 (Explanation Faithfulness XAI Lab).

Trains (or loads cached checkpoint) on the chosen source generator, runs Grad-CAM,
computes Deletion AUC, Insertion AUC, and Composite Faithfulness F(x), and emits
a JSON payload with base64 heatmap overlays + probability curves.
"""

import argparse
import base64
import io
import json
import os
import sys

import matplotlib
matplotlib.use("Agg")
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
import torchvision.transforms as T

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "src"))

from dataset import DeepfakeDataset, list_generators
from model import build_model
from gradcam import GradCAM
from train import train_detector
from faithfulness import _predict_prob, _ranked_pixel_order, composite_faithfulness


def deletion_insertion_with_curves(model, img, cam, class_idx, device, n_steps=10, baseline_value=0.0):
    H, W = cam.shape
    n_pixels = H * W
    order = _ranked_pixel_order(cam)
    step_size = max(1, n_pixels // n_steps)

    img = img.to(device)
    cls = class_idx.view(1).to(device)

    del_img = img.clone()
    del_probs = [_predict_prob(model, del_img.unsqueeze(0), cls).item()]
    flat_del = del_img.view(3, -1)
    for step in range(0, n_pixels, step_size):
        idx = order[step:step + step_size]
        flat_del[:, idx] = baseline_value
        del_probs.append(_predict_prob(model, flat_del.view(3, H, W).unsqueeze(0), cls).item())

    ins_img = torch.full_like(img, baseline_value)
    ins_probs = [_predict_prob(model, ins_img.unsqueeze(0), cls).item()]
    flat_ins = ins_img.view(3, -1)
    flat_orig = img.view(3, -1)
    for step in range(0, n_pixels, step_size):
        idx = order[step:step + step_size]
        flat_ins[:, idx] = flat_orig[:, idx]
        ins_probs.append(_predict_prob(model, flat_ins.view(3, H, W).unsqueeze(0), cls).item())

    _trapz = getattr(np, "trapezoid", None) or np.trapz
    deletion_auc = float(_trapz(del_probs) / max(1, len(del_probs) - 1))
    insertion_auc = float(_trapz(ins_probs) / max(1, len(ins_probs) - 1))
    return deletion_auc, insertion_auc, del_probs, ins_probs


def tensor_to_png_base64(arr_uint8):
    buf = io.BytesIO()
    Image.fromarray(arr_uint8).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True, help="Path to image file to inspect")
    parser.add_argument("--source", type=str, default="StyleGAN2")
    parser.add_argument("--backbone", type=str, default="simple", choices=["simple", "efficientnet_b0"])
    parser.add_argument("--img_size", type=int, default=64)
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--n_steps", type=int, default=10)
    parser.add_argument("--no_pretrained", action="store_true")
    parser.add_argument("--freeze_backbone", action="store_true")
    args = parser.parse_args()

    torch.manual_seed(0)
    np.random.seed(0)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    data_root = os.path.join(ROOT, "data")
    ckpt_dir = os.path.join(ROOT, "outputs", "checkpoints")
    os.makedirs(ckpt_dir, exist_ok=True)

    generators = list_generators(data_root)
    if args.source not in generators:
        raise ValueError(f"Unknown source '{args.source}'. Available: {generators}")

    ckpt_tag = f"{args.source}_{args.backbone}_{args.img_size}_pt{0 if args.no_pretrained else 1}_fz{1 if args.freeze_backbone else 0}.pt"
    ckpt_path = os.path.join(ckpt_dir, ckpt_tag)

    model = build_model(
        backbone=args.backbone,
        pretrained=not args.no_pretrained,
        freeze_backbone=args.freeze_backbone,
    ).to(device)

    trained_from_cache = False
    if os.path.isfile(ckpt_path):
        state = torch.load(ckpt_path, map_location=device, weights_only=True)
        model.load_state_dict(state)
        trained_from_cache = True
    else:
        ds = DeepfakeDataset(os.path.join(data_root, args.source), img_size=args.img_size)
        train_detector(model, [ds], device, epochs=args.epochs, verbose=False)
        torch.save(model.state_dict(), ckpt_path)

    model.eval()
    pil_img = Image.open(args.image).convert("RGB")
    tfm = T.Compose([T.Resize((args.img_size, args.img_size)), T.ToTensor()])
    img_tensor = tfm(pil_img)

    gradcam = GradCAM(model, model.get_last_conv_module())
    cam, pred_class, probs = gradcam(img_tensor.unsqueeze(0).to(device), class_idx=None)
    gradcam.remove_hooks()

    cam_np = cam[0].cpu().numpy()
    pred_idx = int(pred_class.item())
    prob_real = float(probs[0, 0].item())
    prob_fake = float(probs[0, 1].item())

    del_auc, ins_auc, del_curve, ins_curve = deletion_insertion_with_curves(
        model, img_tensor, cam[0].cpu(), pred_class[0].cpu(), device, n_steps=args.n_steps
    )
    f_score = float(composite_faithfulness(del_auc, ins_auc))

    # Build crisp upscaled visual previews (256x256)
    vis_size = 256
    orig_vis = np.array(pil_img.resize((vis_size, vis_size), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0
    cam_pil = Image.fromarray((np.clip(cam_np, 0, 1) * 255).astype(np.uint8)).resize(
        (vis_size, vis_size), Image.Resampling.BILINEAR
    )
    cam_up = np.array(cam_pil, dtype=np.float32) / 255.0
    jet_rgba = matplotlib.colormaps["jet"](cam_up)
    jet_rgb = jet_rgba[:, :, :3]
    overlay = np.clip(0.55 * orig_vis + 0.45 * jet_rgb, 0, 1)

    result = {
        "source_model": args.source,
        "backbone": args.backbone,
        "img_size": args.img_size,
        "trained_from_cache": trained_from_cache,
        "prediction": "FAKE" if pred_idx == 1 else "REAL",
        "pred_class": pred_idx,
        "prob_real": round(prob_real, 4),
        "prob_fake": round(prob_fake, 4),
        "confidence": round(max(prob_real, prob_fake), 4),
        "deletion_auc": round(del_auc, 4),
        "insertion_auc": round(ins_auc, 4),
        "composite_faithfulness": round(f_score, 4),
        "deletion_curve": [round(float(x), 4) for x in del_curve],
        "insertion_curve": [round(float(x), 4) for x in ins_curve],
        "input_image": tensor_to_png_base64((orig_vis * 255).astype(np.uint8)),
        "heatmap_image": tensor_to_png_base64((jet_rgb * 255).astype(np.uint8)),
        "overlay_image": tensor_to_png_base64((overlay * 255).astype(np.uint8)),
        "cam_stats": {
            "mean_activation": round(float(np.mean(cam_np)), 4),
            "peak_activation": round(float(np.max(cam_np)), 4),
            "high_saliency_ratio": round(float(np.mean(cam_np > 0.5)), 4),
        },
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
