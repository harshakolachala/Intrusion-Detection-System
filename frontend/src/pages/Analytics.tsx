import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Gauge,
  Network,
  Radar as RadarIcon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getAnalyticsCharts, getAnalyticsSummary } from '../services/api';
import { ErrorState, Loading } from '../components/Loading';

type TrendPoint = {
  time: string;
  benign: number;
  malicious: number;
};

type DistributionPoint = {
  name: string;
  value: number;
  color?: string;
};

type AnalyticsSummary = {
  total_packets?: number;
  benign_count?: number;
  malicious_count?: number;
  avg_confidence?: number;
};

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
const SEVERITY_COLORS: Record<string, string> = {
  INFO: '#10b981',
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
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

const toFiniteNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const compactNumber = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatTooltipNumber = (value: unknown) => toFiniteNumber(value).toLocaleString();
const formatTooltipPercent = (value: unknown) => `${toFiniteNumber(value).toFixed(2)}%`;
const percent = (value: number) => `${value.toFixed(2)}%`;

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('24h');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>(fallbackTrends);
  const [attackDistData, setAttackDistData] = useState<DistributionPoint[]>(fallbackAttacks);
  const [severityDistData, setSeverityDistData] = useState<DistributionPoint[]>(fallbackSeverity);

  const fetchAnalyticsData = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const [summaryRes, chartsRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        getAnalyticsCharts(timeframe),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value as AnalyticsSummary);
      }

      if (chartsRes.status === 'fulfilled' && chartsRes.value) {
        const data = chartsRes.value as {
          trends?: TrendPoint[];
          attack_distribution?: DistributionPoint[];
          severity_distribution?: DistributionPoint[];
        };

        if (Array.isArray(data.trends) && data.trends.length) setTrendData(data.trends);
        if (Array.isArray(data.attack_distribution) && data.attack_distribution.length) {
          setAttackDistData(data.attack_distribution);
        }
        if (Array.isArray(data.severity_distribution) && data.severity_distribution.length) {
          setSeverityDistData(data.severity_distribution);
        }
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

  useEffect(() => {
    void fetchAnalyticsData();
  }, [timeframe]);

  const totals = useMemo(() => {
    const trendBenign = trendData.reduce((sum, item) => sum + toFiniteNumber(item.benign), 0);
    const trendMalicious = trendData.reduce((sum, item) => sum + toFiniteNumber(item.malicious), 0);
    const fallbackTotal = trendBenign + trendMalicious;
    const totalPackets = toFiniteNumber(summary?.total_packets ?? fallbackTotal);
    const benignCount = toFiniteNumber(summary?.benign_count ?? trendBenign);
    const maliciousCount = toFiniteNumber(summary?.malicious_count ?? trendMalicious);
    const confidence = toFiniteNumber(summary?.avg_confidence ?? 0.988);
    const maliciousRate = totalPackets > 0 ? (maliciousCount / totalPackets) * 100 : 0;
    const benignRate = totalPackets > 0 ? (benignCount / totalPackets) * 100 : 0;

    return { totalPackets, benignCount, maliciousCount, confidence, maliciousRate, benignRate };
  }, [summary, trendData]);

  const rateTrend = useMemo(
    () =>
      trendData.map((item) => {
        const benign = toFiniteNumber(item.benign);
        const malicious = toFiniteNumber(item.malicious);
        const total = benign + malicious;
        return {
          time: item.time,
          rate: total > 0 ? Number(((malicious / total) * 100).toFixed(2)) : 0,
        };
      }),
    [trendData],
  );

  const topAttack = useMemo(
    () => [...attackDistData].sort((a, b) => toFiniteNumber(b.value) - toFiniteNumber(a.value))[0],
    [attackDistData],
  );

  const highestSeverity = useMemo(() => {
    const priority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    return priority.find((name) => severityDistData.some((item) => item.name.toUpperCase() === name)) ?? 'INFO';
  }, [severityDistData]);

  const postureData = useMemo(() => {
    const confidenceValue = totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence;
    const totalSeverity = severityDistData.reduce((sum, item) => sum + toFiniteNumber(item.value), 0);
    const critical = severityDistData
      .filter((item) => item.name.toUpperCase() === 'CRITICAL')
      .reduce((sum, item) => sum + toFiniteNumber(item.value), 0);
    const attackTotal = attackDistData.reduce((sum, item) => sum + toFiniteNumber(item.value), 0);
    const topShare = attackTotal > 0 ? (toFiniteNumber(topAttack?.value) / attackTotal) * 100 : 0;
    const stability = rateTrend.length
      ? 100 - clamp(Math.max(...rateTrend.map((item) => item.rate)) * 8)
      : 100;

    return [
      { metric: 'Model confidence', score: clamp(confidenceValue) },
      { metric: 'Benign ratio', score: clamp(totals.benignRate) },
      { metric: 'Threat diversity', score: clamp(100 - topShare) },
      { metric: 'Severity control', score: clamp(100 - (totalSeverity > 0 ? (critical / totalSeverity) * 100 * 8 : 0)) },
      { metric: 'Traffic stability', score: clamp(stability) },
    ];
  }, [attackDistData, rateTrend, severityDistData, topAttack, totals]);

  const concentrationData = useMemo(() => {
    const total = attackDistData.reduce((sum, item) => sum + toFiniteNumber(item.value), 0);
    return [...attackDistData]
      .sort((a, b) => toFiniteNumber(b.value) - toFiniteNumber(a.value))
      .slice(0, 5)
      .map((item, index) => ({
        name: item.name,
        value: total > 0 ? Number(((toFiniteNumber(item.value) / total) * 100).toFixed(1)) : 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [attackDistData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl border border-[var(--border)] p-6">
          <Loading type="card" count={4} />
        </div>
        <div className="glass-panel rounded-3xl border border-[var(--border)] p-6">
          <Loading type="chart" />
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'var(--glass-bg-strong)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(18px)',
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-5rem] left-[38%] h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="slanted-accent mb-2 flex items-center gap-2 text-sm text-indigo-500">
              <Sparkles className="h-4 w-4" />
              Security intelligence observatory
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Threat <span className="gradient-text slanted-accent">Analytics</span>
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
              Multi-dimensional telemetry for traffic health, attack concentration, threat severity and model confidence across FedSentry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-1 shadow-[var(--shadow-xs)] backdrop-blur-xl">
              <CalendarDays className="ml-2 h-4 w-4 text-[var(--text-muted)]" />
              {['1h', '24h', '7d', '30d'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeframe(value)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    timeframe === value
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void fetchAnalyticsData()}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:text-indigo-500 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={fetchAnalyticsData} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5" />} label="Analyzed traffic" value={totals.totalPackets.toLocaleString()} helper={`${timeframe.toUpperCase()} observation window`} />
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Benign traffic" value={totals.benignCount.toLocaleString()} helper={`${percent(totals.benignRate)} of observed traffic`} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Malicious traffic" value={totals.maliciousCount.toLocaleString()} helper={`${percent(totals.maliciousRate)} threat density`} />
        <MetricCard icon={<Gauge className="h-5 w-5" />} label="Model confidence" value={percent(totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence)} helper="Average prediction confidence" />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2" title="Traffic activity over time" subtitle="Benign and malicious network flows across the selected period">
          <ResponsiveContainer width="100%" height={330}>
            <AreaChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="benignFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.015} />
                </linearGradient>
                <linearGradient id="maliciousFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactNumber} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={54} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatTooltipNumber(value)} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Area type="monotone" dataKey="benign" name="Benign" stroke="#10b981" strokeWidth={2.5} fill="url(#benignFill)" />
              <Area type="monotone" dataKey="malicious" name="Malicious" stroke="#ef4444" strokeWidth={2.5} fill="url(#maliciousFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Threat severity" subtitle="Distribution of detected events by severity">
          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie data={severityDistData} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={70} outerRadius={108} paddingAngle={4} cornerRadius={6}>
                {severityDistData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color || SEVERITY_COLORS[entry.name.toUpperCase()] || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatTooltipNumber(value)} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Attack type distribution" subtitle="Most frequently detected intrusion categories">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={attackDistData} layout="vertical" margin={{ top: 10, right: 28, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickFormatter={compactNumber} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={105} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatTooltipNumber(value)} />
              <Bar dataKey="value" name="Detections" radius={[0, 9, 9, 0]}>
                {attackDistData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Malicious traffic rate" subtitle="Percentage of malicious flows at each observation point">
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={rateTrend} margin={{ top: 10, right: 18, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={46} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatTooltipPercent(value), 'Malicious rate']} />
              <Line type="monotone" dataKey="rate" name="Malicious rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Security posture radar" subtitle="Normalized view of model confidence, traffic health and threat balance">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-indigo-500">
            <RadarIcon className="h-4 w-4" />
            Composite posture score
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={postureData} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-subtle)', fontSize: 10 }} axisLine={false} />
              <Radar name="Posture" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.24} strokeWidth={2.5} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${toFiniteNumber(value).toFixed(1)}/100`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Threat concentration" subtitle="Share of detections contributed by the leading attack families">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-500">
            <Network className="h-4 w-4" />
            Attack portfolio density
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <RadialBarChart data={concentrationData} innerRadius="28%" outerRadius="94%" startAngle={92} endAngle={-268} barSize={15}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background={{ fill: 'rgba(148,163,184,.08)' }} cornerRadius={10} />
              <Legend iconSize={9} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', lineHeight: '22px' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatTooltipPercent(value), 'Detection share']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <InsightCard icon={<Target className="h-5 w-5" />} title="Top attack vector" value={topAttack?.name || 'No detections'} description={topAttack ? `${toFiniteNumber(topAttack.value).toLocaleString()} detections in the selected dataset.` : 'No attack distribution data is available.'} />
        <InsightCard icon={<TrendingUp className="h-5 w-5" />} title="Malicious rate" value={percent(totals.maliciousRate)} description={`${totals.maliciousCount.toLocaleString()} malicious flows out of ${totals.totalPackets.toLocaleString()} analyzed.`} />
        <InsightCard icon={<AlertTriangle className="h-5 w-5" />} title="Highest active severity" value={highestSeverity} description="Highest severity class currently represented in analytics telemetry." />
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Attack telemetry details</h2>
          <p className="slanted-accent mt-1 text-sm text-[var(--text-muted)]">Ranked detection intelligence feeding the visual layer.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-0 shadow-none">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Attack type</th>
                <th>Detections</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {[...attackDistData]
                .sort((a, b) => toFiniteNumber(b.value) - toFiniteNumber(a.value))
                .map((item, index) => {
                  const total = attackDistData.reduce((sum, row) => sum + toFiniteNumber(row.value), 0);
                  const share = total > 0 ? (toFiniteNumber(item.value) / total) * 100 : 0;
                  return (
                    <tr key={item.name}>
                      <td>#{index + 1}</td>
                      <td className="font-semibold text-[var(--text-primary)]">{item.name}</td>
                      <td>{toFiniteNumber(item.value).toLocaleString()}</td>
                      <td>{percent(share)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, helper }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/[0.07] blur-2xl transition-transform duration-500 group-hover:scale-125" />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
        <p className="slanted-accent mt-2 text-xs text-[var(--text-subtle)]">{helper}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-500 shadow-[var(--shadow-xs)]">
        {icon}
      </div>
    </div>
  </div>
);

type ChartCardProps = {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
};

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, className = '', children }) => (
  <div className={`glass-panel min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] sm:p-6 ${className}`}>
    <div className="mb-5">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="slanted-accent mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
    </div>
    {children}
  </div>
);

type InsightCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
};

const InsightCard: React.FC<InsightCardProps> = ({ icon, title, value, description }) => (
  <div className="glass-panel rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
    <div className="flex items-center gap-3 text-indigo-500">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10">{icon}</div>
      <p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
    </div>
    <p className="mt-4 text-xl font-bold text-[var(--text-primary)]">{value}</p>
    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
  </div>
);

export default Analytics;
