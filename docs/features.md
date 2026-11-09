# Feature Registry -- All 30 Platform Features

## Module 1: AI Threat Detection and Forensics

| ID | Feature | Technology | Description |
|----|---------|------------|-------------|
| F-01 | Deepfake Video Detection | PyTorch, MTCNN, EfficientNet-B0 | Frame-level neural analysis detecting face-swapping, manipulation, and audio-visual desync |
| F-02 | URL Risk Classifier | XGBoost, feature engineering | 0-100 risk score for links; detects homograph attacks and hidden redirects |
| F-03 | Phishing Email and Text Classifier | HuggingFace Transformers | NLP analysis of email headers, SMS urgency triggers, credential-harvesting language |
| F-04 | Document Tampering Detector | Pillow ELA, Tesseract OCR | Pixel-level forgery detection on PDFs and images using Error Level Analysis |
| F-05 | Digital Content DNA | pHash, dHash, SHA-256 | Perceptual hashing registry to detect unauthorized reuse, spoofing, plagiarism |
| F-06 | Fake News Analyzer | spaCy, NetworkX | Cross-source claim verification and semantic graph misinformation detection |
| F-07 | QR Code Safety (Quishing) | Redirect tracer, TLS inspector | Payload evaluation, redirect chain tracing, TLS inspection before execution |
| F-08 | Malware and File Scanner | VirusTotal API v3 | Multi-engine malware detection for APKs, executables, and documents |

## Module 2: Identity, Privacy and Utilities

| ID | Feature | Technology | Description |
|----|---------|------------|-------------|
| F-09 | Custom Breach Check Engine | k-Anonymity, Bloom filter, binary search | SHA-1 prefix breach lookup -- password never sent in plaintext |
| F-10 | Password Analyzer and Generator | zxcvbn, CSPRNG | Entropy scoring, pattern detection, secure password generation |
| F-11 | EXIF Inspector and Scrubber | Pillow, ExifRead | Read and permanently strip GPS and device metadata from images |
| F-12 | Encryption Sandbox | PyCryptodome AES/RSA | Visual AES and RSA encrypt/decrypt playground for learning cryptography |
| F-13 | Hash Generator and File Integrity | hashlib SHA-256 | Generate SHA-256 fingerprints and verify file integrity |
| F-14 | Privacy Violation Scanner | NLP classifier | Flag unlawful data collection and excessive permissions in app policies |
| F-15 | Social Media Auditor | Checklist engine | Step-by-step privacy lockdown guides for Instagram, LinkedIn, Twitter, Facebook |

## Module 3: Web and Developer Security

| ID | Feature | Technology | Description |
|----|---------|------------|-------------|
| F-16 | Website Secureness Checker | Nuclei DAST, Docker | Headless scanning with 50+ YAML templates covering OWASP Top 10 |
| F-17 | Automated Bug Remediation | CVE/CWE rule engine | Exact code patches: CSP headers, CORS policies, SQL parameterization |
| F-18 | Secure-Coding Assistant | LLM + AST parser | SAST AI review of pasted code with secure syntax corrections |
| F-19 | DNS Explainer | dnspython | Live DNS record fetch with security annotations (SPF, DMARC, DNSSEC) |

## Module 4: Citizen Support and Incident Response

| ID | Feature | Technology | Description |
|----|---------|------------|-------------|
| F-20 | 1-Click Case Filing | ReportLab / WeasyPrint | Guided form generating structured FIR-ready PDF documents |
| F-21 | Emergency Assistance Playbooks | Rule engine, Jinja2 | Auto-triggered step-by-step containment guides for active threats |
| F-22 | Dynamic Cyber Risk Score | Weighted aggregator | Composite 0-100 posture score updated from all tool scan results |
| F-23 | Personalized Posture Recommendations | Checklist engine | Priority-ranked hardening actions for the weakest security areas |
| F-24 | Reporting Portals | Tesseract OCR | Scam, fraud, cyberbullying, and harassment report submission with screenshot OCR |

## Module 5: Gamified Academy and AI Mentorship

| ID | Feature | Technology | Description |
|----|---------|------------|-------------|
| F-25 | AI Avatar Video Generator | python-pptx, LLM, TTS, FFmpeg | PPT/PDF to narrated MP4 with lip-synced AI avatar presenter |
| F-26 | AI Cyber Mentor (RAG) | LangChain, FAISS/Chroma | Context-aware chatbot over indexed cybersecurity knowledge base |
| F-27 | Phishing and Social Engineering Simulator | Scenario engine, scorer | Sandboxed fake email/SMS identification game with leaderboard and badges |
| F-28 | CTF Challenges | Flag validator, hint system | In-browser Web Security and Crypto exercises with progressive hints |
| F-29 | Spaced Repetition System | SM-2 algorithm | Adaptive flashcards for glossary, OWASP, port numbers, and crypto concepts |
| F-30 | Threat Intelligence Hub | NVD CVE API, MITRE ATT&CK | Real-time feed dashboard tracking CVEs, infrastructure attacks, breach reports |

---
*See team.md for who builds each feature.*
