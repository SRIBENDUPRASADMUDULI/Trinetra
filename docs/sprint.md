# Sprint Schedule (8 Weeks / 4 Phases)

---

## Phase 1: Architecture and Data Foundations (Weeks 1-2)

**Goal:** Infrastructure setup, base ML pipelines, raw dataset preparation.

### Sribendu
- [ ] Design async FastAPI backend with Redis task queue and modular plugin architecture
- [ ] Set up PyTorch pipeline with MTCNN face extraction
- [ ] Architect k-Anonymity SHA-1 prefix database schema with Bloom filter
- [ ] Define Dynamic Cyber Risk Score schema and aggregation logic (F-22)
- [ ] Initialize Docker Compose with all service containers

### Priyanshu
- [ ] Scaffold Next.js project with Tailwind CSS and Lucide icons
- [ ] Build global dark-mode layout, navigation bar, and dashboard card components
- [ ] Create routing structure for all five module sections

### Puspajeet
- [ ] Write SSL/TLS certificate validation helper module
- [ ] Write HTTP security header analysis script (HSTS, CSP, X-Frame-Options)
- [ ] Set up VirusTotal API v3 connector and validate credentials

### Sujal / Nishu
- [ ] Download and label 500+ FaceForensics++ video clips (F-01)
- [ ] Curate labeled phishing email and SMS training dataset (F-03)
- [ ] Initialize project README and repository structure

---

## Phase 2: Deepfake, Breach, and Core Forensics (Weeks 3-4)

**Goal:** Deliver the two flagship ML features and all core forensics tools.

### Sribendu
- [ ] Train and fine-tune EfficientNet-B0 deepfake classifier (F-01)
- [ ] Build video frame decomposition and batch inference worker (F-01)
- [ ] Build k-Anonymity breach lookup endpoint with binary search (F-09)
- [ ] Implement URL Risk Classifier ML scoring pipeline (F-02)
- [ ] Train Phishing Email and Text Classifier on labeled corpus (F-03)
- [ ] Build Document Tampering detector using ELA and Tesseract OCR (F-04)
- [ ] Implement QR Code safety payload decoder and redirect tracer (F-07)
- [ ] Integrate VirusTotal API for malware and file scanning (F-08)

### Priyanshu
- [ ] Deepfake Inspector page: video upload, confidence gauge, frame timeline (F-01)
- [ ] Breach Sentinel page: password input form, suffix match result display (F-09)
- [ ] URL Risk page: risk meter, flag breakdown card (F-02)
- [ ] Phishing Classifier results card (F-03)

### Puspajeet
- [ ] Client-side SHA-1 hashing via window.crypto.subtle (F-09)
- [ ] EXIF reader and scrubber client utility (F-11)
- [ ] QR redirect-tracing and TLS inspection scripts (F-07)
- [ ] Google Safe Browsing API connector (F-02)

### Sujal / Nishu
- [ ] Ingest 1M+ SHA-1 breach hashes into staging database tables (F-09)
- [ ] Collect and categorize malware vs. benign file sample library (F-08)
- [ ] Black-box testing on all Phase 1 endpoints
- [ ] Draft Swagger documentation for Phase 2 endpoints

---

## Phase 3: Web Security, Privacy Tools, and Citizen Support (Weeks 5-6)

**Goal:** Complete the web security engine, all utility tools, and all citizen response features.

### Sribendu
- [ ] Dockerized Nuclei DAST orchestration backend (F-16)
- [ ] CVE/CWE to patch Remediation Logic Engine (F-17)
- [ ] SAST Secure-Coding Assistant: LLM + AST parser (F-18)
- [ ] DNS Explainer: dnspython + annotated security response generator (F-19)
- [ ] Privacy Violation Scanner: NLP policy text classifier (F-14)
- [ ] Digital Content DNA: perceptual hashing registry (F-05)
- [ ] Fake News Analyzer: semantic graph + cross-source verification (F-06)
- [ ] Password entropy calculator + CSPRNG generator (F-10)
- [ ] Hash Generator and File Integrity endpoint (F-13)
- [ ] Encryption Sandbox: AES/RSA endpoint demonstrations (F-12)
- [ ] Case Filing PDF generation engine (F-20)
- [ ] Emergency Playbook rule-triggered generator (F-21)
- [ ] Dynamic Cyber Risk Score aggregation engine (F-22)
- [ ] Screenshot OCR processor for Reporting Portals (F-24)

