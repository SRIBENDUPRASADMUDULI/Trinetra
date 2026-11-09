# Cybersec AI Platform — Project Documentation

> **Unified AI-driven cybersecurity platform** — 30+ tools spanning threat forensics, identity protection, web security, citizen support, and a gamified cyber academy.

---

## Table of Contents

1. Project Overview
2. Complete Feature Registry
3. Team Structure and Workload Allocation
4. Sprint Schedule and Deliverables
5. Individual Member Task Briefs
6. Technology Stack
7. System Architecture Overview
8. Module Descriptions
9. Glossary

---

## 1. Project Overview

This platform is a full-stack, AI-driven cybersecurity suite composed of five macro-modules housing 30+ individual tools:

| Macro-Module | Feature Count | Description |
|---|---|---|
| AI Threat Detection and Forensics | 8 tools | Deepfake detection, URL/phishing/document/malware analysis |
| Identity, Privacy and Utilities | 7 tools | Breach check, password tools, EXIF, encryption sandbox |
| Web and Developer Security | 4 tools | DAST scanner, auto-remediation, SAST assistant, DNS explainer |
| Citizen Support and Incident Response | 5 tools | Case filing, playbooks, risk score, reporting portals |
| Gamified Academy and AI Mentorship | 6 tools | AI video generator, RAG mentor, CTF, simulators |

---

## 2. Complete Feature Registry

### 2.1 AI Threat Detection and Forensics

| ID | Feature | Description |
|---|---|---|
| F-01 | Deepfake Video Detection | Neural network analysis scanning video frames for synthetic manipulation, face-swapping, and audio-visual desync |
| F-02 | URL Risk Classifier | ML model assigning a 0-100 risk score to links, identifying homograph attacks and hidden redirects |
| F-03 | Phishing Email and Text Classifier | NLP model analyzing email headers, SMS urgency triggers, and credential-harvesting language |
| F-04 | Document Tampering Detector | Structural and pixel-level forgery detection for PDFs and images using ELA and OCR |
| F-05 | Digital Content DNA | Perceptual hashing and cryptographic tracking to identify unauthorized reuse, spoofing, and plagiarism |
| F-06 | Fake News Analyzer | Misinformation detection via cross-source verification and semantic graph analysis |
| F-07 | QR Code Safety / Quishing | Static and dynamic payload evaluation, redirect tracing, and TLS inspection before execution |
| F-08 | Malware and File Scanner | VirusTotal API integration to scan uploaded files, APKs, and executables for embedded payloads |

### 2.2 Identity, Privacy and Utilities

| ID | Feature | Description |
|---|---|---|
| F-09 | Custom Breach Check Engine | k-Anonymity (5-char SHA-1 prefixes) to verify compromised passwords — password never leaves browser |
| F-10 | Password Analyzer and Generator | Entropy calculation, dictionary pattern detection, cryptographically secure password generation |
| F-11 | EXIF Inspector and Scrubber | Read and permanently strip hidden metadata (GPS, device info) from images |
| F-12 | Encryption Sandbox | Visual AES/RSA encryption/decryption playground to understand cryptographic principles |
| F-13 | Hash Generator and File Integrity | Generate SHA-256 fingerprints and verify file modification status |
| F-14 | Privacy Violation Scanner | Highlight unlawful data collection, surveillance risks, excessive permissions in app policies |
| F-15 | Social Media Auditor | Interactive step-by-step checklists to lock down privacy settings on Instagram, LinkedIn, etc. |

### 2.3 Web and Developer Security

| ID | Feature | Description |
|---|---|---|
| F-16 | Website Secureness Checker | DAST scanner checking for exposed endpoints, misconfigurations, and vulnerabilities |
| F-17 | Automated Bug Remediation | Engine providing exact code snippets and patches to fix scanner-identified vulnerabilities |
| F-18 | Secure-Coding Assistant | AI agent reviewing pasted code (SAST), explaining SQLi/XSS flaws, providing secure syntax |
| F-19 | DNS Explainer | Beginner-friendly breakdown of domain records (A, MX, TXT) and security implications |

### 2.4 Citizen Support and Incident Response

| ID | Feature | Description |
|---|---|---|
| F-20 | 1-Click Case Filing | Guided forms to document cybercrimes and generate FIR-ready PDFs |
| F-21 | Emergency Assistance Playbooks | Automated step-by-step remediation guides triggered for active threats |
| F-22 | Dynamic Cyber Risk Score | Continuous calculation of user security posture based on all tool scans |
| F-23 | Personalized Posture Recommendations | Priority-based checklists to harden specific vulnerabilities |
| F-24 | Reporting Portals | Modules for fake job scams, fraud, cyberbullying, and harassment with screenshot OCR |

