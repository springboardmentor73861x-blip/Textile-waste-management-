# Textile Waste Intelligence Platform — User Guide & Operational Manual

Welcome to the **Textile Waste Intelligence Platform**. This document provides detailed, step-by-step instructions on how to use every feature, workflow, role-based dashboard, AI material scanner, and reporting engine within the application.

---

## Table of Contents

1. [Platform Overview & User Roles](#1-platform-overview--user-roles)
2. [Getting Started & Login](#2-getting-started--login)
3. [AI Textile Scanner](#3-ai-textile-scanner)
4. [Inventory Management](#4-inventory-management)
5. [Analytics & Insights Dashboard](#5-analytics--insights-dashboard)
6. [Sustainability & Circular Economy](#6-sustainability--circular-economy)
7. [Generating & Exporting Reports](#7-generating--exporting-reports)
8. [User Role Management & Admin Features](#8-user-role-management--admin-features)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Platform Overview & User Roles

The platform provides end-to-end intelligence for textile waste management, powered by PyTorch computer vision models, PostgreSQL data persistence, and a modern React operations dashboard.

### Role Permission Matrix

| Feature / Action | Admin | Recycling Manager | Sustainability Officer | Warehouse Inspector |
|---|:---:|:---:|:---:|:---:|
| **AI Scanner (Upload & Predict)** | ✅ | ✅ | ✅ | ✅ |
| **View Inventory** | ✅ | ✅ | ✅ | ✅ |
| **Add / Edit / Delete Inventory** | ✅ | ✅ | ❌ | ✅ (Add only) |
| **View Sustainability Analytics** | ✅ | ✅ | ✅ | ❌ |
| **Export PDF & CSV Reports** | ✅ | ✅ | ✅ | ❌ |
| **Manage User Roles** | ✅ | ❌ | ❌ | ❌ |
| **Access System Health Metrics** | ✅ | ❌ | ✅ | ❌ |

---

## 2. Getting Started & Login

1. **Accessing the Dashboard**:
   - Open your browser and navigate to `http://localhost:5173` (or your cloud URL).
2. **User Authentication**:
   - **Login**: Click **Login** on the navigation bar or access `/login`. Enter your email and password.
   - **Registration**: If you are a new user, click **Register** to create an account. Admin approval or role assignment can be modified under Admin Settings.
   - **Default Admin Demo Account**:
     - Email: `admin@textile.com`
     - Password: `adminpassword123`

---

## 3. AI Textile Scanner

The **AI Material Scanner** utilizes a trained MobileNetV3 deep learning neural network to automatically classify 17 different textile fabric types from uploaded images.

### Step-by-Step Scanner Instructions:

1. Click on **AI Scanner** in the sidebar navigation (`/scanner`).
2. **Upload Fabric Image**:
   - Drag and drop a sample fabric image (JPG, PNG, WebP up to 10 MB) into the drop zone, or click **Browse File**.
3. **Run AI Classification**:
   - Click the **Analyze Fabric Image** button.
4. **Inspect Results**:
   - **Detected Material**: e.g., *Cotton, Denim, Wool, Polyester, Silk, etc.*
   - **Confidence Score**: Displayed as a percentage (e.g., 94.8%).
   - **Waste Category**: Natural Bio-Degradable, Synthetic Recyclable, Blended, etc.
   - **Recyclability Index**: High, Medium, or Low with circular economy recommendations.
   - **Carbon Footprint Estimate**: Estimated CO₂ impact per kg of material.
5. **Log to Inventory**:
   - Click **Save to Waste Inventory** to automatically populate a new inventory log with the predicted fabric properties.

---

## 4. Inventory Management

The **Waste Inventory** page (`/inventory`) acts as the central ledger for all recorded textile waste batches.

### Managing Inventory Entries:

- **Filter & Search**: Use the search input to filter by material name, category, or location. Filter by recyclability (High / Medium / Low).
- **Add New Batch**:
  - Click **+ Add Textile Batch**.
  - Specify material type, quantity (kg), waste source (e.g., Post-Consumer, Production Offcuts), condition (Clean, Contaminated), and storage warehouse location.
- **Edit Batch**: Click the **Edit** icon on any inventory row to update weights, status, or location.
- **Delete Batch**: (Requires Admin or Recycling Manager role) Click **Delete** to purge an entry.

---

## 5. Analytics & Insights Dashboard

The **Analytics Dashboard** (`/analytics`) presents executive-level visualizations of textile waste streams, processing volume, and composition analysis.

### Visual Metrics Included:

1. **Total Waste Volume (kg)**: Total tonnage recorded across facilities.
2. **Material Distribution Chart**: Pie/Doughnut breakdown of Natural vs. Synthetic vs. Blended fabrics.
3. **Weekly & Monthly Trend Graphs**: Bar and line charts tracking collection trends.
4. **High-Value Recyclables Ratio**: Percentage of materials suitable for direct closed-loop mechanical or chemical recycling.

---

## 6. Sustainability & Circular Economy

The **Sustainability Dashboard** (`/sustainability`) quantifies environmental savings achieved through sorting and recycling.

### Key Metrics & Tools:

- **CO₂ Emissions Avoided**: Calculated in metric tons of CO₂ equivalent based on land-fill diversion rates.
- **Water Saved**: Liters of fresh water preserved by recycling cotton and natural fibers.
- **Energy Conservation**: kWh of energy saved versus virgin fiber production.
- **Recommendation Engine**: Automated suggestions for end-of-life routes:
  - *Mechanical Shredding & Respinning* (High-purity Cotton/Denim)
  - *Chemical Depolymerization* (Polyester & Synthetic Blends)
  - *Downcycling / Insulation Pad Conversion* (Mixed Contaminated Waste)

---

## 7. Generating & Exporting Reports

The platform supports multi-format report generation for compliance, sustainability auditing, and operational management.

### How to Generate Reports:

1. Navigate to **Analytics** or **Sustainability** dashboard.
2. Click **Generate Comprehensive Report** or **Export Data**.
3. **Choose Export Format**:
   - **PDF Report**: Generates a formatted executive PDF document featuring summary statistics, sustainability scores, and breakdown charts.
   - **CSV / Excel Download**: Export raw inventory and prediction history data for external audit tools.

---

## 8. User Role Management & Admin Features

Users logged in with the **Administrator** role have access to **User Settings** (`/roles`):

- **Role Assignment**: Elevate registered users to *Recycling Manager*, *Sustainability Officer*, or *Warehouse Inspector*.
- **Account Activation / Deactivation**: Toggle user active status.
- **Audit Logs & System Monitoring**: View live API health, database status, and error logs via `/health`.

---

## 9. Troubleshooting & FAQs

- **Q: Why does the scanner show "Model Fallback Mode"?**
  - **A**: Ensure `product_classifier.pth` is placed in `backend/ml/models/`. If absent, the platform uses a fallback heuristic classifier so operations continue uninterrupted.
- **Q: How do I reset database records?**
  - **A**: Run `python -m app.database.seed` in the backend virtual environment to populate sample initial data.
