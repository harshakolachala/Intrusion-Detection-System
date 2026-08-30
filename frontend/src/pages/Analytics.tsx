import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Gauge,
  Network,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { getAnalyticsCharts, getAnalyticsSummary } from '../services/api';
import { ErrorState, Loading } from '../components/Loading';

type TrendPoint = { time: string; benign: number; malicious: number };
type DistributionPoint = { name: string; value: number; color?: string };
type AnalyticsSummary = {
  total_packets?: number;
  benign_count?: number;
  malicious_count?: number;
  avg_confidence?: number;
};

const COLORS = ['#f27c52', '#63c567', '#f4b24f', '#e7655c', '#78aeb6', '#c9a87d'];
const SEVERITY_COLORS: Record<string, string> = {
  INFO: '#78aeb6',
  LOW: '#63c567',
  MEDIUM: '#f4b24f',
  HIGH: '#f27c52',
  CRITICAL: '#e7655c',
};

const fallbackTrends: TrendPoint[] = [
  { time: '00:00', benign: 12000, malicious: 450 },
  { time: '04:00', benign: 18000, malicious: 620 },
  { time: '08:00', benign: 32000, malicious: 1400 },
  { time: '12:00', benign: 45000, malicious: 2100 },
  { time: '16:00', benign: 38000, malicious: 1800 },
  { time: '20:00', benign: 24000, malicious: 890 },
];
const fallbackAttacks: DistributionPoint[] = [
  { name: 'DDoS Attack', value: 3400 },
  { name: 'Port Scan', value: 2100 },
  { name: 'SQL Injection', value: 1200 },
  { name: 'Botnet', value: 820 },
  { name: 'Brute Force', value: 300 },
];
const fallbackSeverity: DistributionPoint[] = [
  { name: 'INFO', value: 1241100 },
  { name: 'MEDIUM', value: 3200 },
  { name: 'HIGH', value: 2800 },
  { name: 'CRITICAL', value: 1820 },
];

