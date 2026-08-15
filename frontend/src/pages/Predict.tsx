import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  ShieldAlert,
  CheckCircle,
  Send,
  RefreshCw,
  Sliders,
  Eye,
  Clock,
} from 'lucide-react';

import {
  predictTraffic,
  type TrafficPredictionRequest,
  type TrafficPredictionResponse,
} from '../services/api';

import { Loading, ErrorState } from '../components/Loading';

/*
 * IMPORTANT
 * =========
 * These 78 features MUST remain in exactly this order.
 *
 * This order is verified against:
 *   datasets/combinenew.csv
 *   federated/scaler.pkl
 */
const FEATURE_NAMES = [
  'Destination Port',
  'Flow Duration',
  'Total Fwd Packets',
  'Total Backward Packets',
  'Total Length of Fwd Packets',
  'Total Length of Bwd Packets',
  'Fwd Packet Length Max',
  'Fwd Packet Length Min',
  'Fwd Packet Length Mean',
  'Fwd Packet Length Std',
  'Bwd Packet Length Max',
  'Bwd Packet Length Min',
  'Bwd Packet Length Mean',
  'Bwd Packet Length Std',
  'Flow Bytes/s',
  'Flow Packets/s',
  'Flow IAT Mean',
  'Flow IAT Std',
  'Flow IAT Max',
  'Flow IAT Min',
  'Fwd IAT Total',
  'Fwd IAT Mean',
  'Fwd IAT Std',
  'Fwd IAT Max',
  'Fwd IAT Min',
  'Bwd IAT Total',
  'Bwd IAT Mean',
  'Bwd IAT Std',
  'Bwd IAT Max',
  'Bwd IAT Min',
  'Fwd PSH Flags',
  'Bwd PSH Flags',
  'Fwd URG Flags',
  'Bwd URG Flags',
  'Fwd Header Length',
  'Bwd Header Length',
  'Fwd Packets/s',
  'Bwd Packets/s',
  'Min Packet Length',
  'Max Packet Length',
  'Packet Length Mean',
  'Packet Length Std',
  'Packet Length Variance',
  'FIN Flag Count',
  'SYN Flag Count',
  'RST Flag Count',
  'PSH Flag Count',
  'ACK Flag Count',
  'URG Flag Count',
  'CWE Flag Count',
  'ECE Flag Count',
  'Down/Up Ratio',
  'Average Packet Size',
  'Avg Fwd Segment Size',
  'Avg Bwd Segment Size',
  'Fwd Header Length.1',
  'Fwd Avg Bytes/Bulk',
  'Fwd Avg Packets/Bulk',
  'Fwd Avg Bulk Rate',
  'Bwd Avg Bytes/Bulk',
  'Bwd Avg Packets/Bulk',
  'Bwd Avg Bulk Rate',
  'Subflow Fwd Packets',
  'Subflow Fwd Bytes',
  'Subflow Bwd Packets',
  'Subflow Bwd Bytes',
  'Init_Win_bytes_forward',
  'Init_Win_bytes_backward',
  'act_data_pkt_fwd',
  'min_seg_size_forward',
  'Active Mean',
  'Active Std',
  'Active Max',
  'Active Min',
  'Idle Mean',
  'Idle Std',
  'Idle Max',
  'Idle Min',
] as const;

const DEFAULT_FEATURES: number[] = [
  80,       // Destination Port
  1000,     // Flow Duration
  8,
  8,
  232,
  4920,
  64,
  20,
  29,
  12,
  1500,
  20,
  615,
  200,
  5152,
  16,
  62,
  25,
  120,
  2,
  800,
  100,
  30,
  150,
  5,
  700,
  90,
  25,
  140,
  4,
  0,
  0,
  0,
  0,
  64,
  64,
  8,
  8,
  20,
  1500,
  320,
  400,
  160000,
  0,
  0,
  0,
  0,
  8,
  0,
  0,
  0,
  0,
  1,
  320,
  29,
  615,
  64,
  0,
  0,
  0,
  0,
  0,
  0,
  8,
  232,
  8,
  4920,
  64240,
  65535,
  4,
  20,
  10,
  2,
  20,
  5,
  100,
  1,
  100,
  5,
];

const createRequest = (): TrafficPredictionRequest => ({
  features: [...DEFAULT_FEATURES],
  source_ip: '192.168.1.105',
  destination_ip: '10.0.0.1',
  source_port: 49152,
  destination_port: 80,
  protocol: 'TCP',
});

