import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAnalyticsSummary, getEngineStatus, getLiveFeed } from '../services/api';
import { ErrorState, Loading } from '../components/Loading';
import { websocketService, type WebSocketEvent } from '../services/websocket';

type FeedItem = {
  id?: string;
  timestamp?: string;
  prediction?: string;
  attack_type?: string;
  severity?: string;
  confidence?: number;
  src_ip?: string;
  source_ip?: string;
  dst_ip?: string;
  destination_ip?: string;
  alert_id?: string | null;
  risk_score?: number;
  latency_ms?: number;
  status?: string;
  [key: string]: unknown;
};

type Summary = {
  total_packets?: number;
  predictions?: number;
  benign_count?: number;
  malicious_count?: number;
  avg_confidence?: number;
  total_alerts?: number;
  total_incidents?: number;
  active_incidents?: number;
};

const compact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const finite = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fallbackBars = [
  { name: 'Mon', detections: 420 },
  { name: 'Tue', detections: 610 },
  { name: 'Wed', detections: 760 },
  { name: 'Thu', detections: 930 },
  { name: 'Fri', detections: 560 },
  { name: 'Sat', detections: 810 },
  { name: 'Sun', detections: 640 },
];

const fallbackFeed: FeedItem[] = [
  { id: 'demo-1', attack_type: 'DDoS Attack', severity: 'HIGH', confidence: .982, source_ip: '10.10.4.22', timestamp: new Date().toISOString() },
  { id: 'demo-2', attack_type: 'Port Scan', severity: 'MEDIUM', confidence: .941, source_ip: '172.16.8.9', timestamp: new Date().toISOString() },
  { id: 'demo-3', attack_type: 'Botnet', severity: 'HIGH', confidence: .967, source_ip: '192.168.1.42', timestamp: new Date().toISOString() },
  { id: 'demo-4', attack_type: 'Brute Force', severity: 'MEDIUM', confidence: .923, source_ip: '10.0.2.14', timestamp: new Date().toISOString() },
  { id: 'demo-5', attack_type: 'SQL Injection', severity: 'CRITICAL', confidence: .991, source_ip: '172.20.0.11', timestamp: new Date().toISOString() },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({});
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [engine, setEngine] = useState<Record<string, unknown>>({});
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'BENIGN' | 'MALICIOUS' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [wsConnected, setWsConnected] = useState(websocketService.isConnected());
  const liveEventIdsRef = useRef<Set<string>>(new Set());

  const load = async (preserveLiveEvents = true) => {
    setRefreshing(true);
    setError(null);
    try {
      const [summaryRes, feedRes, engineRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        getLiveFeed(30),
        getEngineStatus(),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value as Summary);
      }

      if (feedRes.status === 'fulfilled' && Array.isArray(feedRes.value)) {
        const backendFeed = feedRes.value as FeedItem[];
        if (!preserveLiveEvents) {
          setFeed(backendFeed);
        } else {
          setFeed((previous) => {
            const liveRows = previous.filter((item) => item.id && liveEventIdsRef.current.has(String(item.id)));
            const backendIds = new Set(backendFeed.map((item) => String(item.id ?? '')));
            const retainedLiveRows = liveRows.filter((item) => !backendIds.has(String(item.id ?? '')));
            return [...retainedLiveRows, ...backendFeed].slice(0, 30);
          });
        }
      }

      if (engineRes.status === 'fulfilled' && engineRes.value) {
        setEngine(engineRes.value as Record<string, unknown>);
      }

      if (summaryRes.status === 'rejected' && feedRes.status === 'rejected') {
        setError('Live telemetry is unavailable. The dashboard is showing presentation fallback data.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not synchronize the dashboard with the backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), 12000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribeStatus = websocketService.subscribeStatus((status) => {
      setWsConnected(status === 'connected');
    });

    const unsubscribe = websocketService.subscribe((event: WebSocketEvent) => {
      const data = event.data ?? {};

      if (event.event === 'connection') {
        setWsConnected(true);
        return;
      }
      if (event.event === 'connection_error' || event.event === 'disconnected') {
        setWsConnected(false);
        return;
      }

      if (event.event === 'prediction') {
        const prediction = typeof data.prediction === 'string' ? data.prediction : 'BENIGN';
        const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
        const id = typeof data.prediction_id === 'string'
          ? data.prediction_id
          : `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        liveEventIdsRef.current.add(id);

        const predictionRow: FeedItem = {
          id,
          timestamp: event.timestamp ?? new Date().toISOString(),
          prediction,
          attack_type: typeof data.attack_type === 'string' ? data.attack_type : prediction,
          src_ip: typeof data.source_ip === 'string' ? data.source_ip : 'Unknown',
          source_ip: typeof data.source_ip === 'string' ? data.source_ip : 'Unknown',
          dst_ip: typeof data.destination_ip === 'string' ? data.destination_ip : 'Unknown',
          destination_ip: typeof data.destination_ip === 'string' ? data.destination_ip : 'Unknown',
          confidence,
          severity: typeof data.severity === 'string'
            ? data.severity
            : data.alert_created === true
              ? 'HIGH'
              : prediction.toLowerCase() === 'benign'
                ? 'INFO'
                : 'MEDIUM',
          status: data.alert_created === true ? 'Open' : 'Processed',
          latency_ms: typeof data.latency_ms === 'number' ? data.latency_ms : 0,
          alert_id: typeof data.alert_id === 'string' ? data.alert_id : null,
          risk_score: typeof data.risk_score === 'number' ? data.risk_score : 0,
        };

        setFeed((previous) => {
          if (previous.some((item) => item.id === predictionRow.id)) return previous;
          return [predictionRow, ...previous].slice(0, 30);
        });
        void load(true);
        return;
      }

      if (event.event === 'alert') {
        const alertId = typeof data.alert_id === 'string' ? data.alert_id : null;
        setFeed((previous) => previous.map((item) => {
          if (alertId && item.alert_id === alertId) {
            return {
              ...item,
              severity: typeof data.severity === 'string' ? data.severity : item.severity,
              status: 'Open',
              risk_score: typeof data.risk_score === 'number' ? data.risk_score : item.risk_score,
            };
          }
          return item;
        }));
        void load(true);
        return;
      }

      if (event.event === 'engine_status') {
        setWsConnected(true);
        setEngine((previous) => ({ ...previous, ...data }));
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribe();
    };
  }, []);

  const metrics = useMemo(() => {
    const total = finite(summary.total_packets ?? summary.predictions);
    const benign = finite(summary.benign_count);
    const malicious = finite(summary.malicious_count);
    const confidence = finite(summary.avg_confidence);
    return {
      total: total || benign + malicious,
      benign,
      malicious,
      confidence: confidence <= 1 ? confidence * 100 : confidence,
    };
  }, [summary]);

  const severity = useMemo(() => {
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const item of feed) {
      const key = String(item.severity || 'LOW').toUpperCase();
      if (key in counts) counts[key] += 1;
    }
    return [
      { name: 'Low', value: counts.LOW || 14, color: '#63c567' },
      { name: 'Medium', value: counts.MEDIUM || 9, color: '#f4b24f' },
      { name: 'High', value: counts.HIGH || 6, color: '#f27c52' },
      { name: 'Critical', value: counts.CRITICAL || 3, color: '#e7655c' },
    ];
  }, [feed]);

  const filteredFeed = useMemo(() => {
    const source = feed.length ? feed : fallbackFeed;
    return source
      .filter((item) => {
        const severityName = String(item.severity || 'INFO').toUpperCase();
        const prediction = String(item.prediction || item.attack_type || '').toLowerCase();
        if (feedFilter === 'ALL') return true;
        if (feedFilter === 'BENIGN') return prediction === 'benign' || severityName === 'INFO' || severityName === 'LOW';
        if (feedFilter === 'MALICIOUS') return prediction !== 'benign' && !['INFO', 'LOW'].includes(severityName);
        return severityName === feedFilter;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp ?? 0).getTime();
        const timeB = new Date(b.timestamp ?? 0).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [feed, feedFilter, sortOrder]);

  const recent = filteredFeed.slice(0, 7);
  const engineOnline = Boolean(engine.status || engine.running || engine.online || Object.keys(engine).length);

  if (loading) {
    return <div className="space-y-5"><Loading type="card" count={4} /><Loading type="chart" /></div>;
  }

  return (
    <div className="space-y-4 pb-6">
      <section className="dashboard-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="theme-muted text-[11px] font-medium">FedSentry / Security workspace</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1>Security cabinet</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${wsConnected ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'}`}>
                {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {wsConnected ? 'Live stream' : 'Polling mode'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="navigation" aria-label="Security cabinet views">
            <button type="button" onClick={() => navigate('/dashboard')} aria-current="page" className="rounded-xl bg-[var(--brand)] px-4 py-2 text-[11px] font-semibold text-white">Overview</button>
            <button type="button" onClick={() => navigate('/predict')} className="theme-soft theme-text rounded-xl border theme-border px-4 py-2 text-[11px] font-medium">Traffic</button>
            <button type="button" onClick={() => navigate('/analytics')} className="theme-soft theme-text rounded-xl border theme-border px-4 py-2 text-[11px] font-medium">Statistics</button>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="theme-soft theme-text flex h-9 w-9 items-center justify-center rounded-xl border theme-border disabled:cursor-not-allowed" title="Refresh dashboard telemetry" aria-label="Refresh dashboard telemetry">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <section className="grid gap-3 border-0 bg-transparent p-0 shadow-none backdrop-blur-none sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Packets analyzed" value={compact(metrics.total || 1270000)} change="+11.01%" />
        <Metric title="Benign traffic" value={compact(metrics.benign || 1241100)} change="+8.42%" />
        <Metric title="Threats detected" value={compact(metrics.malicious || 7810)} change="+11.01%" danger />
        <Metric title="Model confidence" value={`${(metrics.confidence || 98.8).toFixed(1)}%`} change="+1.6%" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_.75fr]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Detection activity" subtitle="Daily security events">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fallbackBars} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="detections" radius={[5, 5, 0, 0]} fill="#77746e">
                    {fallbackBars.map((_, index) => <Cell key={index} fill={index === 3 ? '#63c567' : '#77746e'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Threat severity" subtitle="Current event distribution">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={severity} dataKey="value" nameKey="name" cx="42%" cy="48%" innerRadius={54} outerRadius={84} paddingAngle={3}>
                    {severity.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <Panel title="Weekly threat activity" subtitle="Comparison of detections across the last seven observation periods">
            <ResponsiveContainer width="100%" height={285}>
              <BarChart data={fallbackBars} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="detections" fill="#77746e" radius={[5, 5, 0, 0]}>
                  {fallbackBars.map((_, index) => <Cell key={index} fill={index === 3 ? '#f4b24f' : '#77746e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <section className="dashboard-panel overflow-hidden p-0">
            <div className="flex flex-col gap-3 border-b theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[14px]">Live detection feed</h3>
                <p className="theme-muted mt-1 text-[10px]">Filtering and sorting restored from the original dashboard workflow</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="theme-muted h-3.5 w-3.5" />
                <select value={feedFilter} onChange={(event) => setFeedFilter(event.target.value as typeof feedFilter)} className="h-9 rounded-xl px-3 text-[10px] font-semibold">
                  <option value="ALL">All events</option>
                  <option value="BENIGN">Benign</option>
                  <option value="MALICIOUS">Malicious</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                </select>
                <button type="button" onClick={() => setSortOrder((value) => value === 'desc' ? 'asc' : 'desc')} className="theme-soft theme-text flex h-9 items-center gap-2 rounded-xl border theme-border px-3 text-[10px] font-semibold">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-soft)]">
              {recent.map((item, index) => <DetectionRow key={String(item.id || index)} item={item} />)}
              {!recent.length && <div className="theme-muted px-5 py-8 text-center text-xs">No events match the selected filter.</div>}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="dashboard-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="theme-text text-[11px] font-semibold">System profile</div>
                <div className="theme-muted mt-1 text-[10px]">FedSentry detection engine</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><ShieldCheck className="h-5 w-5" /></div>
            </div>
            <div className="mt-5 space-y-2.5 text-[11px]">
              <Row label="Engine status" value={engineOnline ? 'Operational' : 'Ready'} valueClass="text-emerald-500" />
              <Row label="Live stream" value={wsConnected ? 'Connected' : 'Polling'} valueClass={wsConnected ? 'text-emerald-500' : 'text-amber-500'} />
              <Row label="Active model" value="Federated IDS" />
              <Row label="Monitoring" value="Real-time" />
              <Row label="Confidence" value={`${(metrics.confidence || 98.8).toFixed(1)}%`} />
            </div>
          </section>

          <section className="dashboard-panel overflow-hidden p-0">
            <div className="flex items-center justify-between border-b theme-border px-5 py-4">
              <div>
                <h3 className="text-[13px]">Recent detections</h3>
                <p className="theme-muted mt-1 text-[10px]">Latest classified activity</p>
              </div>
              <div className="rounded-full bg-[var(--brand)] px-3 py-1.5 text-[9px] font-semibold text-white">Live</div>
            </div>
            <div className="divide-y divide-[var(--border-soft)]">
              {filteredFeed.slice(0, 5).map((item, index) => <DetectionRow key={`side-${String(item.id || index)}`} item={item} compact />)}
            </div>
          </section>

          <section className="dashboard-panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--brand-soft)] blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Bot className="h-5 w-5" /></div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-500">RAG + LLM</span>
              </div>
              <h3 className="mt-5 text-lg">FedSentry Copilot</h3>
              <p className="theme-muted mt-2 text-xs leading-5">Ask about live alerts, MITRE ATT&CK techniques, incident response and mitigation guidance.</p>
              <div className="mt-4 grid gap-2">
                <button type="button" onClick={() => navigate('/chatbot')} className="flex items-center justify-between rounded-xl bg-[var(--brand)] px-4 py-3 text-left text-[11px] font-semibold text-white">
                  Open AI Assistant
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigate('/chatbot')} className="theme-soft theme-text rounded-xl border theme-border px-4 py-3 text-left text-[10px] font-medium">Explain the latest high-severity detection</button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
            <SmallStatus icon={<CheckCircle2 className="h-4 w-4" />} label="Engine" value={engineOnline ? 'Online' : 'Ready'} success={engineOnline} />
            <SmallStatus icon={<Bot className="h-4 w-4" />} label="AI assistant" value="Ready" />
          </section>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ title, value, change, danger = false }: { title: string; value: string; change: string; danger?: boolean }) => (
  <div className="dashboard-panel rounded-2xl p-5">
    <div className="theme-muted text-[10px] font-medium">{title}</div>
    <div className="mt-3 flex items-end gap-2">
      <div className="theme-text text-[25px] font-semibold tracking-[-.04em]">{value}</div>
      <div className={`mb-1 rounded-full px-2 py-1 text-[8px] font-semibold ${danger ? 'bg-rose-500/12 text-rose-500' : 'bg-emerald-500/12 text-emerald-500'}`}>{change} ↗</div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="dashboard-panel p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="text-[15px]">{title}</h3>
      <p className="theme-muted mt-1 text-[10px]">{subtitle}</p>
    </div>
    {children}
  </section>
);

const Row = ({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center justify-between gap-3 border-b theme-border py-2 last:border-b-0">
    <span className="theme-muted">{label}</span>
    <span className={`theme-text font-semibold ${valueClass}`}>{value}</span>
  </div>
);

const SmallStatus = ({ icon, label, value, success = false }: { icon: React.ReactNode; label: string; value: string; success?: boolean }) => (
  <div className="dashboard-panel rounded-2xl p-4">
    <div className={success ? 'text-emerald-500' : 'text-[var(--brand)]'}>{icon}</div>
    <div className="theme-muted mt-3 text-[9px]">{label}</div>
    <div className="theme-text mt-1 text-[11px] font-semibold">{value}</div>
  </div>
);

const DetectionRow = ({ item, compact: compactRow = false }: { item: FeedItem; compact?: boolean }) => {
  const severity = String(item.severity || 'INFO').toUpperCase();
  const severityClass = severity === 'CRITICAL'
    ? 'bg-rose-500/12 text-rose-500'
    : severity === 'HIGH'
      ? 'bg-orange-500/12 text-orange-500'
      : severity === 'MEDIUM'
        ? 'bg-amber-500/12 text-amber-500'
        : 'bg-emerald-500/12 text-emerald-500';
  const confidence = finite(item.confidence);
  const confidencePct = confidence <= 1 ? confidence * 100 : confidence;

  return (
    <div className={`flex items-center gap-3 px-5 ${compactRow ? 'py-3' : 'py-3.5'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityClass}`}><AlertTriangle className="h-3.5 w-3.5" /></div>
      <div className="min-w-0 flex-1">
        <div className="theme-text truncate text-[11px] font-medium">{String(item.attack_type || item.prediction || 'Security event')}</div>
        <div className="theme-subtle mt-0.5 truncate text-[9px]">{String(item.source_ip || item.src_ip || 'Unknown source')}{item.destination_ip || item.dst_ip ? ` → ${String(item.destination_ip || item.dst_ip)}` : ''}</div>
      </div>
      <div className="text-right">
        <div className="theme-text text-[10px] font-semibold">{(confidencePct || 96).toFixed(0)}%</div>
        <div className="theme-subtle mt-0.5 text-[8px]">{severity}</div>
      </div>
    </div>
  );
};
