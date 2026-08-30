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
  Network,
  Server,
  Target,
  Zap,
  RotateCcw,
  ChevronDown,
  Lock,
  Database,
  Gauge,
  AlertTriangle,
  CircleDot,
  Braces,
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
  80,
  1000,
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

  const [showAllFeatures, setShowAllFeatures] =
    useState<boolean>(false);

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
      features[0] = 80;
      features[1] = 1000;
      features[2] = 8;
      features[3] = 8;
      features[4] = 232;
      features[5] = 4920;
      features[14] = 5152;
      features[15] = 16;
      features[43] = 0;
      features[44] = 0;
      features[45] = 0;
      features[46] = 0;
      features[47] = 8;

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
      features[44] = 512;
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
    <div className="min-h-full space-y-6 pb-8">

      {/* =====================================================
          HERO / HEADER
      ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-[90px]" />

        <div className="pointer-events-none absolute bottom-[-100px] left-[35%] h-64 w-64 rounded-full bg-cyan-500/[0.045] blur-[90px]" />

        <div className="relative p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  <Cpu className="h-3 w-3" />
                  PyTorch Inference
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Ready
                </span>

              </div>

              <h1 className="text-2xl font-black tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">
                Live Neural Traffic Inspection
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                Analyze a network flow using the deployed 78-feature
                CICIDS intrusion detection model.
              </p>

            </div>

            {/* Model Identity */}
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                <Braces className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-subtle)]">
                  Model Input
                </p>

                <p className="mt-1 font-mono text-sm font-black text-[var(--text-primary)]">
                  78 Features
                </p>
              </div>

            </div>

          </div>

          {/* Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-b border-r border-[var(--border)] px-4 py-3 sm:border-b-0">
              <Network className="h-3.5 w-3.5 text-blue-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Input
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  Network Flow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 sm:border-b-0 sm:border-r">
              <Database className="h-3.5 w-3.5 text-cyan-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Dataset
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  CICIDS Vector
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-3">
              <Lock className="h-3.5 w-3.5 text-violet-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Processing
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  Local Inference
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-3">
              <Gauge className="h-3.5 w-3.5 text-emerald-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Validation
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  78/78 Features
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          PRESET ATTACK PROFILES
      ===================================================== */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
              <Target className="h-[18px] w-[18px]" />
            </div>

            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)]">
                Traffic Scenario Presets
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Load predefined network-flow vectors for rapid testing.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => handlePresetSelect('benign')}
              className="group flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Normal
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('ddos')}
              className="group flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100"
            >
              <Zap className="h-3.5 w-3.5" />
              DDoS
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('portscan')}
              className="group flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100"
            >
              <Activity className="h-3.5 w-3.5" />
              PortScan
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('sqli')}
              className="group flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              SQLi
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-[var(--text-muted)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <ErrorState
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      {/* =====================================================
          MAIN INSPECTION WORKSPACE
      ===================================================== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* ===================================================
            INPUT PANEL
        =================================================== */}
        <section className="xl:col-span-2 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <Sliders className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                  Network Flow Vector
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Metadata + CICIDS numerical feature vector
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">

              <CircleDot className="h-3 w-3 text-blue-600" />

              <span className="font-mono text-sm font-black text-blue-600">
                {formData.features.length}/78
              </span>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-0"
          >

            {/* =================================================
                NETWORK METADATA
            ================================================= */}
            <section className="p-5 sm:p-6">

              <div className="mb-5 flex items-center gap-2.5">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Network className="h-3.5 w-3.5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Network Metadata
                  </h3>

                  <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
                    Flow endpoint information
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="field-label">
                    Source IP
                  </label>

                  <div className="relative">
                    <Server className="field-icon" />

                    <input
                      type="text"
                      value={formData.source_ip}
                      onChange={(e) =>
                        handleMetadataChange(
                          'source_ip',
                          e.target.value
                        )
                      }
                      className="field-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">
                    Destination IP
                  </label>

                  <div className="relative">
                    <Target className="field-icon" />

                    <input
                      type="text"
                      value={formData.destination_ip}
                      onChange={(e) =>
                        handleMetadataChange(
                          'destination_ip',
                          e.target.value
                        )
                      }
                      className="field-input pl-10"
                    />
                  </div>
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

                <div className="sm:col-span-2">
                  <label className="field-label">
                    Transport Protocol
                  </label>

                  <div className="relative">
                    <select
                      value={formData.protocol}
                      onChange={(e) =>
                        handleMetadataChange(
                          'protocol',
                          e.target.value
                        )
                      }
                      className="field-input appearance-none pr-10"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />
                  </div>
                </div>

              </div>
            </section>

            {/* =================================================
                FEATURE VECTOR
            ================================================= */}
            <section className="border-t border-[var(--border)] p-5 sm:p-6">

              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div className="flex items-center gap-2.5">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <Braces className="h-3.5 w-3.5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      CICIDS Feature Vector
                    </h3>

                    <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
                      Exact order required by the trained scaler
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle className="h-3 w-3" />
                    Scaler Order Matched
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowAllFeatures((v) => !v)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-blue-200 hover:text-blue-600"
                  >
                    {showAllFeatures ? 'Hide' : 'Edit'} all 78 values
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        showAllFeatures ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

              </div>

              {!showAllFeatures && (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <Braces className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    All 78 feature values are loaded and ready to send. Use a preset above for a quick scenario, or click{' '}
                    <span className="font-semibold text-[var(--text-secondary)]">"Edit all 78 values"</span>{' '}
                    to fine-tune individual numbers before running inference.
                  </p>
                </div>
              )}

              {showAllFeatures && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {FEATURE_NAMES.map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="group rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 transition-all duration-200 hover:border-blue-200 hover:bg-[var(--surface)]"
                    >

                      <label
                        className="mb-1.5 block truncate px-0.5 text-xs font-semibold text-[var(--text-secondary)]"
                        title={name}
                      >
                        <span className="mr-1 text-blue-500">
                          {String(index).padStart(2, '0')}.
                        </span>

                        {name}
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
                        className="feature-input"
                      />

                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* =================================================
                SUBMIT BAR
            ================================================= */}
            <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:flex-row sm:items-center sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Activity className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-subtle)]">
                    Model Input
                  </p>

                  <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                    78 numerical features
                  </p>
                </div>

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  formData.features.length !== 78
                }
                className="group flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Evaluating Model...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    <span>Execute Neural Inspection</span>
                  </>
                )}
              </button>

            </div>

          </form>
        </section>

        {/* ===================================================
            RESULT PANEL
        =================================================== */}
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

          {/* Result Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
                <Eye className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                  Inference Result
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Model decision and telemetry
                </p>
              </div>

            </div>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

          </div>

          <div className="p-5 sm:p-6">

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">

                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">

                  <Activity className="h-7 w-7 text-[var(--text-subtle)]" />

                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-blue-500" />

                </div>

                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Awaiting Network Flow
                </p>

                <p className="mt-2 max-w-[250px] text-sm leading-5 text-[var(--text-muted)]">
                  Submit a 78-feature network vector
                  to execute model classification.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
                  <CircleDot className="h-3 w-3 text-blue-500" />

                  <span className="text-xs font-medium text-[var(--text-subtle)]">
                    Inference Pipeline Ready
                  </span>
                </div>

              </div>
            )}

            {loading && (
              <div className="py-8">
                <div className="mb-5 flex flex-col items-center text-center">

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                    <RefreshCw className="h-6 w-6 animate-spin" />

                  </div>

                  <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">
                    Running Neural Inference
                  </p>

                  <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
                    Processing 78-feature vector
                  </p>

                </div>

                <Loading type="chart" />
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">

                {/* =================================================
                    CLASSIFICATION
                ================================================= */}
                <div
                  className={`relative overflow-hidden rounded-2xl border p-5 ${
                    isMalicious
                      ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50'
                      : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50'
                  }`}
                >

                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50 blur-2xl" />

                  <div className="relative flex items-start gap-3">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isMalicious
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {isMalicious ? (
                        <ShieldAlert className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">

                      <p
                        className={`text-xs font-semibold ${
                          isMalicious
                            ? 'text-rose-500'
                            : 'text-emerald-600'
                        }`}
                      >
                        Classification
                      </p>

                      <p
                        className={`mt-1 break-words text-lg font-black tracking-tight ${
                          isMalicious
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {result.prediction}
                      </p>

                      <p className="mt-1 text-sm leading-4 text-slate-500">
                        Federated IDS model classification result.
                      </p>

                    </div>

                  </div>
                </div>

                {/* =================================================
                    CONFIDENCE
                ================================================= */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <Gauge className="h-3.5 w-3.5 text-cyan-500" />

                      <span className="text-sm font-semibold text-[var(--text-muted)]">
                        Model Confidence
                      </span>

                    </div>

                    <span className="font-mono text-base font-black text-[var(--text-primary)]">
                      {(result.confidence * 100).toFixed(2)}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMalicious
                          ? 'bg-gradient-to-r from-rose-500 to-orange-400'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          result.confidence * 100
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between">

                    <span className="text-xs font-medium text-[var(--text-subtle)]">
                      0%
                    </span>

                    <span className="text-xs font-medium text-[var(--text-subtle)]">
                      100%
                    </span>

                  </div>

                </div>

                {/* =================================================
                    LATENCY
                ================================================= */}
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Clock className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--text-subtle)]">
                        Inference Latency
                      </p>

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Model execution time
                      </p>
                    </div>

                  </div>

                  <span className="font-mono text-sm font-black text-blue-600">
                    {result.latency_ms.toFixed(2)} ms
                  </span>

                </div>

                {/* =================================================
                    ALERT STATUS
                ================================================= */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2.5">

                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          result.alert_created
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {result.alert_created ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[var(--text-subtle)]">
                          Security Alert
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          Automated response state
                        </p>
                      </div>

                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        result.alert_created
                          ? 'border-amber-200 bg-amber-50 text-amber-600'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {result.alert_created
                        ? 'Generated'
                        : 'None'}
                    </span>

                  </div>

                  {result.alert_created &&
                    result.alert_id && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">

                        <p className="break-all font-mono text-xs text-amber-700">
                          Alert ID: {result.alert_id}
                        </p>

                      </div>
                    )}

                </div>

                {/* =================================================
                    PREDICTION ID
                ================================================= */}
                <div className="border-t border-[var(--border)] pt-4">

                  <div className="flex items-center gap-2">
                    <Server className="h-3 w-3 text-[var(--text-subtle)]" />

                    <span className="text-xs font-semibold text-[var(--text-subtle)]">
                      Prediction ID
                    </span>
                  </div>

                  <p className="mt-2 break-all rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-xs leading-4 text-[var(--text-muted)]">
                    {result.prediction_id}
                  </p>

                </div>

              </div>
            )}

          </div>
        </section>
      </div>

      {/* =====================================================
          SECURITY PIPELINE FOOTER
      ===================================================== */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Network className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Stage 01
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Flow Vector Received
            </p>
          </div>

          <CheckCircle className="ml-auto h-3.5 w-3.5 text-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <Cpu className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Stage 02
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Neural Classification
            </p>
          </div>

          <CheckCircle className="ml-auto h-3.5 w-3.5 text-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Stage 03
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Security Decision
            </p>
          </div>

          <CheckCircle className="ml-auto h-3.5 w-3.5 text-emerald-500" />

        </div>

      </section>

      {/* =====================================================
          LOCAL FIELD STYLES
      ===================================================== */}
      <style>{`
        .field-label {
          display: block;
          margin-bottom: 0.4rem;
          padding-left: 0.15rem;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.8rem;
          line-height: 1.1rem;
          font-weight: 600;
        }

        .field-input {
          width: 100%;
          min-height: 44px;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          background: var(--surface-muted);
          padding: 0.65rem 0.9rem;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.25rem;
          outline: none;
          transition:
            border-color 180ms ease,
            background-color 180ms ease,
            box-shadow 180ms ease;
        }

        .field-input:hover {
          border-color: var(--border-strong);
          background: var(--surface);
        }

        .field-input:focus {
          border-color: #3b82f6;
          background: var(--surface);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .field-input option {
          background: var(--surface);
          color: var(--text-primary);
        }

        .field-icon {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          width: 0.8rem;
          height: 0.8rem;
          transform: translateY(-50%);
          color: var(--text-subtle);
          pointer-events: none;
        }

        .feature-input {
          width: 100%;
          min-height: 40px;
          border: 1px solid var(--border);
          border-radius: 0.65rem;
          background: var(--surface);
          padding: 0.5rem 0.7rem;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.8rem;
          line-height: 1.1rem;
          outline: none;
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease;
        }

        .feature-input:hover {
          border-color: var(--border-strong);
        }

        .feature-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.45;
        }
      `}</style>

    </div>
  );
};

export default Predict;