# Team Workload Distribution

## Allocation Summary

| Member | Role | Share |
|--------|------|-------|
| Sribendu | Lead Architect and ML Engineer | 70% |
| Priyanshu | Frontend Lead | 10% |
| Puspajeet | Security Integrations Specialist | 10% |
| Sujal / Nishu | Data Engineer and QA | 10% |

---

## Sribendu -- Lead Architect and ML Engineer (70%)

Owns every ML pipeline, inference engine, backend API, and infrastructure component.

### AI Inference and ML

| Feature | Responsibility |
|---------|---------------|
| F-01 | PyTorch deepfake service: MTCNN face extraction + EfficientNet-B0 classification |
| F-02 | URL risk ML pipeline: domain age, TLS, homograph, redirect chain scoring |
| F-03 | Phishing classifier: HuggingFace transformer fine-tuned on labeled corpus |
| F-04 | Document tampering: ELA pixel analysis + Tesseract OCR structural consistency |
| F-05 | Digital Content DNA: pHash/dHash registry + cryptographic fingerprint tracking |
| F-06 | Fake news analyzer: spaCy semantic graph + cross-source claim verification |
| F-07 | QR safety engine: payload decoder + redirect tracer + TLS inspection |
| F-08 | Malware scanner: VirusTotal API v3 orchestration + verdict parser |

### Backend Services

| Feature | Responsibility |
|---------|---------------|
| F-09 | Breach check: k-Anonymity SHA-1 prefix DB + Bloom filter + binary search |
| F-10 | Password analyzer: zxcvbn entropy + CSPRNG secure generator |
| F-12 | Encryption sandbox: AES/RSA demonstration endpoints |
| F-13 | Hash generator: SHA-256 file fingerprinting + integrity comparison |
| F-14 | Privacy violation scanner: NLP policy text classifier |
| F-16 | Dockerized Nuclei DAST orchestration backend |
| F-17 | CVE/CWE-to-patch remediation rule engine |
| F-18 | SAST secure-coding assistant: LLM + AST parser |
| F-19 | DNS explainer: dnspython record fetcher + annotated generator |
| F-20 | Case filing PDF engine: ReportLab / WeasyPrint |
| F-21 | Emergency playbooks: rule engine + Jinja2 templates |
| F-22 | Dynamic risk score: weighted aggregator over all scan outputs |
| F-23 | Personalized recommendations: priority-ranked hardening engine |
| F-24 | Screenshot OCR processor + report aggregation |

### Academy and Video Pipeline

| Feature | Responsibility |
|---------|---------------|
| F-25 | Video generator: python-pptx -> LLM script -> TTS -> FFmpeg compositor |
| F-26 | AI Cyber Mentor RAG: LangChain + FAISS/Chroma knowledge base |
| F-27 | Phishing simulator: scenario template engine + flag scoring |
| F-28 | CTF validator: flag checker + progressive hint unlock |
| F-29 | SM-2 spaced repetition algorithm + flashcard scheduling |
| F-30 | Threat intel hub: NVD CVE API + MITRE ATT&CK feed aggregator |

### Infrastructure
- Async FastAPI backend with Redis task queue
- Docker Compose production environment (all services)
- End-to-end latency optimization

---

## Priyanshu -- Frontend Lead (10%)

Owns all Next.js views, interactive components, and API wiring across every feature.

| Page / Component | Features |
|-----------------|---------|
| Global layout: dark-mode dashboard, nav bar, card system | All |
| Deepfake Inspector: upload form, confidence gauge, frame timeline | F-01 |
| URL and Phishing Scanner: risk meter, result card, flag breakdown | F-02, F-03 |
| Document and Fake News Analyzer: diff view, claim graph display | F-04, F-06 |
| QR and Malware Scanner: verdict badge, engine list | F-07, F-08 |
| Breach Sentinel: password input, suffix match result | F-09 |
| Password and Hash Tools: strength bar, options, hash output | F-10, F-13 |
| EXIF Inspector: metadata table, before/after stripped view | F-11 |
| Encryption Sandbox: key gen UI, mode selector, encode/decode panels | F-12 |
| Privacy and Social Media Auditor: risk badges, checklist steps | F-14, F-15 |
| Website Security Auditor: severity badges (Critical/High/Medium/Low) + code-diff viewer | F-16, F-17 |
| Secure-Coding Assistant: code editor, annotated output pane | F-18 |
| Case Filing Form: multi-step wizard, PDF preview, download button | F-20 |
| Cyber Risk Score Dashboard: gauge, trend chart | F-22, F-23 |
| Reporting Portal Forms: scam, fraud, bullying, harassment sets | F-24 |
| Academy -- Video Player: streaming controls, chapter marks | F-25 |
| Academy -- AI Mentor Chat: message thread, source citations | F-26 |
| Academy -- CTF Browser: challenge list, scoreboard, hint countdown | F-28 |
| Academy -- Flashcard: flip component, SM-2 rating buttons | F-29 |
| Academy -- Threat Intel Dashboard: CVE cards, sector filters | F-30 |

---

## Puspajeet -- Security Integrations Specialist (10%)

| Task | Feature | Output |
|------|---------|--------|
| SSL/TLS certificate validation Python module | F-16 | Python helper |
| HTTP security header analyzer (HSTS, CSP, X-Frame-Options) | F-16 | Python helper |
| 50+ Nuclei YAML templates for OWASP Top 10 | F-16 | YAML library |
| Client-side SHA-1 via window.crypto.subtle | F-09 | JavaScript module |
| EXIF reader and scrubber client utility | F-11 | JS/Python utility |
| Social Media Auditor scripts: Instagram, LinkedIn, Twitter | F-15 | Checklist content |
| QR redirect-tracer and TLS verification scripts | F-07 | Python utility |
| VirusTotal API v3 connector and result normalizer | F-08 | Python connector |
| Google Safe Browsing API connector | F-02 | Python connector |
| AWS S3 / Cloudinary cloud storage setup | F-25 | Infrastructure |
| External API response format validation test suite | All | pytest tests |

---

## Sujal / Nishu -- Data Engineer and QA (10%)

| Task | Feature | Output |
|------|---------|--------|
| FaceForensics++ video dataset: 500+ pristine + manipulated clips | F-01 | Labeled dataset |
| 1M+ SHA-1 breach hash ingestion into staging tables | F-09 | Hash database |
| Labeled phishing email and SMS dataset | F-03 | CSV training data |
| Misinformation corpus for fake news benchmarking | F-06 | Labeled articles |
| Malware vs. benign file sample collection | F-08 | Test sample library |
| CTF challenge content authoring and flag validation | F-28 | Challenge descriptions |
| SRS flashcard content: glossary, ports, OWASP, concepts | F-29 | Flashcard JSON dataset |
| Black-box testing across all 30 input forms | All | Bug report log |
| False-positive audits against OWASP Juice Shop and DVWA | F-16 | Audit report |
| Swagger UI + Postman collection for all endpoints | All | API documentation |
| Project README and environment setup guide | All | Markdown docs |
| Final demo pitch deck | All | Presentation slides |

---
*See sprint.md for the week-by-week delivery schedule.*
