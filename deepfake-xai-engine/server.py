#!/usr/bin/env python3
"""
TRINETRA Deepfake XAI Inference Service (FastAPI)
--------------------------------------------------
Exposes live HTTP endpoints for Panel 11 (/deepfake-xai):
  - GET  /health   : Service & dependency readiness check
  - POST /analyze  : Accepts image upload (or base64) and runs either:
      1) HuggingFace `honi05/deepfake-detection` (EfficientNet-B4 + Grad-CAM), or
      2) Local PyTorch Grad-CAM + Deletion/Insertion Faithfulness pipeline (`analyze_single.py`)

Run locally:
  uvicorn server:app --host 0.0.0.0 --port 8011
"""

import base64
import io
import os
import subprocess
import sys
import tempfile
import json
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "src"))

app = FastAPI(
    title="TRINETRA Deepfake XAI Service",
    version="1.0.0",
    description="Live Grad-CAM & Deletion/Insertion Faithfulness inference service for TRINETRA",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _try_honi05_inference(image_bytes: bytes) -> Optional[dict]:
    """
    Attempts inference via HuggingFace `honi05/deepfake-detection` if `huggingface_hub`
    and `timm` are installed and reachable. Returns None if unavailable.
    """
    try:
        import torch
        import torchvision.transforms as T
        from huggingface_hub import hf_hub_download
        import timm  # noqa: F401
    except ImportError:
        return None

    try:
        model_path = hf_hub_download(
            repo_id="honi05/deepfake-detection",
            filename="best_model.pth",
            local_files_only=False,
        )
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)

        model = timm.create_model("efficientnet_b4", pretrained=False, num_classes=2)
        state = checkpoint.get("model_state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
        model.load_state_dict(state, strict=False)
        model.to(device).eval()

        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tfm = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        x = tfm(pil_img).unsqueeze(0).to(device)
        with torch.no_grad():
            logits = model(x)
            probs = torch.softmax(logits, dim=1)[0]
            prob_real = float(probs[0].item())
            prob_fake = float(probs[1].item())
            pred_idx = int(torch.argmax(probs).item())

        return {
            "source_model": "honi05/deepfake-detection",
            "backbone": "efficientnet_b4",
            "prediction": "FAKE" if pred_idx == 1 else "REAL",
            "pred_class": pred_idx,
            "prob_real": round(prob_real, 4),
            "prob_fake": round(prob_fake, 4),
            "confidence": round(max(prob_real, prob_fake), 4),
        }
    except Exception:
        return None


@app.get("/health")
def health():
    has_torch = False
    try:
        import torch  # noqa: F401
        has_torch = True
    except ImportError:
        pass
    return {
        "status": "ok",
        "service": "trinetra-deepfake-xai",
        "torch_available": has_torch,
        "hf_model": "honi05/deepfake-detection",
    }


@app.post("/predict")
@app.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
    source: str = Form(default="StyleGAN2"),
    backbone: str = Form(default="simple"),
    use_hf: bool = Form(default=False),
):
    if file is not None:
        raw_bytes = await file.read()
    elif image_base64:
        payload = image_base64.split(",", 1)[-1]
        raw_bytes = base64.b64decode(payload)
    else:
        raise HTTPException(status_code=400, detail="Provide an image file or image_base64")

    # Run full Grad-CAM + Deletion/Insertion Faithfulness via analyze_single.py
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
        Image.open(io.BytesIO(raw_bytes)).convert("RGB").save(tmp_path, format="PNG")

    try:
        cmd = [
            sys.executable,
            os.path.join(ROOT, "analyze_single.py"),
            "--image",
            tmp_path,
            "--source",
            source,
            "--backbone",
            backbone if backbone in ("simple", "efficientnet_b0") else "simple",
            "--no_pretrained",
        ]
        proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=180)
        if proc.returncode != 0:
            raise HTTPException(status_code=500, detail=proc.stderr.strip() or "Inference failed")

        lines = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
        result = json.loads(lines[-1])

        if use_hf:
            hf_res = _try_honi05_inference(raw_bytes)
            if hf_res:
                result["hf_secondary_verdict"] = hf_res

        return {"success": True, "analysis": result}
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