export const Predict: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] =
    useState<TrafficPredictionResponse | null>(null);

  const [formData, setFormData] =
    useState<TrafficPredictionRequest>(createRequest());

  const handleMetadataChange = (
    field:
      | 'source_ip'
      | 'destination_ip'
      | 'source_port'
      | 'destination_port'
      | 'protocol',
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (
    index: number,
    value: number
  ) => {
    setFormData((prev) => {
      const features = [...prev.features];
      features[index] = value;

      return {
        ...prev,
        features,
      };
    });
  };

  /*
   * Presets modify actual CICIDS features.
   * They do NOT use the old protocol_type/service/count/etc.
   */
  const handlePresetSelect = (
    type: 'benign' | 'ddos' | 'portscan' | 'sqli'
  ) => {
    const features = [...DEFAULT_FEATURES];

    if (type === 'benign') {
      features[0] = 80;       // Destination Port
      features[1] = 1000;     // Flow Duration
      features[2] = 8;        // Fwd packets
      features[3] = 8;        // Bwd packets
      features[4] = 232;
      features[5] = 4920;
      features[14] = 5152;   // Flow Bytes/s
      features[15] = 16;     // Flow Packets/s
      features[43] = 0;       // FIN
      features[44] = 0;       // SYN
      features[45] = 0;       // RST
      features[46] = 0;       // PSH
      features[47] = 8;       // ACK

      setFormData({
        ...createRequest(),
        features,
        source_ip: '192.168.1.45',
        destination_ip: '10.0.0.2',
        source_port: 49152,
        destination_port: 80,
        protocol: 'TCP',
      });
    }

    if (type === 'ddos') {
      features[0] = 80;
      features[1] = 50;
      features[2] = 512;
      features[3] = 0;
      features[4] = 0;
      features[5] = 0;
      features[14] = 0;
      features[15] = 10240;
      features[44] = 512;     // SYN
      features[45] = 0;
      features[47] = 0;
      features[66] = 64240;

      setFormData({
        ...createRequest(),
        features,
        source_ip: '192.168.1.105',
        destination_ip: '10.0.0.1',
        source_port: 45000,
        destination_port: 80,
        protocol: 'TCP',
      });
    }

    if (type === 'portscan') {
      features[0] = 22;
      features[1] = 100;
      features[2] = 1;
      features[3] = 0;
      features[4] = 0;
      features[5] = 0;
      features[14] = 0;
      features[15] = 240;
      features[44] = 1;
      features[45] = 1;
      features[51] = 0;
      features[56] = 0;
      features[57] = 0;

      setFormData({
        ...createRequest(),
        features,
        source_ip: '192.168.1.112',
        destination_ip: '10.0.0.4',
        source_port: 45001,
        destination_port: 22,
        protocol: 'TCP',
      });
    }

    if (type === 'sqli') {
      features[0] = 80;
      features[1] = 2500;
      features[2] = 15;
      features[3] = 12;
      features[4] = 1420;
      features[5] = 8900;
      features[14] = 4128;
      features[15] = 10;
      features[43] = 0;
      features[44] = 0;
      features[47] = 12;
      features[52] = 430;

      setFormData({
        ...createRequest(),
        features,
        source_ip: '172.16.0.88',
        destination_ip: '10.0.0.12',
        source_port: 49200,
        destination_port: 80,
        protocol: 'TCP',
      });
    }

    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setFormData(createRequest());
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (formData.features.length !== 78) {
      setError(
        `Invalid feature vector. Expected 78 features, received ${formData.features.length}.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictTraffic(formData);

      setResult(response);
    } catch (err: any) {
      console.error('Prediction API Error:', err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Prediction failed. Please verify that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isMalicious =
    result &&
    result.prediction.toUpperCase() !== 'BENIGN';

  return (
    <div className="space-y-8 font-sans text-slate-100">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-slate-800/80 pb-5">

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Live Neural Traffic Inspection
            </h1>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-3.5 h-3.5" />
              PYTORCH INFERENCE
            </span>
          </div>

          <p className="text-sm text-slate-400 mt-1">
            78-feature CICIDS network-flow inspection
          </p>
        </div>

        {/* PRESETS */}
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          <span className="text-slate-400 mr-1">
            Sample:
          </span>

          <button
            type="button"
            onClick={() => handlePresetSelect('benign')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 hover:bg-slate-800"
          >
            Normal
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect('ddos')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-400 hover:bg-slate-800"
          >
            DDoS
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect('portscan')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 hover:bg-slate-800"
          >
            PortScan
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect('sqli')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400 hover:bg-slate-800"
          >
            SQLi
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
            title="Reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* INPUT PANEL */}
        <div className="xl:col-span-2 rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 shadow-xl">

          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
            <Sliders className="w-5 h-5 text-blue-400" />

            <div>
              <h2 className="text-lg font-bold text-white">
                Network Flow Vector
              </h2>

              <p className="text-xs text-slate-500 font-mono mt-1">
                Exactly 78 numerical features
              </p>
            </div>

            <span className="ml-auto text-xs font-mono text-cyan-400">
              {formData.features.length}/78
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* NETWORK METADATA */}
            <section>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Network Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="field-label">
                    Source IP
                  </label>

                  <input
                    type="text"
                    value={formData.source_ip}
                    onChange={(e) =>
                      handleMetadataChange(
                        'source_ip',
                        e.target.value
                      )
                    }
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    Destination IP
                  </label>

                  <input
                    type="text"
                    value={formData.destination_ip}
                    onChange={(e) =>
                      handleMetadataChange(
                        'destination_ip',
                        e.target.value
                      )
                    }
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    Source Port
                  </label>

                  <input
                    type="number"
                    value={formData.source_port}
                    onChange={(e) =>
                      handleMetadataChange(
                        'source_port',
                        Number(e.target.value)
                      )
                    }
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    Destination Port
                  </label>

                  <input
                    type="number"
                    value={formData.destination_port}
                    onChange={(e) =>
                      handleMetadataChange(
                        'destination_port',
                        Number(e.target.value)
                      )
                    }
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    Protocol
                  </label>

                  <select
                    value={formData.protocol}
                    onChange={(e) =>
                      handleMetadataChange(
                        'protocol',
                        e.target.value
                      )
                    }
                    className="field-input"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                  </select>
                </div>

              </div>
            </section>

            {/* 78 FEATURES */}
            <section className="border-t border-slate-800/70 pt-6">

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">
                  CICIDS Feature Vector
                </h3>

                <span className="text-[10px] font-mono text-slate-500">
                  ORDER MATCHED TO SCALER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {FEATURE_NAMES.map((name, index) => (
                  <div key={`${name}-${index}`}>

                    <label
                      className="block text-[10px] font-mono text-slate-500 mb-1.5 truncate"
                      title={name}
                    >
                      {index}. {name}
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={formData.features[index]}
                      onChange={(e) =>
                        handleFeatureChange(
                          index,
                          Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />

                  </div>
                ))}

              </div>
            </section>

            {/* SUBMIT */}
            <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-3">

              <div className="flex items-center text-xs font-mono text-slate-500">
                <Activity className="w-3.5 h-3.5 mr-2 text-cyan-400" />

                Model input:
                <span className="text-cyan-400 ml-1">
                  78 features
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  formData.features.length !== 78
                }
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Model...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Neural Inspection</span>
                  </>
                )}
              </button>

            </div>

          </form>
        </div>

        {/* RESULT PANEL */}
        <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 shadow-xl">

          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
            <Eye className="w-5 h-5 text-cyan-400" />

            <h2 className="text-lg font-bold text-white">
              Inference Result
            </h2>
          </div>

          {!result && !loading && (
            <div className="text-center py-16 text-slate-500 font-mono">

              <Activity className="w-10 h-10 mx-auto text-slate-700 mb-3" />

              <p className="text-xs">
                Submit a 78-feature network vector
                for classification.
              </p>

            </div>
          )}

          {loading && (
            <Loading type="chart" />
          )}

          {result && !loading && (
            <div className="space-y-5">

              {/* CLASSIFICATION */}
              <div
                className={`p-5 rounded-xl border flex items-start gap-3 ${
                  isMalicious
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >

                {isMalicious ? (
                  <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />
                )}

                <div>

                  <span
                    className={`text-sm font-mono uppercase font-bold ${
                      isMalicious
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {result.prediction}
                  </span>

                  <p className="text-xs text-slate-400 mt-1">
                    15-class federated IDS classification
                  </p>

                </div>

              </div>

              {/* CONFIDENCE */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">

                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">
                    Model Confidence
                  </span>

                  <span className="text-lg font-bold font-mono text-white">
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        result.confidence * 100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* LATENCY */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">

                <span className="text-xs font-mono text-slate-400">
                  Inference Latency
                </span>

                <span className="text-cyan-400 font-bold font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {result.latency_ms.toFixed(2)} ms
                </span>

              </div>

              {/* ALERT */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">

                <div className="flex justify-between items-center">

                  <span className="text-xs font-mono text-slate-400">
                    Security Alert
                  </span>

                  <span
                    className={`text-xs font-mono font-bold ${
                      result.alert_created
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {result.alert_created
                      ? 'GENERATED'
                      : 'NONE'}
                  </span>

                </div>

                {result.alert_created &&
                  result.alert_id && (
                    <p className="text-[10px] font-mono text-slate-500 mt-2 break-all">
                      Alert ID: {result.alert_id}
                    </p>
                  )}

              </div>

              {/* PREDICTION ID */}
              <div className="border-t border-slate-800 pt-4">

                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Prediction ID
                </span>

                <p className="text-[10px] font-mono text-slate-400 mt-1 break-all">
                  {result.prediction_id}
                </p>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Tailwind utility classes used above */}
      <style>{`
        .field-label {
          display: block;
          font-size: 0.7rem;
          line-height: 1rem;
          font-family: monospace;
          color: rgb(148 163 184);
          margin-bottom: 0.375rem;
        }

        .field-input {
          width: 100%;
          background-color: rgb(15 23 42);
          border: 1px solid rgb(30 41 59);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.75rem;
          line-height: 1rem;
          font-family: monospace;
          color: white;
          outline: none;
        }

        .field-input:focus {
          border-color: rgb(59 130 246);
        }
      `}</style>

    </div>
  );
};

export default Predict;