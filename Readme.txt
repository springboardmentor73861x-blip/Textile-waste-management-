# AI Textile Waste Intelligence Platform

An AI-powered textile waste management platform that uses **MobileNetV3-Small** to classify textile fabrics and provide intelligent waste categorization, recycling recommendations, inventory management, waste requests, notifications, and sustainability insights.

## 🚀 Project Overview

The **AI Textile Waste Intelligence Platform** helps textile manufacturers, recyclers, and other users manage textile waste efficiently.

The system combines:

* 🤖 AI-based textile fabric classification
* ♻️ Waste categorization and recycling recommendations
* 📦 Textile waste inventory management
* 🔄 Waste request and recycling workflow
* 🔔 User notifications
* 🌱 Sustainability and environmental impact insights
* 📊 Waste and circular-economy analytics
* 🖥️ React-based frontend
* ⚙️ FastAPI-based backend
* 🗄️ Database integration

---

## ✨ Key Features

### 1. AI Textile Fabric Classification

Users can upload a textile image and the trained **MobileNetV3-Small** model predicts the fabric type.

The model supports **7 fabric classes**:

| Class         | Description                  |
| ------------- | ---------------------------- |
| Cotton        | Natural cotton fiber         |
| Denim         | Cotton-based denim textile   |
| Mixed Fabrics | Blended textile materials    |
| Polyester     | Synthetic polyester fiber    |
| Rayon         | Regenerated cellulosic fiber |
| Silk          | Natural protein fiber        |
| Wool          | Natural protein fiber        |

The prediction API provides:

* Fabric type
* Confidence score
* Waste category
* Recyclability
* Biodegradability
* Recommended processing
* Potential reuse
* Top predictions
* Class probabilities

---

## 🤖 Machine Learning Model

### Model Used

**MobileNetV3-Small**

The model was trained using transfer learning with ImageNet-pretrained weights.

### Dataset

The project uses a textile fabric image dataset organized into:

```text
Fabric Classification/
├── train/
├── valid/
└── test/
```

Dataset distribution:

* Training images: **5,499**
* Validation images: **392**
* Test images: **393**
* Total images: **6,284**
* Number of classes: **7**

### Classes

```text
Cotton
Denim
Mixed Fabrics
Polyester
Rayon
Silk
Wool
```

### Model Performance

The trained MobileNetV3-Small model achieved approximately:

* **Test Accuracy:** 70.23%
* **Test Precision:** 70.69%
* **Test Recall:** 70.57%
* **Macro F1 Score:** 70.39%

The production model is:

```text
backend/models/mobilenetv3/mobilenetv3_small_best.pth
```

---

## ♻️ Waste Classification & Recycling Recommendations

The platform maps predicted fabric types to suitable waste-management strategies.

### Cotton

**Waste Category:** Natural Fiber Waste

**Recommendation:** Mechanical fiber recycling, reuse as wiping cloths/rags, and recycled cotton products.

### Denim

**Waste Category:** Cotton-Based Textile Waste

**Recommendation:** Upcycling, mechanical fiber recycling, bags, accessories, insulation, and recycled cotton products.

### Mixed Fabrics

**Waste Category:** Blended Textile Waste

**Recommendation:** Fiber separation where possible, specialized blended-textile recycling, or upcycling.

### Polyester

**Waste Category:** Synthetic Fiber Waste

**Recommendation:** Polyester recycling into recycled polyester fibers and products.

### Rayon

**Waste Category:** Regenerated Cellulosic Fiber Waste

**Recommendation:** Reuse, upcycling, and suitable textile/fiber recovery processes.

### Silk

**Waste Category:** Natural Protein Fiber Waste

**Recommendation:** Reuse, upcycling, and suitable textile/fiber recovery.

### Wool

**Waste Category:** Natural Protein Fiber Waste

**Recommendation:** Reuse, repair, felting, and mechanical fiber recycling.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌──────────────┐  ┌──────────────┐
       │ MobileNet  │   │   Database   │  │ Sustainability│
       │ V3-Small   │   │              │  │    Engine     │
       └────────────┘   └──────────────┘  └──────────────┘
              │
              ▼
       Fabric Prediction
              │
              ▼
       Waste Classification
              │
              ▼
    Recycling Recommendation
