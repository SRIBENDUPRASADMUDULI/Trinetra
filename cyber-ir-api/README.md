# Cyber-IR API

Incident Response Automation API. Generates structured Cyber FIRs (First Information Reports) as PDF and emergency incident response playbooks as Markdown. Powered by Google AI Studio Gemma 4.

Built for hackathons and rapid prototyping. Drop it into any web project and call two endpoints.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Integration Examples](#integration-examples)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [FIR Generation Details](#fir-generation-details)
- [Playbook Generation Details](#playbook-generation-details)
- [Error Handling](#error-handling)
- [Limitations](#limitations)
- [Development](#development)
- [License](#license)

---

## Features

**Cyber FIR PDF Generator** (`POST /api/fir/generate`)
- Takes incident description, victim details, date/time, location, incident type
- LLM generates structured FIR with auto-mapped legal sections (BNS 2023 + IT Act 2000)
- Returns a formatted PDF with 8 sections: Complainant, Incident, Accused, Technical Analysis, Legal Provisions, Financial Loss, Prayer/Relief, Verification
- Optional financial fraud details (transaction ID, UPI, bank account, amount)

**Emergency Playbook Generator** (`POST /api/playbook/generate`)
- Takes situation description, organization type, urgency level
- LLM generates a full SANS PICERL incident response playbook as Markdown
- Includes: Incident Header, Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned, Escalation Matrix, Communication Templates, Evidence Preservation Checklist
- Adapts to severity (P1-P4) and organization type

---

## Architecture

```
Client (any frontend)
    |
    v
FastAPI (Python 3.11+)
  |-- GET  /api/health       -> status check
  |-- POST /api/fir/generate -> incident data -> LLM -> JSON -> PDF
  |-- POST /api/playbook/generate -> situation -> LLM -> Markdown
    |
    v
Google AI Studio API (Gemma 4 26B MoE)
```

No database. No auth. Stateless. Request in, result out.

---

## Quick Start

### Prerequisites

- Python 3.11 or higher
- A Google AI Studio API key (free at https://aistudio.google.com/app/apikey)

### 1. Clone and install

```bash
git clone https://github.com/thenabbu/cyber-ir-api.git
cd cyber-ir-api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env and add your Google AI Studio API key
```

### 3. Run

```bash
uvicorn main:app --reload --port 8099
```

The API is now available at `http://localhost:8099`. Interactive docs at `http://localhost:8099/docs`.

---

## Docker Deployment

### Build and run

```bash
docker build -t cyber-ir-api .
docker run -p 8099:8099 --env-file .env cyber-ir-api
```

### Or use Docker Compose

```bash
docker compose up -d
```

The container includes a health check that verifies the API is responding. Check logs with:

```bash
docker compose logs -f
```

---

## API Reference

### Health Check

```
GET /api/health
```

**Response** (200 OK):

```json
{
  "status": "healthy",
  "model": "gemma-4-26b-a4b-it"
}
```

### Generate FIR

```
POST /api/fir/generate
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `incident_description` | string | Yes | Detailed description of the cyber incident |
| `victim_name` | string | Yes | Full name of the complainant/victim |
| `incident_date` | string | Yes | Date of incident (YYYY-MM-DD) |
| `incident_time` | string | Yes | Time of incident (HH:MM, 24h format) |
| `location` | string | Yes | Location where incident occurred |
| `incident_type` | string | Yes | One of: `online_financial_fraud`, `hacking`, `ransomware`, `data_breach`, `cyber_stalking`, `identity_theft`, `cryptocurrency_crime`, `other` |
| `victim_dob` | string | No | Date of birth (DD/MM/YYYY) |
| `victim_parent_name` | string | No | Father/Mother/Spouse name |
| `victim_email` | string | No | Email address for communication |
| `victim_address` | string | No | Complete address with PIN code |
| `financial_details` | object | No | Financial fraud details (see below) |

**financial_details object:**

| Field | Type | Description |
|-------|------|-------------|
| `transaction_id` | string | Transaction reference number |
| `bank_account` | string | Bank account number |
| `amount` | string | Amount in INR |
| `upi_id` | string | UPI ID or digital wallet |
| `transaction_date` | string | Date/time of transaction |

**Response:** `application/pdf` -- Binary PDF file with `Content-Disposition: attachment`.

**Example request:**

```bash
curl -X POST http://localhost:8099/api/fir/generate \
  -H "Content-Type: application/json" \
  -d '{
    "incident_description": "On September 15 at 2:30 PM, I discovered unauthorized access to my email account. The attacker used my credentials to send phishing emails to 12 contacts.",
    "victim_name": "Priya Sharma",
    "incident_date": "2026-09-15",
    "incident_time": "14:30",
    "location": "New Delhi, India",
    "incident_type": "hacking"
  }' \
  --output fir_report.pdf
```

**Example with financial fraud:**

```bash
curl -X POST http://localhost:8099/api/fir/generate \
  -H "Content-Type: application/json" \
  -d '{
    "incident_description": "Received phishing SMS with fake bank link. Entered OTP and Rs 35,000 was debited.",
    "victim_name": "Amit Kumar",
    "incident_date": "2026-09-17",
    "incident_time": "11:20",
    "location": "Bangalore, India",
    "incident_type": "online_financial_fraud",
    "financial_details": {
      "transaction_id": "UPI-20260917-88432",
      "bank_account": "50100123456789",
      "amount": "35000",
      "upi_id": "amit@oksbi",
      "transaction_date": "2026-09-17 11:18"
    }
  }' \
  --output fir_fraud.pdf
```

### Generate Playbook

```
POST /api/playbook/generate
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `situation` | string | Yes | -- | Detailed description of the cyber incident |
| `organization_type` | string | No | `"general"` | One of: `startup`, `enterprise`, `government`, `healthcare`, `education`, `general` |
| `urgency` | string | No | `"high"` | One of: `critical`, `high`, `medium`, `low` |
| `framework` | string | No | `"sans_picerl"` | Response framework: `sans_picerl`, `nist_800_61`, or `auto` |

**Response** (200 OK):

```json
{
  "playbook": "# Incident Response Playbook\n\n## Incident Header\n...",
  "urgency": "high"
}
```

The `playbook` field contains full Markdown that can be rendered directly in a frontend.

**Example request:**

```bash
curl -X POST http://localhost:8099/api/playbook/generate \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "Ransomware attack encrypting all company file shares. Attacker demands 10 BTC. Production is down.",
    "organization_type": "enterprise",
    "urgency": "critical"
  }'
```

---

## Integration Examples

### JavaScript (fetch API)

```javascript
// FIR PDF Download
async function generateFIR(incidentData) {
  const response = await fetch("http://localhost:8099/api/fir/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incidentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "FIR_Report.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

// Playbook Fetch
async function generatePlaybook(situationData) {
  const response = await fetch("http://localhost:8099/api/playbook/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(situationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const data = await response.json();
  return data.playbook; // Markdown string
}
```

### Python (requests library)

```python
import requests

BASE_URL = "http://localhost:8099"

# Generate FIR PDF
def generate_fir(incident_data):
    response = requests.post(f"{BASE_URL}/api/fir/generate", json=incident_data)
    response.raise_for_status()
    with open("fir_report.pdf", "wb") as f:
        f.write(response.content)
    print(f"FIR saved: {len(response.content)} bytes")

# Generate Playbook
def generate_playbook(situation_data):
    response = requests.post(f"{BASE_URL}/api/playbook/generate", json=situation_data)
    response.raise_for_status()
    playbook = response.json()["playbook"]
    print(f"Playbook: {len(playbook)} characters")
    return playbook

# Usage
generate_fir({
    "incident_description": "Phishing attack leading to credential theft",
    "victim_name": "Jane Doe",
    "incident_date": "2026-09-17",
    "incident_time": "09:15",
    "location": "Remote",
    "incident_type": "hacking",
})

playbook = generate_playbook({
    "situation": "DDoS attack on public website",
    "organization_type": "startup",
    "urgency": "high",
})
```

### React Component

```jsx
import React, { useState } from "react";

export default function IncidentResponse() {
  const [situation, setSituation] = useState("");
  const [playbook, setPlaybook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8099/api/playbook/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          organization_type: "startup",
          urgency: "high",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }
      const data = await res.json();
      setPlaybook(data.playbook);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="Describe the cyber incident..."
        rows={4}
      />
      <button onClick={generate} disabled={loading || !situation}>
        {loading ? "Generating..." : "Generate Playbook"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {playbook && (
        <pre style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
          {playbook}
        </pre>
      )}
    </div>
  );
}
```

### cURL Quick Reference

```bash
# Health check
curl http://localhost:8099/api/health

# Generate FIR (save as PDF)
curl -X POST http://localhost:8099/api/fir/generate \
  -H "Content-Type: application/json" \
  -d '{"incident_description":"test","victim_name":"Test","incident_date":"2026-09-17","incident_time":"12:00","location":"Delhi","incident_type":"hacking"}' \
  --output fir.pdf

# Generate Playbook (print to stdout)
curl -X POST http://localhost:8099/api/playbook/generate \
  -H "Content-Type: application/json" \
  -d '{"situation":"Server compromised","organization_type":"startup","urgency":"high"}'
```

---

## Configuration

All configuration is via environment variables (set in `.env` file or system environment).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | -- | Google AI Studio API key. Get one at https://aistudio.google.com/app/apikey |
| `LLM_MODEL` | No | `gemma-4-26b-a4b-it` | Google AI model to use. Alternatives: `gemma-4-31b-it`, `gemini-3.6-flash` |
| `LLM_BASE_URL` | No | `https://generativelanguage.googleapis.com/v1beta/openai` | Google AI OpenAI-compatible endpoint |
| `LLM_TEMPERATURE` | No | `0.4` | Sampling temperature (0.0 = deterministic, 1.0 = creative). Lower values produce more consistent FIRs |
| `LLM_MAX_OUTPUT_TOKENS` | No | `8192` | Maximum tokens per LLM response. Playbooks may need 4096+. FIR JSON typically uses 2000-3000 |

---

## Project Structure

```
cyber-ir-api/
  main.py              FastAPI application with all route handlers
  prompts.py           Pydantic request models and LLM system/user prompts
  llm_client.py        Google AI Studio API client (OpenAI-compatible)
  pdf_generator.py     FPDF2-based FIR PDF renderer
  settings.py          Pydantic settings (reads .env)
  requirements.txt     Python dependencies
  Dockerfile           Container build (Python 3.11-slim)
  docker-compose.yml   One-command deployment
  test_api.py          Stress test and validation script
  .env.example         Configuration template
  .gitignore           Git ignore rules
  LICENSE              MIT License
  README.md            This file
```

---

## How It Works

### FIR Generation Flow

1. Client sends incident details as JSON
2. Server constructs a structured prompt with the victim's data and incident description
3. Prompt instructs the LLM to generate a JSON FIR following Indian cybercrime reporting standards
4. LLM automatically maps the incident type to appropriate BNS 2023 and IT Act 2000 sections
5. Server extracts the JSON from the LLM response (handles code fences and thinking tags)
6. FPDF2 renders the JSON into a formatted PDF with 8 labeled sections
7. PDF is returned as a binary download

### Playbook Generation Flow

1. Client sends situation description, organization type, and urgency
2. Server constructs a SANS PICERL-aligned prompt
3. LLM generates a structured Markdown playbook with all 6 phases
4. Markdown is returned directly in the JSON response
5. Client renders it in a Markdown viewer or displays as formatted text

---

## FIR Generation Details

The FIR follows Indian cybercrime reporting standards with these auto-generated sections:

1. **Complainant Details** -- Name, DOB, parent name, email, address, ID proof
2. **Incident Details** -- Category (one of 8 cyber crime types), sub-category, date/time, location, chronological narrative
3. **Accused Details** -- Description of accused if identifiable, contact/bank details
4. **Technical Analysis** -- Attack vector, indicators of compromise (IPs, emails, URLs), evidence collected
5. **Legal Provisions** -- Auto-mapped BNS 2023 sections and IT Act 2000 sections based on incident type
6. **Financial Loss** -- Amount, transaction details (for financial fraud cases)
7. **Prayer/Relief Sought** -- Standard reliefs (FIR registration, investigation, account freeze, etc.)
8. **Verification** -- Place, date, signature block

**Legal section mapping (automatic):**

| Incident Type | BNS Sections | IT Act Sections |
|---------------|-------------|-----------------|
| Financial Fraud | 318, 319(2), 303 | 66D, 66C, 66 |
| Hacking | 303 | 66, 43 |
| Data Breach | 379, 408, 409, 411 | 66, 66B, 66C, 66E, 66F, 72 |
| Ransomware | 303 | 66, 43 |
| Cyber Terrorism | -- | 66F (life imprisonment) |

---

## Playbook Generation Details

The playbook follows the SANS PICERL (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned) framework:

1. **Preparation** -- Pre-incident readiness steps relevant to the scenario
2. **Identification** -- How to confirm the incident, what indicators to look for
3. **Containment** -- Short-term (immediate: 15-60 min) and long-term (temporary fixes)
4. **Eradication** -- Remove threat, close attack vector, reset credentials
5. **Recovery** -- Restore systems, validate integrity, monitor for re-compromise
6. **Lessons Learned** -- Post-incident review template with timeline and action items

**Additional sections generated:**
- **Escalation Matrix** -- P1 (critical, 15 min) through P4 (low, 24 hours) with escalation paths
- **Communication Templates** -- Internal advisory, customer notification, regulatory notification (GDPR 72-hour, HIPAA 60-day, India IT Act)
- **Evidence Preservation Checklist** -- Volatile data sequence (RAM, processes, network, disk), chain of custody

---

## Error Handling

| Status Code | Meaning | How to Handle |
|-------------|---------|---------------|
| 200 | Success | FIR: download PDF. Playbook: parse JSON, render `playbook` field |
| 422 | Validation Error | Request body missing required fields. Check the `detail` array for specific field errors |
| 500 | Internal Error | Server-side failure. Retry the request |
| 502 | LLM Provider Error | Google AI Studio returned an error. Retry after a brief wait |

**Example 422 response:**

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "incident_description"],
      "msg": "Field required"
    }
  ]
}
```

---

## Limitations

- **No authentication.** This is a prototype API. Do not expose it publicly without adding API key auth or OAuth middleware.
- **No rate limiting.** Google AI Studio free tier has ~15-20 RPM. Adding server-side rate limiting is recommended for production.
- **LLM latency.** Responses take 5-60 seconds depending on input complexity and model load. Plan your frontend UX with loading states.
- **No persistence.** Generated FIRs and playbooks are not stored. Each request generates fresh output.
- **PDF layout is basic.** Uses Helvetica (built-in PDF font). Non-ASCII characters (Hindi, special symbols) may not render. Use a Unicode font for multilingual support.
- **English only.** Prompts and output are in English. Adding multilingual support would require translated prompts.

---

## Development

### Run stress tests

Start the server, then run the test suite:

```bash
# Terminal 1: Start server
uvicorn main:app --port 8099

# Terminal 2: Run tests
python test_api.py http://localhost:8099
```

The test script covers:
- Health check and root endpoint
- FIR generation (basic and with financial details)
- Playbook generation (basic and data breach scenario)
- Input validation (missing fields, invalid types)
- Concurrent requests (3 simultaneous playbooks)
- Response format verification (PDF header, JSON structure, no thinking tag leaks)

### Run locally without Docker

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key
uvicorn main:app --reload --port 8099
```

API docs at `http://localhost:8099/docs` (Swagger UI) and `http://localhost:8099/redoc` (ReDoc).

---

## License

MIT License. See [LICENSE](LICENSE) for details.
