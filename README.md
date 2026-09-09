# Textile Waste Intelligence Platform

A full-stack AI platform for textile waste tracking, material classification, sustainability analysis, and circular-economy decision support.

The project combines a React frontend, a FastAPI backend, a PostgreSQL database, and a PyTorch-based image classification model to help users identify textile materials, review prediction history, monitor waste inventory, and estimate sustainability outcomes.

## Overview

This solution is designed for textile manufacturers, recycling operators, sustainability teams, and administrators who need to:

- classify textile/fabric images using AI
- track textile inventory and waste categories
- monitor sustainability and recycling indicators
- review prediction history and analytics
- manage user roles and access to system features

## Documentation Guides

- 📖 **[User Guide & Operational Manual](file:///c:/Users/Sanju%20b/OneDrive/Desktop/Infosys%20Project/docs/USER_GUIDE.md)**: How to use the dashboard, AI scanner, inventory, analytics, sustainability, reports, and user roles.
- ⚙️ **[Setup & Installation Guide](file:///c:/Users/Sanju%20b/OneDrive/Desktop/Infosys%20Project/docs/SETUP_GUIDE.md)**: Local installation, Docker Compose setup, environment variables, database seed script, and PyTorch AI model setup.
- 🔌 **[REST API Reference](file:///c:/Users/Sanju%20b/OneDrive/Desktop/Infosys%20Project/docs/API_DOCUMENTATION.md)**: Complete list of HTTP endpoints, request/response formats, auth, and system health endpoints.
- ☁️ **[AWS & Azure Deployment Guide](file:///c:/Users/Sanju%20b/OneDrive/Desktop/Infosys%20Project/docs/DEPLOYMENT_GUIDE.md)**: Step-by-step production cloud deployment for AWS (EC2/ECS/RDS) and Azure (App Service / Container Instances).

## Key Features

- AI-powered textile material prediction from uploaded images
- Sustainability scoring and recovery recommendations
- Inventory management for textile waste records
- Prediction history and analytics dashboards
- Role-based authentication and authorization
- Responsive React dashboard for operations and reporting
- Docker-based setup for backend, frontend, and database services

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Chart.js and react-chartjs-2
- Tailwind CSS

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT authentication
- Python standard packages for ML and sustainability utilities

### AI / ML
- PyTorch
- Torchvision
- PIL / image preprocessing
- EfficientNet-based classifier integration

## Architecture

```mermaid
flowchart LR
    A[React Frontend] -->|API requests| B[FastAPI Backend]
    B --> C[Prediction Service]
    C --> D[PyTorch Model]
    B --> E[PostgreSQL Database]
    B --> F[Sustainability Engine]
    B --> G[Inventory + Analytics APIs]
    H[User Auth / Roles] --> B
```

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── ml/
│   │   ├── dataset/
│   │   ├── models/
│   │   └── ...
│   ├── model/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── uploads/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

## AI Prediction Workflow

1. A user uploads a textile or fabric image.
2. The backend validates the file type and size.
3. The image is preprocessed and passed to the PyTorch model.
4. The model predicts the textile class and confidence score.
5. The result is stored in the database and returned to the frontend.
6. Sustainability and recycling recommendations are generated based on the material and its properties.

## Supported Material Classes

The model is configured for textile material classification across a set of classes including:

- Acrylic
- Chenille
- Corduroy
- Cotton
- Crepe
- Denim
- Felt
- Fleece
- Linen
- Nylon
- Polyester
- Satin
- Silk
- Terrycloth
- Velvet
- Viscose
- Wool

## Authentication and Roles

The platform includes a role-based authorization system with roles such as:

- Administrator
- Textile Manufacturer
- Recycling Facility Operator
- Sustainability Manager

These roles control access to actions such as upload, inventory updates, reports, and settings.

## Prerequisites

Before running the project, ensure you have:

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL
- Docker and Docker Compose (optional but recommended)

## Environment Configuration

The backend expects environment variables such as:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/textile_waste_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

You can place these in a `.env` file inside the backend folder depending on your local setup.

## Running the Project

### Option 1: Using Docker Compose

From the project root:

```bash
docker compose up --build
```

This runs:

- PostgreSQL on port 5432
- Backend on port 8000
- Frontend on port 5173

### Option 2: Run Backend Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Then open the frontend at:

```text
http://localhost:5173
```

## Main API Features

The backend exposes routes for:

- user registration and login
- inventory creation and updates
- image upload and prediction
- prediction history retrieval
- analytics and dashboard metrics
- sustainability and recommendation endpoints

Typical endpoints include:

- `POST /auth/login`
- `POST /users/register`
- `POST /predict`
- `POST /upload`
- `GET /inventory`
- `GET /analytics`
- `GET /history`

## Model Notes

The project uses a trained PyTorch classifier loaded through the model utilities. The model file and class mapping are expected under:

- `backend/ml/models/product_classifier.pth`
- `backend/model/class_mapping.json`

If the model file is missing, prediction endpoints may return a fallback response indicating the model is not loaded.

## Use Cases

- textile waste sorting and classification
- operational inventory documentation
- sustainability and recycling assessment
- decision support for circular textile programs
- data-backed reporting and traceability

## Notes

This project is intended as an AI-driven waste intelligence solution for textile operations. The current implementation focuses on material classification and sustainability-oriented workflow support rather than direct end-of-life recycling certification.

## License

This project is currently not configured with a formal license file. Update this section if you plan to publish it publicly or distribute it under a chosen license.

- Classification performance
- Computational efficiency
- Model size
- Inference speed
- Deployment suitability

---

# Dataset Preparation

The training data was created by combining suitable textile/fabric image sources and cleaning the material categories.

The final clean material dataset contains:

```text
Total Images: 5624
Total Classes: 17
```

---

# Dataset Classes

| Class | Images |
|---|---:|
| Acrylic | 48 |
| Chenille | 52 |
| Corduroy | 96 |
| Cotton | 2352 |
| Crepe | 104 |
| Denim | 648 |
| Felt | 16 |
| Fleece | 132 |
| Linen | 76 |
| Nylon | 228 |
| Polyester | 904 |
| Satin | 96 |
| Silk | 200 |
| Terrycloth | 120 |
| Velvet | 44 |
| Viscose | 148 |
| Wool | 360 |
| **Total** | **5624** |

---

# Dataset Split

The dataset was divided into training, validation, and testing subsets.

```text
Training     : 3929 images
Validation   : 837 images
Testing      : 858 images
Total        : 5624 images
```

### Split Ratio

```text
70% Training
15% Validation
15% Testing
```

### Training Distribution

```text
Acrylic       -> 33
Chenille      -> 36
Corduroy      -> 67
Cotton        -> 1646
Crepe         -> 72
Denim         -> 453
Felt          -> 11
Fleece        -> 92
Linen         -> 53
Nylon         -> 159
Polyester     -> 632
Satin         -> 67
Silk          -> 140
Terrycloth    -> 84
Velvet        -> 30
Viscose       -> 103
Wool          -> 251
```

---

# Handling Class Imbalance

The original dataset contained significant class imbalance.

For example:

```text
Cotton       -> 1646 training images
Felt         -> 11 training images
Acrylic      -> 33 training images
Polyester    -> 632 training images
```

To reduce the effect of class imbalance, a **class-balanced training sampler** was implemented.

The balanced sampler gives underrepresented classes greater sampling importance during training.

This allows the model to learn minority classes more effectively.

---

# Data Augmentation

Training images use augmentation techniques including:

```text
Resize
Random Horizontal Flip
Random Vertical Flip
Random Rotation
Color Jitter
```

Validation and test images use only deterministic preprocessing:

```text
Resize
ToTensor
Normalization
```

The input image size is:

```text
224 × 224 × 3
```

---

# Training Configuration

```text
Model:
MobileNetV3-Large

Training:
From Scratch

Number of Classes:
17

Input Size:
224 × 224

Batch Size:
32

Optimizer:
AdamW

Learning Rate:
0.001

Weight Decay:
0.0001

Epochs:
30

Learning Rate Scheduler:
CosineAnnealingLR

Training Strategy:
Class-Balanced Sampling

Device:
CUDA GPU
```

---

# Model Architecture

The final classifier of MobileNetV3-Large was modified for the 17 textile material classes.

```text
Sequential(
    Linear(960 → 1280)
    Hardswish()
    Dropout(p=0.2)
    Linear(1280 → 17)
)
```

Therefore, the final network produces:

```text
17 output probabilities
```

one for each textile material class.

---

# Model Performance

The final balanced MobileNetV3-Large model achieved:

| Metric | Result |
|---|---:|
| Validation Accuracy | **79.09%** |
| Test Accuracy | **77.97%** |
| Test Images | **858** |
| Number of Classes | **17** |

The best model was obtained at:

```text
Best Epoch:
30

Best Validation Accuracy:
79.09%
```

---

# Classification Evaluation

The model was evaluated using:

- Accuracy
- Precision
- Recall
- F1-score
- Classification report
- Confusion matrix
- Real-image inference testing

The final test accuracy was:

```text
77.97%
```

---

# Best Trained Model

The best trained checkpoint is:

```text
best_mobilenetv3_balanced.pth
```

Expected model location during training:

```text
/content/textile_project/checkpoints/best_mobilenetv3_balanced.pth
```

For the VS Code application, the model should be placed inside the backend AI model directory.

Example:

```text
backend/
└── ml/
    └── model/
        ├── best_mobilenetv3_balanced.pth
        └── class_mapping.json
```

---

# Class Mapping

The model uses the following fixed class-to-index mapping:

```python
classes = [
    "Acrylic",
    "Chenille",
    "Corduroy",
    "Cotton",
    "Crepe",
    "Denim",
    "Felt",
    "Fleece",
    "Linen",
    "Nylon",
    "Polyester",
    "Satin",
    "Silk",
    "Terrycloth",
    "Velvet",
    "Viscose",
    "Wool"
]
```

The class mapping must remain unchanged when loading the trained model in the backend.

---

# Technology Stack

## Frontend

```text
React.js
Vite
Tailwind CSS
JavaScript
REST API
```

## Backend

```text
Python
FastAPI
Uvicorn
SQLAlchemy
```

## Machine Learning

```text
PyTorch
Torchvision
MobileNetV3-Large
NumPy
Scikit-learn
Pillow
```

## Database

```text
PostgreSQL
```

## Development

```text
Visual Studio Code
Google Colab
Git
GitHub
Kaggle API
```

---

# Backend API

The FastAPI backend provides REST APIs for image upload, AI prediction, inventory management, authentication, and prediction history.

## Upload Textile Image

```http
POST /upload
```

Uploads a textile image to the backend.

---

## Predict Textile Material

```http
POST /predict
```

The endpoint receives an uploaded image/file reference and performs AI classification.

Example response:

```json
{
    "material": "Cotton",
    "confidence": 0.8743
}
```

The endpoint can also return sustainability information:

```json
{
    "material": "Cotton",
    "confidence": 0.8743,
    "sustainability": {
        "recommendation": "Suitable for recycling/reuse analysis"
    }
}
```

---

# API Documentation

When the backend is running, FastAPI provides interactive API documentation.

### Swagger UI

```text
http://localhost:8000/docs
```

### ReDoc

```text
http://localhost:8000/redoc
```

---

# Backend Installation

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
.\venv\Scripts\Activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

# Frontend Installation

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the React development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Complete AI Prediction Flow

```text
┌──────────────────────────┐
│      User Uploads        │
│     Textile Image        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      React Frontend      │
└────────────┬─────────────┘
             │
             │ REST API
             ▼
┌──────────────────────────┐
│      FastAPI Backend     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    Image Preprocessing   │
│      224 × 224 RGB       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   MobileNetV3-Large      │
│       17 Classes         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Material + Confidence    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Sustainability Engine    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Recycling / Reuse        │
│ Recommendation           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│ Prediction History       │
│ Inventory                │
└──────────────────────────┘
```

---

# Project Directory Structure

```text
Textile-Waste-Intelligence-Platform/
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── ml/
│   │   ├── train.py
│   │   ├── predict.py
│   │   └── model/
│   │       ├── best_mobilenetv3_balanced.pth
│   │       └── class_mapping.json
│   │
│   ├── uploads/
│   ├── reports/
│   ├── logs/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── routes/
│   │
│   ├── index.html
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Example User Experience

### Step 1 — Upload

```text
User selects textile image
```

### Step 2 — AI Prediction

```text
Predicted Material:
Cotton

Confidence:
87.43%
```

### Step 3 — Sustainability Analysis

```text
Material:
Cotton

Sustainability Recommendation:
Proceed with recycling/reuse assessment.
```

### Step 4 — History

The prediction is stored in the database for future tracking and reporting.

---

# Security and Access Control

The platform supports role-based access control.

Authentication and authorization are handled through the backend.

Protected functionality includes:

- User management
- Textile inventory
- Prediction history
- Administrative operations
- Reports
- Dashboard data

---

# Testing

The project includes testing for:

## Machine Learning

- Dataset verification
- Batch verification
- Model output verification
- Validation accuracy
- Test accuracy
- Classification report
- Confusion matrix
- Real-world image inference

## Backend

- API endpoint testing
- Image upload testing
- Prediction testing
- Authentication testing
- Inventory CRUD testing
- Database testing

## Frontend

- Image upload
- Image preview
- Prediction display
- Confidence display
- API error handling
- Loading states
- Dashboard functionality

---

# Current Project Status

```text
DATASET
✅ Dataset collection
✅ Dataset cleaning
✅ 17 material classes
✅ 5624 images
✅ Train / validation / test split

MACHINE LEARNING
✅ MobileNetV3-Large
✅ Training from scratch
✅ Data augmentation
✅ Class-balanced sampling
✅ AdamW optimizer
✅ CosineAnnealingLR
✅ 30 epochs
✅ Model checkpoint
✅ Classification report
✅ Confusion matrix
✅ 79.09% validation accuracy
✅ 77.97% test accuracy

BACKEND
⬜ Model integration
⬜ Prediction service
⬜ /predict endpoint verification
⬜ Database prediction logging
⬜ Sustainability integration

FRONTEND
⬜ AI image upload
⬜ Prediction result UI
⬜ Confidence display
⬜ Sustainability result UI

SYSTEM
⬜ End-to-end integration
⬜ Real-world image testing
⬜ Final system testing
⬜ Deployment
```

---

# Future Enhancements

Future improvements may include:

- Increasing the number of textile material classes
- Improving real-world image classification
- Increasing minority-class samples
- Improving blended-fabric classification
- Dedicated recyclability classification using a properly labeled recyclability dataset
- Advanced sustainability scoring
- Automated recycling recommendations
- Textile lifecycle prediction
- Environmental-impact estimation
- Model monitoring
- Production deployment

---

# Developers

- **Sanju B** — Lead Developer

---

# License

This project is developed as an academic/major project for research and educational purposes.
