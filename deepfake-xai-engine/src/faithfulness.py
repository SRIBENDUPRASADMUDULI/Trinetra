"""
faithfulness.py
----------------
Implements the faithfulness metrics used to answer:
"Is the explanation E(x) actually faithful to the model's decision?"

and the two core NEW metrics proposed for this research:
    - CGFD  (Cross-Generator Faithfulness Drop)
    - FADI  (Faithfulness-Accuracy Decoupling Index)

Metrics implemented (per-image, then averaged over a generator's test set):
    1. Deletion AUC  -- lower is more faithful
    2. Insertion AUC -- higher is more faithful
    3. Composite Faithfulness Score F(x) in [0, 1] -- higher is more faithful
"""

import numpy as np
import torch
import torch.nn.functional as F


@torch.no_grad()
def _predict_prob(model, x, class_idx):
    logits = model(x)
    probs = F.softmax(logits, dim=1)
    return probs.gather(1, class_idx.view(-1, 1)).squeeze(1)


def _ranked_pixel_order(cam):
    """Returns flat pixel indices sorted by importance, descending. cam: (H, W)"""
    flat = cam.flatten()
    order = torch.argsort(flat, descending=True)
    return order


def deletion_insertion_auc(model, img, cam, class_idx, device, n_steps=10, baseline_value=0.0):
    """
    img: (3, H, W) tensor in [0,1]
    cam: (H, W) tensor in [0,1], the explanation heatmap for this image
    class_idx: scalar tensor, the class whose probability we track

    Returns: deletion_auc, insertion_auc  (both in [0,1])
    """
    H, W = cam.shape
    n_pixels = H * W
    order = _ranked_pixel_order(cam)  # most -> least important
    step_size = max(1, n_pixels // n_steps)

    img = img.to(device)
    cls = class_idx.view(1).to(device)

    # ---- Deletion: start from original, progressively remove important pixels ----
    del_img = img.clone()
    del_probs = [ _predict_prob(model, del_img.unsqueeze(0), cls).item() ]
    flat_del = del_img.view(3, -1)
    for step in range(0, n_pixels, step_size):
        idx = order[step:step + step_size]
        flat_del[:, idx] = baseline_value
        del_probs.append(_predict_prob(model, flat_del.view(3, H, W).unsqueeze(0), cls).item())

    # ---- Insertion: start from blank, progressively add important pixels ----
    ins_img = torch.full_like(img, baseline_value)
    ins_probs = [ _predict_prob(model, ins_img.unsqueeze(0), cls).item() ]
    flat_ins = ins_img.view(3, -1)
    flat_orig = img.view(3, -1)
    for step in range(0, n_pixels, step_size):
        idx = order[step:step + step_size]
        flat_ins[:, idx] = flat_orig[:, idx]
        ins_probs.append(_predict_prob(model, flat_ins.view(3, H, W).unsqueeze(0), cls).item())

    _trapz = getattr(np, "trapezoid", None) or np.trapz
    deletion_auc = float(_trapz(del_probs) / (len(del_probs) - 1))
    insertion_auc = float(_trapz(ins_probs) / (len(ins_probs) - 1))
    return deletion_auc, insertion_auc


def composite_faithfulness(deletion_auc, insertion_auc, w_del=0.5, w_ins=0.5):
    """
    F(x) in [0,1], higher = more faithful.
    Low deletion_auc (prob drops fast when important pixels removed) -> good -> (1 - deletion_auc) is high
    High insertion_auc (prob rises fast when important pixels added) -> good
    """
    return w_del * (1 - deletion_auc) + w_ins * insertion_auc


def evaluate_faithfulness_on_dataset(model, gradcam, dataset, device, n_samples=40, n_steps=10, seed=0):
    """
    Runs Grad-CAM + deletion/insertion faithfulness over a random subset of a dataset.
    Returns a dict with mean accuracy and mean faithfulness score for that generator.
    """
    rng = np.random.default_rng(seed)
    idxs = rng.choice(len(dataset), size=min(n_samples, len(dataset)), replace=False)

    model.eval()
    correct = 0
    f_scores = []

    for i in idxs:
        img, label, _path = dataset[i]
        img_batch = img.unsqueeze(0).to(device)

        # prediction (no grad needed for accuracy, but GradCAM needs grad internally)
        cam, pred_class, probs = gradcam(img_batch, class_idx=None)
        pred = pred_class.item()
        correct += int(pred == int(label))

        del_auc, ins_auc = deletion_insertion_auc(
            model, img, cam[0].cpu(), pred_class[0].cpu(), device, n_steps=n_steps
        )
        f_scores.append(composite_faithfulness(del_auc, ins_auc))

    acc = correct / len(idxs)
    mean_f = float(np.mean(f_scores))
    return {"accuracy": acc, "faithfulness": mean_f, "n_eval": len(idxs)}


# ---------------------------------------------------------------------------
# NOVEL METRICS proposed for this research
# ---------------------------------------------------------------------------

def cross_generator_faithfulness_drop(f_src, f_target):
    """CGFD(src -> target) = mean_F(src) - mean_F(target). Positive = faithfulness collapsed."""
    return f_src - f_target


def faithfulness_accuracy_decoupling_index(all_cgfd, all_acc_drop, cgfd, acc_drop):
    """
    FADI for one (src, target) pair, normalized against the full set of
    pairs observed in this run (min-max scaling), per the proposed methodology:

        FADI = normalized(CGFD) - normalized(accuracy_drop)

    all_cgfd / all_acc_drop: lists of CGFD / accuracy-drop values across ALL
    evaluated generator pairs, used only to compute the min/max for normalization.
    """
    def norm(v, arr):
        arr = np.array(arr, dtype=np.float64)
        lo, hi = arr.min(), arr.max()
        if hi - lo < 1e-8:
            return 0.0
        return float((v - lo) / (hi - lo))

    return norm(cgfd, all_cgfd) - norm(acc_drop, all_acc_drop)
