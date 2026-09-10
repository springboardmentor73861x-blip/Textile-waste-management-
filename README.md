# Textile Waste Intelligence Platform

An AI-powered web platform for textile waste identification, recyclability assessment, sustainability analysis, recovery recommendations, and circular-economy analytics.

> **Project Status:** 🚧 Active Development
> **Current Progress:** Milestones 1, 2 and 3 completed
> **Live Deployment:** Not available yet — the application is currently being developed and tested locally.

---

## 📌 Project Overview

The **Textile Waste Intelligence Platform** is designed to help users analyze textile materials using AI-based image classification and provide sustainability-oriented recovery information.

The platform allows a user to:

- Upload textile images
- Identify textile materials using an AI model
- View prediction confidence and alternative predictions
- Assess recyclability
- Calculate sustainability and circularity scores
- Receive recovery/recycling recommendations
- Estimate potential environmental benefits
- Maintain analysis history
- View circular-economy analytics through the dashboard

The project combines a React frontend, FastAPI backend, PostgreSQL database, and a TensorFlow/Keras-based textile classification model.

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

---

## 🧠 AI Pipeline

The current AI pipeline uses **MobileNetV2 transfer learning**.

```text
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
Sustainability & Recovery Analysis