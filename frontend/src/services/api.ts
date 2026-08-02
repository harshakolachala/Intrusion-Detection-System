import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

// =========================
// Health
// =========================

export const getHealth = () => api.get("/health");

// =========================
// Alerts
// =========================

export const getDetections = () => api.get("/alerts");

export const getHistory = () => api.get("/alerts/history");

// =========================
// Chatbot
// =========================

export const getExplanation = (detectionId: string) =>
  api.get(`/chatbot/explain/${detectionId}`);

// =========================
// Federated Learning
// =========================

export const getFlStatus = () =>
  api.get("/training/status");

// =========================
// Prediction API
// =========================

export const predictIntrusion = (features: number[]) =>
  api.post("/predict/", {
    features,
  });