### 2.5 Gamified Academy and AI Mentorship

| ID | Feature | Description |
|---|---|---|
| F-25 | AI Avatar Video Generator | PPT/PDF to narrated micro-learning videos with lip-synced AI presenters |
| F-26 | AI Cyber Mentor / RAG | Context-aware chatbot explaining tool outputs, security doubts, and CTF hints |
| F-27 | Phishing and Social Engineering Simulator | Sandboxed environment where users earn points identifying red flags |
| F-28 | CTF Challenges | In-browser Web and Crypto exercises for hands-on problem-solving |
| F-29 | Spaced Repetition System | Adaptive flashcards for security glossary, concepts, and port numbers |
| F-30 | Threat Intelligence Hub | Dashboards tracking critical infrastructure attacks and cybercrime case studies |

---

## 3. Team Structure and Workload Allocation

```
Role                                        Share    Primary Ownership
------------------------------------------  -------  -----------------------------------------
Lead Architect and ML Engineer (Sribendu)   70%      All ML, backend, inference, orchestration
Frontend Lead (Priyanshu)                   10%      Next.js UI, dashboards, visualizations
Security Integrations Specialist (Puspajeet)10%      Scanner wrappers, crypto helpers, APIs
Data Engineer and QA (Sujal / Nishu)        10%      Datasets, QA, docs, automation testing
```

### 3.1 Lead Architect and ML Engineer (Sribendu) — 70%

AI Threat Detection and Forensics:
- F-01: Deepfake inference — PyTorch, MTCNN, EfficientNet-B0
- F-02: URL Risk Classifier — ML scoring pipeline with homograph/redirect detection
- F-03: Phishing Classifier — HuggingFace Transformers, NLP pipeline
- F-04: Document Tampering — ELA pixel analysis + OCR structural anomaly detection
- F-05: Digital Content DNA — Perceptual hashing (pHash/dHash) + cryptographic registry
- F-06: Fake News Analyzer — Semantic graph + cross-source claim verification
- F-07: QR Code Safety — Payload decoder + redirect tracer + TLS inspection
- F-08: Malware Scanner — VirusTotal API v3 orchestration + result parser

Identity, Privacy and Utilities:
- F-09: Breach Check Engine — k-Anonymity SHA-1 prefix DB + Bloom filter + binary search
- F-10: Password Analyzer — zxcvbn entropy + CSPRNG generator
- F-12: Encryption Sandbox — AES/RSA demonstration endpoints (PyCryptodome)
- F-13: Hash Generator — SHA-256 file fingerprinting + integrity comparison
- F-14: Privacy Violation Scanner — Policy text NLP classifier

Web and Developer Security:
- F-16: Website Secureness Checker — Dockerized Nuclei DAST orchestration
- F-17: Automated Bug Remediation — CVE/CWE-to-patch rule engine
- F-18: Secure-Coding Assistant — SAST LLM pipeline with AST parser
- F-19: DNS Explainer — dnspython record fetcher + annotated response generator

Citizen Support and Incident Response:
- F-20: Case Filing PDF Engine — ReportLab / WeasyPrint
- F-21: Emergency Playbooks — Rule engine + Jinja2 templates
- F-22: Dynamic Risk Score — Weighted scoring aggregator
- F-23: Posture Recommendations — Priority-ranked hardening checklist engine
- F-24: Reporting Portals — Tesseract OCR screenshot processor + report aggregation

Gamified Academy and AI Mentorship:
- F-25: AI Avatar Video Generator — python-pptx / PyMuPDF → LLM → TTS → FFmpeg
- F-26: AI Cyber Mentor RAG — LangChain + FAISS/Chroma vector store
- F-27: Phishing Simulator Engine — Scenario templates + flag scoring
- F-28: CTF Validator + Hints — Flag checker + hint unlock logic
- F-29: SM-2 Spaced Repetition — SM-2 algorithm implementation + flashcard DB
- F-30: Threat Intel Feed Aggregator — NVD CVE API + MITRE ATT&CK feed

Infrastructure:
- Async FastAPI backend + Redis task queue
- Docker Compose production environment
- End-to-end latency optimization

### 3.2 Priyanshu — Frontend Lead (10%)

