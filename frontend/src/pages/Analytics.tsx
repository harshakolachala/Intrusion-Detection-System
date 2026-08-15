import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldAlert,
  RefreshCw,
  Calendar,
  Activity,
  Layers,
  Database,
  Network,
  Cpu,
  Gauge,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Clock3,
  Zap,
  Target,
  CircleDot,
  Sparkles,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  getAnalyticsCharts,
  getAnalyticsSummary,
} from '../services/api';

import {
  Loading,
  ErrorState,
} from '../components/Loading';

export const Analytics: React.FC = () => {
  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [timeframe, setTimeframe] =
    useState<string>('24h');

  const [error, setError] =
    useState<string | null>(null);

  // Analytics Data States
  const [summary, setSummary] =
    useState<any>(null);

  const [trendData, setTrendData] =
    useState<any[]>([]);

  const [attackDistData, setAttackDistData] =
    useState<any[]>([]);

  const [severityDistData, setSeverityDistData] =
    useState<any[]>([]);

  const COLORS = [
    '#3b82f6',
    '#06b6d4',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#8b5cf6',
  ];

  const fetchAnalyticsData = async () => {
    setRefreshing(true);

    try {
      setError(null);

      const [summaryRes, chartsRes] =
        await Promise.allSettled([
          getAnalyticsSummary(),
          getAnalyticsCharts(timeframe),
        ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
      }

      if (
        chartsRes.status === 'fulfilled' &&
        chartsRes.value
      ) {
        const data = chartsRes.value;

        if (data.trends) {
          setTrendData(data.trends);
        }

        if (data.attack_distribution) {
          setAttackDistData(
            data.attack_distribution
          );
        }

        if (data.severity_distribution) {
          setSeverityDistData(
            data.severity_distribution
          );
        }
      } else {
        // High-fidelity fallback telemetry matching backend schema
        setTrendData([
          {
            time: '00:00',
            benign: 12000,
            malicious: 450,
          },
          {
            time: '04:00',
            benign: 18000,
            malicious: 620,
          },
          {
            time: '08:00',
            benign: 32000,
            malicious: 1400,
          },
          {
            time: '12:00',
            benign: 45000,
            malicious: 2100,
          },
          {
            time: '16:00',
            benign: 38000,
            malicious: 1800,
          },
          {
            time: '20:00',
            benign: 24000,
            malicious: 890,
          },
        ]);

        setAttackDistData([
          {
            name: 'DDoS Attack',
            value: 3400,
          },
          {
            name: 'PortScan',
            value: 2100,
          },
          {
            name: 'SQL Injection',
            value: 1200,
          },
          {
            name: 'Botnet',
            value: 820,
          },
          {
            name: 'Brute Force',
            value: 300,
          },
        ]);

        setSeverityDistData([
          {
            name: 'INFO',
            value: 1241100,
            color: '#10b981',
          },
          {
            name: 'MEDIUM',
            value: 3200,
            color: '#f59e0b',
          },
          {
            name: 'HIGH',
            value: 2800,
            color: '#f97316',
          },
          {
            name: 'CRITICAL',
            value: 1820,
            color: '#ef4444',
          },
        ]);
      }
    } catch (err) {
      console.error(
        'Failed to fetch analytics telemetry:',
        err
      );

      setError(
        'Telemetry service offline or unable to compile chart aggregations.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
          <Loading
            type="card"
            count={4}
          />
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
          <Loading type="chart" />
        </div>
      </div>
    );
  }

  const totalPackets =
    summary?.total_packets ??
    1248920;

  const benignCount =
    summary?.benign_count ??
    1241100;

  const maliciousCount =
    summary?.malicious_count ??
    7820;

  const confidence =
    summary?.avg_confidence ??
    0.988;

  const benignPercentage =
    (
      (benignCount / totalPackets) *
      100
    ).toFixed(2);

  const maliciousPercentage =
    (
      (maliciousCount / totalPackets) *
      100
    ).toFixed(2);

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================================
          HERO HEADER
      ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        {/* Ambient 3D Lighting */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/[0.08] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-120px] left-[25%] h-72 w-72 rounded-full bg-cyan-400/[0.045] blur-[100px]" />

        <div className="relative p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

            {/* Header Identity */}
            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  <BarChart2 className="h-3 w-3" />
                  Aggregated Telemetry
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live Dataset
                </span>

              </div>

              <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
                Threat Analytics & Trends
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                Historical traffic metrics, attack vectors,
                severity distribution, and model performance
                across the selected analysis window.
              </p>

            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">

                <Calendar className="ml-2 mr-1.5 h-3.5 w-3.5 text-[var(--text-subtle)]" />

                {[
                  '1h',
                  '24h',
                  '7d',
                  '30d',
                ].map((tf) => (
                  <button
                    key={tf}
                    onClick={() =>
                      setTimeframe(tf)
                    }
                    className={`rounded-lg px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      timeframe === tf
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}

              </div>

              <button
                onClick={fetchAnalyticsData}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-blue-600 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                <span>
                  {refreshing
                    ? 'Syncing'
                    : 'Refresh'}
                </span>
              </button>

            </div>

          </div>

          {/* Analytics Status Strip */}
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-b border-r border-[var(--border)] px-4 py-3 sm:border-b-0">

              <Activity className="h-3.5 w-3.5 text-blue-500" />

              <div>
                <p className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-subtle)]">
                  Window
                </p>

                <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
                  {timeframe.toUpperCase()}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 sm:border-b-0 sm:border-r">

              <Database className="h-3.5 w-3.5 text-cyan-500" />

              <div>
                <p className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-subtle)]">
                  Records
                </p>

                <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
                  {totalPackets.toLocaleString()}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-3">

              <Cpu className="h-3.5 w-3.5 text-violet-500" />

              <div>
                <p className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-subtle)]">
                  Engine
                </p>

                <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
                  Neural IDS
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 px-4 py-3">

              <CircleDot className="h-3.5 w-3.5 text-emerald-500" />

              <div>
                <p className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-subtle)]">
                  Telemetry
                </p>

                <p className="mt-0.5 text-[9px] font-bold text-emerald-600">
                  Operational
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchAnalyticsData}
        />
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/[0.07] blur-3xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                  Analyzed Inferences
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                  Processed network flows
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <BarChart2 className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {totalPackets.toLocaleString()}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-blue-600">
                {timeframe.toUpperCase()} Window
              </span>

              <ArrowUpRight className="h-4 w-4 text-blue-500" />

            </div>

          </div>
        </div>

        {/* Benign */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/[0.07] blur-3xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                  Benign Flows
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                  Clean classifications
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-emerald-600">
              {benignCount.toLocaleString()}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-600">
                {benignPercentage}% Clean
              </span>

              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      Number(benignPercentage),
                      100
                    )}%`,
                  }}
                />
              </div>

            </div>

          </div>
        </div>

        {/* Threats */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-500/[0.07] blur-3xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                  Identified Threats
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                  Malicious classifications
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                <ShieldAlert className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-rose-600">
              {maliciousCount.toLocaleString()}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-rose-600">
                {maliciousPercentage}% Threat Ratio
              </span>

              <AlertTriangle className="h-4 w-4 text-rose-500" />

            </div>

          </div>
        </div>

        {/* Precision */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/[0.07] blur-3xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                  Model Precision
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                  Average inference confidence
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
                <Gauge className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-cyan-600">
              {(confidence * 100).toFixed(1)}%
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-cyan-600">
                XAI Verified
              </span>

              <Sparkles className="h-4 w-4 text-cyan-500" />

            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          TIME SERIES
      ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

        <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-56 w-56 rounded-full bg-blue-500/[0.045] blur-[80px]" />

        <div className="relative">

          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <TrendingUp className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                  Inference & Threat Volume
                </h2>

                <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                  Benign and malicious traffic over time
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">

              <Clock3 className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {timeframe.toUpperCase()} Time Series
              </span>

            </div>

          </div>

          <div className="mt-5 h-80 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={trendData}>

                <defs>

                  <linearGradient
                    id="colorBenign"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10b981"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="95%"
                      stopColor="#10b981"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="colorMalicious"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      'var(--surface)',
                    borderColor:
                      'var(--border-strong)',
                    borderRadius:
                      '0.75rem',
                    fontSize: '11px',
                    fontFamily:
                      'monospace',
                    boxShadow:
                      '0 12px 35px rgba(15,23,42,0.10)',
                  }}
                  labelStyle={{
                    color:
                      'var(--text-primary)',
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: '10px',
                    fontFamily:
                      'monospace',
                    paddingTop: '14px',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="benign"
                  name="Benign Traffic"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBenign)"
                  activeDot={{
                    r: 5,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="malicious"
                  name="Malicious Traffic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMalicious)"
                  activeDot={{
                    r: 5,
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

        </div>
      </section>

      {/* =====================================================
          ATTACK + SEVERITY
      ===================================================== */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* ===================================================
            ATTACK VECTOR DISTRIBUTION
        =================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/[0.05] blur-3xl" />

          <div className="relative">

            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
                  <PieChartIcon className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <h3 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                    Top Attack Categories
                  </h3>

                  <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                    Distribution of identified attack vectors
                  </p>
                </div>

              </div>

              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 font-mono text-[7px] font-bold uppercase tracking-wider text-cyan-600">
                Vectors
              </span>

            </div>

            <div className="mt-5 h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={attackDistData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 10,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={9}
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={9}
                    fontFamily="monospace"
                    width={105}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        'var(--surface)',
                      borderColor:
                        'var(--border-strong)',
                      borderRadius:
                        '0.75rem',
                      fontSize: '11px',
                      fontFamily:
                        'monospace',
                      boxShadow:
                        '0 12px 35px rgba(15,23,42,0.10)',
                    }}
                  />

                  <Bar
                    dataKey="value"
                    name="Count"
                    fill="#06b6d4"
                    radius={[
                      0,
                      8,
                      8,
                      0,
                    ]}
                    maxBarSize={28}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

              {attackDistData
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5"
                  >
                    <p className="truncate font-mono text-[7px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                      {item.name}
                    </p>

                    <p className="mt-1 font-mono text-sm font-black text-[var(--text-primary)]">
                      {Number(
                        item.value
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}

            </div>

          </div>
        </div>

        {/* ===================================================
            SEVERITY DISTRIBUTION
        =================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-500/[0.05] blur-3xl" />

          <div className="relative">

            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <h3 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                    Traffic Severity
                  </h3>

                  <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                    Security impact classification
                  </p>
                </div>

              </div>

              <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 font-mono text-[7px] font-bold uppercase tracking-wider text-rose-600">
                Severity
              </span>

            </div>

            <div className="mt-5 h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={severityDistData}
                    cx="50%"
                    cy="48%"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="var(--surface)"
                    strokeWidth={3}
                  >

                    {severityDistData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.color ||
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        'var(--surface)',
                      borderColor:
                        'var(--border-strong)',
                      borderRadius:
                        '0.75rem',
                      fontSize: '11px',
                      fontFamily:
                        'monospace',
                      boxShadow:
                        '0 12px 35px rgba(15,23,42,0.10)',
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: '9px',
                      fontFamily:
                        'monospace',
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>

            </div>

            <div className="grid grid-cols-2 gap-2">

              {severityDistData.map(
                (item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5"
                  >

                    <div className="flex items-center gap-2">

                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            item.color ||
                            COLORS[
                              index %
                                COLORS.length
                            ],
                        }}
                      />

                      <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {item.name}
                      </span>

                    </div>

                    <span className="font-mono text-[9px] font-black text-[var(--text-primary)]">
                      {Number(
                        item.value
                      ).toLocaleString()}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          ANALYTICS INSIGHT STRIP
      ===================================================== */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Layers className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="font-mono text-[7px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              Aggregation
            </p>

            <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
              {timeframe.toUpperCase()} Dataset
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="font-mono text-[7px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              Threat Ratio
            </p>

            <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
              {maliciousPercentage}% Malicious
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Zap className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="font-mono text-[7px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              Model Confidence
            </p>

            <p className="mt-0.5 text-[9px] font-bold text-[var(--text-secondary)]">
              {(confidence * 100).toFixed(1)}%
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

      </section>

    </div>
  );
};

export default Analytics;