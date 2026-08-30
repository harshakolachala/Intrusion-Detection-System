import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  History,
  Network,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  getEngineStatus,
  getPredictionHistory,
  predictTraffic,
  type TrafficPredictionRequest,
  type TrafficPredictionResponse,
} from '../services/api';

const FEATURE_NAMES = [
  'Destination Port','Flow Duration','Total Fwd Packets','Total Backward Packets','Total Length of Fwd Packets','Total Length of Bwd Packets','Fwd Packet Length Max','Fwd Packet Length Min','Fwd Packet Length Mean','Fwd Packet Length Std','Bwd Packet Length Max','Bwd Packet Length Min','Bwd Packet Length Mean','Bwd Packet Length Std','Flow Bytes/s','Flow Packets/s','Flow IAT Mean','Flow IAT Std','Flow IAT Max','Flow IAT Min','Fwd IAT Total','Fwd IAT Mean','Fwd IAT Std','Fwd IAT Max','Fwd IAT Min','Bwd IAT Total','Bwd IAT Mean','Bwd IAT Std','Bwd IAT Max','Bwd IAT Min','Fwd PSH Flags','Bwd PSH Flags','Fwd URG Flags','Bwd URG Flags','Fwd Header Length','Bwd Header Length','Fwd Packets/s','Bwd Packets/s','Min Packet Length','Max Packet Length','Packet Length Mean','Packet Length Std','Packet Length Variance','FIN Flag Count','SYN Flag Count','RST Flag Count','PSH Flag Count','ACK Flag Count','URG Flag Count','CWE Flag Count','ECE Flag Count','Down/Up Ratio','Average Packet Size','Avg Fwd Segment Size','Avg Bwd Segment Size','Fwd Header Length.1','Fwd Avg Bytes/Bulk','Fwd Avg Packets/Bulk','Fwd Avg Bulk Rate','Bwd Avg Bytes/Bulk','Bwd Avg Packets/Bulk','Bwd Avg Bulk Rate','Subflow Fwd Packets','Subflow Fwd Bytes','Subflow Bwd Packets','Subflow Bwd Bytes','Init_Win_bytes_forward','Init_Win_bytes_backward','act_data_pkt_fwd','min_seg_size_forward','Active Mean','Active Std','Active Max','Active Min','Idle Mean','Idle Std','Idle Max','Idle Min',
] as const;

const DEFAULT_FEATURES = [80,1000,8,8,232,4920,64,20,29,12,1500,20,615,200,5152,16,62,25,120,2,800,100,30,150,5,700,90,25,140,4,0,0,0,0,64,64,8,8,20,1500,320,400,160000,0,0,0,0,8,0,0,0,0,1,320,29,615,64,0,0,0,0,0,0,8,232,8,4920,64240,65535,4,20,10,2,20,5,100,1,100,5];

const createRequest = (): TrafficPredictionRequest => ({
  features: [...DEFAULT_FEATURES],
  source_ip: '192.168.1.105',
  destination_ip: '10.0.0.1',
  source_port: 49152,
  destination_port: 80,
  protocol: 'TCP',
});

type WorkspaceTab = 'live' | 'history';
type Props = { initialTab?: WorkspaceTab };
type EngineTelemetry = {
  running: boolean;
  model_status?: string;
  capture_status?: string;
  packets?: number;
  queue_size?: number;
};

const isMaliciousRow = (row: any): boolean => {
  const value = String(row?.prediction ?? row?.attack_type ?? '').toLowerCase();
  return row?.is_anomaly === true || Boolean(value && value !== 'benign' && value !== 'normal traffic');
};

const confidencePct = (value: unknown) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric <= 1 ? numeric * 100 : numeric;
};

