# Textile Waste Intelligence Platform — Cloud Deployment Guide (AWS & Azure)

This deployment guide details step-by-step procedures for deploying the containerized **Textile Waste Intelligence Platform** to major cloud platforms: **Amazon Web Services (AWS)** and **Microsoft Azure**.

---

## Architecture Topology

```text
               ┌────────────────────────┐
               │    Cloud DNS / Route53 │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Load Balancer / Nginx  │
               └─────┬────────────┬─────┘
                     │            │
         ┌───────────┘            └───────────┐
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ React Frontend  │                  │ FastAPI Backend │
│ (Nginx / Port 80)│                 │   (Port 8000)   │
└─────────────────┘                  └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │   Managed DB    │
                                     │ AWS RDS / Azure │
                                     └─────────────────┘
```

---

## Part 1: Deployment on AWS (Amazon Web Services)

### Option A: AWS EC2 with Docker Compose (Simple & Cost-Effective)

#### 1. Provision an AWS EC2 Instance
- Launch an EC2 instance (`Ubuntu 22.04 LTS`, instance type `t3.medium` or `t3.large`).
- Configure Security Group inbound rules:
  - `HTTP` (Port 80)
  - `HTTPS` (Port 443)
  - `Custom TCP` (Port 5173 / 8000 if testing directly)
  - `SSH` (Port 22)

#### 2. Install Docker & Docker Compose on EC2
Connect to your EC2 instance via SSH:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
```

#### 3. Clone Repository & Deploy
```bash
git clone <your-repository-url>
cd Textile-Waste-Intelligence-Platform

# Configure production environment
cp backend/.env.example backend/.env
# Edit DATABASE_URL and SECRET_KEY inside backend/.env

# Build and start services
docker compose up -d --build
```

---

### Option B: AWS ECS (Elastic Container Service) + ECR + AWS RDS PostgreSQL

For enterprise scalable deployment with auto-healing and managed database:

#### 1. Provision Managed Database (AWS RDS PostgreSQL)
- Create a PostgreSQL database instance in AWS RDS.
- Note the DB endpoint hostname, port (5432), master username, and password.

#### 2. Push Container Images to AWS ECR (Elastic Container Registry)
```bash
# Authenticate Docker to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR Repositories
aws ecr create-repository --repository-name textile-backend
aws ecr create-repository --repository-name textile-frontend

# Tag & Push Backend Image
docker build -t textile-backend ./backend
docker tag textile-backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/textile-backend:latest
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/textile-backend:latest

# Tag & Push Frontend Image
docker build -t textile-frontend ./frontend
docker tag textile-frontend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/textile-frontend:latest
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/textile-frontend:latest
```

#### 3. Deploy Task Definition on AWS ECS Fargate
- Create an ECS Cluster.
- Create Task Definitions referencing the ECR images.
- Set environment variable `DATABASE_URL` pointing to AWS RDS PostgreSQL.
- Attach Application Load Balancer (ALB) to forward port 80/443 traffic to the frontend and backend services.

---

## Part 2: Deployment on Microsoft Azure

### Option A: Azure App Service for Containers + Azure Database for PostgreSQL

#### 1. Provision Azure Database for PostgreSQL Flexible Server
```bash
az group create --name textile-rg --location eastus

az postgres flexible-server create \
  --resource-group textile-rg \
  --name textile-pg-server \
  --admin-user postgres \
  --admin-password "SecurePassword123!" \
  --sku-name Standard_B1ms
```

#### 2. Push Container Images to Azure Container Registry (ACR)
```bash
# Create ACR
az acr create --resource-group textile-rg --name textileacr --sku Basic
az acr login --name textileacr

# Build and Push Images
docker build -t textileacr.azurecr.io/backend:v1 ./backend
docker push textileacr.azurecr.io/backend:v1

docker build -t textileacr.azurecr.io/frontend:v1 ./frontend
docker push textileacr.azurecr.io/frontend:v1
```

#### 3. Deploy Multi-Container Web App via Azure App Service
Create `docker-compose.azure.yml`:

```yaml
version: '3.8'
services:
  backend:
    image: textileacr.azurecr.io/backend:v1
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:SecurePassword123!@textile-pg-server.postgres.database.azure.com:5432/postgres?sslmode=require
      - SECRET_KEY=azure-production-secret-key

  frontend:
    image: textileacr.azurecr.io/frontend:v1
    ports:
      - "80:80"
    depends_on:
      - backend
```

Deploy to Azure App Service:
```bash
az appservice plan create --name textile-plan --resource-group textile-rg --is-linux --sku B1

az webapp create --resource-group textile-rg --plan textile-plan --name textile-waste-app \
  --multicontainer-config-type compose \
  --multicontainer-config-file docker-compose.azure.yml
```

---

## Part 3: SSL/TLS & Domain Setup

1. **Custom Domain**: Attach a custom domain name (e.g. `textile.yourdomain.com`) in AWS Route53 or Azure Custom Domains.
2. **HTTPS Certificate**:
   - On AWS: Use AWS Certificate Manager (ACM) with Application Load Balancer.
   - On EC2 / Custom Server: Install `certbot` for automated Let's Encrypt certificates:
     ```bash
     sudo apt install certbot python3-certbot-nginx
     sudo certbot --nginx -d textile.yourdomain.com
     ```

---

## Part 4: Production Monitoring & Log Management

1. **System Health Endpoints**:
   - Access `/health` to verify live status of PostgreSQL connection, memory consumption, CPU load, and PyTorch model state.
2. **CloudWatch / Azure Monitor Integration**:
   - Configure Docker log driver to stream logs to AWS CloudWatch Logs or Azure Log Analytics.