### Priyanshu
- [ ] Website Security Auditor: severity badges + code-diff viewer (F-16, F-17)
- [ ] Secure-Coding Assistant: code editor + annotated output pane (F-18)
- [ ] Encryption Sandbox UI: key gen, mode selector, encode/decode panels (F-12)
- [ ] Password strength meter and generator UI (F-10)
- [ ] EXIF Inspector: metadata table + before/after stripped view (F-11)
- [ ] Case Filing Form: multi-step wizard + PDF preview + download (F-20)
- [ ] Cyber Risk Score dashboard: gauge + trend chart (F-22)
- [ ] Document and Fake News Analyzer page (F-04, F-06)
- [ ] QR and Malware Scanner verdict page (F-07, F-08)

### Puspajeet
- [ ] Write and test 50+ Nuclei YAML templates for OWASP Top 10 (F-16)
- [ ] Social Media Auditor checklist scripts: Instagram, LinkedIn, Twitter (F-15)
- [ ] VirusTotal connector and multi-engine result normalizer (F-08)
- [ ] AWS S3 / Cloudinary cloud storage bucket setup

### Sujal / Nishu
- [ ] False-positive audits against OWASP Juice Shop and DVWA (F-16)
- [ ] Compile misinformation corpus for fake news benchmarking (F-06)
- [ ] Write CTF challenge descriptions and validate flags (F-28)
- [ ] Swagger documentation for all Phase 3 endpoints

---

## Phase 4: Academy, Video Generation, and Full Integration (Weeks 7-8)

**Goal:** Deliver the gamified academy, AI video pipeline, and production-ready deployment.

### Sribendu
- [ ] PPT/PDF to LLM script to TTS to FFmpeg video compositor (F-25)
- [ ] LangChain RAG AI Cyber Mentor with FAISS/Chroma index (F-26)
- [ ] Phishing Simulator backend: scenario engine + points scoring (F-27)
- [ ] CTF challenge flag validator + hint unlock system (F-28)
- [ ] SM-2 spaced repetition algorithm + flashcard scheduling backend (F-29)
- [ ] Threat Intel Hub: NVD CVE + MITRE ATT&CK feed aggregator (F-30)
- [ ] Personalized Posture Recommendations engine (F-23)
- [ ] End-to-end latency optimization across all 30 endpoints
- [ ] Full production Docker Compose build

### Priyanshu
- [ ] Academy: AI Avatar Video Player with streaming controls (F-25)
- [ ] Academy: AI Mentor Chat with source citations (F-26)
- [ ] Academy: Phishing Simulator sandboxed UI (F-27)
- [ ] Academy: CTF Challenge browser and scoreboard (F-28)
- [ ] Academy: Flashcard flip component with SM-2 rating buttons (F-29)
- [ ] Academy: Threat Intel Feed dashboard with CVE cards and filters (F-30)
- [ ] Social Media Auditor interactive checklist UI (F-15)
- [ ] Reporting Portal form sets for scam, fraud, bullying, harassment (F-24)
- [ ] Personalized posture hardening checklist UI (F-23)
- [ ] Downloadable PDF audit report UI

### Puspajeet
- [ ] Finalize QR payload resolver and TLS verification (F-07)
- [ ] External API response format validation test suite for all connectors
- [ ] Integration smoke tests: VirusTotal, Safe Browsing, S3

### Sujal / Nishu
- [ ] SRS flashcard content: glossary, port numbers, OWASP, crypto concepts (F-29)
- [ ] Full end-to-end regression test suite across all 30 tools
- [ ] Complete Swagger UI + Postman collection for all endpoints
- [ ] Final project README with deployment and environment setup instructions
- [ ] Demo pitch deck for final presentation

---
*See team.md for member-level responsibility details.*