| View / Component | Features Served |
|---|---|
| Global: Dark-mode dashboard, nav bar | All modules |
| Deepfake Inspector page | F-01 |
| URL and Phishing Scanner page | F-02, F-03 |
| Document and Fake News Analyzer page | F-04, F-06 |
| QR and Malware Scanner page | F-07, F-08 |
| Breach Sentinel page | F-09 |
| Password and Hash Tools page | F-10, F-13 |
| EXIF Inspector page | F-11 |
| Encryption Sandbox page | F-12 |
| Privacy and Social Media Auditor page | F-14, F-15 |
| Website Security Auditor page | F-16, F-17 |
| Secure-Coding Assistant page | F-18 |
| Case Filing form page | F-20 |
| Risk Score dashboard | F-22, F-23 |
| Reporting Portal forms | F-24 |
| Academy: Video player | F-25 |
| Academy: AI Mentor chat | F-26 |
| Academy: CTF scoreboard | F-28 |
| Academy: Flashcard component | F-29 |
| Academy: Threat Intel dashboard | F-30 |

### 3.3 Puspajeet — Security Integrations Specialist (10%)

| Task | Feature |
|---|---|
| SSL/TLS validation + HTTP header detection scripts | F-16 |
| 50+ Nuclei YAML templates for OWASP Top 10 | F-16 |
| Client-side SHA-1 hashing via Web Crypto API | F-09 |
| EXIF reader/scrubber client utility | F-11 |
| Social Media Auditor platform-specific scripts | F-15 |
| QR redirect-tracer and TLS verification scripts | F-07 |
| VirusTotal API connector and result normalizer | F-08 |
| Google Safe Browsing API connector | F-02 |
| AWS S3 / Cloudinary cloud storage setup | F-25 |
| External API response format validation test suite | All |

### 3.4 Sujal / Nishu — Data Engineer and QA (10%)

| Task | Feature |
|---|---|
| FaceForensics++ video dataset (500+ clips, pristine + manipulated) | F-01 |
| 1M+ SHA-1 breach hash ingestion into staging tables | F-09 |
| Labeled phishing email and SMS dataset curation | F-03 |
| Misinformation corpus for fake news classifier benchmarking | F-06 |
| Malware vs. benign file sample collection | F-08 |
| CTF challenge content authoring and flag validation | F-28 |
| SRS flashcard content — glossary, ports, concepts | F-29 |
| Black-box testing across all 30 input forms | All |
| False-positive audits against OWASP Juice Shop and DVWA | F-16 |
| Swagger UI + Postman API documentation | All |
| Project README and deployment guide | All |
| Demo pitch deck | All |


---

## 4. Sprint Schedule and Deliverables

### Phase 1 — Architecture and Data Foundations (Weeks 1-2)

Lead Architect:
- [ ] Design async FastAPI backend architecture + Redis task queue
- [ ] Set up deep learning pipeline (PyTorch + MTCNN)
- [ ] Architect k-anonymity DB schema with 5-char SHA-1 prefix indexing
- [ ] Design modular plugin architecture to host all 30 tool endpoints
- [ ] Define scoring schema for Dynamic Cyber Risk Score (F-22)

Priyanshu:
- [ ] Build base Next.js layout, dark-mode navigation, and dashboard card components
- [ ] Scaffold all five section pages (routing structure)

Puspajeet:
- [ ] Write standalone SSL/TLS and HTTP header analysis scripts
- [ ] Set up VirusTotal + Google Safe Browsing API connectors

Sujal / Nishu:
- [ ] Download and prepare FaceForensics++ video dataset (F-01)
- [ ] Curate phishing email dataset for classifier training (F-03)

---

### Phase 2 — Deepfake, HIBP and Forensics Engine (Weeks 3-4)

Lead Architect:
- [ ] Train/fine-tune EfficientNet-B0 for deepfake classification (F-01)
- [ ] Build k-anonymity breach lookup endpoint with Bloom filter (F-09)
- [ ] Implement URL Risk Classifier ML pipeline (F-02)
- [ ] Implement Phishing Email and Text Classifier (F-03)
- [ ] Build Document Tampering detector using ELA + OCR (F-04)
- [ ] Build video frame decomposition and batch inference worker

Priyanshu:
- [ ] Video upload UI + confidence gauge component (F-01)
- [ ] Breach check form + result display (F-09)
- [ ] URL risk meter component (F-02)

Puspajeet:
- [ ] Implement client-side SHA-1 hashing via Web Crypto API (F-09)
- [ ] EXIF reader/scrubber client utility (F-11)
- [ ] QR redirect-tracing and TLS inspection scripts (F-07)