```

---

# 🖥️ Frontend

The frontend is developed using:

* **React.js**
* **Vite**
* **Axios**
* **React Icons**
* CSS

### Main frontend functionality

* Dashboard
* AI textile prediction
* Available waste
* Waste requests
* Recycler requests
* Production waste
* Notifications
* Sustainability
* Settings
* User management

---

# ⚙️ Backend

The backend is developed using:

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **PyTorch**
* **Torchvision**
* **Pillow**
* **Uvicorn**

### Main API modules

```text
/api/auth
/api/prediction
/api/waste
/api/waste-requests
/api/production-waste
/api/notifications
/api/sustainability
/api/admin
```

---

# 📁 Project Structure

```text
Textile-waste-management/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── inference/
│   │   └── predict.py
│   │
│   ├── preprocessing/
│   │   └── dataset_loader.py
│   │
│   ├── training/
│   │   ├── train_mobilenetv3.py
│   │   ├── train_mobilenetv3_improved.py
│   │   └── train_mobilenetv3_v3.py
│   │
│   ├── models/
│   │   └── mobilenetv3/
│   │       └── mobilenetv3_small_best.pth
│   │
│   └── Fabric Classification/
│       ├── train/
│       ├── valid/
│       └── test/
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── css/
```

---

# 🔮 AI Prediction Workflow

```text
Upload Textile Image
        ↓
Image Preprocessing
        ↓
MobileNetV3-Small
        ↓
Fabric Classification
        ↓
Confidence Calculation
        ↓
Waste Category
        ↓
Recycling Recommendation
        ↓
Potential Reuse
        ↓
Store Prediction History
```

---

# 📡 Example Prediction Response

The prediction API returns information similar to:

```json
{
  "success": true,
  "model": "MobileNetV3-Small",
  "number_of_classes": 7,
  "prediction": {
    "fabric_type": "Silk",
    "confidence_percentage": 99.91,
    "waste_category": "Natural Protein Fiber Waste",
    "recyclability": "...",
    "biodegradability": "...",
    "recommended_processing": "...",
    "potential_reuse": "..."
  }
}
```

---

# 🔄 Waste Management Workflow

```text
Manufacturer
     │
     ▼
Add Textile Waste
     │
     ▼
AI Classification
     │
     ▼
Waste Inventory
     │
     ▼
Recycler Requests Waste
     │
     ▼
Manufacturer Reviews Request
     │
     ├── Approve
     │
     └── Reject
     │
     ▼
Waste Transfer / Recycling
```

---

# 🌱 Sustainability

The platform supports sustainable textile management by helping users:

* Reduce textile waste
* Identify reusable materials
* Select appropriate recycling methods
* Track waste quantities
* Connect waste generators with recyclers
* Analyze environmental impact
* Support circular-economy practices

---

# 🛠️ Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/springboardmentor73861x-blip/Textile-waste-management-.git
cd Textile-waste-management-
```

## 2. Backend Setup

```bash
cd backend
python -m venv .venv312
```

### Windows

```bash
.venv312\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

# 🧪 Model Training

The MobileNetV3-Small model can be trained using:

```bash
python training/train_mobilenetv3.py
```

The trained model is saved under:

```text
backend/models/mobilenetv3/
```

---

# 🔐 Security Notes

Do not commit:

* `.env` files
* Database passwords
* API keys
* User credentials
* Uploaded private images
* Other sensitive configuration

Use environment variables for sensitive configuration.

---

# 🎯 Project Objective

The main objective of this project is to build an intelligent digital platform that combines **computer vision, textile waste classification, recycling recommendations, inventory management, and circular-economy workflows** to improve textile waste management.

---

# 👩‍💻 Project Branch

Final implementation branch:

**`intern-shashipreethi`**

This branch contains the complete AI textile waste management platform, including the trained MobileNetV3-Small model, backend integration, frontend application, prediction workflow, and waste-management functionality.

---

# 📌 Status

**Project Status: Completed**

Core modules implemented:

* ✅ AI textile classification
* ✅ MobileNetV3-Small model integration
* ✅ 7-class fabric prediction
* ✅ Waste categorization
* ✅ Recycling recommendations
* ✅ Prediction history
* ✅ Waste inventory
* ✅ Waste requests
* ✅ Recycler workflow
* ✅ Notifications
* ✅ Sustainability features
* ✅ React frontend
* ✅ FastAPI backend
