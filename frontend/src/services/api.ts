import axiosClient from "../api/axiosClient";

/* ===========================================================
   Prediction Types
=========================================================== */

export interface TrafficPredictionRequest {
  features: number[];

  source_ip: string;
  destination_ip: string;

  source_port: number;
  destination_port: number;

  protocol: string;
}

export interface TrafficPredictionResponse {
  prediction_id: string;
  prediction: string;
  confidence: number;
  latency_ms: number;
  alert_created: boolean;
  alert_id: string | null;
}

/* ===========================================================
   Analytics Types
=========================================================== */

export interface AnalyticsSummary {
  total_packets: number;
  predictions: number;
  malicious_count: number;
  benign_count: number;
  avg_confidence: number;
  total_incidents: number;
  latency_ms: number;
}

export interface AnalyticsDistributionItem {
  name: string;
  value: number;
  color?: string;
}

export interface AnalyticsCharts {
  trends?: Array<{
    time: string;
    benign: number;
    malicious: number;
  }>;

  attack_distribution: AnalyticsDistributionItem[];

  severity_distribution: AnalyticsDistributionItem[];
}

/* ===========================================================
   Analytics
=========================================================== */

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
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

export const getAnalyticsCharts = async (
  _timeframe?: string
): Promise<AnalyticsCharts> => {
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

export const predictTraffic = async (
  data: TrafficPredictionRequest
): Promise<TrafficPredictionResponse> => {
  if (data.features.length !== 78) {
    throw new Error(
      `Prediction requires exactly 78 features. Received ${data.features.length}.`
    );
  }

  const payload: TrafficPredictionRequest = {
    source_ip: data.source_ip,
    destination_ip: data.destination_ip,
    source_port: Number(data.source_port),
    destination_port: Number(data.destination_port),
    protocol: data.protocol,
    features: data.features.map(Number),
  };

  const response = await axiosClient.post(
    "/predict/",
    payload
  );

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
    title: item.alert_type ?? item.attack_type,
    attack_type: item.alert_type ?? item.attack_type,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    severity: item.severity,
    status:
      item.status ??
      (item.is_resolved ? "RESOLVED" : "NEW"),
    confidence: item.confidence ?? 0,
    description: item.description ?? item.llm_summary ?? "",
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
    created_at: item.created_at,
    updated_at: item.updated_at,
    closed_at: item.closed_at,
    alert_id: item.alert_id,
    title: item.title,
    description: item.description,
    status: item.status,
    severity: item.severity,
    resolution: item.resolution,
    assigned_to:
      item.assigned_user?.username ||
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

export interface ChatMessageRequest {
  message: string;
  session_id?: string;
}

export const sendChatMessage = async (
  data: ChatMessageRequest
) => {
  const response = await axiosClient.post(
    "/chatbot/chat",
    {
      message: data.message,
    }
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
  const response = await axiosClient.patch(
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
   Reports / Downloads
=========================================================== */

const downloadReport = async (url: string, fallbackFilename: string) => {
  const response = await axiosClient.get(url, { responseType: "blob" });
  const disposition = String(response.headers["content-disposition"] ?? "");
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackFilename;

  const objectUrl = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const downloadAlertsCsv = () =>
  downloadReport("/reports/alerts.csv", "fedsentry-alerts.csv");

export const downloadIncidentsCsv = () =>
  downloadReport("/reports/incidents.csv", "fedsentry-incidents.csv");

export const downloadPredictionsCsv = () =>
  downloadReport("/reports/predictions.csv", "fedsentry-predictions.csv");

export const downloadSecuritySummaryPdf = () =>
  downloadReport("/reports/security-summary.pdf", "fedsentry-security-summary.pdf");

export const downloadIncidentPdf = (incidentId: string | number) =>
  downloadReport(`/reports/incidents/${incidentId}.pdf`, `fedsentry-incident-${incidentId}.pdf`);

/* ===========================================================
   Health
=========================================================== */

export const getHealthStatus = async () => {
  const response = await axiosClient.get("/health");

  return response.data;
};