Sujal / Nishu:
- [ ] Ingest 1M+ SHA-1 hashes into breach staging tables (F-09)
- [ ] Prepare malware vs. benign sample dataset (F-08)
- [ ] Begin black-box testing on Phase 1 endpoints

---

### Phase 3 — Web Security, Privacy Tools and Citizen Support (Weeks 5-6)

Lead Architect:
- [ ] Dockerized Nuclei DAST orchestration backend (F-16)
- [ ] CVE/CWE-to-patch Remediation Logic Engine (F-17)
- [ ] SAST Secure-Coding Assistant pipeline (F-18)
- [ ] DNS record fetcher + explainer endpoint (F-19)
- [ ] Privacy Violation Scanner policy parser (F-14)
- [ ] PDF generation for Case Filing engine (F-20)
- [ ] Dynamic Cyber Risk Score aggregation engine (F-22)
- [ ] Fake News Analyzer semantic graph pipeline (F-06)
- [ ] Digital Content DNA perceptual hashing registry (F-05)
- [ ] Password entropy calculator + CSPRNG generator (F-10)
- [ ] Hash Generator and File Integrity endpoint (F-13)
- [ ] Encryption Sandbox AES/RSA endpoints (F-12)
- [ ] Emergency Playbook rule-triggered generator (F-21)
- [ ] Screenshot OCR for Reporting Portals (F-24)

Priyanshu:
- [ ] Vulnerability report page: severity badges + code-diff viewer (F-16, F-17)
- [ ] Encryption sandbox playground UI (F-12)
- [ ] Password strength meter (F-10)
- [ ] EXIF metadata results table (F-11)
- [ ] Case filing multi-step form + PDF preview (F-20)
- [ ] Risk score dashboard gauge (F-22)

Puspajeet:
- [ ] 50+ Nuclei YAML templates for OWASP Top 10 (F-16)
- [ ] Social Media Auditor checklist scripts — Instagram, LinkedIn (F-15)
- [ ] AWS S3 / Cloudinary cloud storage setup

Sujal / Nishu:
- [ ] Manual false-positive audits on DAST scanner (OWASP Juice Shop, DVWA)
- [ ] Fake news and misinformation corpus compilation (F-06)
- [ ] Author CTF challenge descriptions and solutions (F-28)
- [ ] Begin Swagger documentation for Phase 2 and 3 endpoints

---

### Phase 4 — Academy, Video Generation and Full Integration (Weeks 7-8)

Lead Architect:
- [ ] PPT/PDF to LLM script to TTS to FFmpeg video compositor (F-25)
- [ ] LangChain RAG AI Cyber Mentor pipeline (F-26)
- [ ] Phishing Simulator backend + scoring engine (F-27)
- [ ] CTF challenge validator + hint system (F-28)
- [ ] SM-2 spaced repetition algorithm implementation (F-29)
- [ ] Threat Intelligence Hub feed aggregator + dashboard pipeline (F-30)
- [ ] Personalized posture recommendations engine (F-23)
- [ ] QR Code safety full pipeline finalization (F-07)
- [ ] Malware/file scanner VirusTotal orchestration (F-08)
- [ ] End-to-end latency optimization + full Docker Compose production build

Priyanshu:
- [ ] AI Avatar video player + streaming controls (F-25)
- [ ] AI Mentor chatbot interface (F-26)
- [ ] CTF challenge browser + scoreboard UI (F-28)
- [ ] Flashcard flip component (F-29)
- [ ] Threat intelligence feed dashboard (F-30)
- [ ] Downloadable PDF audit report UI
- [ ] Social Media Auditor interactive checklist UI (F-15)
- [ ] Reporting portal forms (F-24)

Puspajeet:
- [ ] VirusTotal integration wrapper + result normalizer (F-08)
- [ ] Google Safe Browsing fallback integration (F-02)
- [ ] QR payload resolver and TLS verification finalization (F-07)
- [ ] External API test suite coverage for all connectors

Sujal / Nishu:
- [ ] SRS flashcard content — glossary, port numbers, concepts (F-29)
- [ ] Full end-to-end regression test suite across all 30 tools
- [ ] Complete Swagger/Postman API documentation
- [ ] Project README, deployment guide, and demo pitch deck

---

## 5. Individual Member Task Briefs

### 5.1 Lead Architect and ML Engineer (Sribendu)

Inference and ML Services:

