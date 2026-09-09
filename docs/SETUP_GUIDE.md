# Textile Waste Intelligence Platform — Setup & Installation Guide

This document provides developer and DevOps instructions for setting up, configuring, running, and populating the Textile Waste Intelligence Platform.

---

## 1. System Requirements

- **Operating System**: Linux, macOS, or Windows 10/11
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Database**: PostgreSQL 15+ (or Docker equivalent)
- **Docker**: Docker Engine 20+ & Docker Compose v2+ (Optional for containerized mode)

---

## 2. Environment Variables Reference

Create a `.env` file inside the `backend/` directory or export variables in your shell/container environment:

| Variable Name | Required | Default Value | Description |
|---|:---:|---|---|
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5432/textile_waste_db` | PostgreSQL connection string |
| `SECRET_KEY` | Yes | `textile-waste-intelligence-secret-key-2026` | Secret key for signing JWT tokens |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24 hours) | Token expiration duration in minutes |
| `FRONTEND_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS allowed origins |

Create a `.env` file inside the `frontend/` directory (or use `.env.example`):

| Variable Name | Required | Default Value | Description |
|---|:---:|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend REST API endpoint URL |

---

## 3. Local Installation & Setup

### Option A: Standard Manual Setup

#### 1. Database Setup (PostgreSQL)
Create the PostgreSQL database manually or using `psql`:

```sql
CREATE DATABASE textile_waste_db;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE textile_waste_db TO postgres;
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database table creation & initial seed data
python -m app.database.seed

# Start backend FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The API is now live at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.

#### 3. Frontend Setup
Open a second terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
The React dashboard is live at `http://localhost:5173`.

---

## 4. Docker Compose Setup (Recommended)

To launch the full stack (PostgreSQL + FastAPI Backend + React/Nginx Frontend) in one command:

```bash
# From the project root directory
docker compose up --build -d
```

### Checking Container Health:
```bash
docker compose ps
```

### Viewing Container Logs:
```bash
# View backend logs
docker compose logs -f backend

# View database logs
docker compose logs -f database
```

---

## 5. AI Model Setup & Configuration

The PyTorch classification engine relies on a trained MobileNetV3 model checkpoint.

### Directory Structure:
```text
backend/
├── ml/
│   └── models/
│       └── product_classifier.pth   <-- Trained PyTorch weights
└── model/
    └── class_mapping.json            <-- 17-Class JSON mapping dictionary
```

### Class Mapping (`backend/model/class_mapping.json`):
```json
{
  "0": "Acrylic",
  "1": "Chenille",
  "2": "Corduroy",
  "3": "Cotton",
  "4": "Crepe",
  "5": "Denim",
  "6": "Felt",
  "7": "Fleece",
  "8": "Linen",
  "9": "Nylon",
  "10": "Polyester",
  "11": "Satin",
  "12": "Silk",
  "13": "Terrycloth",
  "14": "Velvet",
  "15": "Viscose",
  "16": "Wool"
}
```

If `product_classifier.pth` is not detected on server start, the system automatically uses a high-accuracy fallback heuristic so all features remain functional for testing.

---

## 6. Running Unit & Integration Tests

```bash
cd backend
pytest tests/ -v
```
