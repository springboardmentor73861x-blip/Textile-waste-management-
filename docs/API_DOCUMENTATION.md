# Textile Waste Intelligence Platform — REST API Reference

The FastAPI backend exposes RESTful HTTP endpoints for user authentication, AI predictions, inventory management, analytics, sustainability calculations, and system health.

Interactive documentation is available at runtime:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 1. Authentication & Users

### `POST /auth/login`
Authenticates a user and returns a JWT bearer access token.
- **Request Body** (`application/x-www-form-urlencoded` or JSON):
  ```json
  {
    "username": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "role": "Admin",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "Admin"
    }
  }
  ```

### `POST /users/register`
Registers a new user account.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Smith",
    "role": "Sustainability Officer"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 2,
    "email": "newuser@example.com",
    "full_name": "Jane Smith",
    "role": "Sustainability Officer",
    "is_active": true
  }
  ```

---

## 2. AI Prediction Engine

### `POST /predict`
Uploads a textile image file and receives PyTorch AI classification results.
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (Image binary: JPG, PNG, WebP)
- **Response** (`200 OK`):
  ```json
  {
    "product_type": "Cotton",
    "confidence": 94.8,
    "waste_category": "Natural Bio-Degradable",
    "recyclability": "High",
    "recommendation": "Suitable for mechanical recycling and respinning",
    "sustainability_score": 88
  }
  ```

---

## 3. Inventory Management

### `GET /inventory`
Retrieves paginated textile waste inventory records with search and filter capabilities.
- **Query Parameters**:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
  - `material` (str, optional)
  - `recyclability` (str, optional)
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "material": "Cotton",
      "quantity_kg": 450.5,
      "waste_category": "Natural Bio-Degradable",
      "recyclability": "High",
      "source": "Production Offcuts",
      "location": "Warehouse A",
      "created_at": "2026-09-01T10:00:00Z"
    }
  ]
  ```

### `POST /inventory`
Adds a new inventory batch record.
- **Request Body**:
  ```json
  {
    "material": "Denim",
    "quantity_kg": 320.0,
    "waste_category": "Natural Bio-Degradable",
    "recyclability": "High",
    "source": "Post-Consumer",
    "location": "Warehouse B"
  }
  ```

### `PUT /inventory/{inventory_id}`
Updates an existing inventory record.

### `DELETE /inventory/{inventory_id}`
Deletes an inventory record (Admin/Recycling Manager only).

---

## 4. Analytics & Sustainability

### `GET /analytics`
Returns aggregate waste metrics and distribution charts.
- **Response** (`200 OK`):
  ```json
  {
    "total_waste_kg": 12500.0,
    "total_batches": 48,
    "category_breakdown": {
      "Natural Bio-Degradable": 6200.0,
      "Synthetic Recyclable": 4800.0,
      "Blended / Complex": 1500.0
    },
    "recyclability_ratios": {
      "High": 65.0,
      "Medium": 25.0,
      "Low": 10.0
    }
  }
  ```

### `GET /sustainability/metrics`
Returns calculated carbon offset, water savings, and recycling impact metrics.

### `GET /sustainability/recommendations`
Provides automated circular-economy recovery recommendations per material category.

---

## 5. System Health & Monitoring

### `GET /health`
Returns live backend, database, AI model, CPU, and RAM health metrics.
- **Response** (`200 OK`):
  ```json
  {
    "status": "healthy",
    "service": "Textile Waste Intelligence Platform API",
    "version": "1.0.0",
    "timestamp": "2026-09-03T22:30:00Z",
    "uptime_seconds": 3600,
    "components": {
      "database": {
        "status": "healthy",
        "engine": "PostgreSQL"
      },
      "ai_model": {
        "status": "loaded",
        "architecture": "MobileNetV3-Large",
        "classes_count": 17
      }
    },
    "system": {
      "cpu_usage_percent": 12.4,
      "memory_usage_mb": 142.5
    }
  }
  ```
