FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

# Download model files at build time
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN curl -L "YOUR_MODEL_PKL_URL" -o model.pkl
RUN curl -L "YOUR_ENCODERS_PKL_URL" -o encoders.pkl
RUN curl -L "YOUR_TARGET_ENCODER_PKL_URL" -o target_encoder.pkl

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]