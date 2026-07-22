import { useEffect, useState } from "react";

interface Detection {
  id: string;
  timestamp: string;
  attackType: string;
  confidence: number;
  sourceIp: string;
}

const MOCK_DETECTIONS: Detection[] = [
  { id: "1", timestamp: "2026-07-22 14:02:11", attackType: "DDoS", confidence: 0.94, sourceIp: "192.168.1.14" },
  { id: "2", timestamp: "2026-07-22 14:01:47", attackType: "Port Scan", confidence: 0.81, sourceIp: "10.0.0.22" },
  { id: "3", timestamp: "2026-07-22 14:00:59", attackType: "Benign", confidence: 0.99, sourceIp: "192.168.1.8" },
  { id: "4", timestamp: "2026-07-22 13:59:30", attackType: "Brute Force", confidence: 0.76, sourceIp: "172.16.0.5" },
];

function Dashboard() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Later: replace with getDetections() from services/api.ts
    const timer = setTimeout(() => {
      setDetections(MOCK_DETECTIONS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1>Detection Feed</h1>
      <p style={{ color: "#6b7280" }}>Live network traffic classifications</p>

      {loading ? (
        <p>Loading detections...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "0.6rem" }}>Time</th>
              <th style={{ padding: "0.6rem" }}>Attack Type</th>
              <th style={{ padding: "0.6rem" }}>Confidence</th>
              <th style={{ padding: "0.6rem" }}>Source IP</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.6rem" }}>{d.timestamp}</td>
                <td style={{
                  padding: "0.6rem",
                  color: d.attackType === "Benign" ? "#16a34a" : "#dc2626",
                  fontWeight: 600,
                }}>
                  {d.attackType}
                </td>
                <td style={{ padding: "0.6rem" }}>{(d.confidence * 100).toFixed(1)}%</td>
                <td style={{ padding: "0.6rem" }}>{d.sourceIp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;