| Task | Feature | Stack |
|---|---|---|
| Deepfake Inference Service | F-01 | PyTorch, MTCNN, EfficientNet-B0 |
| URL Risk Classifier | F-02 | Scikit-learn / XGBoost |
| Phishing Email/Text Classifier | F-03 | HuggingFace Transformers |
| Document Tampering Detector | F-04 | Pillow, Tesseract, NumPy |
| Digital Content DNA | F-05 | ImageHash (pHash/dHash), SHA-256 |
| Fake News Semantic Analyzer | F-06 | spaCy, NetworkX, cross-source APIs |
| QR Code Safety Engine | F-07 | qrcode, requests, TLS libs |
| Malware/File Scanner | F-08 | VirusTotal API v3 |

Backend and Database Services:

| Task | Feature | Stack |
|---|---|---|
| Breach k-Anonymity Endpoint | F-09 | FastAPI, Bloom filter, binary search |
| Password Entropy + CSPRNG | F-10 | zxcvbn, secrets module |
| Encryption Sandbox Endpoints | F-12 | PyCryptodome (AES/RSA) |
| Hash Generator + Integrity | F-13 | hashlib SHA-256 |
| Privacy Policy Parser | F-14 | NLP classifier |
| DNS Explainer Endpoint | F-19 | dnspython |
| Case Filing PDF Engine | F-20 | ReportLab / WeasyPrint |
| Dynamic Risk Score Engine | F-22 | Weighted scoring aggregator |
| Emergency Playbook Generator | F-21 | Rule engine + Jinja2 |
| OCR Screenshot Processor | F-24 | Tesseract OCR |

Security Scanner and Remediation:

| Task | Feature | Stack |
|---|---|---|
| Dockerized Nuclei DAST Daemon | F-16 | Nuclei, Docker SDK |
| CVE/CWE Remediation Engine | F-17 | Rule-based patch mapper |
| SAST Secure-Coding Assistant | F-18 | LLM + AST parser |

Academy and Video Pipeline:

| Task | Feature | Stack |
|---|---|---|
| PPT/PDF to Video Pipeline | F-25 | python-pptx, LLM, TTS, FFmpeg |
| AI Cyber Mentor RAG | F-26 | LangChain, FAISS/Chroma |
| Phishing Simulator Engine | F-27 | Scenario templates + scorer |
| CTF Validator + Hints | F-28 | Flag checker logic |
| SM-2 Spaced Repetition | F-29 | SM-2 algorithm |
| Threat Intel Feed Aggregator | F-30 | NVD CVE API, MITRE ATT&CK |

### 5.2 Priyanshu — UI / Frontend

(See Section 3.2 for full page-to-feature mapping)

Key deliverables: Dark-mode Next.js dashboard, 20+ distinct views, video player, chatbot UI, CTF browser, flashcard component, confidence gauges, severity badge system, code-diff viewer, multi-step case filing form.

### 5.3 Puspajeet — Utilities and Integration Scripts

(See Section 3.3 for full task-to-feature mapping)

Key deliverables: SSL/TLS scripts, 50+ Nuclei templates, browser-side SHA-1 hashing, EXIF client utility, platform auditor scripts, VirusTotal/Safe Browsing connectors, cloud storage setup.

### 5.4 Sujal / Nishu — Data Engineer and QA

(See Section 3.4 for full task-to-feature mapping)

Key deliverables: Video and breach hash datasets, phishing/fake-news corpora, CTF content, SRS flashcards, full black-box test suite, false-positive audits, Swagger/Postman docs, README, pitch deck.

---

## 6. Technology Stack

### Backend

| Component | Technology |
|---|---|
| API Framework | FastAPI (async) |
| Task Queue | Redis + Celery / ARQ |
| ML Framework | PyTorch |
| Face Detection | MTCNN |
| Image Classification | EfficientNet-B0 |
| NLP / Transformers | HuggingFace Transformers |
| RAG / LLM Orchestration | LangChain |
| Vector Store | FAISS / ChromaDB |
| Security Scanner | Nuclei (Dockerized) |
| Video Processing | FFmpeg |
| PDF Generation | ReportLab / WeasyPrint |
| OCR | Tesseract OCR |
| Graph Analysis | spaCy, NetworkX |
| Cryptography | PyCryptodome, hashlib |
| Password Analysis | zxcvbn |
| Containerization | Docker / Docker Compose |

### Frontend

