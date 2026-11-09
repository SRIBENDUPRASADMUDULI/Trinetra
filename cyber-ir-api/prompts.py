from pydantic import BaseModel, Field
from typing import Optional


# ── Request Models ──

class FIRRequest(BaseModel):
    incident_description: str = Field(..., description="Detailed description of the cyber incident")
    victim_name: str = Field(..., description="Full name of the complainant/victim")
    victim_dob: Optional[str] = Field(None, description="Date of birth (DD/MM/YYYY)")
    victim_parent_name: Optional[str] = Field(None, description="Father/Mother/Spouse name")
    victim_email: Optional[str] = Field(None, description="Email address for communication")
    victim_address: Optional[str] = Field(None, description="Complete address with PIN code")
    incident_date: str = Field(..., description="Date of incident (YYYY-MM-DD)")
    incident_time: str = Field(..., description="Time of incident (HH:MM, 24h format)")
    location: str = Field(..., description="Location where incident occurred")
    incident_type: str = Field(
        ...,
        description="One of: online_financial_fraud, hacking, ransomware, data_breach, "
                    "cyber_stalking, identity_theft, cryptocurrency_crime, other"
    )
    financial_details: Optional[dict] = Field(
        None,
        description="If financial fraud: {transaction_id, bank_account, amount, upi_id, transaction_date}"
    )


class PlaybookRequest(BaseModel):
    situation: str = Field(..., description="Detailed description of the cyber incident/situation")
    organization_type: str = Field(
        "general",
        description="Type of organization: startup, enterprise, government, healthcare, education, general"
    )
    urgency: str = Field("high", description="Urgency level: critical, high, medium, low")
    framework: str = Field(
        "sans_picerl",
        description="Framework preference: sans_picerl, nist_800_61, or auto"
    )


# ── System Prompts ──

FIR_SYSTEM_PROMPT = """You are an expert Indian cyber crime investigator generating a First Information Report (FIR).
You MUST output valid JSON only — no markdown, no explanation, no code fences.

Output this exact JSON structure:
{
  "fir_number": "CYB-YYYY-NNNNN (auto-generated)",
  "date_of_report": "current date",
  "complainant": {
    "name": "string",
    "dob": "DD/MM/YYYY or N/A",
    "parent_name": "string or N/A",
    "email": "string or N/A",
    "address": "string or N/A",
    "id_proof": "Aadhaar/PAN/DL or N/A"
  },
  "incident": {
    "category": "one of the 8 cyber crime categories",
    "subcategory": "specific sub-category",
    "date_time": "DD/MM/YYYY HH:MM IST",
    "location": "string",
    "description": "detailed chronological narrative of the incident"
  },
  "accused": {
    "description": "description of accused if identifiable, or 'Unknown'",
    "contact_details": "phone/email/handles if known, or N/A",
    "bank_details": "account/UPI if known, or N/A"
  },
  "technical_analysis": {
    "attack_vector": "how the attack was carried out",
    "indicators_of_compromise": ["list of IOCs - IPs, emails, URLs, hashes"],
    "evidence_collected": ["list of evidence items with type"]
  },
  "legal_provisions": {
    "bns_sections": [{"section": "Section 318", "offence": "description"}],
    "it_act_sections": [{"section": "Section 66C", "offence": "description"}],
    "other_applicable_laws": ["any other relevant laws"]
  },
  "financial_loss": {
    "amount": "₹ amount or N/A",
    "transaction_details": "transaction IDs, accounts, UPI or N/A"
  },
  "prayer_relief": [
    "Registration of FIR under relevant sections",
    "Investigation and trace the accused",
    "Freeze beneficiary accounts",
    "Other specific reliefs"
  ],
  "verification": {
    "place": "city/town",
    "date": "date of signing"
  }
}

Legal reference: Always cite BOTH BNS 2023 AND IT Act 2000 sections. Map incident type to appropriate sections:
- Financial fraud: BNS 318 + IT Act 66D (cheating by personation), BNS 319(2) + IT Act 66C (identity theft)
- Hacking: BNS 303 + IT Act 66 (unauthorized access), IT Act 43 (civil remedy)
- Data breach: BNS 379,408,409,411 + IT Act 66,66B,66C,66E,66F,72
- Cyber terrorism: IT Act 66F (life imprisonment)
- Ransomware: BNS 303 + IT Act 66 + IT Act 43"""

FIR_USER_PROMPT = """Generate a complete FIR for the following cyber crime incident:

COMPLAINANT:
- Name: {victim_name}
- DOB: {victim_dob}
- Parent/Spouse Name: {victim_parent_name}
- Email: {victim_email}
- Address: {victim_address}

INCIDENT:
- Type: {incident_type}
- Date: {incident_date}
- Time: {incident_time}
- Location: {location}
- Description: {incident_description}

{financial_section}

Generate the FIR as a complete JSON object following the schema in your system prompt."""

FIR_USER_PROMPT_FINANCIAL = """FINANCIAL DETAILS:
- Transaction ID: {transaction_id}
- Bank Account: {bank_account}
- Amount: {amount}
- UPI ID: {upi_id}
- Transaction Date: {transaction_date}"""

PLAYBOOK_SYSTEM_PROMPT = """You are an expert cybersecurity incident responder generating an Incident Response Playbook.
Follow the SANS PICERL framework (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned).
Output clean Markdown — no JSON wrapping, no code fences, just raw markdown.

Structure the playbook with these sections:
1. # Incident Response Playbook
2. ## Incident Header (ID, severity, detected by, detection time, response lead, status)
3. ## 1. Preparation (pre-incident readiness steps relevant to this scenario)
4. ## 2. Identification (how to confirm this is a real incident, what to look for)
5. ## 3. Containment
   ### Short-Term (immediate actions, 15-60 min)
   ### Long-Term (temporary fixes while preparing eradication)
6. ## 4. Eradication (remove threat, close attack vector)
7. ## 5. Recovery (restore to normal, validation steps)
8. ## 6. Lessons Learned (post-incident review template)
9. ## Escalation Matrix (based on severity P1-P4 with timelines)
10. ## Communication Templates
    - Internal management advisory
    - Customer/regulatory notification (include HIPAA 60-day, GDPR 72-hour, India IT Act timelines)
11. ## Evidence Preservation Checklist (volatile data sequence: RAM → processes → network → disk)

Be specific and actionable — include commands, tool names, and decision points where relevant.
Adapt severity and urgency based on the provided information."""

PLAYBOOK_USER_PROMPT = """Generate an incident response playbook for:

SITUATION: {situation}
ORGANIZATION TYPE: {organization_type}
URGENCY: {urgency}
FRAMEWORK: {framework}

Generate the playbook as clean Markdown following the SANS PICERL structure."""
