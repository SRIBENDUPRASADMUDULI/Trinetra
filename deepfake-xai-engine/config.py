"""
config.py
---------
Central configuration for the Explanation Faithfulness Under Distribution
Shift pipeline. Edit values here instead of passing long CLI flag lists.
"""

from dataclasses import dataclass


@dataclass
class Config:
    # Paths
    data_root: str = "data"
    output_root: str = "outputs"

    # Model
    backbone: str = "efficientnet_b0"   # "simple" (fast, toy) or "efficientnet_b0" (real, recommended)
    pretrained: bool = True             # ImageNet weights (needs internet on first run)
    freeze_backbone: bool = False       # True = only train the classification head (faster, less data-hungry)

    # Data
    img_size: int = 64    # fast default for the bundled 64x64 demo data.
                           # For REAL datasets with efficientnet_b0, override with
                           # --img_size 224 (EfficientNet-B0's native resolution).

    # Training
    epochs: int = 8
    batch_size: int = 16
    lr: float = 1e-3
    seed: int = 0

    # Faithfulness evaluation
    n_eval: int = 30          # images sampled per generator for faithfulness eval
    n_deletion_steps: int = 10


CONFIG = Config()
