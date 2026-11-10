"""
dataset.py
----------
Loads images from the required folder structure:

    data/<generator_name>/real/*.{png,jpg,jpeg}
    data/<generator_name>/fake/*.{png,jpg,jpeg}

and exposes:
  - list_generators(data_root)        -> sorted list of generator folder names
  - DeepfakeDataset                   -> torch Dataset for ONE generator
  - build_generator_datasets(...)     -> dict {generator_name: DeepfakeDataset}
"""

import os
import glob
from PIL import Image
import torch
from torch.utils.data import Dataset
import torchvision.transforms as T

IMG_EXTS = ("*.png", "*.jpg", "*.jpeg", "*.bmp")


def list_generators(data_root: str):
    """Every sub-folder of data_root that contains real/ and fake/ subfolders
    is treated as one 'generator' (i.e. one distribution)."""
    gens = []
    for name in sorted(os.listdir(data_root)):
        gen_path = os.path.join(data_root, name)
        if os.path.isdir(gen_path) and \
           os.path.isdir(os.path.join(gen_path, "real")) and \
           os.path.isdir(os.path.join(gen_path, "fake")):
            gens.append(name)
    return gens


def _collect_files(folder):
    files = []
    for ext in IMG_EXTS:
        files.extend(glob.glob(os.path.join(folder, ext)))
    return sorted(files)


class DeepfakeDataset(Dataset):
    """All (image, label) pairs for a single generator folder.
    label: 0 = real, 1 = fake
    """

    def __init__(self, generator_dir, img_size=64, augment=False):
        self.samples = []
        for label, cls in enumerate(["real", "fake"]):
            cls_dir = os.path.join(generator_dir, cls)
            for f in _collect_files(cls_dir):
                self.samples.append((f, label))

        if len(self.samples) == 0:
            raise RuntimeError(f"No images found under {generator_dir}/real or /fake")

        tfm_list = [T.Resize((img_size, img_size))]
        if augment:
            tfm_list += [T.RandomHorizontalFlip()]
        tfm_list += [T.ToTensor()]  # -> [0,1], shape (3,H,W)
        self.transform = T.Compose(tfm_list)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        img = self.transform(img)
        return img, torch.tensor(label, dtype=torch.long), path


def build_generator_datasets(data_root, img_size=64, augment=False):
    """Returns {generator_name: DeepfakeDataset} for every generator found."""
    gens = list_generators(data_root)
    if not gens:
        raise RuntimeError(
            f"No valid generator folders found under {data_root}. "
            f"Expected structure: data/<generator_name>/real/ and data/<generator_name>/fake/"
        )
    return {g: DeepfakeDataset(os.path.join(data_root, g), img_size, augment) for g in gens}
