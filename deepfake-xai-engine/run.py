#!/usr/bin/env python3
"""
run.py
------
Single entry point for the whole pipeline. This is the ONLY script you
need to run.

USAGE
    python run.py                          # full study, all generators as source
    python run.py --source StyleGAN2       # train on one generator only
    python run.py --epochs 10 --n_eval 40  # override config.py defaults

If data/ is empty or missing, this script AUTOMATICALLY generates the
bundled synthetic demo dataset first, so this always runs end-to-end
with zero setup required.
"""

import os
import sys
import argparse

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "src"))

from config import CONFIG


def data_is_ready(data_root):
    if not os.path.isdir(data_root):
        return False
    for name in os.listdir(data_root):
        gen_path = os.path.join(data_root, name)
        if os.path.isdir(os.path.join(gen_path, "real")) and os.path.isdir(os.path.join(gen_path, "fake")):
            return True
    return False


def main():
    parser = argparse.ArgumentParser(description="Explanation Faithfulness Under Distribution Shift")
    parser.add_argument("--source", type=str, default=None,
                         help="Train on this generator only. If omitted, runs the full "
                              "cross-generator study (every generator as source).")
    parser.add_argument("--epochs", type=int, default=CONFIG.epochs)
    parser.add_argument("--n_eval", type=int, default=CONFIG.n_eval)
    parser.add_argument("--img_size", type=int, default=CONFIG.img_size)
    parser.add_argument("--seed", type=int, default=CONFIG.seed)
    parser.add_argument("--backbone", type=str, default=CONFIG.backbone, choices=["simple", "efficientnet_b0"],
                         help="'simple' = fast toy CNN. 'efficientnet_b0' = real pretrained backbone "
                              "(recommended for real datasets; default).")
    parser.add_argument("--no_pretrained", action="store_true",
                         help="Train efficientnet_b0 from random init (use if you have no internet access).")
    parser.add_argument("--freeze_backbone", action="store_true", default=CONFIG.freeze_backbone,
                         help="Only train the classification head on top of efficientnet_b0.")
    parser.add_argument("--skip_data_check", action="store_true",
                         help="Skip auto-generation of demo data even if data/ is empty.")
    args = parser.parse_args()

    data_root = os.path.join(ROOT, CONFIG.data_root)

    if not args.skip_data_check and not data_is_ready(data_root):
        print(f"[run.py] No dataset found under '{CONFIG.data_root}/'. "
              f"Generating the bundled synthetic demo dataset automatically...\n")
        import generate_synthetic_data
        generate_synthetic_data.main()
        print()

    # Delegate to the main experiment script with the resolved arguments
    from run_experiment import main as run_experiment_main
    sys.argv = ["run_experiment.py"]
    if args.source:
        sys.argv += ["--source", args.source]
    else:
        sys.argv += ["--all_as_source"]
    sys.argv += [
        "--epochs", str(args.epochs),
        "--n_eval", str(args.n_eval),
        "--img_size", str(args.img_size),
        "--seed", str(args.seed),
        "--backbone", args.backbone,
    ]
    if args.no_pretrained:
        sys.argv += ["--no_pretrained"]
    if args.freeze_backbone:
        sys.argv += ["--freeze_backbone"]
    run_experiment_main()


if __name__ == "__main__":
    main()
