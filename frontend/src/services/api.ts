/**
 * Legacy service module kept for backward compatibility with existing pages
 * (Dashboard, Alerts, Chatbot, Predict, Analytics, Settings).
 *
 * It now delegates to the shared axios client (src/api/axiosClient.ts) so
 * every request automatically carries the JWT set by AuthContext. Endpoint
 * paths and exported function names are UNCHANGED — no page needs to change.
 */
import axiosClient from "../api/axiosClient";

export const api = axiosClient;

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

export const getExplanation = (detectionId: string) => api.get(`/chatbot/explain/${detectionId}`);

// =========================
// Federated Learning
// =========================

export const getFlStatus = () => api.get("/training/status");

// =========================
// Prediction API
// =========================

export const predictIntrusion = (features: number[]) =>
  api.post("/predict/", {
    features,
  });
