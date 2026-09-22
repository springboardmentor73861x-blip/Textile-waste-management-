# Textile Waste Intelligence Platform

An AI-powered web platform for textile waste identification, recyclability assessment, sustainability analysis, recovery recommendations, and circular-economy analytics — with role-based dashboards, secure authentication, and exportable reporting.

> **Project Status:** ✅ All 4 Milestones Completed
> **Current Progress:** Milestones 1, 2, 3, and 4 completed
> **Live Deployment:** Not publicly hosted yet — fully containerized and runnable locally via Docker Compose.

---

## 📌 Project Overview

The **Textile Waste Intelligence Platform** helps users analyze textile materials using AI-based image classification and provides sustainability-oriented recovery information, with dedicated tools for different roles across a recycling/manufacturing organization.

The platform allows a user to:

- Register and sign in with email/password **or Google OAuth**
- Upload textile images and identify materials using an AI model
- View prediction confidence and alternative predictions
- Assess recyclability
- Calculate sustainability and circularity scores
- Receive recovery/recycling recommendations
- Estimate potential environmental benefits (CO₂, water, landfill, resource recovery)
- Maintain analysis history
- View circular-economy analytics through role-specific dashboards
- Export analysis history as **PDF or Excel reports**
- Receive **in-app notifications** for key events
- Manage their profile, including password changes and a profile photo

---

## 🚀 Current Project Status

### Milestone 1 — Core Platform

- [x] User registration and login
- [x] JWT-based authentication
- [x] Protected user routes
- [x] Textile image upload
- [x] Textile metadata management
- [x] Textile CRUD operations
- [x] User-specific analysis history
- [x] Dashboard
- [x] Profile section
- [x] Dark/Light mode
- [x] History details

### Milestone 2 — AI Textile Recognition

- [x] TensorFlow/Keras textile classification
- [x] MobileNetV2 transfer-learning architecture
- [x] 10 textile classes
- [x] Prediction confidence
- [x] Top-3 predictions
- [x] Textile category information
- [x] Recyclability information
- [x] AI result persistence
- [x] Integration with upload and history workflows
- [x] **88.30% validation accuracy (model V6)**

### Supported Textile Classes

The current model supports:

1. Corduroy
2. Cotton
3. Denim
4. Fleece
5. Leather
6. Linen
7. Nylon
8. Polyester
9. Silk
10. Velvet

### Milestone 3 — Sustainability Intelligence

- [x] Sustainability score calculation
- [x] Circularity score calculation
- [x] Recovery potential classification
- [x] Recycling/recovery recommendations
- [x] Alternative recovery actions
- [x] Recovery workflow generation
- [x] Environmental impact estimation
- [x] CO2 savings estimation
- [x] Water savings estimation
- [x] Landfill diversion estimation
- [x] Resource recovery estimation
- [x] Circular-economy analytics
- [x] Dashboard analytics integration

### Milestone 4 — Role-Based Access, Dashboards, Reporting & Deployment

- [x] Role-based access control (User, Recycling Operator, Sustainability Manager, Manufacturer, Administrator)
- [x] Admin Dashboard with platform-wide analytics and user role management
- [x] Recycling Operator Dashboard with a processing queue and "Mark as Processed" workflow
- [x] Sustainability Manager Dashboard with ESG-style environmental reporting and score trends over time
- [x] Manufacturer Dashboard with production waste patterns and recovery outcome analysis
- [x] Google OAuth 2.0 sign-in and sign-up
- [x] Redesigned Login/Register experience with a guided, descriptive role picker
- [x] PDF and Excel export of textile analysis reports
- [x] In-app notification system with unread badge and mark-as-read
- [x] Profile management: password change, profile photo upload/removal, role display
- [x] AI confidence-threshold guardrail to reject low-confidence/non-textile predictions
- [x] Alembic database migrations
- [x] Security hardening: environment-based secrets, rate-limited auth endpoints, configurable CORS
- [x] Full Docker Compose deployment (frontend, backend, database)

---

## 🧠 AI Pipeline

The current AI pipeline uses **MobileNetV2 transfer learning**.

```
Textile Image
      ↓
Image Resize (224 × 224)
      ↓
Data Augmentation
      ↓
MobileNetV2 Feature Extraction
      ↓
Classification Head
      ↓
Softmax Prediction
      ↓
Top-3 Textile Predictions
      ↓
Confidence Threshold Guardrail
      ↓
Sustainability & Recovery Analysis
```

---

## 👥 User Roles

| Role | Purpose |
|---|---|
| **User** | Default account with general platform access |
| **Recycling Operator** | Uploads and sorts incoming textile waste; processes items via a dedicated queue |
| **Sustainability Manager** | Tracks circularity, environmental impact, and sustainability trends over time |
| **Manufacturer** | Monitors production waste patterns and material recovery outcomes |
| **Administrator** | Oversees the entire platform, all users, and role assignments |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Material UI, Recharts, Axios, Vite |
| Backend | FastAPI, Python, Pydantic |
| Database | PostgreSQL, SQLAlchemy, Alembic (migrations) |
| Authentication | JWT, Google Identity Services (OAuth 2.0), bcrypt |
| AI / ML | TensorFlow / Keras, MobileNetV2 |
| Reporting | jsPDF, jspdf-autotable, SheetJS (xlsx) |
| Deployment | Docker, Docker Compose, Nginx |

---

## 🚢 Running Locally

```bash
git clone https://github.com/Gaureshdwivedi/textile-waste-intelligence-platform.git
cd textile-waste-intelligence-platform
docker-compose up --build
```

Copy `.env.example` to `.env` in both `backend/` and `frontend/` and fill in the required values (database credentials, JWT secret, Google OAuth client ID/secret) before running.

---