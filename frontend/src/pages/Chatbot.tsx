import { useState } from "react";
import { getExplanation } from "../services/api";

interface ExplainResponse {
  detection_id: string | null;
  attack_type: string;
  confidence: number;
  explanation: string;
  llm_provider: string;
  sources: string[];
}

function Chatbot() {
  const [detectionId, setDetectionId] = useState("a1");
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await getExplanation(detectionId);
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`Unknown detection ID "${detectionId}". Try a1, a2, a3, or a4.`);
      } else {
        setError("Failed to fetch explanation. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Explanations</h1>
      <p style={{ color: "#6b7280" }}>Ask why a detection was flagged</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <label htmlFor="detectionId" style={{ display: "block", marginBottom: "0.5rem" }}>
          Detection ID (try a1, a2, a3, a4)
        </label>
        <input
          id="detectionId"
          value={detectionId}
          onChange={(e) => setDetectionId(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <button
          onClick={handleExplain}
          disabled={loading}
          style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {loading ? "Explaining..." : "Explain"}
        </button>
      </div>

      {error && (
        <div className="card" style={{ color: "#dc2626" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{result.attack_type}</strong>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              {(result.confidence * 100).toFixed(1)}% confidence · via {result.llm_provider}
            </span>
          </div>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>{result.explanation}</p>

          {result.sources.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <strong style={{ fontSize: "0.85rem" }}>Sources</strong>
              <ul style={{ marginTop: "0.3rem", color: "#6b7280", fontSize: "0.85rem" }}>
                {result.sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chatbot;