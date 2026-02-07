# 1. Use the correct Python version
FROM python:3.12-slim

# 2. Install essential tools first (curl, wget, gnupg)
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 3. Install Chrome (The "Direct Deb" way - Crash Proof)
# We download the official .deb and let apt handle the dependencies
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get update \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm google-chrome-stable_current_amd64.deb

# 4. Set the working directory
WORKDIR /app

# 5. Copy the Clean requirements file
COPY requirements.txt .

# 6. Install Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copy your code
COPY . .

# 8. Start the server
CMD uvicorn api:app --host 0.0.0.0 --port $PORT