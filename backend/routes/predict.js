import express from 'express';
const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://ml:8000";

router.post("/predict", async (req, res) => {
  console.log("📦 Predict request body:", JSON.stringify(req.body, null, 2));
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ FastAPI error:", JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    console.log("✅ ML response:", JSON.stringify(data, null, 2));
    res.json(data);

  } catch (err) {
    console.log("❌ ML service error:", err.message);
    res.status(500).json({ error: "ML service unreachable", detail: err.message });
  }
});

export default router;