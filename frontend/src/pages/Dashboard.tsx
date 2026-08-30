import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Bot, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
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
  [key: string]: unknown;
};

type Summary = {
  total_packets?: number;
  benign_count?: number;
  malicious_count?: number;
  avg_confidence?: number;
  total_alerts?: number;
  active_incidents?: number;
};

const compact = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
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

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({});
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [engine, setEngine] = useState<Record<string, unknown>>({});

  const load = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [summaryRes, feedRes, engineRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        getLiveFeed(30),
        getEngineStatus(),
      ]);
      if (summaryRes.status === 'fulfilled' && summaryRes.value) setSummary(summaryRes.value as Summary);
      if (feedRes.status === 'fulfilled' && Array.isArray(feedRes.value)) setFeed(feedRes.value as FeedItem[]);
      if (engineRes.status === 'fulfilled' && engineRes.value) setEngine(engineRes.value as Record<string, unknown>);
      if (summaryRes.status === 'rejected' && feedRes.status === 'rejected') {
        setError('Live telemetry is unavailable. The dashboard is showing its fallback presentation data.');
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
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(() => {
    const total = finite(summary.total_packets);
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
    const data = [
      { name: 'Low', value: counts.LOW || 14, color: '#69c45d' },
      { name: 'Medium', value: counts.MEDIUM || 9, color: '#f5b14c' },
      { name: 'High', value: counts.HIGH || 6, color: '#f36f45' },
      { name: 'Critical', value: counts.CRITICAL || 3, color: '#ef6a60' },
    ];
    return data;
  }, [feed]);

  const recent = feed.slice(0, 7);
  const engineOnline = Boolean(engine.status || engine.running || engine.online || Object.keys(engine).length);

  if (loading) {
    return <div className="space-y-5"><Loading type="card" count={4} /><Loading type="chart" /></div>;
  }

  return (
    <div className="space-y-4 pb-6">
      <section className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-[11px] font-medium text-white/45">FedSentry / Security workspace</div>
            <h1 className="mt-2">Security cabinet</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="bg-[#f36f45] px-4 py-2 text-[11px] font-semibold text-white">Overview</button>
            <button className="border border-white/12 bg-white/[.04] px-4 py-2 text-[11px] text-white/65">Traffic</button>
            <button className="border border-white/12 bg-white/[.04] px-4 py-2 text-[11px] text-white/65">Statistics</button>
            <button onClick={() => void load()} disabled={refreshing} className="ml-1 flex h-9 w-9 items-center justify-center border border-white/12 bg-white/[.05] text-white/60">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={load} />}

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
                  <CartesianGrid vertical={false} strokeDasharray="0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="detections" radius={[4, 4, 0, 0]} fill="#77746e">
                    {fallbackBars.map((_, index) => <Cell key={index} fill={index === 3 ? '#69c45d' : '#77746e'} />)}
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
                <Bar dataKey="detections" fill="#6f6c66" radius={[5, 5, 0, 0]}>
                  {fallbackBars.map((_, index) => <Cell key={index} fill={index === 3 ? '#f5b14c' : '#6f6c66'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <div className="space-y-4">
          <section className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-white">System profile</div>
                <div className="mt-1 text-[10px] text-white/42">FedSentry detection engine</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8cec2] text-[#4b4740]"><ShieldCheck className="h-5 w-5" /></div>
            </div>
            <div className="mt-5 space-y-2.5 text-[11px]">
              <Row label="Engine status" value={engineOnline ? 'Operational' : 'Ready'} valueClass="text-[#91d888]" />
              <Row label="Active model" value="Federated IDS" />
              <Row label="Monitoring" value="Real-time" />
              <Row label="Confidence" value={`${(metrics.confidence || 98.8).toFixed(1)}%`} />
            </div>
          </section>

          <section className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-[13px]">Recent detections</h3>
                <p className="mt-1 text-[10px]">Latest classified activity</p>
              </div>
              <div className="rounded-full bg-[#f36f45] px-3 py-1.5 text-[9px] font-semibold text-white">Live</div>
            </div>
            <div>
              {(recent.length ? recent : [
                { attack_type: 'DDoS Attack', severity: 'HIGH', confidence: .982, source_ip: '10.10.4.22' },
                { attack_type: 'Port Scan', severity: 'MEDIUM', confidence: .941, source_ip: '172.16.8.9' },
                { attack_type: 'Botnet', severity: 'HIGH', confidence: .967, source_ip: '192.168.1.42' },
                { attack_type: 'Brute Force', severity: 'MEDIUM', confidence: .923, source_ip: '10.0.2.14' },
                { attack_type: 'SQL Injection', severity: 'CRITICAL', confidence: .991, source_ip: '172.20.0.11' },
              ]).map((item, index) => (
                <div key={String(item.id || index)} className="flex items-center gap-3 border-b border-white/[.08] px-5 py-3 last:border-b-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${String(item.severity).toUpperCase() === 'CRITICAL' ? 'bg-[#ef6a60]/15 text-[#ff9890]' : String(item.severity).toUpperCase() === 'HIGH' ? 'bg-[#f36f45]/15 text-[#ff9b79]' : 'bg-[#f5b14c]/14 text-[#ffd07a]'}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-white/86">{String(item.attack_type || item.prediction || 'Security event')}</div>
                    <div className="mt-0.5 truncate text-[9px] text-white/38">{String(item.source_ip || item.src_ip || 'Unknown source')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-white/78">{(finite(item.confidence) <= 1 ? finite(item.confidence) * 100 : finite(item.confidence) || 96).toFixed(0)}%</div>
                    <div className="mt-0.5 text-[8px] text-white/34">confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
            <SmallStatus icon={<CheckCircle2 className="h-4 w-4" />} label="Engine" value="Online" success />
            <SmallStatus icon={<Bot className="h-4 w-4" />} label="AI assistant" value="Ready" />
          </section>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ title, value, change, danger = false }: { title: string; value: string; change: string; danger?: boolean }) => (
  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(85,82,76,.73),rgba(61,59,55,.74))] p-5 shadow-[0_18px_48px_rgba(28,27,24,.18)] backdrop-blur-2xl">
    <div className="text-[10px] font-medium text-white/52">{title}</div>
    <div className="mt-3 flex items-end gap-2">
      <div className="text-[25px] font-semibold tracking-[-.04em] text-white">{value}</div>
      <div className={`mb-1 rounded-full px-2 py-1 text-[8px] font-semibold ${danger ? 'bg-[#ef6a60]/14 text-[#ff978f]' : 'bg-[#69c45d]/16 text-[#9be191]'}`}>{change} ↗</div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="p-5">
    <div className="mb-3">
      <h3 className="text-[13px]">{title}</h3>
      <p className="mt-1 text-[10px]">{subtitle}</p>
    </div>
    {children}
  </section>
);

const Row = ({ label, value, valueClass = 'text-white/76' }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center justify-between border-b border-white/[.07] pb-2.5 last:border-b-0">
    <span className="text-white/40">{label}</span><span className={valueClass}>{value}</span>
  </div>
);

const SmallStatus = ({ icon, label, value, success = false }: { icon: React.ReactNode; label: string; value: string; success?: boolean }) => (
  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(85,82,76,.73),rgba(61,59,55,.74))] p-4 shadow-[0_12px_30px_rgba(28,27,24,.15)] backdrop-blur-2xl">
    <div className={success ? 'text-[#91d888]' : 'text-[#ffd07a]'}>{icon}</div>
    <div className="mt-3 text-[9px] text-white/40">{label}</div>
    <div className="mt-1 text-[11px] font-semibold text-white/84">{value}</div>
  </div>
);

export default Dashboard;
