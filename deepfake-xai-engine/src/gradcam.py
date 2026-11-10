"""
gradcam.py
----------
Standard Grad-CAM: hooks the last conv layer's activations + gradients,
weights each channel by its average gradient, and produces a single
importance heatmap per image. This heatmap is the "explanation" E(x)
whose faithfulness is measured in faithfulness.py.
"""

import torch
import torch.nn.functional as F


class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None
        self._fwd_handle = target_layer.register_forward_hook(self._save_activation)
        self._bwd_handle = target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, inp, out):
        self.activations = out.detach()

    def _save_gradient(self, module, grad_in, grad_out):
        self.gradients = grad_out[0].detach()

    def remove_hooks(self):
        self._fwd_handle.remove()
        self._bwd_handle.remove()

    def __call__(self, x, class_idx=None):
        """
        x: (B, 3, H, W) tensor, requires no external grad tracking needed.
        Returns: heatmaps (B, H, W) normalized to [0, 1], and predicted class indices (B,)
        """
        self.model.zero_grad()

        # IMPORTANT: force requires_grad on the input. This guarantees a full
        # autograd graph through every layer -- including a FROZEN backbone
        # (requires_grad=False on its weights) -- since gradient w.r.t. the
        # input only needs the input itself to require grad, not the weights.
        # Without this, target_layer's backward hook receives grad_out=None
        # whenever every upstream parameter is frozen (e.g. --freeze_backbone).
        x = x.clone().detach().requires_grad_(True)

        logits = self.model(x)
        probs = F.softmax(logits, dim=1)
        if class_idx is None:
            class_idx = probs.argmax(dim=1)

        selected = logits.gather(1, class_idx.view(-1, 1)).sum()
        selected.backward(retain_graph=True)

        if self.gradients is None:
            raise RuntimeError(
                "Grad-CAM received no gradients at the target layer. This should not "
                "happen after the requires_grad_(True) fix above -- check that "
                "target_layer is actually part of the model's forward path."
            )

        # Global-average-pool the gradients -> per-channel importance weights
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)          # (B, C, 1, 1)
        cam = (weights * self.activations).sum(dim=1)                    # (B, h, w)
        cam = F.relu(cam)

        cam = cam.unsqueeze(1)
        cam = F.interpolate(cam, size=x.shape[2:], mode="bilinear", align_corners=False)
        cam = cam.squeeze(1)

        # normalize each heatmap to [0,1]
        cam_min = cam.amin(dim=(1, 2), keepdim=True)
        cam_max = cam.amax(dim=(1, 2), keepdim=True)
        cam = (cam - cam_min) / (cam_max - cam_min + 1e-8)

        return cam.detach(), class_idx.detach(), probs.detach()