export const PredictionWorkspace: React.FC<Props> = ({ initialTab = 'live' }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkspaceTab>(initialTab);
  const [request, setRequest] = useState<TrafficPredictionRequest>(createRequest());
  const [result, setResult] = useState<TrafficPredictionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'BENIGN' | 'MALICIOUS'>('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [engineTelemetry, setEngineTelemetry] = useState<EngineTelemetry>({ running: false, packets: 0, queue_size: 0 });
  const [packetRate, setPacketRate] = useState(0);
  const lastPacketRef = useRef({ count: 0, at: Date.now() });
  const pageSize = 8;

  const loadHistory = async (silent = false) => {
    if (!silent) setHistoryLoading(true);
    try {
      const rows = await getPredictionHistory(0, 100);
      setHistoryRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error(err);
      if (!silent) setHistoryRows([]);
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  };

  const loadEngineTelemetry = async () => {
    try {
      const status = await getEngineStatus() as EngineTelemetry;
      const now = Date.now();
      const packets = Number(status.packets ?? 0);
      const elapsed = Math.max(0.2, (now - lastPacketRef.current.at) / 1000);
      const delta = Math.max(0, packets - lastPacketRef.current.count);
      setPacketRate(Math.round(delta / elapsed));
      lastPacketRef.current = { count: packets, at: now };
      setEngineTelemetry({ ...status, packets, queue_size: Number(status.queue_size ?? 0) });
    } catch (err) {
      console.error('Unable to refresh engine telemetry', err);
      setEngineTelemetry((prev) => ({ ...prev, running: false }));
      setPacketRate(0);
    }
  };

  useEffect(() => {
    void loadHistory();
    void loadEngineTelemetry();

    const telemetryTimer = window.setInterval(() => void loadEngineTelemetry(), 1000);
    const historyTimer = window.setInterval(() => void loadHistory(true), 2500);

    return () => {
      window.clearInterval(telemetryTimer);
      window.clearInterval(historyTimer);
    };
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return historyRows.filter((row) => {
      const malicious = isMaliciousRow(row);
      const matchesType = filter === 'ALL' || (filter === 'MALICIOUS' ? malicious : !malicious);
      const haystack = [row.src_ip,row.dst_ip,row.attack_type,row.prediction,row.id].map((v) => String(v ?? '').toLowerCase()).join(' ');
      return matchesType && (!q || haystack.includes(q));
    });
  }, [historyRows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applyPreset = (preset: 'baseline' | 'flood' | 'scan') => {
    const next = createRequest();
    if (preset === 'flood') {
      next.source_ip = '192.168.1.105';
      next.destination_ip = '10.0.0.1';
      next.source_port = 45000;
      next.destination_port = 80;
      next.features[1] = 50;
      next.features[2] = 512;
      next.features[3] = 0;
      next.features[15] = 10240;
      next.features[44] = 512;
    } else if (preset === 'scan') {
      next.source_ip = '192.168.1.112';
      next.destination_ip = '10.0.0.4';
      next.source_port = 45001;
      next.destination_port = 22;
      next.features[0] = 22;
      next.features[1] = 100;
      next.features[2] = 1;
      next.features[3] = 0;
      next.features[44] = 1;
      next.features[45] = 1;
    }
    setRequest(next);
    setResult(null);
    setError(null);
  };

  const updateFeature = (index: number, raw: string) => {
    const value = Number(raw);
    setRequest((prev) => {
      const features = [...prev.features];
      features[index] = Number.isFinite(value) ? value : 0;
      return { ...prev, features };
    });
  };

  const runPrediction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (request.features.length !== 78) {
      setError(`Prediction requires 78 features. Current vector has ${request.features.length}.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await predictTraffic(request);
      setResult(response);
      await loadHistory(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Prediction failed. Confirm that the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistoryRow = (row: any) => {
    setRequest((prev) => ({
      ...prev,
      source_ip: row.src_ip || prev.source_ip,
      destination_ip: row.dst_ip || prev.destination_ip,
      protocol: String(row.protocol || row.protocol_type || prev.protocol).toUpperCase(),
    }));
    setResult(null);
    setError(null);
    setTab('live');
  };

  const total = historyRows.length;
  const malicious = historyRows.filter(isMaliciousRow).length;
  const avgConfidence = total ? historyRows.reduce((sum, row) => sum + confidencePct(row.confidence), 0) / total : 0;

  return (
    <div className="space-y-5 pb-8">
      <section className="dashboard-panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="theme-muted text-[10px] font-semibold uppercase tracking-[.14em]">FedSentry / Inference workspace</div>
            <h1 className="mt-2">Traffic intelligence</h1>
            <p className="theme-muted mt-2 max-w-2xl text-sm">Live capture telemetry updates automatically while the detection engine is running. Manual 78-feature analysis and the complete prediction history remain available here.</p>
          </div>
          <div className="theme-soft flex w-full max-w-md rounded-2xl border theme-border p-1.5">
            <button type="button" onClick={() => setTab('live')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${tab === 'live' ? 'bg-[var(--brand)] text-white' : 'theme-text'}`}><Activity className="h-4 w-4" />Live Predict</button>
            <button type="button" onClick={() => setTab('history')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${tab === 'history' ? 'bg-[var(--brand)] text-white' : 'theme-text'}`}><History className="h-4 w-4" />History</button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Packets captured" value={Number(engineTelemetry.packets ?? 0).toLocaleString()} icon={<Network className="h-4 w-4" />} live={engineTelemetry.running} />
        <Stat label="Packet rate" value={`${packetRate}/s`} icon={<Activity className="h-4 w-4" />} live={engineTelemetry.running} />
        <Stat label="Capture queue" value={String(engineTelemetry.queue_size ?? 0)} icon={<Database className="h-4 w-4" />} />
        <Stat label="Detection engine" value={engineTelemetry.running ? 'Analyzing' : 'Stopped'} icon={<ShieldCheck className="h-4 w-4" />} success={engineTelemetry.running} danger={!engineTelemetry.running} />
      </section>

      <section className="dashboard-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={`relative flex h-3 w-3 ${engineTelemetry.running ? '' : 'opacity-60'}`}>
            {engineTelemetry.running && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-40" />}
            <span className={`relative h-3 w-3 rounded-full ${engineTelemetry.running ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <div>
            <div className="theme-text text-xs font-semibold">{engineTelemetry.running ? 'Automatic packet analysis is live' : 'Packet analysis is currently stopped'}</div>
            <div className="theme-muted mt-0.5 text-[10px]">Status, packet totals and prediction records refresh automatically — no keyboard or mouse action is required.</div>
          </div>
        </div>
        <div className="theme-muted text-[10px]">Capture: <span className="theme-text font-semibold">{engineTelemetry.capture_status || (engineTelemetry.running ? 'Live Capturing' : 'Stopped')}</span></div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saved predictions" value={String(total)} icon={<Database className="h-4 w-4" />} />
        <Stat label="Malicious" value={String(malicious)} icon={<AlertTriangle className="h-4 w-4" />} danger />
        <Stat label="Benign" value={String(Math.max(0, total - malicious))} icon={<ShieldCheck className="h-4 w-4" />} success />
        <Stat label="Avg. confidence" value={`${avgConfidence.toFixed(1)}%`} icon={<Sparkles className="h-4 w-4" />} />
      </section>

      {tab === 'live' ? (
        <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <form onSubmit={runPrediction} className="dashboard-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Manual flow prediction</h2>
                <p className="theme-muted mt-1 text-xs">Use this editor when you want to test a specific 78-feature flow while live packet capture continues independently.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => applyPreset('baseline')} className="theme-soft theme-text rounded-xl border theme-border px-3 py-2 text-[10px] font-semibold">Baseline</button>
                <button type="button" onClick={() => applyPreset('flood')} className="theme-soft theme-text rounded-xl border theme-border px-3 py-2 text-[10px] font-semibold">Flood sample</button>
                <button type="button" onClick={() => applyPreset('scan')} className="theme-soft theme-text rounded-xl border theme-border px-3 py-2 text-[10px] font-semibold">Scan sample</button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Source IP" value={request.source_ip} onChange={(value) => setRequest((prev) => ({ ...prev, source_ip: value }))} />
              <Field label="Destination IP" value={request.destination_ip} onChange={(value) => setRequest((prev) => ({ ...prev, destination_ip: value }))} />
              <Field label="Source port" type="number" value={String(request.source_port)} onChange={(value) => setRequest((prev) => ({ ...prev, source_port: Number(value) || 0 }))} />
              <Field label="Destination port" type="number" value={String(request.destination_port)} onChange={(value) => setRequest((prev) => ({ ...prev, destination_port: Number(value) || 0 }))} />
              <label className="block"><span className="theme-muted mb-2 block text-[10px] font-semibold uppercase tracking-[.1em]">Protocol</span><select value={request.protocol} onChange={(e) => setRequest((prev) => ({ ...prev, protocol: e.target.value }))} className="h-11 w-full rounded-xl border theme-border px-3 text-sm"><option>TCP</option><option>UDP</option><option>ICMP</option></select></label>
            </div>

            <div className="mt-5 rounded-2xl border theme-border theme-soft p-4">
              <button type="button" onClick={() => setShowFeatures((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
                <div><div className="theme-text text-sm font-semibold">Advanced feature editor</div><div className="theme-muted mt-1 text-[10px]">{request.features.length}/78 CICIDS features ready</div></div>
                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--brand)]">{showFeatures ? 'Hide features' : 'Edit all 78'}</span>
              </button>
              {showFeatures && <div className="mt-4 grid max-h-[430px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">{FEATURE_NAMES.map((name, index) => <label key={name} className="block"><span className="theme-muted mb-1.5 block truncate text-[9px] font-semibold" title={name}>{String(index + 1).padStart(2, '0')} · {name}</span><input type="number" step="any" value={request.features[index] ?? 0} onChange={(e) => updateFeature(index, e.target.value)} className="h-10 w-full rounded-xl border theme-border px-3 text-sm" /></label>)}</div>}
            </div>

            {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-500">{error}</div>}

            <div className="mt-5 flex flex-wrap gap-3">
              <button disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-xs font-semibold text-white disabled:opacity-60"><Zap className="h-4 w-4" />{submitting ? 'Analyzing…' : 'Run prediction'}</button>
              <button type="button" onClick={() => { setRequest(createRequest()); setResult(null); setError(null); }} className="theme-soft theme-text flex items-center gap-2 rounded-xl border theme-border px-4 py-3 text-xs font-semibold"><RotateCcw className="h-4 w-4" />Reset</button>
            </div>
          </form>

          <div className="space-y-5">
            <section className="dashboard-panel p-5">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Prediction result</h3><Activity className="h-4 w-4 text-[var(--brand)]" /></div>
              {result ? <div className="mt-5"><div className={`rounded-2xl border p-4 ${result.prediction.toUpperCase() === 'BENIGN' ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}><div className="text-[10px] font-semibold uppercase tracking-[.12em] opacity-70">Verdict</div><div className="mt-2 text-xl font-semibold">{result.prediction}</div><div className="mt-4 grid grid-cols-2 gap-3"><ResultDatum label="Confidence" value={`${confidencePct(result.confidence).toFixed(1)}%`} /><ResultDatum label="Latency" value={`${Number(result.latency_ms || 0).toFixed(1)} ms`} /></div></div>{result.alert_created && <button type="button" onClick={() => navigate('/alerts')} className="mt-3 flex w-full items-center justify-between rounded-xl bg-[var(--brand)] px-4 py-3 text-xs font-semibold text-white">Open generated alert<ArrowRight className="h-4 w-4" /></button>}</div> : <div className="theme-muted mt-5 rounded-2xl border border-dashed theme-border p-6 text-center text-xs">Live packet capture runs automatically above. Use the manual form when you want a direct model test.</div>}
            </section>

            <section className="dashboard-panel overflow-hidden p-0">
              <div className="flex items-center justify-between border-b theme-border px-5 py-4"><div><h3 className="text-sm font-semibold">Latest predictions</h3><p className="theme-muted mt-1 text-[10px]">Automatically refreshes every 2.5 seconds</p></div><button type="button" onClick={() => setTab('history')} className="text-[10px] font-semibold text-[var(--brand)]">View all</button></div>
              <div className="divide-y divide-[var(--border-soft)]">{historyRows.slice(0, 5).map((row) => <HistoryRow key={String(row.id)} row={row} onOpen={() => setSelected(row)} />)}{!historyRows.length && <div className="theme-muted px-5 py-7 text-center text-xs">No prediction records yet.</div>}</div>
            </section>
          </div>
        </div>
      ) : (
        <section className="dashboard-panel overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold">Prediction history</h2><p className="theme-muted mt-1 text-xs">Search, filter, inspect, reuse prior traffic metadata, and watch new predictions arrive automatically.</p></div>
            <div className="flex flex-wrap items-center gap-2"><div className="theme-soft flex h-10 min-w-[220px] items-center gap-2 rounded-xl border theme-border px-3"><Search className="theme-muted h-4 w-4" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search IP, verdict, attack…" className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none" /></div><select value={filter} onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(1); }} className="h-10 rounded-xl border theme-border px-3 text-xs font-semibold"><option value="ALL">All</option><option value="BENIGN">Benign</option><option value="MALICIOUS">Malicious</option></select><button type="button" onClick={() => void loadHistory()} className="theme-soft theme-text flex h-10 w-10 items-center justify-center rounded-xl border theme-border"><RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} /></button></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-xs"><thead><tr className="border-b theme-border"><th className="px-5 py-3">Time</th><th className="px-5 py-3">Source → Destination</th><th className="px-5 py-3">Verdict</th><th className="px-5 py-3">Attack / class</th><th className="px-5 py-3">Confidence</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{pageRows.map((row) => <tr key={String(row.id)} className="border-b theme-border last:border-b-0"><td className="theme-muted px-5 py-4">{row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}</td><td className="px-5 py-4 font-medium">{row.src_ip || '—'} <span className="theme-muted">→</span> {row.dst_ip || '—'}</td><td className="px-5 py-4"><Verdict malicious={isMaliciousRow(row)} /></td><td className="px-5 py-4">{row.attack_type || row.prediction || 'Unknown'}</td><td className="px-5 py-4 font-semibold">{confidencePct(row.confidence).toFixed(1)}%</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(row)} className="theme-soft theme-text rounded-lg border theme-border px-3 py-2 text-[10px] font-semibold">Inspect</button><button type="button" onClick={() => loadHistoryRow(row)} className="rounded-lg bg-[var(--brand)] px-3 py-2 text-[10px] font-semibold text-white">Use in Live</button></div></td></tr>)}{!pageRows.length && <tr><td colSpan={6} className="theme-muted px-5 py-10 text-center">No predictions match the current filters.</td></tr>}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t theme-border px-5 py-4"><div className="theme-muted text-[10px]">{filteredRows.length} matching records · Page {page} of {totalPages} · Auto-refresh on</div><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="theme-soft theme-text rounded-lg border theme-border px-3 py-2 text-[10px] font-semibold disabled:opacity-40">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="theme-soft theme-text rounded-lg border theme-border px-3 py-2 text-[10px] font-semibold disabled:opacity-40">Next</button></div></div>
        </section>
      )}

      {selected && <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"><div className="dashboard-panel w-full max-w-xl p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="theme-muted text-[10px] font-semibold uppercase tracking-[.12em]">Prediction detail</div><h3 className="mt-2 text-xl font-semibold">{selected.attack_type || selected.prediction || 'Traffic classification'}</h3></div><button type="button" onClick={() => setSelected(null)} className="theme-soft theme-text flex h-9 w-9 items-center justify-center rounded-full border theme-border"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><ResultDatum label="Prediction ID" value={String(selected.id ?? '—')} /><ResultDatum label="Timestamp" value={selected.timestamp ? new Date(selected.timestamp).toLocaleString() : '—'} /><ResultDatum label="Source" value={String(selected.src_ip ?? '—')} /><ResultDatum label="Destination" value={String(selected.dst_ip ?? '—')} /><ResultDatum label="Confidence" value={`${confidencePct(selected.confidence).toFixed(1)}%`} /><ResultDatum label="Latency" value={`${Number(selected.latency_ms ?? selected.latency ?? 0).toFixed(1)} ms`} /></div><button type="button" onClick={() => { loadHistoryRow(selected); setSelected(null); }} className="mt-5 flex w-full items-center justify-between rounded-xl bg-[var(--brand)] px-4 py-3 text-xs font-semibold text-white">Use metadata in Live Predict<ArrowRight className="h-4 w-4" /></button></div></div>}
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) => <label className="block"><span className="theme-muted mb-2 block text-[10px] font-semibold uppercase tracking-[.1em]">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border theme-border px-3 text-sm" /></label>;

const Stat = ({ label, value, icon, danger = false, success = false, live = false }: { label: string; value: string; icon: React.ReactNode; danger?: boolean; success?: boolean; live?: boolean }) => <div className="dashboard-panel rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-rose-500/10 text-rose-500' : success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--brand-soft)] text-[var(--brand)]'}`}>{icon}</div>{live && <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-semibold text-emerald-500"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />LIVE</span>}</div><div className="theme-muted mt-3 text-[9px] font-semibold uppercase tracking-[.1em]">{label}</div><div className="theme-text mt-1 text-xl font-semibold">{value}</div></div>;

const Verdict = ({ malicious }: { malicious: boolean }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${malicious ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{malicious ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}{malicious ? 'Malicious' : 'Benign'}</span>;

const ResultDatum = ({ label, value }: { label: string; value: string }) => <div className="theme-soft rounded-xl border theme-border p-3"><div className="theme-muted text-[9px] font-semibold uppercase tracking-[.1em]">{label}</div><div className="theme-text mt-1 break-words text-xs font-semibold">{value}</div></div>;

const HistoryRow = ({ row, onOpen }: { row: any; onOpen: () => void }) => <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[var(--surface-soft)]"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isMaliciousRow(row) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{isMaliciousRow(row) ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}</div><div className="min-w-0 flex-1"><div className="theme-text truncate text-[11px] font-semibold">{row.attack_type || row.prediction || 'Traffic event'}</div><div className="theme-muted mt-0.5 truncate text-[9px]">{row.src_ip || '—'} → {row.dst_ip || '—'}</div></div><div className="text-right"><div className="theme-text text-[10px] font-semibold">{confidencePct(row.confidence).toFixed(0)}%</div><div className="theme-muted mt-0.5 text-[8px]"><Clock3 className="mr-1 inline h-2.5 w-2.5" />{row.timestamp ? new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div></div></button>;

export default PredictionWorkspace;
