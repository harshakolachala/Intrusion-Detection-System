import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

// TODO: confirm exact paths with Hasini/Rohith once their routes are live
export const getHealth = () => api.get("/health");
export const getDetections = () => api.get("/alerts");
export const getExplanation = (detectionId: string) =>
  api.get(`/chatbot/explain/${detectionId}`);
export const getFlStatus = () => api.get("/training/status");
export const getHistory = () => api.get("/alerts/history");