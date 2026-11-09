# API Keys and Requirements

Complete list of every API key, credential, software dependency, and system requirement needed to run the CyberSec AI Platform.

---

## 1. API Keys Required

### 1.1 VirusTotal (F-08 -- Malware and File Scanner)
- Key Name     : VIRUSTOTAL_API_KEY
- Where to get : https://www.virustotal.com/gui/sign-in -> My API Key
- Free tier    : 4 requests/min, 500 requests/day
- Paid tier    : Needed for APK and bulk scanning at scale
- Used by      : Puspajeet (connector), Sribendu (orchestration)

### 1.2 Google Safe Browsing (F-02 -- URL Risk Classifier)
- Key Name     : GOOGLE_SAFE_BROWSING_API_KEY
- Where to get : https://console.cloud.google.com -> APIs and Services -> Enable Safe Browsing API -> Credentials
- Free tier    : 10,000 requests/day
- Used by      : Puspajeet (connector)

### 1.3 Google Cloud / Gemini API (F-18, F-25, F-26 -- LLM for SAST, Video Script, RAG Mentor)
- Key Name     : GOOGLE_API_KEY or GEMINI_API_KEY
- Where to get : https://aistudio.google.com/app/apikey
- Alternative  : Use OpenAI API key (OPENAI_API_KEY) from https://platform.openai.com/api-keys
- Free tier    : Google AI Studio has free quota
- Used by      : Sribendu (LLM pipelines)

### 1.4 HuggingFace Hub (F-03 -- Phishing Classifier, F-06 -- Fake News Analyzer)
- Key Name     : HUGGINGFACE_API_TOKEN
- Where to get : https://huggingface.co/settings/tokens -> New token
- Free tier    : Yes, for model downloads
- Used by      : Sribendu (model downloads and inference)

### 1.5 AWS S3 (F-25 -- Video Storage, F-20 -- PDF Reports)
- Key Names    :
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    AWS_REGION
    AWS_S3_BUCKET_NAME
- Where to get : https://aws.amazon.com -> IAM -> Users -> Create User -> Attach S3FullAccess policy -> Security Credentials -> Create Access Key
- Free tier    : 5 GB storage, 20,000 GET requests/month (12 months)
- Alternative  : Use Cloudinary (see below)
- Used by      : Puspajeet (bucket setup)

### 1.6 Cloudinary (Alternative to S3 for Video/Image Storage)
- Key Names    :
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
- Where to get : https://cloudinary.com/users/register_free -> Dashboard
- Free tier    : 25 GB storage, 25 GB bandwidth/month
- Used by      : Puspajeet (storage setup)

### 1.7 NVD CVE API (F-30 -- Threat Intelligence Hub)
- Key Name     : NVD_API_KEY
- Where to get : https://nvd.nist.gov/developers/request-an-api-key
- Free tier    : Yes, but rate-limited without key (5 requests/30 sec with key vs 1 without)
- Used by      : Sribendu (threat intel feed aggregator)

### 1.8 MITRE ATT&CK (F-30 -- Threat Intelligence Hub)
- Key Name     : No API key required
- Access       : Public REST API and STIX/TAXII feed at https://attack.mitre.org
- Used by      : Sribendu (ATT&CK tactic data)

### 1.9 Have I Been Pwned / Custom Breach DB (F-09)
- Option A     : Build own breach hash database (recommended -- no key needed)
    - Download SHA-1 hash files from https://haveibeenpwned.com/Passwords (Pwned Passwords)
    - Sujal/Nishu index these locally
- Option B     : HIBP API key for live lookup
    - Key Name : HIBP_API_KEY
    - Where to get : https://haveibeenpwned.com/API/Key
    - Cost     : Paid (USD 3.50/month)
- Used by      : Sribendu (breach engine), Sujal/Nishu (dataset ingestion)

