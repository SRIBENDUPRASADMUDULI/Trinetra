# Explanation Faithfulness Under Distribution Shift

A runnable ML pipeline for studying whether a deepfake detector's **explanation**
(Grad-CAM heatmap) stays faithful when the detector is tested on a generator it
was never trained on — the core question behind the proposed **CGFD** and
**FADI** metrics.

## 1. Folder Structure (required)

```
data/
  <generator_name_1>/
    real/   *.png / *.jpg
    fake/   *.png / *.jpg
  <generator_name_2>/
    real/
    fake/
  ...
```

Each top-level folder under `data/` is treated as one **generator / distribution**
(e.g. `StyleGAN2`, `FaceSwapAE`, `StableDiffusion`, or real dataset names like
`FFpp`, `CelebDF`, `DF40_diffusion`, etc.). The code auto-discovers every
generator folder — you don't need to edit any script to add a new one, just
drop a new folder in `data/` with `real/` and `fake/` subfolders.

## 2. Quick Start — ONE Command

A demo dataset (`data/StyleGAN2`, `data/FaceSwapAE`, `data/StableDiffusion` —
150 real + 150 fake images each) is **already bundled in this zip**, so
nothing needs to be downloaded to get a working end-to-end run. Each
"generator" folder injects a different artifact signature (checkerboard /
boundary-ring / smooth-blur) to loosely simulate how real GAN vs Diffusion
vs face-swap generators leave different fingerprints.

```bash
pip install -r requirements.txt
python run.py
```

That's it — `run.py` is the single entry point. It trains on every
generator as source in turn, evaluates cross-generator faithfulness, and
writes every result to `outputs/`. (If you ever delete the `data/` folder,
`run.py` will automatically regenerate the demo dataset before running.)

## 3. Model Backbone: Toy CNN vs Real Pretrained Network

This repo ships with **two detector backbones**, selected with `--backbone`:

| Backbone | What it is | When to use |
|---|---|---|
| `simple` | A tiny 3-layer CNN, trained from scratch | Fastest option, good for a quick sanity check |
| `efficientnet_b0` (**default**) | torchvision's EfficientNet-B0, **ImageNet-pretrained by default** | Recommended for real experiments — this is the kind of backbone used in the actual literature (GenD, CDTS, DFA all use ImageNet- or CLIP-pretrained backbones) |

```bash
# Real backbone, ImageNet-pretrained (default) — recommended for real datasets
python run.py --backbone efficientnet_b0 --img_size 224

# Real backbone, but only train the classification head (faster, needs less data)
python run.py --backbone efficientnet_b0 --freeze_backbone

# Fast toy CNN (from scratch) — good for a 2-minute sanity check
python run.py --backbone simple
```

**About pretrained weights and internet access:** the first time `efficientnet_b0` runs with
pretrained weights, torchvision downloads them from `download.pytorch.org` (a few tens of MB,
cached afterwards). This requires normal internet access — it works out of the box on your own
machine, Google Colab, or Kaggle. If you're running in a network-restricted environment where
that download is blocked, the code automatically catches the failure and falls back to
`pretrained=False` (random init) with a clear console message — it will not crash, but accuracy
will be lower until you run it somewhere with internet access, or pass `--no_pretrained`
explicitly to skip the download attempt.

**Why this matters for accuracy:** a from-scratch toy CNN cannot match published deepfake
detection accuracy — real papers use large labeled datasets *and* transfer learning from
ImageNet/CLIP. Switching to `efficientnet_b0` with pretrained weights and a real dataset (see
Section 6) is what actually closes that gap; the backbone choice alone does not, since accuracy
also depends heavily on the dataset used.

## 4. Run Options

**Full cross-generator matrix** (default — every generator as source):
```bash
python run.py
```

**Single source generator** (train on one, test faithfulness on all):
```bash
python run.py --source StyleGAN2
```

**Custom settings** (all optional, defaults live in `config.py`):
```bash
python run.py --source StyleGAN2 --backbone efficientnet_b0 --img_size 224 --epochs 10 --n_eval 40 --seed 1
```

## 5. Outputs (written to `outputs/`)

| File | Contents |
|---|---|
| `results_per_generator.csv` | Accuracy + faithfulness score for every (source, evaluated-on) combination |
| `results_pairwise_CGFD_FADI.csv` | CGFD and FADI for every (source → target) generator pair |
| `cgfd_matrix.png` | Heatmap of Cross-Generator Faithfulness Drop (only with `--all_as_source`) |
| `fadi_matrix.png` | Heatmap of Faithfulness-Accuracy Decoupling Index (only with `--all_as_source`) |
| `gradcam_samples/*.png` | Example Grad-CAM explanation overlays per generator |
| `summary.txt` | Human-readable results summary |

