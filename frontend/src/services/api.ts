import axiosClient from '../api/axiosClient';

// Analytics Summary
export const getAnalyticsSummary = async () => {
  const response = await axiosClient.get('/analytics/dashboard');
  const data = response.data;
  return {
    total_packets: data.total_predictions ?? 0,
    predictions: data.total_predictions ?? 0,
    malicious_count: data.malicious_predictions ?? 0,
    avg_confidence: data.average_confidence ?? 0,
    total_incidents: data.total_alerts ?? 0,
    latency_ms: data.average_latency_ms ?? 0,
  };
};

// Live Feed / Predictions
export const getLiveFeed = async (limit = 20) => {
  const response = await axiosClient.get(`/predictions/?limit=${limit}`);
  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    attack_type: item.predicted_class,
    prediction: item.predicted_class,
    confidence: item.confidence,
    severity: item.confidence > 0.8 ? 'High' : item.confidence > 0.5 ? 'Medium' : 'Low',
    status: item.predicted_class !== 'BENIGN' ? 'Alert' : 'Normal',
    latency_ms: item.latency_ms,
  }));
};

// Analytics Charts Data
export const getAnalyticsCharts = async () => {
  const [distRes, sevRes] = await Promise.all([
    axiosClient.get('/analytics/attack-distribution'),
    axiosClient.get('/analytics/severity-distribution'),
  ]);

  return {
    attack_distribution: distRes.data,
    severity_distribution: sevRes.data,
  };
};

// Predict Traffic Packet
export const predictTraffic = async (data: any) => {
  const payload = {
    source_ip: data.src_ip || data.source_ip || '192.168.1.100',
    destination_ip: data.dst_ip || data.destination_ip || '10.0.0.1',
    source_port: Number(data.src_port || data.source_port || 80),
    destination_port: Number(data.dst_port || data.destination_port || 8080),
    protocol: data.protocol || 'TCP',
    features: Array.isArray(data.features) ? data.features : Object.values(data.features || {}).map(Number),
  };
  const response = await axiosClient.post('/predictions/predict', payload);
  return response.data;
};

// Prediction History
export const getPredictionHistory = async (skip = 0, limit = 50) => {
  const response = await axiosClient.get(`/predictions/?skip=${skip}&limit=${limit}`);
  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    prediction: item.predicted_class,
    confidence: item.confidence,
    latency_ms: item.latency_ms,
  }));
};

// Chatbot
export const sendChatMessage = async (message: string, _sessionId?: string) => {
  const response = await axiosClient.post('/chatbot/chat', { message });
  return response.data;
};

// Alerts
export const getAlerts = async (skip = 0, limit = 50) => {
  const response = await axiosClient.get(`/alerts/?skip=${skip}&limit=${limit}`);
  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    title: item.alert_type,
    alert_type: item.alert_type,
    src_ip: item.source_ip,
    dst_ip: item.destination_ip,
    severity: item.severity,
    is_resolved: item.is_resolved,
  }));
};

// Incidents
export const getIncidents = async (skip = 0, limit = 50) => {
  const response = await axiosClient.get(`/incidents/?skip=${skip}&limit=${limit}`);
  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    title: item.title,
    description: item.description,
    status: item.status,
    severity: item.severity,
    assigned_to: item.assigned_user || item.assigned_to || 'Unassigned',
  }));
};

// Audit Logs
export const getAuditLogs = async (skip = 0, limit = 50) => {
  const response = await axiosClient.get(`/audit-logs/?skip=${skip}&limit=${limit}`);
  return response.data.map((item: any) => ({
    id: item.id,
    timestamp: item.created_at,
    user: item.username,
    module: item.resource,
    description: item.details,
    ip_address: item.ip_address,
  }));
};