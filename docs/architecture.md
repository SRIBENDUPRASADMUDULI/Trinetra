# System Architecture

---

## High-Level System Diagram

`
+------------------------------------------------------------------------+
|                         Next.js Frontend                               |
|   [Forensics]  [Identity]  [Web Sec]  [Citizen Support]  [Academy]    |
+----------------------------------+-------------------------------------+
           | Axios / Fetch         | Web Crypto API (SHA-1 in browser)
           v                       v
+------------------------------------------------------------------------+
|                   FastAPI Backend -- Async Core                        |
|   Redis Task Queue  |  Docker Compose  |  Modular Plugin Architecture  |
|                                                                        |
|  +-----------------+  +------------------+  +---------------------+   |
|  | AI Threat       |  | Identity and     |  | Web and Dev         |   |
|  | Forensics Engine|  | Privacy Tools    |  | Security Engine     |   |
|  | F-01 to F-08    |  | F-09 to F-15     |  | F-16 to F-19        |   |
|  +-------+---------+  +--------+---------+  +----------+----------+   |
|          |                     |                        |              |
|  +-------v---------+  +--------v----------+  +----------v----------+  |
|  | PyTorch / MTCNN |  | SHA-1 Prefix DB   |  | Nuclei Docker       |  |
|  | EfficientNet-B0 |  | Bloom Filter      |  | DAST Orchestrator   |  |
|  | HuggingFace NLP |  | zxcvbn / CSPRNG   |  | Remediation Engine  |  |
|  | ELA / pHash     |  | AES/RSA Sandbox   |  | SAST LLM Pipeline   |  |
|  +-----------------+  +-------------------+  +---------------------+  |
|                                                                        |
|  +-----------------+  +--------------------------------------------+  |
|  | Citizen Support |  | Gamified Academy                           |  |
|  | F-20 to F-24    |  | F-25 to F-30                               |  |
|  +-------+---------+  +--------+-----------------------------------+  |
|          |                     |                                       |
|  +-------v---------+  +--------v-----------+                          |
|  | PDF Generator   |  | LangChain RAG      |                          |
|  | Risk Score Eng  |  | PPT->LLM->TTS->FFmpeg                         |
|  | Playbook Engine |  | CTF Validator      |                          |
|  | Tesseract OCR   |  | SM-2 SRS Engine    |                          |
|  +-----------------+  +--------------------+                          |
+------------------------------------------------------------------------+
         |                      |                     |
+--------v--------+  +----------v------+  +-----------v-------+
| AWS S3          |  | External APIs   |  | FAISS / ChromaDB  |
| Cloudinary      |  | VirusTotal      |  | (Vector Store)    |
| (File Storage)  |  | Google SafeBrowse  +-------------------+
+-----------------+  | NVD CVE Feed   |
                     | MITRE ATT&CK   |
                     +-----------------+
`

---

## Component Descriptions

### FastAPI Async Backend
- Python asyncio with modular router registration for all 30+ endpoints
- Redis-backed Celery/ARQ workers handle long-running jobs (video rendering, DAST scans)
- Docker Compose orchestrates: API server, Redis, Nuclei daemon, database, vector store

### AI Forensics Engine (F-01 to F-08)
- PyTorch inference service: MTCNN for face detection, EfficientNet-B0 for classification
- HuggingFace Transformers pipeline for phishing (F-03) and fake news (F-06) NLP models
- ELA image analysis with Pillow + Tesseract OCR for document tampering detection (F-04)
- pHash/dHash perceptual hashing registry for Digital Content DNA (F-05)
- VirusTotal API v3 integration with async polling for malware scan results (F-08)

### Identity and Privacy Tools (F-09 to F-15)
- SHA-1 prefix database: sorted file with O(log n) binary search + Bloom filter for O(1) miss detection
- Passwords hashed client-side via window.crypto.subtle -- plaintext never leaves the browser
- PyCryptodome for AES/RSA sandbox demonstrations; zxcvbn for password entropy scoring

### Web Security Engine (F-16 to F-19)
- Nuclei DAST scanner runs in a dedicated Docker container, streams JSON vulnerability results
- CVE/CWE rule engine maps each finding to a patch template (CSP, CORS, SQL parameterization)
- LLM + AST parser SAST pipeline supports Python, JavaScript, PHP, Java (F-18)
- dnspython fetches live DNS records annotated with security implications (F-19)

### Citizen Support (F-20 to F-24)
- ReportLab / WeasyPrint generates FIR-ready PDF from structured multi-step form input (F-20)
- Risk score aggregator reads latest scan outputs from all modules and computes weighted composite (F-22)
- Jinja2 template engine renders emergency playbooks dynamically based on detected threat type (F-21)
- Tesseract OCR processes uploaded screenshots to extract evidence text automatically (F-24)

### Gamified Academy (F-25 to F-30)
- python-pptx / PyMuPDF extracts slide text -> LLM generates narration -> TTS synthesizes audio -> FFmpeg composites MP4 (F-25)
- LangChain with FAISS/ChromaDB vector store powers the context-aware AI Cyber Mentor (F-26)
- SM-2 algorithm implements optimal spaced repetition scheduling for adaptive flashcards (F-29)
- NVD CVE feed and MITRE ATT&CK API populate the real-time Threat Intelligence Hub (F-30)

---

## Key Data Flows

### Deepfake Detection (F-01)
`
User uploads video
  -> FastAPI: receive file, push to Redis queue
  -> Celery worker: FFmpeg frame decomposition
  -> MTCNN: detect and crop face regions per frame
  -> EfficientNet-B0: classify each crop (real / fake)
  -> Aggregate: confidence scores + temporal consistency check
  -> Return: per-frame scores + overall deepfake probability
  -> Next.js: render confidence gauge + frame timeline
`

### Breach Check (F-09)
`
User types password
  -> window.crypto.subtle: SHA-1 hash computed in browser
  -> API receives ONLY first 5 characters of hash
  -> FastAPI: binary search SHA-1 prefix database
  -> Return: all suffix hashes matching that prefix
  -> Browser: check if full hash is in returned list
  -> Display: BREACHED or SAFE -- password never left device
`

### DAST Scan (F-16)
`
User submits target URL
  -> FastAPI: validate URL, push to Redis queue
  -> Celery worker: start Nuclei Docker container with 50+ YAML templates
  -> Nuclei: scan target, output structured JSON
  -> Parser: classify by CVE/CWE, assign severity
  -> Remediation Engine: map each finding to patch template
  -> Return: severity-ranked vulnerability list + code patches
  -> Next.js: render severity badges + code-diff viewer + PDF export
`

---
*See stack.md for the full technology reference.*
