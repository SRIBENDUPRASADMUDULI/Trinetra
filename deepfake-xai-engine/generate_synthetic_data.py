"""
generate_synthetic_data.py
---------------------------
Creates a DEMO dataset in the required folder structure:

    data/<generator_name>/real/*.png
    data/<generator_name>/fake/*.png

This is ONLY a stand-in so the pipeline can be run end-to-end without
downloading real deepfake datasets. Each synthetic "generator" injects a
different artifact signature into the fake images, which loosely mimics
how real generators (GAN vs Diffusion vs face-swap) leave different
fingerprints. This lets you verify the whole cross-generator faithfulness
pipeline works before pointing it at a real dataset.

>>> REPLACE THIS STEP with your real dataset once available. <<<
Just place real images under the same data/<generator_name>/real|fake/
structure (e.g. data/StyleGAN2/real, data/StyleGAN2/fake,
data/StableDiffusion/real, data/StableDiffusion/fake, ...) and skip
running this script.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

IMG_SIZE = 64
N_REAL_PER_GEN = 150
N_FAKE_PER_GEN = 150
SEED = 42

# Each "generator" gets its own artifact signature (simulating different
# generator fingerprints: e.g. GAN checkerboard upsampling vs diffusion
# blur-ring vs face-swap blending-boundary artifacts).
GENERATORS = {
    "StyleGAN2":       {"artifact": "checkerboard", "strength": 0.35},
    "FaceSwapAE":      {"artifact": "boundary_ring", "strength": 0.30},
    "StableDiffusion": {"artifact": "smooth_blur",   "strength": 0.28},
}

OUT_ROOT = os.path.join(os.path.dirname(__file__), "data")


def make_base_face(rng):
    """A crude 'face-like' base image: smooth radial gradient + blobs."""
    img = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
    yy, xx = np.mgrid[0:IMG_SIZE, 0:IMG_SIZE]
    cx, cy = IMG_SIZE / 2, IMG_SIZE / 2
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (IMG_SIZE / 2)
    base = 1.0 - 0.6 * dist
    skin_tone = rng.uniform(0.55, 0.85, size=3)
    for c in range(3):
        img[:, :, c] = np.clip(base * skin_tone[c] + rng.normal(0, 0.03, base.shape), 0, 1)
    # eyes / mouth blobs so there's some structure to attend to
    for (bx, by, r) in [(cx - 12, cy - 6, 4), (cx + 12, cy - 6, 4), (cx, cy + 14, 6)]:
        mask = (xx - bx) ** 2 + (yy - by) ** 2 <= r ** 2
        img[mask] *= 0.4
    return img


def add_checkerboard_artifact(img, strength, rng):
    """Simulates GAN transposed-conv upsampling checkerboard artifacts."""
    yy, xx = np.mgrid[0:IMG_SIZE, 0:IMG_SIZE]
    pattern = (((xx // 2) + (yy // 2)) % 2).astype(np.float32)
    region = np.zeros((IMG_SIZE, IMG_SIZE), dtype=np.float32)
    region[10:54, 10:54] = 1.0  # roughly the "face" region
    out = img.copy()
    for c in range(3):
        out[:, :, c] += strength * pattern * region * rng.uniform(0.7, 1.0)
    return np.clip(out, 0, 1)


def add_boundary_ring_artifact(img, strength, rng):
    """Simulates face-swap blending-boundary artifacts (a visible ring)."""
    yy, xx = np.mgrid[0:IMG_SIZE, 0:IMG_SIZE]
    cx, cy = IMG_SIZE / 2, IMG_SIZE / 2
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    ring = np.exp(-((dist - 22) ** 2) / (2 * 2.5 ** 2))
    out = img.copy()
    for c in range(3):
        out[:, :, c] += strength * ring * rng.uniform(0.8, 1.0)
    return np.clip(out, 0, 1)


def add_smooth_blur_artifact(img, strength, rng):
    """Simulates diffusion-model over-smoothing / low-frequency bias artifacts."""
    pil = Image.fromarray((img * 255).astype(np.uint8))
    blurred = pil.filter(ImageFilter.GaussianBlur(radius=2.2))
    blurred = np.asarray(blurred).astype(np.float32) / 255.0
    out = (1 - strength) * img + strength * blurred
    # slight diffusion-like low-frequency color cast
    cast = rng.uniform(-0.03, 0.03, size=3)
    out = np.clip(out + cast, 0, 1)
    return out


ARTIFACT_FN = {
    "checkerboard": add_checkerboard_artifact,
    "boundary_ring": add_boundary_ring_artifact,
    "smooth_blur": add_smooth_blur_artifact,
}


def save_img(arr, path):
    Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).save(path)


def main():
    rng = np.random.default_rng(SEED)
    for gen_name, cfg in GENERATORS.items():
        real_dir = os.path.join(OUT_ROOT, gen_name, "real")
        fake_dir = os.path.join(OUT_ROOT, gen_name, "fake")
        os.makedirs(real_dir, exist_ok=True)
        os.makedirs(fake_dir, exist_ok=True)

        for i in range(N_REAL_PER_GEN):
            img = make_base_face(rng)
            save_img(img, os.path.join(real_dir, f"real_{i:04d}.png"))

        artifact_fn = ARTIFACT_FN[cfg["artifact"]]
        for i in range(N_FAKE_PER_GEN):
            img = make_base_face(rng)
            img = artifact_fn(img, cfg["strength"], rng)
            save_img(img, os.path.join(fake_dir, f"fake_{i:04d}.png"))

        print(f"[{gen_name}] wrote {N_REAL_PER_GEN} real + {N_FAKE_PER_GEN} fake images "
              f"-> data/{gen_name}/real|fake/")

    print("\nDone. Demo dataset created under:", OUT_ROOT)
    print("Replace this with real data in the same data/<generator>/real|fake/ structure "
          "(e.g. FF++, Celeb-DF, DF40 subsets) for actual experiments.")


if __name__ == "__main__":
    main()
