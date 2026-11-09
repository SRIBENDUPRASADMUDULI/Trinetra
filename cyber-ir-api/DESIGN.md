# Cyber-IR API — Design Document

## What is this?

A production-grade REST microservice providing **incident response automation** for enterprise and sovereign operations. Two core capabilities:

1. **Cyber-FIR PDF Generator** — Describe a cyber incident in natural language → get a structured, formatted First Information Report (FIR) as a downloadable PDF.
2. **Emergency Assistance Playbook Generator** — Describe a cyber situation → get a step-by-step incident response playbook.

Both backed by an LLM (Gemma 31B via OpenRouter for speed + high rate limits).

---

## Architecture

```
Client (any website/frontend)
        │
        ▼
  FastAPI (Python 3.11+)
   ├── /api/fir/generate   → Incident description → LLM → structured data → PDF
   ├── /api/playbook/generate → Situation description → LLM → markdown playbook
   └── /api/health          → Health check
        │
        ▼
  LLM Provider (OpenRouter — Gemma 3 31B)
```

**No database.** Stateless. Request in → PDF/markdown out. Deploy on any server with Python.

---

## Endpoint 1: Cyber-FIR PDF Generator

### POST `/api/fir/generate`

**Request:**
```json
{
  "incident_description": "On September 15, 2026, at approximately 14:30 IST, I discovered unauthorized access to my email account (victim@example.com). The attacker used my credentials to send phishing emails to 12 contacts...",
  "victim_name": "John Doe",
  "incident_date": "2026-09-15",
  "incident_time": "14:30",
  "location": "New Delhi, India",
  "incident_type": "unauthorized_access"
}
```

**Flow:**
1. User sends incident details
2. Server constructs a structured prompt with the incident data
3. LLM returns a **structured JSON** containing:
   - FIR number (auto-generated)
   - Complainant details
   - Incident summary
   - Technical details (IPs, timestamps, attack vectors if mentioned)
   - Legal sections applicable (IT Act 2000, IPC sections)
   - Evidence inventory
   - Action items
4. Server renders this JSON into a **formatted PDF** using FPDF2
5. Returns PDF as `application/pdf` download

### PDF Format (Indian Cyber FIR style):
- Header: "[COUNTRY] CYBER CRIME - FIRST INFORMATION REPORT"
- Auto-generated FIR number
- Date/time/ location of report
- Complainant information section
- Incident details section
- Technical analysis section
- Legal framework section
- Evidence list
- Action items
- Footer with disclaimer

---

## Endpoint 2: Emergency Assistance Playbook

### POST `/api/playbook/generate`

**Request:**
```json
{
  "situation": "Our company database was breached, customer PII exposed. We need to respond within 24 hours for compliance.",
  "organization_type": "startup",
  "urgency": "high"
}
```

**Flow:**
1. User describes the situation
2. Server sends a structured prompt to the LLM
3. LLM returns a **markdown playbook** with:
   - Immediate containment steps (0-1 hours)
   - Assessment phase (1-4 hours)
   - Notification requirements (legal/compliance deadlines)
   - Eradication steps
   - Recovery plan
   - Post-incident review
   - Contact templates (legal, PR, law enforcement)
4. Returns as JSON with the markdown content

---

## Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | FastAPI | Async, auto-docs, lightweight |
| PDF Generation | FPDF2 | Pure Python, no wkhtmltopdf, minimal deps |
| LLM Provider | OpenRouter (Gemma 3 31B) | High rate limits, fast, free tier available |
| Template Engine | Jinja2 | PDF layout templates |
| No database | Stateless | High throughput, zero persistent state overhead |
| No auth | API key optional | Internal microservice mesh architecture |

---

## File Structure

```
cyber-ir-api/
├── DESIGN.md              # This file
├── README.md              # Integration docs
├── main.py                # FastAPI app, all routes
├── prompts.py             # LLM prompt templates
├── pdf_generator.py       # PDF rendering logic
├── llm_client.py          # OpenRouter API client
├── templates/             # Jinja2 templates for PDF
│   └── fir_template.html
├── requirements.txt
├── Dockerfile
└── .env.example
```

**5 Python files.** No src/ directory, no packages, no models, no routers/ folder. Flat structure. FastAPI auto-generates /docs.

---

## Integration Example (for the consuming website)

```html
<!-- Minimal integration -->
<script>
async function generateFIR(incidentData) {
  const res = await fetch('https://your-api.com/api/fir/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData)
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url); // opens PDF
  // or: <a download="FIR.pdf" href="${url}">Download FIR</a>
}

async function generatePlaybook(situationData) {
  const res = await fetch('https://your-api.com/api/playbook/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(situationData)
  });
  const { playbook } = await res.json();
  document.getElementById('playbook-output').innerHTML = marked.parse(playbook);
}
</script>
```

---

## Future (not building now)

- Authentication / API keys
- Rate limiting
- Multi-language support
- Custom FIR templates per country
- Webhook callback for async generation