| Component | Technology |
|---|---|
| Framework | Next.js |
| Styling | Tailwind CSS |
| Icons | Lucide |
| HTTP Client | Axios / Fetch API |
| Client Crypto | Web Crypto API (window.crypto.subtle) |
| Visualizations | Recharts / D3.js |

### Data and Storage

| Component | Technology |
|---|---|
| Breach Database | Indexed SHA-1 prefix store (Bloom filters + binary search) |
| Vector Database | FAISS / ChromaDB |
| File Storage | AWS S3 / Cloudinary |
| Relational Store | PostgreSQL / SQLite |
| Dataset Sources | FaceForensics++, OWASP Juice Shop, DVWA |

### External APIs

| Service | Purpose | Feature |
|---|---|---|
| VirusTotal API v3 | File/URL/APK malware scanning | F-08 |
| Google Safe Browsing | Malicious URL detection | F-02 |
| HIBP / Custom Breach DB | Credential breach lookup | F-09 |
| NVD CVE Feed | Live vulnerability intelligence | F-30 |
| MITRE ATT&CK | Threat tactic and technique data | F-30 |

---

## 7. System Architecture Overview

```
+------------------------------------------------------------------------+
|                         Next.js Frontend                               |
|   [Forensics]  [Identity]  [Web Sec]  [Citizen Support]  [Academy]    |
+----------------------------------+-------------------------------------+
           | Axios/Fetch           | Web Crypto API (SHA-1 in browser)
           v                       v
+------------------------------------------------------------------------+
|                   FastAPI Backend -- Async Core                        |
|   Redis Task Queue | Docker Compose | Modular Plugin Architecture      |
|                                                                        |
|  +------------------+  +------------------+  +--------------------+   |
|  | AI Threat        |  | Identity and     |  | Web and Dev        |   |
|  | Forensics Engine |  | Privacy Tools    |  | Security Engine    |   |
|  | F-01 to F-08     |  | F-09 to F-15     |  | F-16 to F-19       |   |
|  +--------+---------+  +--------+---------+  +---------+----------+   |
|           |                     |                       |              |
|  +--------v---------+  +--------v---------+  +---------v----------+   |
|  | PyTorch / MTCNN  |  | SHA-1 Prefix DB  |  | Nuclei Docker      |   |
|  | EfficientNet-B0  |  | Bloom Filter     |  | DAST Orchestrator  |   |
|  | HuggingFace NLP  |  | zxcvbn / CSPRNG  |  | Remediation Engine |   |
|  | ELA / pHash / OCR|  | AES/RSA Sandbox  |  | SAST LLM Pipeline  |   |
|  +------------------+  +------------------+  +--------------------+   |
|                                                                        |
|  +------------------+  +--------------------------------------------+ |
|  | Citizen Support  |  | Gamified Academy                           | |
|  | F-20 to F-24     |  | F-25 to F-30                               | |
|  +--------+---------+  +--------+-----------------------------------+ |
|           |                     |                                      |
|  +--------v---------+  +--------v-----------+                         |
|  | PDF Generator    |  | LangChain RAG      |                         |
|  | Risk Score Engine|  | PPT->LLM->TTS->FFmpeg|                       |
|  | Playbook Rules   |  | CTF Validator      |                         |
|  | Tesseract OCR    |  | SM-2 SRS Engine    |                         |
|  +------------------+  +--------------------+                         |
+------------------------------------------------------------------------+
         |                      |                     |
+--------v--------+  +----------v------+  +-----------v-------+
| AWS S3 /        |  | External APIs   |  | FAISS / ChromaDB  |
| Cloudinary      |  | VirusTotal      |  | (RAG Vector Store)|
| (File Storage)  |  | Google SafeBrowse|  +-------------------+
+-----------------+  | NVD CVE Feed   |
                     +-----------------+
```

---

## 8. Module Descriptions

### 8.1 AI Threat Detection and Forensics

F-01 Deepfake Video Detection:
Frame-by-frame neural analysis. MTCNN extracts face crops; EfficientNet-B0 classifies each crop. Temporal consistency analysis detects audio-visual desync. Output: per-frame confidence scores and aggregate deepfake probability.

F-02 URL Risk Classifier:
ML model trained on phishing URL datasets. Features: domain age, TLS validity, homograph character detection, redirect chain depth. Output: 0-100 risk score with explanation tags.

F-03 Phishing Email and Text Classifier:
HuggingFace transformer fine-tuned on labeled phishing corpora. Analyzes: email header anomalies, urgency word triggers, sender spoofing patterns, and credential-harvesting links in SMS.