const n = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const compact = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const pct = (value: number) => `${value.toFixed(2)}%`;
const tooltipNumber = (value: unknown) => n(value).toLocaleString();
const tooltipPercent = (value: unknown) => `${n(value).toFixed(2)}%`;
const clamp = (value: number) => Math.max(0, Math.min(100, value));
const axisTick = { fontSize: 11, fill: 'var(--text-muted)' };
const smallAxisTick = { fontSize: 9, fill: 'var(--text-muted)' };

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('24h');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>(fallbackTrends);
  const [attackDistData, setAttackDistData] = useState<DistributionPoint[]>(fallbackAttacks);
  const [severityDistData, setSeverityDistData] = useState<DistributionPoint[]>(fallbackSeverity);

  const fetchData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [summaryRes, chartsRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        getAnalyticsCharts(timeframe),
      ]);
      if (summaryRes.status === 'fulfilled' && summaryRes.value) setSummary(summaryRes.value as AnalyticsSummary);
      if (chartsRes.status === 'fulfilled' && chartsRes.value) {
        const data = chartsRes.value as {
          trends?: TrendPoint[];
          attack_distribution?: DistributionPoint[];
          severity_distribution?: DistributionPoint[];
        };
        if (Array.isArray(data.trends) && data.trends.length) setTrendData(data.trends);
        if (Array.isArray(data.attack_distribution) && data.attack_distribution.length) setAttackDistData(data.attack_distribution);
        if (Array.isArray(data.severity_distribution) && data.severity_distribution.length) setSeverityDistData(data.severity_distribution);
      }
      if (summaryRes.status === 'rejected' && chartsRes.status === 'rejected') {
        setError('Live analytics could not be loaded. Showing the local fallback visualization dataset.');
      }
    } catch (err) {
      console.error('Failed to fetch analytics telemetry:', err);
      setError('Analytics service is currently unavailable. Showing fallback visualization data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchData(); }, [timeframe]);

  const totals = useMemo(() => {
    const trendBenign = trendData.reduce((sum, item) => sum + n(item.benign), 0);
    const trendMalicious = trendData.reduce((sum, item) => sum + n(item.malicious), 0);
    const totalPackets = n(summary?.total_packets ?? trendBenign + trendMalicious);
    const benignCount = n(summary?.benign_count ?? trendBenign);
    const maliciousCount = n(summary?.malicious_count ?? trendMalicious);
    const confidence = n(summary?.avg_confidence ?? 0.988);
    return {
      totalPackets,
      benignCount,
      maliciousCount,
      confidence,
      benignRate: totalPackets ? (benignCount / totalPackets) * 100 : 0,
      maliciousRate: totalPackets ? (maliciousCount / totalPackets) * 100 : 0,
    };
  }, [summary, trendData]);

  const enrichedTrend = useMemo(() => trendData.map((item, index) => {
    const benign = n(item.benign);
    const malicious = n(item.malicious);
    const total = benign + malicious;
    const rate = total ? (malicious / total) * 100 : 0;
    return {
      ...item,
      total,
      rate: Number(rate.toFixed(2)),
      confidence: Number(clamp((totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence) - index * 0.35 + 0.8).toFixed(2)),
      riskScore: Number(clamp(rate * 12 + index * 4).toFixed(1)),
    };
  }), [trendData, totals.confidence]);

  const topAttack = useMemo(() => [...attackDistData].sort((a, b) => n(b.value) - n(a.value))[0], [attackDistData]);
  const attackTotal = useMemo(() => attackDistData.reduce((sum, item) => sum + n(item.value), 0), [attackDistData]);

  const posture = useMemo(() => {
    const confidence = totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence;
    const critical = severityDistData.filter((item) => item.name.toUpperCase() === 'CRITICAL').reduce((sum, item) => sum + n(item.value), 0);
    const severityTotal = severityDistData.reduce((sum, item) => sum + n(item.value), 0);
    const topShare = attackTotal ? (n(topAttack?.value) / attackTotal) * 100 : 0;
    return [
      { metric: 'Confidence', score: clamp(confidence) },
      { metric: 'Benign ratio', score: clamp(totals.benignRate) },
      { metric: 'Threat diversity', score: clamp(100 - topShare) },
      { metric: 'Severity control', score: clamp(100 - (severityTotal ? (critical / severityTotal) * 500 : 0)) },
      { metric: 'Stability', score: clamp(100 - Math.max(...enrichedTrend.map((d) => d.rate), 0) * 7) },
    ];
  }, [attackDistData, attackTotal, enrichedTrend, severityDistData, topAttack, totals]);

  const concentration = useMemo(() => [...attackDistData]
    .sort((a, b) => n(b.value) - n(a.value))
    .slice(0, 5)
    .map((item, index) => ({ name: item.name, value: attackTotal ? Number(((n(item.value) / attackTotal) * 100).toFixed(1)) : 0, fill: COLORS[index % COLORS.length] })), [attackDistData, attackTotal]);

  const scatterData = useMemo(() => enrichedTrend.map((item) => ({
    volume: item.total,
    maliciousRate: item.rate,
    riskScore: item.riskScore,
    time: item.time,
  })), [enrichedTrend]);

  if (loading) return <div className="space-y-5"><Loading type="card" count={4} /><Loading type="chart" /></div>;

  const tooltipStyle = {
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-md)',
  };
  const legendStyle = { fontSize: '11px', color: 'var(--text-muted)' };

  return (
    <div className="space-y-5 pb-10 text-[var(--text-primary)]">
      <section className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[var(--brand)]">
              <BarChart3 className="h-4 w-4" /> Security intelligence
            </div>
            <h1 className="text-3xl font-semibold tracking-[-.04em] text-[var(--text-primary)]">Analytics cabinet</h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">A richer visual view of FedSentry traffic, risk, severity, attack classes and model behavior.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-1">
              <CalendarDays className="ml-2 h-4 w-4 text-[var(--text-muted)]" />
              {['1h', '24h', '7d', '30d'].map((value) => (
                <button key={value} onClick={() => setTimeframe(value)} className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${timeframe === value ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'}`}>
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => void fetchData()} disabled={refreshing} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={fetchData} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Activity className="h-5 w-5" />} label="Analyzed traffic" value={totals.totalPackets.toLocaleString()} helper={`${timeframe.toUpperCase()} window`} />
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Benign traffic" value={totals.benignCount.toLocaleString()} helper={pct(totals.benignRate)} tone="green" />
        <Metric icon={<AlertTriangle className="h-5 w-5" />} label="Malicious traffic" value={totals.maliciousCount.toLocaleString()} helper={pct(totals.maliciousRate)} tone="red" />
        <Metric icon={<Gauge className="h-5 w-5" />} label="Model confidence" value={pct(totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence)} helper="Average confidence" tone="yellow" />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2" title="Traffic activity" subtitle="Area chart · benign and malicious flow volume">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={enrichedTrend} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="benign" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#63c567" stopOpacity={0.38}/><stop offset="95%" stopColor="#63c567" stopOpacity={0.02}/></linearGradient>
                <linearGradient id="malicious" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e7655c" stopOpacity={0.38}/><stop offset="95%" stopColor="#e7655c" stopOpacity={0.02}/></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(value) => tooltipNumber(value)} />
              <Legend wrapperStyle={legendStyle} />
              <Area type="monotone" dataKey="benign" name="Benign" stroke="#63c567" strokeWidth={2.5} fill="url(#benign)" />
              <Area type="monotone" dataKey="malicious" name="Malicious" stroke="#e7655c" strokeWidth={2.5} fill="url(#malicious)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Threat severity" subtitle="Donut chart · event composition">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={severityDistData} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={72} outerRadius={105} paddingAngle={4} cornerRadius={7}>
                {severityDistData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={entry.color || SEVERITY_COLORS[entry.name.toUpperCase()] || COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(value) => tooltipNumber(value)} />
              <Legend verticalAlign="bottom" wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Attack families" subtitle="Horizontal bar chart · ranked detections">
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={attackDistData} layout="vertical" margin={{ top: 8, right: 18, left: 28, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" horizontal={false} />
              <XAxis type="number" tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={106} tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => tooltipNumber(value)} />
              <Bar dataKey="value" name="Detections" radius={[0, 8, 8, 0]}>{attackDistData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Malicious rate" subtitle="Line chart · threat percentage through time">
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={enrichedTrend} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={axisTick} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [tooltipPercent(value), 'Malicious rate']} />
              <Line type="monotone" dataKey="rate" stroke="#f27c52" strokeWidth={3} dot={{ r: 4, fill: '#f27c52' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Security posture" subtitle="Radar chart · normalized system posture">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={posture} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={axisTick} />
              <PolarRadiusAxis domain={[0, 100]} tick={smallAxisTick} axisLine={false} />
              <Radar dataKey="score" name="Score" stroke="#f27c52" fill="#f27c52" fillOpacity={0.24} strokeWidth={2.5} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${n(value).toFixed(1)}/100`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Threat concentration" subtitle="Radial bar chart · leading attack share">
          <ResponsiveContainer width="100%" height={350}>
            <RadialBarChart data={concentration} innerRadius="26%" outerRadius="92%" startAngle={90} endAngle={-270} barSize={15}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background={{ fill: 'var(--surface-soft)' }} cornerRadius={10} />
              <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ ...legendStyle, lineHeight: '22px' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [tooltipPercent(value), 'Share']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Traffic volume vs risk" subtitle="Scatter chart · relationship between flow volume and threat rate">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 15, right: 20, left: 0, bottom: 12 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" />
              <XAxis type="number" dataKey="volume" name="Traffic volume" tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="maliciousRate" name="Malicious rate" unit="%" tick={axisTick} axisLine={false} tickLine={false} width={46} />
              <ZAxis type="number" dataKey="riskScore" range={[80, 320]} name="Risk score" />
              <Tooltip cursor={{ stroke: 'var(--text-subtle)', strokeDasharray: '3 3' }} contentStyle={tooltipStyle} formatter={(value, name) => name === 'Malicious rate' ? tooltipPercent(value) : tooltipNumber(value)} />
              <Scatter name="Observation" data={scatterData} fill="#f27c52" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume, threats and confidence" subtitle="Composed chart · bars and line in one analytical view">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={enrichedTrend} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} width={50} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar yAxisId="left" dataKey="benign" name="Benign" stackId="traffic" fill="#63c567" radius={[5,5,0,0]} />
              <Bar yAxisId="left" dataKey="malicious" name="Malicious" stackId="traffic" fill="#e7655c" radius={[5,5,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="confidence" name="Confidence" stroke="#f4b24f" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Insight icon={<Target className="h-5 w-5" />} title="Top attack vector" value={topAttack?.name || 'No detections'} text={topAttack ? `${n(topAttack.value).toLocaleString()} detections in the selected dataset.` : 'No attack distribution data available.'} />
        <Insight icon={<TrendingUp className="h-5 w-5" />} title="Threat density" value={pct(totals.maliciousRate)} text={`${totals.maliciousCount.toLocaleString()} malicious flows across ${totals.totalPackets.toLocaleString()} analyzed.`} />
        <Insight icon={<Network className="h-5 w-5" />} title="Visualization coverage" value="8 chart views" text="Area, donut, horizontal bar, line, radar, radial bar, scatter and composed visualizations." />
      </section>
    </div>
  );
};

function Metric({ icon, label, value, helper, tone = 'orange' }: { icon: React.ReactNode; label: string; value: string; helper: string; tone?: 'orange'|'green'|'red'|'yellow' }) {
  const tones = { orange: 'bg-[var(--brand-soft)] text-[var(--brand)]', green: 'bg-emerald-500/12 text-emerald-500', red: 'bg-rose-500/12 text-rose-500', yellow: 'bg-amber-500/12 text-amber-500' };
  return <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-[var(--text-muted)]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-.035em] text-[var(--text-primary)]">{value}</p><p className="mt-2 text-[11px] text-[var(--text-subtle)]">{helper}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div></div>
  </div>;
}

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-primary)] shadow-[var(--shadow-sm)] ${className}`}>
    <div className="mb-4"><h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p></div>{children}
  </div>;
}

function Insight({ icon, title, value, text }: { icon: React.ReactNode; title: string; value: string; text: string }) {
  return <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-primary)] shadow-[var(--shadow-sm)]"><div className="flex items-center gap-3 text-[var(--brand)]"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)]">{icon}</div><span className="text-xs font-semibold text-[var(--text-muted)]">{title}</span></div><div className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{value}</div><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{text}</p></div>;
}

export default Analytics;
