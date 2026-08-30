import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Gauge,
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
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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

const CHART_COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
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

const compactNumber = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

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
        const data = chartsRes.value as any;
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
    const trendBenign = trendData.reduce((sum, item) => sum + Number(item.benign || 0), 0);
    const trendMalicious = trendData.reduce((sum, item) => sum + Number(item.malicious || 0), 0);
    const totalPackets = Number(summary?.total_packets ?? trendBenign + trendMalicious ?? 0);
    const benignCount = Number(summary?.benign_count ?? trendBenign);
    const maliciousCount = Number(summary?.malicious_count ?? trendMalicious);
    const confidence = Number(summary?.avg_confidence ?? 0.988);
    const maliciousRate = totalPackets > 0 ? (maliciousCount / totalPackets) * 100 : 0;
    const benignRate = totalPackets > 0 ? (benignCount / totalPackets) * 100 : 0;

    return { totalPackets, benignCount, maliciousCount, confidence, maliciousRate, benignRate };
  }, [summary, trendData]);

  const rateTrend = useMemo(
    () =>
      trendData.map((item) => {
        const benign = Number(item.benign || 0);
        const malicious = Number(item.malicious || 0);
        const total = benign + malicious;
        return {
          time: item.time,
          rate: total > 0 ? Number(((malicious / total) * 100).toFixed(2)) : 0,
        };
      }),
    [trendData],
  );

  const topAttack = useMemo(
    () => [...attackDistData].sort((a, b) => Number(b.value) - Number(a.value))[0],
    [attackDistData],
  );

  const highestSeverity = useMemo(() => {
    const priority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    return priority.find((name) => severityDistData.some((item) => item.name.toUpperCase() === name)) ?? 'INFO';
  }, [severityDistData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <Loading type="card" count={4} />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <Loading type="chart" />
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BarChart3 className="h-4 w-4" />
              Security intelligence dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Threat Analytics</h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
              Visualize network traffic, malicious activity, attack classes, severity distribution and model confidence from FedSentry telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
              <CalendarDays className="ml-2 h-4 w-4 text-[var(--text-muted)]" />
              {['1h', '24h', '7d', '30d'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeframe(value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    timeframe === value
                      ? 'bg-blue-600 text-white'
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
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={fetchAnalyticsData} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5" />} label="Analyzed traffic" value={totals.totalPackets.toLocaleString()} helper={`${timeframe.toUpperCase()} window`} />
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Benign traffic" value={totals.benignCount.toLocaleString()} helper={percent(totals.benignRate)} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Malicious traffic" value={totals.maliciousCount.toLocaleString()} helper={percent(totals.maliciousRate)} />
        <MetricCard icon={<Gauge className="h-5 w-5" />} label="Model confidence" value={percent(totals.confidence <= 1 ? totals.confidence * 100 : totals.confidence)} helper="Average prediction confidence" />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2" title="Traffic activity over time" subtitle="Benign and malicious network flows across the selected period">
          <ResponsiveContainer width="100%" height={330}>
            <AreaChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="benignFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="maliciousFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactNumber} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={54} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Area type="monotone" dataKey="benign" name="Benign" stroke="#10b981" strokeWidth={2.5} fill="url(#benignFill)" />
              <Area type="monotone" dataKey="malicious" name="Malicious" stroke="#ef4444" strokeWidth={2.5} fill="url(#maliciousFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Threat severity" subtitle="Distribution of detected events by severity">
          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie data={severityDistData} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={70} outerRadius={108} paddingAngle={3}>
                {severityDistData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color || SEVERITY_COLORS[entry.name.toUpperCase()] || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Attack type distribution" subtitle="Most frequently detected intrusion categories">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={attackDistData} layout="vertical" margin={{ top: 10, right: 28, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickFormatter={compactNumber} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={105} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
              <Bar dataKey="value" name="Detections" radius={[0, 7, 7, 0]}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={46} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Malicious rate']} />
              <Line type="monotone" dataKey="rate" name="Malicious rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <InsightCard icon={<Target className="h-5 w-5" />} title="Top attack vector" value={topAttack?.name || 'No detections'} description={topAttack ? `${Number(topAttack.value).toLocaleString()} detections in the selected dataset.` : 'No attack distribution data is available.'} />
        <InsightCard icon={<TrendingUp className="h-5 w-5" />} title="Malicious rate" value={percent(totals.maliciousRate)} description={`${totals.maliciousCount.toLocaleString()} malicious flows out of ${totals.totalPackets.toLocaleString()} analyzed.`} />
        <InsightCard icon={<AlertTriangle className="h-5 w-5" />} title="Highest active severity" value={highestSeverity} description="Highest severity class currently represented in analytics telemetry." />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Attack telemetry details</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Ranked detection counts used by the attack distribution chart.</p>
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
                .sort((a, b) => Number(b.value) - Number(a.value))
                .map((item, index) => {
                  const total = attackDistData.reduce((sum, row) => sum + Number(row.value || 0), 0);
                  const share = total > 0 ? (Number(item.value) / total) * 100 : 0;
                  return (
                    <tr key={item.name}>
                      <td>#{index + 1}</td>
                      <td className="font-semibold text-[var(--text-primary)]">{item.name}</td>
                      <td>{Number(item.value).toLocaleString()}</td>
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
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
        <p className="mt-2 text-xs font-medium text-[var(--text-subtle)]">{helper}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
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
  <div className={`min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6 ${className}`}>
    <div className="mb-5">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
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
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
    <div className="flex items-center gap-3 text-blue-600">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">{icon}</div>
      <p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
    </div>
    <p className="mt-4 text-xl font-bold text-[var(--text-primary)]">{value}</p>
    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
  </div>
);

export default Analytics;
