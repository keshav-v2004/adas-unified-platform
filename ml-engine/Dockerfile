FROM python:3.10-slim

# Install Java (for PySpark) and R
RUN apt-get update && apt-get install -y \
    default-jre \
    r-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies safely
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the ML scripts, CSVs, and API wrapper
COPY . .

EXPOSE 5001

CMD ["python", "app.py"]