F-04 Document Tampering Detector:
Error Level Analysis (ELA) on JPEG compression artifacts reveals pixel-level edits. Tesseract OCR extracts text and compares structural consistency. Supports PDFs and common image formats.

F-05 Digital Content DNA:
Generates perceptual hashes (pHash/dHash) for images and videos. Maintains a cryptographic registry to track unauthorized reuse, near-duplicate spoofing, and plagiarism at scale.

F-06 Fake News Analyzer:
Semantic graph built from article claims cross-referenced against trusted source APIs. Identifies contradictory claims, synthetic quotes, and misattributed content.

F-07 QR Code Safety (Quishing):
Decodes static and dynamic QR payloads. Traces full redirect chains. Performs TLS certificate inspection on the final destination before reporting safe/unsafe verdict.

F-08 Malware and File Scanner:
Submits files to VirusTotal API v3. Parses multi-engine verdicts, threat names, and behavioral indicators. Supports APKs, executables, documents, and archives.

### 8.2 Identity, Privacy and Utilities

F-09 Custom Breach Check Engine:
k-Anonymity protocol: browser computes SHA-1 hash, sends only 5-char prefix to server. Server returns matching suffix set; client checks locally. Password never transmitted in plaintext. Backed by 1M+ indexed credential hashes.

F-10 Password Analyzer and Generator:
zxcvbn entropy analysis, dictionary attack simulation, pattern detection (keyboard walks, dates, names). CSPRNG-based generator with configurable length and character sets.

F-11 EXIF Inspector and Scrubber:
Reads all EXIF tags (GPS coordinates, device model, creation timestamps). Strips metadata permanently from images using Pillow. Provides before/after comparison view.

F-12 Encryption Sandbox:
Interactive AES (CBC/GCM) and RSA encryption/decryption demonstrations. Shows key generation, IV handling, padding, and base64 encoding steps visually for educational purposes.

F-13 Hash Generator and File Integrity:
Accepts file uploads or text input. Generates SHA-256 (and MD5/SHA-1 for legacy comparison). Compares two hashes to verify file has not been tampered with.

F-14 Privacy Violation Scanner:
Parses app privacy policies and terms-of-service text. Flags clauses indicating unlawful data collection, third-party sharing, indefinite data retention, or excessive permission requests.

F-15 Social Media Auditor:
Platform-specific interactive checklists for Instagram, LinkedIn, Twitter/X, and Facebook. Step-by-step guides with screenshots to lock down each privacy setting category.

### 8.3 Web and Developer Security

F-16 Website Secureness Checker:
Dockerized Nuclei DAST runner executes 50+ YAML templates against the target URL. Outputs classified vulnerability list by CVE/CWE with severity rating: Critical, High, Medium, Low, Info.

F-17 Automated Bug Remediation:
Rule-based engine maps each CVE/CWE finding to a code-level patch. Examples: missing CSP generates header config; CORS wildcard becomes restrictive policy; SQL concat becomes parameterized query.

F-18 Secure-Coding Assistant:
Accepts pasted code (Python, JS, PHP, etc.). LLM + AST parser identifies anti-patterns: unsanitized inputs, hardcoded secrets, insecure randomness, missing authentication checks. Returns secure rewrite with inline explanations.

F-19 DNS Explainer:
Fetches live DNS records for a domain (A, AAAA, MX, TXT, CNAME, SPF, DMARC). Annotates each record with a security implication. Missing SPF = email spoofing risk. Missing DMARC = phishing vector.

### 8.4 Citizen Support and Incident Response

F-20 1-Click Case Filing:
Guided multi-step form captures incident type, timeline, evidence screenshots, financial impact, and perpetrator details. Generates a structured FIR-ready PDF downloadable by the user.

F-21 Emergency Assistance Playbooks:
Trigger-based response system. On detecting an active threat type such as account takeover, auto-generates a prioritized step-by-step containment guide with external authority links.

F-22 Dynamic Cyber Risk Score:
Aggregates scan results from all tool modules into a composite 0-100 security posture score. Score updates continuously as new scans complete and displays trend over time.

F-23 Personalized Posture Recommendations:
Reads the risk score breakdown and generates a priority-ranked checklist of specific hardening actions mapped to the user's weakest security areas.

F-24 Reporting Portals:
Dedicated submission modules for fake job/internship scams, online financial fraud, cyberbullying, and harassment. Screenshot OCR extracts evidence text automatically. Submissions stored as structured incident reports.

### 8.5 Gamified Academy and AI Mentorship