### 1.10 Tesseract OCR (F-04, F-11, F-24 -- Document Tampering, EXIF, Reporting)
- Key Name     : No API key -- local installation required
- Install      : See System Requirements section below
- Used by      : Sribendu (OCR pipeline)

### 1.11 ElevenLabs / OpenAI TTS (F-25 -- AI Avatar Video Generator)
- Option A -- ElevenLabs
    - Key Name     : ELEVENLABS_API_KEY
    - Where to get : https://elevenlabs.io -> Profile -> API Keys
    - Free tier    : 10,000 characters/month
- Option B -- OpenAI TTS
    - Key Name     : OPENAI_API_KEY (same key as LLM)
    - Where to get : https://platform.openai.com/api-keys
- Used by      : Sribendu (TTS pipeline)

### 1.12 Redis (Task Queue -- All async background workers)
- Key Name     : REDIS_URL (e.g., redis://localhost:6379)
- Free self-hosted : Yes (Docker container)
- Cloud option : Redis Cloud free tier at https://redis.io/try-free
- Used by      : Sribendu (task queue infrastructure)

---

## 2. Environment Variables File (.env)

Create a .env file in the project root. Never commit this file to Git.
Add .env to .gitignore immediately.

`
# ?? AI / LLM ?????????????????????????????????????????????????????????????
GOOGLE_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_key_here              # optional if using Google
HUGGINGFACE_API_TOKEN=your_hf_token_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here      # optional if using OpenAI TTS

# ?? Security APIs ?????????????????????????????????????????????????????????
VIRUSTOTAL_API_KEY=your_virustotal_key_here
GOOGLE_SAFE_BROWSING_API_KEY=your_gsb_key_here
HIBP_API_KEY=your_hibp_key_here                  # optional if using local DB

# ?? Threat Intelligence ???????????????????????????????????????????????????
NVD_API_KEY=your_nvd_key_here

# ?? Storage ???????????????????????????????????????????????????????????????
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=cybersec-platform-bucket

CLOUDINARY_CLOUD_NAME=your_cloud_name            # if using Cloudinary instead
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ?? Database ??????????????????????????????????????????????????????????????
DATABASE_URL=postgresql://user:password@localhost:5432/cybersec
REDIS_URL=redis://localhost:6379

# ?? App Config ????????????????????????????????????????????????????????????
SECRET_KEY=generate_a_long_random_string_here
ALLOWED_ORIGINS=http://localhost:3000
DEBUG=True
`

---

## 3. System Requirements

### 3.1 Hardware (Minimum)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| GPU | Not required | NVIDIA GPU with CUDA (for PyTorch training) |
| Disk | 20 GB free | 50 GB free (datasets + models) |
| Internet | Required | Stable broadband |

### 3.2 Operating System

- Linux (Ubuntu 22.04 LTS recommended)
- macOS 13+
- Windows 11 with WSL2 (for Docker + Linux tools)

---

## 4. Software to Install

### 4.1 Core Tools

| Tool | Version | Install Command / Link |
|------|---------|----------------------|
| Python | 3.11+ | https://python.org/downloads |
| Node.js | 20 LTS+ | https://nodejs.org |
| Docker | Latest | https://docs.docker.com/get-docker |
| Docker Compose | v2+ | Included with Docker Desktop |
| Git | Latest | https://git-scm.com |
| FFmpeg | Latest | See below |
| Tesseract OCR | 5.x | See below |
| Redis | 7.x | Docker (recommended) |

FFmpeg Install:
- Ubuntu/Debian  : sudo apt install ffmpeg
- macOS          : brew install ffmpeg
- Windows        : https://ffmpeg.org/download.html (add to PATH)

Tesseract OCR Install:
- Ubuntu/Debian  : sudo apt install tesseract-ocr
- macOS          : brew install tesseract
- Windows        : https://github.com/UB-Mannheim/tesseract/wiki

### 4.2 Nuclei (DAST Scanner)

| Method | Command |
|--------|---------|
| Docker (recommended) | docker pull projectdiscovery/nuclei:latest |
| Direct install | go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest |
| Binary download | https://github.com/projectdiscovery/nuclei/releases |

---

## 5. Python Dependencies (Backend)

Create a requirements.txt file:

`
# ?? API Framework ?????????????????????????????????????????????????????????
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
python-multipart>=0.0.9
pydantic>=2.7.0

# ?? Task Queue ????????????????????????????????????????????????????????????
celery>=5.4.0
redis>=5.0.0
arq>=0.26.1

# ?? Machine Learning ??????????????????????????????????????????????????????
torch>=2.3.0
torchvision>=0.18.0
facenet-pytorch>=2.6.0          # MTCNN
timm>=1.0.3                     # EfficientNet-B0
transformers>=4.41.0            # HuggingFace Transformers
datasets>=2.20.0                # HuggingFace Datasets
scikit-learn>=1.5.0
xgboost>=2.1.0
numpy>=1.26.0
pandas>=2.2.0

# ?? Image and Video Processing ????????????????????????????????????????????
Pillow>=10.3.0
opencv-python>=4.10.0
imagehash>=4.3.1                # pHash / dHash
pytesseract>=0.3.10             # Tesseract OCR wrapper
ffmpeg-python>=0.2.0

# ?? NLP and Graph Analysis ????????????????????????????????????????????????
spacy>=3.7.4
networkx>=3.3
nltk>=3.8.1

# ?? RAG and LLM ???????????????????????????????????????????????????????????
langchain>=0.2.5
langchain-community>=0.2.5
langchain-google-genai>=1.0.6
langchain-openai>=0.1.14
faiss-cpu>=1.8.0
chromadb>=0.5.3
openai>=1.35.0
google-generativeai>=0.7.2

# ?? PDF and Document Processing ???????????????????????????????????????????
reportlab>=4.2.0
weasyprint>=62.0
python-pptx>=0.6.23
PyMuPDF>=1.24.5                 # fitz -- PDF text extraction
pypdf2>=3.0.1

# ?? Cryptography and Security ?????????????????????????????????????????????
pycryptodome>=3.20.0
passlib>=1.7.4
python-jose>=3.3.0
zxcvbn>=4.4.28

# ?? DNS and Network ???????????????????????????????????????????????????????
dnspython>=2.6.1
httpx>=0.27.0
aiohttp>=3.9.5
requests>=2.32.3
qrcode>=7.4.2

# ?? Cloud Storage ?????????????????????????????????????????????????????????
boto3>=1.34.0                   # AWS S3
cloudinary>=1.40.0

# ?? Database ??????????????????????????????????????????????????????????????
sqlalchemy>=2.0.30
alembic>=1.13.1
asyncpg>=0.29.0                 # PostgreSQL async driver
aiosqlite>=0.20.0

# ?? Document Generation and OCR ???????????????????????????????????????????
jinja2>=3.1.4
markdown>=3.6

# ?? Dev and Testing ???????????????????????????????????????????????????????
pytest>=8.2.0
pytest-asyncio>=0.23.7
httpx>=0.27.0                   # For FastAPI test client
python-dotenv>=1.0.1
black>=24.4.2
ruff>=0.4.9
`

Install command:
`
pip install -r requirements.txt
`

For spaCy English model:
`
python -m spacy download en_core_web_sm
`

---

## 6. Node.js / Frontend Dependencies

Create or update package.json for the Next.js frontend:

`json
{
  "dependencies": {
    "next": "^14.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.2",
    "lucide-react": "^0.395.0",
    "tailwindcss": "^3.4.4",
    "recharts": "^2.12.7",
    "@codemirror/next": "^0.19.9",
    "@monaco-editor/react": "^4.6.0",
    "framer-motion": "^11.2.12",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.8",
    "react-pdf": "^8.0.2",
    "react-player": "^2.16.0"
  },
  "devDependencies": {
    "typescript": "^5.5.2",
    "@types/react": "^18.3.3",
    "@types/node": "^20.14.9",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.4",
    "prettier": "^3.3.2"
  }
}
`

Install command:
`
npm install
`

---

## 7. Docker Services (docker-compose.yml)

All services needed to run the full platform locally:

`yaml
version: "3.9"
services:

  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - redis
      - db
    volumes:
      - ./backend:/app

  worker:
    build: ./backend
    command: celery -A app.worker worker --loglevel=info
    env_file: .env
    depends_on:
      - redis
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: .env

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cybersec
      POSTGRES_PASSWORD: cybersec123
      POSTGRES_DB: cybersec
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  nuclei:
    image: projectdiscovery/nuclei:latest
    volumes:
      - ./nuclei-templates:/templates

volumes:
  pgdata:
`

---

## 8. Quick Setup Checklist

Before running the project, confirm all of the following:

### API Keys
- [ ] VIRUSTOTAL_API_KEY obtained and added to .env
- [ ] GOOGLE_SAFE_BROWSING_API_KEY obtained and added to .env
- [ ] GOOGLE_API_KEY or OPENAI_API_KEY obtained and added to .env
- [ ] HUGGINGFACE_API_TOKEN obtained and added to .env
- [ ] NVD_API_KEY obtained and added to .env
- [ ] AWS or Cloudinary storage credentials added to .env
- [ ] ELEVENLABS_API_KEY or using OpenAI TTS
- [ ] HIBP hash files downloaded or HIBP_API_KEY added (optional)

### Software Installed
- [ ] Python 3.11+ installed
- [ ] Node.js 20 LTS+ installed
- [ ] Docker and Docker Compose installed
- [ ] FFmpeg installed and on PATH
- [ ] Tesseract OCR installed
- [ ] Nuclei pulled (docker pull projectdiscovery/nuclei:latest)

### Dependencies Installed
- [ ] pip install -r requirements.txt (backend)
- [ ] python -m spacy download en_core_web_sm
- [ ] npm install (frontend)

### Data Setup (Sujal / Nishu)
- [ ] FaceForensics++ video clips downloaded and labeled
- [ ] SHA-1 breach hash files downloaded and indexed
- [ ] Phishing email and SMS dataset prepared

### Local Services Running
- [ ] docker-compose up -d (starts Redis, PostgreSQL, Nuclei)
- [ ] uvicorn app.main:app --reload (FastAPI backend on port 8000)
- [ ] npm run dev (Next.js frontend on port 3000)

---

## 9. Free vs Paid Summary

| Service | Free Tier | Paid Needed When |
|---------|-----------|-----------------|
| VirusTotal | 500 req/day | Bulk scanning or APK analysis at scale |
| Google Safe Browsing | 10,000 req/day | High traffic production |
| Google AI Studio / Gemini | Free quota available | Heavy LLM usage |
| OpenAI API | Pay-per-use (no free tier) | If using GPT instead of Gemini |
| HuggingFace Hub | Free for downloads | Private models or inference API |
| ElevenLabs TTS | 10,000 chars/month | More than ~60 minutes of audio/month |
| AWS S3 | 5 GB / 12 months | After free tier expires |
| Cloudinary | 25 GB storage | More storage or bandwidth |
| NVD CVE API | Free | Never -- always free |
| MITRE ATT&CK | Free | Never -- always free |
| HIBP Passwords (hash files) | Free download | Never -- local database |
| HIBP API (live) | Paid (USD 3.50/month) | Only if not using local DB |
| Redis | Free self-hosted | Cloud Redis if not self-hosting |
| PostgreSQL | Free self-hosted | Cloud DB if not self-hosting |

**Minimum cost to run this project: USD 0 (using all free tiers and self-hosted services)**

---
*Add .env to .gitignore before the first commit. Never share API keys publicly.*
