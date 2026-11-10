"""
model.py
--------
Two detector options:

1. SimpleDetector   - tiny from-scratch CNN. Fast, works on any image size,
                       good for quick demo/sanity runs (e.g. on synthetic data).

2. EfficientNetDetector - real research-grade backbone (torchvision's
                       EfficientNet-B0), ImageNet-pretrained by default.
                       This is what you should use for actual experiments
                       on real datasets (FF++, Celeb-DF, DF40, etc.) --
                       transfer learning from ImageNet gives a large accuracy
                       boost over training from scratch, which is standard
                       practice in the deepfake detection literature (the
                       CLIP/Xception/EfficientNet backbones used by GenD,
                       DFA, CDTS, etc. are all ImageNet- or CLIP-pretrained).

IMPORTANT -- pretrained weights require internet access:
   torchvision downloads ImageNet weights from download.pytorch.org the
   first time EfficientNetDetector(pretrained=True) is created. If you are
   running in a network-restricted sandbox, this download will fail; set
   pretrained=False to train from scratch instead (works, but expect lower
   accuracy, especially on small datasets). On your own machine / Colab /
   Kaggle (which have normal internet access), the download happens
   automatically and only once (cached afterwards).

Both models expose `.get_last_conv_module()` so Grad-CAM (gradcam.py) works
identically regardless of which backbone you choose.
"""

import torch
import torch.nn as nn
import torchvision.models as tv_models


class SimpleDetector(nn.Module):
    """Tiny from-scratch CNN. Good for quick demo/sanity runs."""

    def __init__(self, num_classes=2):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=False),  # non-inplace: required for Grad-CAM backward hooks
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x):
        feat = self.features(x)
        pooled = self.pool(feat).flatten(1)
        return self.classifier(pooled)

    def get_last_conv_module(self):
        return self.features[-1]


class EfficientNetDetector(nn.Module):
    """
    Research-grade backbone: torchvision EfficientNet-B0, ImageNet-pretrained
    by default, with a fresh binary classification head on top.

    Recommended input size: 224x224 (EfficientNet-B0's native resolution).
    Smaller sizes (e.g. 64x64, used by this repo's synthetic demo data) still
    run without error -- adaptive pooling handles any spatial size -- but
    expect weaker results than at the intended resolution; scale img_size
    up to 224 once you switch to a real dataset (see README).
    """

    def __init__(self, num_classes=2, pretrained=True, freeze_backbone=False):
        super().__init__()
        weights = tv_models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
        try:
            backbone = tv_models.efficientnet_b0(weights=weights)
        except Exception as e:
            # Network-restricted environment (e.g. offline sandbox): fall back
            # to random init so the pipeline still runs end-to-end.
            print(f"[EfficientNetDetector] Could not download pretrained weights "
                  f"({type(e).__name__}: {e}). Falling back to pretrained=False "
                  f"(random init). This is expected in network-restricted "
                  f"environments -- on your own machine with internet access, "
                  f"pretrained weights will download automatically.")
            backbone = tv_models.efficientnet_b0(weights=None)

        self.features = backbone.features  # Sequential of MBConv blocks
        in_features = backbone.classifier[1].in_features  # 1280 for B0

        if freeze_backbone:
            for p in self.features.parameters():
                p.requires_grad = False

        self.pool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(p=0.3)
        self.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        feat = self.features(x)
        pooled = self.pool(feat).flatten(1)
        pooled = self.dropout(pooled)
        return self.classifier(pooled)

    def get_last_conv_module(self):
        # Last MBConv block's output activation -- used as the Grad-CAM target layer.
        return self.features[-1]


def build_model(backbone="efficientnet_b0", pretrained=True, freeze_backbone=False, num_classes=2):
    """
    Factory used by train.py / run_experiment.py.

    backbone: "simple"          -> SimpleDetector (from-scratch, fast, any image size)
              "efficientnet_b0" -> EfficientNetDetector (recommended for real experiments)
    """
    if backbone == "simple":
        return SimpleDetector(num_classes=num_classes)
    elif backbone == "efficientnet_b0":
        return EfficientNetDetector(num_classes=num_classes, pretrained=pretrained,
                                     freeze_backbone=freeze_backbone)
    else:
        raise ValueError(f"Unknown backbone '{backbone}'. Use 'simple' or 'efficientnet_b0'.")
