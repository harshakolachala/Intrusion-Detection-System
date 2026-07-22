import { useEffect, useState } from "react";

interface Alert {
  id: string;
  timestamp: string;
  attackType: string;
  severity: "high" | "medium" | "low";
  sourceIp: string;
  status: "new" | "acknowledged" | "resolved";
}

const MOCK_ALERTS: Alert[] = [
  { id: "a1", timestamp: "2026-07-22 14:02:11", attackType: "DDoS", severity: "high", sourceIp: "192.168.1.14", status: "new" },
  { id: "a2", timestamp: "2026-07-22 13:47:03", attackType: "Port Scan", severity: "medium", sourceIp: "10.0.0.22", status: "acknowledged" },
  { id: "a3", timestamp: "2026-07-22 13:20:15", attackType: "Brute Force", severity: "high", sourceIp: "172.16.0.5", status: "new" },
  { id: "a4", timestamp: "2026-07-22 12:58:40", attackType: "Probe", severity: "low", sourceIp: "192.168.1.30", status: "resolved" },
];

function badgeClass(severity: Alert["severity"]) {
  if (severity === "high") return "badge badge-high";
  if (severity === "medium") return "badge badge-medium";
  return "badge badge-low";
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Later: replace with getDetections()/alerts endpoint
    const timer = setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1>Alerts</h1>
      <p style={{ color: "#6b7280" }}>Flagged intrusions requiring review</p>

      {loading ? (
        <p>Loading alerts...</p>
      ) : (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {alerts.map((a) => (
            <div key={a.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{a.attackType}</strong>
                <span className={badgeClass(a.severity)} style={{ marginLeft: "0.75rem" }}>
                  {a.severity.toUpperCase()}
                </span>
                <div style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                  {a.timestamp} · {a.sourceIp}
                </div>
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>{a.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;