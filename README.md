
# 🛡️ TRINETRA // त्रिनेत्र (CyberShield Bharat)
### Sovereign Cyber Defense, Statutory Legal Intelligence & Explainable AI Forensics Console

[![Live Deployment](https://img.shields.io/badge/LIVE_DEPLOYMENT-TRINETRA_CONSOLE-FF5A79?style=for-the-badge&logo=vercel&logoColor=white)](https://trinetra-eight-sigma.vercel.app/)
[![Powered By BharatCode AI](https://img.shields.io/badge/AI_ENGINE-BHARATCODE_API_v1-06B6D4?style=for-the-badge)](https://bharatcode.ai)
[![Models](https://img.shields.io/badge/MODELS-Qwen_3.8_27B_%7C_DeepSeek_V4.1_Flash-10B981?style=for-the-badge)](https://bharatcode.ai)
[![Legal Alignment](https://img.shields.io/badge/STATUTORY_ENGINE-BNS_2023_%7C_BSA_2023_%7C_DPDP_2023-F59E0B?style=for-the-badge)](https://trinetra-eight-sigma.vercel.app/incident)

**🌐 Live Production URL:** [**https://trinetra-eight-sigma.vercel.app/**](https://trinetra-eight-sigma.vercel.app/)

*"Unifying 100% deterministic client-side cryptographic math, stateless BharatCode AI Harness orchestration, automated BNS 2023 police FIR synthesis, and explainable deepfake forensics (CGFD/FADI + Grad-CAM) in one sovereign platform."*


---

## 📌 1. Problem Statement: The Tripartite Vulnerability in Cyberspace

Contemporary national defense and enterprise cybersecurity infrastructures suffer from three systemic failures:

1. **The SOC Fragility & Jurisprudential Blindspot:** Conventional Security Operations Centers (SOCs) rely on rigid signature-based SIEMs that miss polymorphic zero-days, while unguarded LLM wrappers hallucinate CVEs and forensic artifacts. Furthermore, Western security tools (mapped to GDPR or US Title 18) have zero native alignment with Indian criminal law (**Bharatiya Nyaya Sanhita - BNS 2023**, **Bharatiya Sakshya Adhiniyam - BSA 2023**, **IT Act 2000**, **DPDP Act 2023**, and **CERT-In 6-Hour Directives**), causing over 85% of cyber complaints to face procedural delays.
2. **Uncontrolled AI Inference Risk in SecOps:** Sending raw security logs containing citizen PII, credentials, or sensitive government identifiers directly to stateful external LLMs violates sovereign data-retention policies and creates prompt-injection and token-exhaustion vulnerabilities.
3. **The Deepfake Distribution Shift & "Black-Box" Evidentiary Crisis:** Deepfake detectors trained on a single generator (e.g., GANs) suffer up to a **60% accuracy collapse** when tested against unseen architectures (e.g., Diffusion models). Because standard neural networks act as black boxes without mathematical faithfulness verification, their outputs fail courtroom admissibility standards under **BSA 2023 Section 63(4)**.

---

## ⚡ 2. What is AI Harnessing & How TRINETRA Implements the BharatCode AI Harness

### What is an AI Harness?
In mission-critical security engineering, raw LLM API calls are never exposed directly to end-users. An **AI Harness** is a deterministic control plane wrapped around foundation models that enforces **pre-flight input sanitization, PII redaction, defensive statutory guardrails, task-aware multi-model routing, stateless execution, real-time telemetry capture (`x-request-id` & latency), and multi-tier failover**.

### BharatCode AI API Specification Used
TRINETRA's neural intelligence core is powered by the **BharatCode Sovereign AI Gateway** (`https://bharatcode.ai/api/model/v1`):

| Parameter / Component | TRINETRA Implementation Detail | Operational Purpose |
| :--- | :--- | :--- |
| **Primary Endpoint** | `POST https://bharatcode.ai/api/model/v1/responses` | OpenAI-compatible stateless Responses API & SSE streaming (`/chat/completions` compatible). |
| **Primary Reasoning Model** | `qwen-3.8-27b` | High-capacity coding, AST/SAST patch synthesis, BNS 2023 statutory mapping, and Deepfake XAI courtroom briefing. |
| **High-Speed Triage Model** | `deepseek-v4.1-flash` | Sub-second interactive SecOps copilot triage, live log correlation, and rapid incident response playbooks. |
| **Stateless Execution** | `store: false` | Enforces zero server-side conversation retention; conversation state and tool outputs are replayed deterministically from the client/server harness. |
| **Reasoning Budget Control** | `reasoning: { effort: "none" }` | Dynamically injected on fast-triage queries (`deepseek-v4.1-flash`) so internal reasoning tokens never exhaust `max_output_tokens`. |
| **Audit Traceability** | `x-request-id` Header Capture | Every inference response captures the upstream BharatCode `x-request-id`, token usage, and round-trip latency (`ms`) in the live UI Diagnostics Modal. |

### Architecture of the TRINETRA AI Harness (`src/lib/ai-harness.ts`)

```text
[ Analyst Prompt / Incident Log / Code Snippet / XAI Telemetry ]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: PRE-FLIGHT DETERMINISTIC GUARDRAILS (< 0.1 ms)                  │
│ • Prompt Injection & Jailbreak Sanitizer                                │
│ • Statutory Offensive Block (Refuses malware/exploit gen per IT Act §66)│
│ • Zero-Leak PII Scrubber (Masks 12-digit Govt IDs -> [REDACTED-GOVT-ID] │
│   and redacts payment cards & credentials prior to wire transmission)   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: BHARATCODE STATELESS MULTI-MODEL ROUTER                         │
│ • Endpoint: [https://bharatcode.ai/api/model/v1/responses](https://bharatcode.ai/api/model/v1/responses) (store: false) │
│ ├─► Route A (Deep Legal / SAST / XAI Briefs) ──► qwen-3.8-27b           │
│ └─► Route B (Fast SOC Triage / Stream)       ──► deepseek-v4.1-flash    │
│                                                  (reasoning: "none")    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ (Automated Failover on Timeout / 5xx)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: RESILIENT FAILOVER & TELEMETRY VERIFICATION                     │
│ • Primary: qwen-3.8-27b ──► Secondary: deepseek-v4.1-flash              │
│ • Tertiary Fallback: Deterministic Offline Sovereign Forensics Kernel   │
│ • Emits Live Telemetry: { outputText, modelUsed, latencyMs, requestId } │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 3. Live Endpoints & End-to-End Threat Pipeline

| Route | Capabilities |
| :--- | :--- |
| **`POST /api/analyze`** *(alias `/api/nlp/analyze`)* | Live phishing/smishing analysis via `callAIHarness` + multilingual heuristics, auto-extracts URLs, runs 12 lexical/homoglyph markers, and queries **Abuse.ch URLhaus**, **OpenPhish**, **Google Safe Browsing v4**, and **VirusTotal v3**. |
| **`POST /api/devsec/analyze`** | Live DPDP Act 2023 / IT Act 2000 policy violation scanner (`mode: "privacy"`) and custom source code SAST vulnerability auditor (`mode: "sast"`). |
| **`POST /api/fir/generate`** & **`POST /api/playbook/generate`** | Generates court-ready BNS 2023 / IT Act 2000 FIR PDFs and 6-phase SANS PICERL playbooks; accepts 1-click prefill from `/nlp` verdicts. |
| **`POST /api/ai/test`** & **`GET /api/ai/telemetry`** | On-demand BharatCode gateway ping (`x-request-id`, latency, status) and live guardrail telemetry. |
| **`Export BSA 2023 §63 Certificate`** (`/nlp`) | Computes local Web Crypto **SHA-256** digest of raw payload + verdict + UTC/IST timestamps and downloads a signed PDF evidence certificate. |

---

## 🧩 4. Open-Source Ecosystem & Model Catalog

TRINETRA integrates and aligns with open-source security models, blocklists, and SOAR tooling:

| Domain | Open-Source Resource | Purpose |
| :--- | :--- | :--- |
| **SMS / Phishing NLP** | [`Horizon-Labs/phishing-scam-detector-base`](https://huggingface.co/Horizon-Labs/phishing-scam-detector-base) & [`onnx-community/phishing-scam-detector-base-ONNX`](https://huggingface.co/onnx-community/phishing-scam-detector-base-ONNX) | Multilingual SMS/email fraud detection (Apache-2.0, ONNX browser-ready). |
| **Carrier Smishing** | [`telecomsxchange/OpenTextShield`](https://huggingface.co/telecomsxchange/OpenTextShield) | Multilingual BERT ham/spam/phishing classifier. |
| **URL Threat Feeds** | [URLhaus](https://urlhaus.abuse.ch/), [OpenPhish](https://openphish.com/), [PhishTank](https://www.phishtank.com/), [`PhishGuard`](https://github.com/shantheshas24/PhishGuard) | Live malicious URL lookups paired with Shannon entropy & homoglyph checks. |
| **Deepfake XAI** | [`honi05/deepfake-detection`](https://huggingface.co/honi05/deepfake-detection), [`mertkayacs/xdfdet`](https://huggingface.co/mertkayacs/xdfdet), [`ishal1410/deepfake-detection-faceforensics`](https://github.com/ishal1410/deepfake-detection-faceforensics) | EfficientNet + MTCNN + Grad-CAM saliency attribution on FaceForensics++ / Celeb-DF v2. |
| **SOAR & Playbooks** | [CISA Shareable SOAR Workflows](https://github.com/cisagov/shareable-soar-workflows) | Automated containment templates mapped to SANS PICERL & BNS 2023. |

---

## ⚠️ 5. Probabilistic Limitations & Honest Framing

- **Pure Cryptography vs. AI Classification:** SHA-256 hashing, k-anonymity prefix matching (`src/lib/crypto-utils.ts`), and Shannon entropy calculations are deterministic mathematical operations. AI phishing verdicts (`/nlp`) and deepfake saliency maps (`/deepfake-xai`) are **probabilistic indications** and carry explicit UI disclaimers requiring manual human verification before legal or enforcement action.
- **Deepfake XAI Mode:** On serverless Node.js deployments without an attached PyTorch worker, `/deepfake-xai` explicitly labels its matrices (`CGFD`, `FADI`) and Grad-CAM visualizations as **Research Benchmark Outputs (Static Evaluation)**.

---

## 📚 6. Academic References

1. Al Saidat, M. R., Yerima, S. Y., & Shaalan, K. (2024). *Advancements of SMS Smishing Detection: A Comprehensive Survey of NLP and ML Techniques*. Procedia Computer Science, 244, 248–259. DOI: `10.1016/j.procs.2024.10.198`
2. Prajapati, P. et al. (2024). *Smishing: A SMS Phishing Detection Using Various Machine Learning Algorithms*. Springer ICCIS 2023, LNNS vol. 968. DOI: `10.1007/978-981-97-2079-8_7`
3. Mishra, S., & Soni, D. (2023). *DSmishSMS — A system to detect smishing SMS*. Neural Computing and Applications, 35(7). DOI: `10.1007/s00521-021-06305-y`
4. Kaur, A., & Sharma, S. (2026). *An Explainable Deep Learning Framework for Robust Deepfake Detection in Video Streams*. Atlantis Press BEDAIML 2026.
5. Selvaraju, R. R. et al. (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization*. IEEE ICCV 2017, 618–626.
6. Keerthana, & Rajam, (2026). *Explainability-guided local–global fusion for video deepfake detection*. Signal, Image and Video Processing, 20. DOI: `10.1007/s11760-026-05658-y`
7. Seiler, A. (2022). *How to Build and Use an Incident Response Playbook Effectively*. SANS Institute.
8. Kremer, R. et al. (2023). *IC-SECURE: Intelligent System for Assisting Security Experts in Generating Playbooks for Automated Incident Response*. `arXiv:2311.03825`
9. IJRAS (2025). *Digital Criminal Justice: Evaluating the Digital Reforms Introduced under BNS and BNSS*.
10. IJALR (2026). *Cyber Stalking in the Digital Age: Assessing the Effectiveness of BNS 2023 and IT Act 2000*.