F-25 AI Avatar Video Generator:
Pipeline: python-pptx/PyMuPDF extracts slide text, LLM generates narration script, TTS synthesizes audio, FFmpeg composites slide visuals with avatar animation and audio into downloadable MP4.

F-26 AI Cyber Mentor (RAG):
LangChain-powered chatbot over an indexed cybersecurity knowledge base (FAISS/Chroma). Answers tool output questions, explains vulnerabilities, provides CTF hints, and adapts to the user's current learning context.

F-27 Phishing and Social Engineering Simulator:
Presents sandboxed fake emails, login pages, and SMS prompts. User identifies red flags and earns points per correct identification. Leaderboard and badge system for competitive learning.

F-28 CTF Challenges:
In-browser Web Security and Cryptography exercises. Server validates submitted flags. Progressive hint unlock system reduces score on each hint use. Categories: Injection, Crypto, Forensics, OSINT.

F-29 Spaced Repetition System (SRS):
SM-2 algorithm schedules flashcard reviews at optimal intervals. Cards cover security glossary terms, OWASP vulnerabilities, TCP/UDP port numbers, and cryptography concepts. Tracks mastery per card.

F-30 Threat Intelligence Hub:
Aggregates live feeds from NVD CVE database, MITRE ATT&CK techniques, government sector breach reports, and critical infrastructure incident data. Visualized as a real-time intelligence dashboard with filters by sector, severity, and date.

---

## 9. Glossary

| Term | Definition |
|---|---|
| AES | Advanced Encryption Standard — symmetric block cipher |
| AST | Abstract Syntax Tree — code structure used in SAST analysis |
| ATT&CK | Adversarial Tactics, Techniques and Common Knowledge (MITRE framework) |
| Bloom Filter | Probabilistic data structure for fast set-membership queries |
| CORS | Cross-Origin Resource Sharing — controls cross-domain HTTP requests |
| CSPRNG | Cryptographically Secure Pseudo-Random Number Generator |
| CSP | Content Security Policy — HTTP header mitigating XSS attacks |
| CTF | Capture The Flag — competitive security challenge format |
| CVE | Common Vulnerabilities and Exposures — standardized vulnerability IDs |
| CWE | Common Weakness Enumeration — categorization of software weaknesses |
| DAST | Dynamic Application Security Testing — testing a running web application |
| DMARC | Domain-based Message Authentication — email spoofing protection protocol |
| ELA | Error Level Analysis — pixel-level image forgery detection technique |
| EXIF | Exchangeable Image File Format — metadata embedded in image files |
| FAISS | Facebook AI Similarity Search — vector index for RAG retrieval |
| FFmpeg | Open-source multimedia framework for video and audio processing |
| FIR | First Information Report — formal police complaint document |
| HIBP | Have I Been Pwned — breach intelligence database |
| k-Anonymity | Privacy model: each record indistinguishable from at least k-1 others |
| LangChain | Framework for building LLM-powered RAG and agent pipelines |
| MITRE | Nonprofit maintaining the CVE and ATT&CK frameworks |
| MTCNN | Multi-task Cascaded Convolutional Networks — real-time face detection |
| NLP | Natural Language Processing |
| Nuclei | Open-source DAST scanner using YAML vulnerability templates |
| NVD | National Vulnerability Database — NIST CVE repository |
| OCR | Optical Character Recognition — text extraction from images |
| OWASP Top 10 | Industry standard list of 10 most critical web security risks |
| pHash | Perceptual Hash — image fingerprint robust to minor modifications |
| Quishing | QR code phishing attack vector |
| RAG | Retrieval-Augmented Generation — LLM with a searchable knowledge base |
| RSA | Rivest-Shamir-Adleman — asymmetric encryption algorithm |
| SAST | Static Application Security Testing — code analysis without execution |
| SHA-1 | Secure Hash Algorithm 1 — used for breach hash lookups |
| SHA-256 | Secure Hash Algorithm 256-bit — file integrity fingerprinting |
| SM-2 | SuperMemo 2 — spaced repetition scheduling algorithm |
| SPF | Sender Policy Framework — email sender verification DNS record |
| TLS | Transport Layer Security — encryption protocol for HTTPS |
| TTS | Text-to-Speech — synthesizes audio narration from text |
| XSS | Cross-Site Scripting — client-side code injection vulnerability |
| zxcvbn | Dropbox password strength estimation library |

---

*Document maintained by the Lead Architect. Last updated: September 2026.*
