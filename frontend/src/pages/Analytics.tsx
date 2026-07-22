import { useEffect, useState } from "react";

interface FlStatus {
  round: number;
  totalRounds: number;
  status: string;
  lastUpdated: string;
}

interface HistoryPoint {
  date: string;
  attackType: string;
  count: number;
}

const MOCK_FL: FlStatus = {
  round: 7,
  totalRounds: 20,
  status: "Training",
  lastUpdated: "2026-07-22 13:55:00",
};

const MOCK_HISTORY: HistoryPoint[] = [
  { date: "2026-07-18", attackType: "DDoS", count: 12 },
  { date: "2026-07-19", attackType: "Port Scan", count: 8 },
  { date: "2026-07-20", attackType: "Brute Force", count: 5 },
  { date: "2026-07-21", attackType: "DDoS", count: 15 },
  { date: "2026-07-22", attackType: "Probe", count: 3 },
];

function Analytics() {
  const [fl, setFl] = useState<FlStatus | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    // Later: replace with getFlStatus() and getHistory()
    const timer = setTimeout(() => {
      setFl(MOCK_FL);
      setHistory(MOCK_HISTORY);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1>Analytics</h1>
      <p style={{ color: "#6b7280" }}>Federated learning status and historical trends</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <strong>FL Training Status</strong>
        {fl ? (
          <div style={{ marginTop: "0.5rem" }}>
            <div>Round {fl.round} / {fl.totalRounds}</div>
            <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              {fl.status} · last updated {fl.lastUpdated}
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, marginTop: "0.5rem" }}>
              <div style={{
                width: `${(fl.round / fl.totalRounds) * 100}%`,
                background: "#2563eb",
                height: 8,
                borderRadius: 999,
              }} />
            </div>
          </div>
        ) : (
          <p>Loading FL status...</p>
        )}
      </div>

      <div className="card">
        <strong>Historical Detections</strong>
        {history.length === 0 ? (
          <p>Loading history...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "0.5rem" }}>Date</th>
                <th style={{ padding: "0.5rem" }}>Attack Type</th>
                <th style={{ padding: "0.5rem" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.5rem" }}>{h.date}</td>
                  <td style={{ padding: "0.5rem" }}>{h.attackType}</td>
                  <td style={{ padding: "0.5rem" }}>{h.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Analytics;