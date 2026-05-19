FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Download model files from GitHub Releases
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN curl -L "https://github.com/khaledfoudz/Smart-Invesstment-Advisor/releases/download/v1.0/model.pkl" -o model.pkl
RUN curl -L "https://github.com/khaledfoudz/Smart-Invesstment-Advisor/releases/download/v1.0/encoders.pkl" -o encoders.pkl
RUN curl -L "https://github.com/khaledfoudz/Smart-Invesstment-Advisor/releases/download/v1.0/target_encoder.pkl" -o target_encoder.pkl

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]