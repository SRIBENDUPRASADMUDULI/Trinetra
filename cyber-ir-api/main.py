from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import logging

from settings import settings
from llm_client import generate_response
from pdf_generator import generate_fir_pdf
from prompts import (
    FIRRequest,
    PlaybookRequest,
    FIR_SYSTEM_PROMPT,
    FIR_USER_PROMPT,
    FIR_USER_PROMPT_FINANCIAL,
    PLAYBOOK_SYSTEM_PROMPT,
    PLAYBOOK_USER_PROMPT,
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("cyber-ir")

app = FastAPI(
    title="Cyber-IR API",
    description="Incident Response Automation -- FIR PDF Generator + Emergency Playbooks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code fences and thinking tags."""
    import re
    # Strip thinking tags first
    text = re.sub(r"<thought>.*?</thought>", "", text, flags=re.DOTALL).strip()
    # Strip code fences
    for opener in ("```json", "```"):
        if opener in text:
            start = text.index(opener) + len(opener)
            remaining = text[start:]
            if "```" in remaining:
                end = remaining.index("```")
                text = remaining[:end].strip()
                break
    return json.loads(text)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "model": settings.llm_model}


@app.get("/")
async def root():
    return {
        "name": "Cyber-IR API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.post("/api/fir/generate")
async def generate_fir(req: FIRRequest):
    """Generate a Cyber FIR as PDF from incident details."""
    try:
        financial_section = ""
        if req.financial_details:
            financial_section = FIR_USER_PROMPT_FINANCIAL.format(**req.financial_details)

        prompt = FIR_USER_PROMPT.format(
            victim_name=req.victim_name,
            victim_dob=req.victim_dob or "N/A",
            victim_parent_name=req.victim_parent_name or "N/A",
            victim_email=req.victim_email or "N/A",
            victim_address=req.victim_address or "N/A",
            incident_type=req.incident_type,
            incident_date=req.incident_date,
            incident_time=req.incident_time,
            location=req.location,
            incident_description=req.incident_description,
            financial_section=financial_section,
        )

        log.info("Generating FIR for %s", req.victim_name)
        raw = await generate_response(prompt, FIR_SYSTEM_PROMPT, json_mode=True)
        fir_data = _extract_json(raw)

        fir_data["incident_date"] = req.incident_date
        if "date_of_report" not in fir_data:
            from datetime import date
            fir_data["date_of_report"] = date.today().isoformat()

        pdf_bytes = generate_fir_pdf(fir_data)
        log.info("FIR PDF generated: %d bytes", len(pdf_bytes))

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="FIR_{req.incident_date}.pdf"'},
        )
    except json.JSONDecodeError as e:
        log.error("LLM returned invalid JSON: %s", e)
        raise HTTPException(502, detail="LLM returned invalid JSON. Please retry.")
    except httpx.HTTPStatusError as e:
        log.error("LLM API error: %s", e)
        raise HTTPException(502, detail=f"LLM provider error: {e.response.status_code}")
    except Exception as e:
        log.error("FIR generation failed: %s", e)
        raise HTTPException(500, detail=str(e))


@app.post("/api/playbook/generate")
async def generate_playbook(req: PlaybookRequest):
    """Generate an incident response playbook as Markdown."""
    try:
        prompt = PLAYBOOK_USER_PROMPT.format(
            situation=req.situation,
            organization_type=req.organization_type,
            urgency=req.urgency,
            framework=req.framework,
        )

        log.info("Generating playbook (urgency=%s)", req.urgency)
        playbook_md = await generate_response(prompt, PLAYBOOK_SYSTEM_PROMPT)

        return {"playbook": playbook_md, "urgency": req.urgency}
    except httpx.HTTPStatusError as e:
        log.error("LLM API error: %s", e)
        raise HTTPException(502, detail=f"LLM provider error: {e.response.status_code}")
    except Exception as e:
        log.error("Playbook generation failed: %s", e)
        raise HTTPException(500, detail=str(e))
