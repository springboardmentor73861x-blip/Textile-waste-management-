FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Required system packages for OpenCV / scientific Python packages
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt .

# Install pip
RUN pip install --no-cache-dir --upgrade pip

# Install all packages except TensorFlow
RUN grep -v "^tensorflow-cpu==" requirements-docker.txt > requirements-no-tensorflow.txt \
    && pip install --no-cache-dir -r requirements-no-tensorflow.txt

# Install TensorFlow separately
RUN pip install --no-cache-dir tensorflow-cpu==2.21.0

# Copy project
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]