## 6. Switching to a Real Dataset

1. Delete/replace the synthetic `data/` folder.
2. Create `data/<generator_name>/real/` and `data/<generator_name>/fake/` for
   each generator family you want to test (e.g. subsets of **DF40** split by
   generator family, or **FF++** vs **DiffusionFace** for a GAN→Diffusion shift).
3. Run `python run.py --backbone efficientnet_b0 --img_size 224` — no code
   changes needed. On your own machine / Colab / Kaggle, pretrained ImageNet
   weights download automatically on first run (see Section 3).

**On accuracy expectations:** published deepfake detectors typically report
92–98% accuracy on FF++ after training on tens of thousands of real images
with a pretrained backbone. Matching or exceeding that is realistic with
`efficientnet_b0` + a real dataset of that scale, but is a separate effort
from this project's core contribution (CGFD/FADI) — treat strong accuracy as
a **prerequisite for credible faithfulness numbers**, not as the paper's main
claim. If accuracy on your real data is noticeably below published baselines,
check: dataset size (thousands, not hundreds, of images per class), training
epochs, whether pretrained weights actually downloaded (check the console
message), and whether `--freeze_backbone` is unnecessarily limiting capacity
for your dataset size (unfreeze it for larger datasets).

## 7. Extending the Pipeline

- **Try a different pretrained backbone**: `src/model.py`'s `build_model()` factory currently
  supports `simple` and `efficientnet_b0`. To add another (e.g. Xception via `timm`, or a CLIP
  ViT), add a new branch to `build_model()` following the same pattern as `EfficientNetDetector`
  — just keep a `.get_last_conv_module()` method returning a real spatial conv layer so Grad-CAM
  keeps working. (A pooled-embedding backbone like a plain CLIP encoder has no spatial map — see
  the CDTS paper discussion in the architecture PDF for how that case is normally handled.)
- **Add IoU-based faithfulness**: if you have ground-truth manipulation masks
  (FF++, DGM4), add an IoU term to `composite_faithfulness()` in
  `src/faithfulness.py`, matching the `F(x)` formula in the proposed
  methodology (`w4 · IoU(x)` term).
- **Add Artifact-Grounded Faithfulness (AGF)**: extend `faithfulness.py` with
  a function that scores explanation overlap against FIA/USA artifact-category
  masks rather than raw pixels, per the proposed methodology section 3.7.

## 8. Module Overview

| File | Purpose |
|---|---|
| `run.py` | **Single entry point.** Auto-generates demo data if missing, then runs the full study. |
| `config.py` | All default settings (backbone, epochs, batch size, learning rate, eval sample count, seed) |
| `generate_synthetic_data.py` | Creates the bundled demo data (replace `data/` with real data for actual experiments) |
| `src/dataset.py` | Loads `data/<generator>/real|fake/` into PyTorch datasets |
| `src/model.py` | **Two backbones**: `SimpleDetector` (toy CNN) and `EfficientNetDetector` (real, ImageNet-pretrained) via the `build_model()` factory |
| `src/gradcam.py` | Grad-CAM explanation generator (works with either backbone; robust to a frozen backbone) |
| `src/faithfulness.py` | Deletion/Insertion faithfulness metrics + **CGFD** + **FADI** |
| `src/train.py` | Training loop |
| `src/run_experiment.py` | Orchestrator — trains, evaluates, builds matrices, saves outputs (called by `run.py`) |

## 9. Verified Run

This exact package was executed end-to-end in a clean environment before
delivery, with **zero arguments** (`python run.py` — the true out-of-the-box
default: `--backbone efficientnet_b0`, `--epochs 8`, `--n_eval 30`) and
completed with no errors in about 3 minutes on CPU, producing all files
listed in Section 5. It was also separately verified with `--backbone simple`
and with `--freeze_backbone` (both regression-tested after the backbone
upgrade). The `data/` and `outputs/` folders in this zip are the real
artifacts from that verified default run — you are not starting from an
untested script. Because pretrained ImageNet weights could not be downloaded
in the network-restricted environment used to build this package (see
Section 3), this bundled run used `pretrained=False` automatically; on your
own machine the same command will use real ImageNet weights.
