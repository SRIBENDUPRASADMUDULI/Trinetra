# Technology Stack

---

## Backend

| Component | Technology | Version / Notes |
|-----------|-----------|----------------|
| API Framework | FastAPI | Async, Python 3.11+ |
| Task Queue | Redis + Celery / ARQ | Background workers |
| ML Framework | PyTorch | Deepfake and image classification |
| Face Detection | MTCNN | Real-time face extraction from video frames |
| Image Classification | EfficientNet-B0 | Per-frame deepfake classification |
| NLP / Transformers | HuggingFace Transformers | Phishing and fake news classifiers |
| RAG Orchestration | LangChain | AI Cyber Mentor pipeline |
| Vector Store | FAISS / ChromaDB | Knowledge base indexing for RAG |
| Security Scanner | Nuclei (Dockerized) | DAST with YAML vulnerability templates |
| Video Processing | FFmpeg | Frame extraction and MP4 compositing |
| PDF Generation | ReportLab / WeasyPrint | FIR-ready incident reports |
| OCR | Tesseract OCR | Screenshot text extraction |
| Image Analysis | Pillow + ELA | Document tampering detection |
| Perceptual Hashing | ImageHash (pHash/dHash) | Digital Content DNA |
| Graph Analysis | spaCy + NetworkX | Fake news semantic graph |
| Cryptography | PyCryptodome | AES/RSA encryption sandbox |
| Password Analysis | zxcvbn | Entropy scoring and pattern detection |
| DNS Querying | dnspython | Live DNS record resolution |
| Containerization | Docker + Docker Compose | Full production environment |

---

## Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 14+ | React-based SSR frontend |
| Styling | Tailwind CSS | Responsive dark-mode design |
| Icons | Lucide React | Consistent icon library |
| HTTP Client | Axios / Fetch API | API calls to FastAPI backend |
| Client Crypto | Web Crypto API (window.crypto.subtle) | SHA-1 password hashing in browser |
| Charts and Gauges | Recharts / D3.js | Risk gauges, confidence charts, trend lines |
| Code Editor | CodeMirror / Monaco Editor | Secure-coding assistant input |
| Language | TypeScript | Type-safe frontend codebase |

---

## Databases and Storage

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Breach Hash Store | Custom indexed SHA-1 prefix file | k-Anonymity binary search + Bloom filter |
| Vector Database | FAISS / ChromaDB | RAG embedding retrieval for AI Mentor |
| Relational Database | PostgreSQL / SQLite | User data, scan history, SRS states |
| File Storage | AWS S3 / Cloudinary | Video uploads, generated MP4s, PDF reports |

---

## External APIs

| API | Base URL | Feature |
|-----|----------|---------|
| BharatCode AI Gateway | bharatcode.ai/api/model/v1 | Stateless qwen-3.8-27b & deepseek-v4.1-flash routing |
| Abuse.ch URLhaus | urlhaus-api.abuse.ch/v1/url | Live malware URL reputation (no key required) |
| OpenPhish Feed | openphish.com/feed.txt | Live phishing URL feed (no key required) |
| VirusTotal API v3 | api.virustotal.com/api/v3 | F-02/F-08 URL & malware scanning |
| Google Safe Browsing | safebrowsing.googleapis.com | F-02 URL threat lookup |
| NVD CVE API | services.nvd.nist.gov | F-30 threat intelligence |
| MITRE ATT&CK | attack.mitre.org/api | F-30 threat tactics |
| HuggingFace Hub | huggingface.co | F-03 model downloads |

---

## Datasets

| Dataset | Source | Used For |
|---------|--------|---------|
| FaceForensics++ | github.com/ondyari/FaceForensics | F-01 deepfake model training and testing |
| Phishing Email Corpus | Kaggle / SPAM Assassin | F-03 classifier training |
| SHA-1 Breach Hash Files | HIBP bulk hash exports | F-09 breach database population |
| OWASP Juice Shop | owasp.org | F-16 DAST scanner validation |
| DVWA | dvwa.co.uk | F-16 false-positive audits |

---

## Dev and QA Tools

| Tool | Purpose |
|------|---------|
| pytest | Backend unit, integration, and API tests |
| Swagger UI / ReDoc | Auto-generated interactive API documentation |
| Postman | API collection for QA and demo testing |
| Docker Compose | Local development and production deployment |
| GitHub Actions | CI/CD pipeline |
| ESLint / Prettier | Frontend code quality |
| Black / Ruff | Python code formatting and linting |
