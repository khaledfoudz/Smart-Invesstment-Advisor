const BASE_URL = "http://localhost:4000";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getRecommendation = async (formData) => {
  return apiRequest("/api/predict", "POST", {
    age:                formData.age,
    salary:             formData.salary,
    savings:            formData.savings,
    investment_value:   formData.investment_value,
    risk_tolerance:     formData.risk_tolerance,
    investment_horizon: formData.investment_horizon,
  });
};
