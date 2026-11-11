
# 🛡️ TRINETRA // त्रिनेत्र (CyberShield Bharat)
### Sovereign Cyber Defense, Statutory Legal Intelligence & Explainable AI Forensics Console

[![Live Deployment](https://img.shields.io/badge/LIVE_DEPLOYMENT-TRINETRA_CONSOLE-FF5A79?style=for-the-badge&logo=vercel&logoColor=white)](https://trinetra-bz1dg7rf4-sribendu-work.vercel.app/)
[![Powered By BharatCode AI](https://img.shields.io/badge/AI_ENGINE-BHARATCODE_API_v1-06B6D4?style=for-the-badge)](https://bharatcode.ai)
[![Models](https://img.shields.io/badge/MODELS-Qwen_3.8_27B_%7C_DeepSeek_V4.1_Flash-10B981?style=for-the-badge)](https://bharatcode.ai)
[![Legal Alignment](https://img.shields.io/badge/STATUTORY_ENGINE-BNS_2023_%7C_BSA_2023_%7C_DPDP_2023-F59E0B?style=for-the-badge)](https://trinetra-bz1dg7rf4-sribendu-work.vercel.app/incident)

**🌐 Live Production URL:** [**[https://trinetra-bz1dg7rf4-sribendu-work.vercel.app/](https://trinetra-eight-sigma.vercel.app)](https://trinetra-eight-sigma.vercel.app)**](https://trinetra-bz1dg7rf4-sribendu-work.vercel.app/)

*"Unifying 100% deterministic client-side cryptographic math, stateless BharatCode AI Harness orchestration, automated BNS 2023 police FIR synthesis, and explainable deepfake forensics (CGFD/FADI + Grad-CAM) in one sovereign platform."*

</div>

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
