import axiosClient from "../api/axiosClient";

/* ===========================================================
   Analytics
=========================================================== */

export const getAnalyticsSummary = async () => {
  const response = await axiosClient.get("/analytics/dashboard");
  const data = response.data;

  return {
    total_packets: data.total_predictions ?? 0,
    predictions: data.total_predictions ?? 0,
    malicious_count: data.malicious_predictions ?? 0,
    benign_count: data.benign_predictions ?? 0,
    avg_confidence: data.average_confidence ?? 0,
    total_incidents: data.total_alerts ?? 0,
    latency_ms: data.average_latency_ms ?? 0,
  };
};

export const getAnalyticsCharts = async () => {
  const [attackRes, severityRes] = await Promise.all([
    axiosClient.get("/analytics/attack-distribution"),
    axiosClient.get("/analytics/severity-distribution"),
  ]);

  return {
    attack_distribution: attackRes.data,
    severity_distribution: severityRes.data,
  };
};

/* ===========================================================
   Engine
=========================================================== */

export const getEngineStatus = async () => {
  const response = await axiosClient.get("/engine/status");
  const data = response.data;

  return {
    running: data.running ?? false,
    model_status: data.running ? "Running" : "Stopped",
    capture_status: data.capture?.running
      ? "Live Capturing"
      : "Stopped",
    packets: data.capture?.captured_packets ?? 0,
    queue_size: data.queue?.queue_size ?? 0,
  };
};

/* ===========================================================
   Predictions
=========================================================== */

export const predictTraffic = async (data: any) => {
  const payload = {
    source_ip: data.src_ip || data.source_ip || "192.168.1.100",
    destination_ip: data.dst_ip || data.destination_ip || "10.0.0.1",
    source_port: Number(data.src_port || data.source_port || 80),
    destination_port: Number(data.dst_port || data.destination_port || 8080),
    protocol: data.protocol || "TCP",
    features: Array.isArray(data.features)
      ? data.features
      : Object.values(data.features || {}).map(Number),
  };

  const response = await axiosClient.post("/predict/", payload);

  return response.data;
};

export const getPredictionHistory = async (
  skip = 0,
  limit = 50
) => {
  const response = await axiosClient.get(
    `/predictions/?skip=${skip}&limit=${limit}`
  );

  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    prediction: item.predicted_class,
    attack_type: item.predicted_class,
    confidence: item.confidence,
    latency_ms: item.latency_ms,
  }));
};

export const getLiveFeed = async (limit = 20) => {
  const response = await axiosClient.get(
    `/predictions/?skip=0&limit=${limit}`
  );

  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    attack_type: item.predicted_class,
    prediction: item.predicted_class,
    confidence: item.confidence,
    severity:
      item.confidence >= 0.9
        ? "CRITICAL"
        : item.confidence >= 0.75
        ? "HIGH"
        : item.confidence >= 0.5
        ? "MEDIUM"
        : "LOW",
    status:
      item.predicted_class === "BENIGN"
        ? "NORMAL"
        : "ALERT",
    latency_ms: item.latency_ms,
  }));
};

/* ===========================================================
   Alerts
=========================================================== */

export const getAlerts = async (
  skip = 0,
  limit = 50
) => {
  const response = await axiosClient.get(
    `/alerts/?skip=${skip}&limit=${limit}`
  );

  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    title: item.alert_type,
    attack_type: item.alert_type,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    severity: item.severity,
    status: item.status ?? (item.is_resolved ? "RESOLVED" : "NEW"),
    confidence: item.confidence ?? 0,
    description: item.description ?? "",
    is_resolved: item.is_resolved,
  }));
};

export const updateAlertStatus = async (
  alertId: string | number,
  status: string
) => {
  const response = await axiosClient.patch(
    `/alerts/${alertId}/status`,
    { status }
  );

  return response.data;
};

export const deleteAlert = async (
  alertId: string | number
) => {
  const response = await axiosClient.delete(
    `/alerts/${alertId}`
  );

  return response.data;
};

/* ===========================================================
   Incidents
=========================================================== */

export const getIncidents = async (
  skip = 0,
  limit = 50
) => {
  const response = await axiosClient.get(
    `/incidents/?skip=${skip}&limit=${limit}`
  );

  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    title: item.title,
    description: item.description,
    status: item.status,
    severity: item.severity,
    assigned_to:
      item.assigned_user ||
      item.assigned_to ||
      "Unassigned",
  }));
};

/* ===========================================================
   Audit Logs
=========================================================== */

export const getAuditLogs = async (
  skip = 0,
  limit = 50
) => {
  const response = await axiosClient.get(
    `/audit/?skip=${skip}&limit=${limit}`
  );

  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    user: item.username,
    module: item.resource,
    description: item.details,
    ip_address: item.ip_address,
  }));
};

/* ===========================================================
   Chatbot
=========================================================== */

export const sendChatMessage = async (
  message: string,
  _sessionId?: string
) => {
  const response = await axiosClient.post(
    "/chatbot/chat",
    { message }
  );

  return response.data;
};

/* ===========================================================
   Incident Types
=========================================================== */

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: string;
  status?: string;
  assigned_to?: string;
}

/* ===========================================================
   Incident CRUD
=========================================================== */

export const createIncident = async (
  payload: CreateIncidentPayload
) => {
  const response = await axiosClient.post(
    "/incidents/",
    payload
  );

  return response.data;
};

export const updateIncident = async (
  incidentId: string | number,
  payload: Partial<CreateIncidentPayload>
) => {
  const response = await axiosClient.put(
    `/incidents/${incidentId}`,
    payload
  );

  return response.data;
};

export const deleteIncident = async (
  incidentId: string | number
) => {
  const response = await axiosClient.delete(
    `/incidents/${incidentId}`
  );

  return response.data;
};

/* ===========================================================
   Health
=========================================================== */

export const getHealthStatus = async () => {
  const response = await axiosClient.get("/health");

  return response.data;
};