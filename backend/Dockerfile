FROM python:3.13-slim

# Install system dependency for pdfkit
RUN apt-get update && apt-get install -y --no-install-recommends \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Start FastAPI (Railway will override port)
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2"]
