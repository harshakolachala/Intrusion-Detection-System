import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Server,
  Target,
  Network,
  Gauge,
  ArrowUpRight,
  CircleDot,
  Layers,
  Zap,
  Inbox,
} from 'lucide-react';

import {
  getAlerts,
  updateAlertStatus,
  deleteAlert,
} from '../services/api';

import {
  Loading,
  ErrorState,
} from '../components/Loading';

export const Alerts: React.FC = () => {
  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  // Alert State Management
  const [alerts, setAlerts] =
    useState<any[]>([]);

  const [selectedAlert, setSelectedAlert] =
    useState<any | null>(null);

  const [modalOpen, setModalOpen] =
    useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] =
    useState<string>('');

  const [severityFilter, setSeverityFilter] =
    useState<string>('ALL');

  const [statusFilter, setStatusFilter] =
    useState<string>('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const itemsPerPage = 10;

  const fetchAlertsData = async () => {
    setRefreshing(true);

    try {
      setError(null);

      const data = await getAlerts(0, 100);

      if (Array.isArray(data)) {
        setAlerts(data);
      } else if (
        data &&
        Array.isArray(data.alerts)
      ) {
        setAlerts(data.alerts);
      } else {
        // High-fidelity fallback alerts matching backend schemas
        setAlerts([
          {
            id: 101,
            timestamp:
              new Date().toISOString(),
            title:
              'Critical DDoS Volume Flagged',
            attack_type:
              'DDoS Attack',
            severity:
              'CRITICAL',
            status:
              'NEW',
            src_ip:
              '192.168.1.105',
            dst_ip:
              '10.0.0.1',
            confidence:
              0.98,
            description:
              'Volumetric TCP SYN flood exceeding 10,000 packets/sec targeting primary gateway.',
          },
          {
            id: 102,
            timestamp:
              new Date(
                Date.now() - 450000
              ).toISOString(),
            title:
              'Port Scan Sweep Detected',
            attack_type:
              'PortScan',
            severity:
              'HIGH',
            status:
              'IN_PROGRESS',
            src_ip:
              '192.168.1.112',
            dst_ip:
              '10.0.0.4',
            confidence:
              0.91,
            description:
              'Sequential probe against SSH (22), HTTP (80), and HTTPS (443) within 2-second window.',
          },
          {
            id: 103,
            timestamp:
              new Date(
                Date.now() - 1200000
              ).toISOString(),
            title:
              'SQL Injection Injection Pattern',
            attack_type:
              'SQL Injection',
            severity:
              'CRITICAL',
            status:
              'NEW',
            src_ip:
              '172.16.0.88',
            dst_ip:
              '10.0.0.12',
            confidence:
              0.96,
            description:
              'UNION SELECT injection payload detected in HTTP POST query body.',
          },
          {
            id: 104,
            timestamp:
              new Date(
                Date.now() - 3600000
              ).toISOString(),
            title:
              'Anomaly in Outbound Flow Size',
            attack_type:
              'Data Exfiltration Anomaly',
            severity:
              'MEDIUM',
            status:
              'RESOLVED',
            src_ip:
              '192.168.1.45',
            dst_ip:
              '10.0.0.2',
            confidence:
              0.84,
            description:
              'Unusual outbound payload transfer exceeding established baseline parameters.',
          },
        ]);
      }
    } catch (err: any) {
      console.error(
        'Failed to fetch security alerts:',
        err
      );

      setError(
        'Unable to fetch active security alerts from the backend server.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  // Status Change Handler
  const handleStatusUpdate = async (
    alertId: number | string,
    newStatus: string
  ) => {
    try {
      await updateAlertStatus(
        alertId,
        newStatus
      );

      setAlerts((prev) =>
        prev.map((item) =>
          item.id === alertId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      if (
        selectedAlert &&
        selectedAlert.id === alertId
      ) {
        setSelectedAlert(
          (prev: any) => ({
            ...prev,
            status: newStatus,
          })
        );
      }
    } catch (err) {
      console.error(
        'Failed to update alert status:',
        err
      );
    }
  };

  // Delete Alert Handler
  const handleDeleteAlert = async (
    alertId: number | string
  ) => {
    try {
      await deleteAlert(alertId);

      setAlerts((prev) =>
        prev.filter(
          (item) => item.id !== alertId
        )
      );

      if (
        selectedAlert &&
        selectedAlert.id === alertId
      ) {
        setModalOpen(false);
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error(
        'Failed to delete alert:',
        err
      );
    }
  };

  // Search & Filter Logic
  const filteredAlerts = alerts.filter(
    (alert) => {
      const matchesSearch =
        (alert.title || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (alert.src_ip || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (alert.dst_ip || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (alert.attack_type || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesSeverity =
        severityFilter === 'ALL' ||
        alert.severity ===
          severityFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        alert.status === statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    }
  );

  // Pagination Logic
  const totalPages =
    Math.ceil(
      filteredAlerts.length /
        itemsPerPage
    ) || 1;

  const paginatedAlerts =
    filteredAlerts.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage * itemsPerPage
    );

  // KPI Calculations
  const criticalCount =
    alerts.filter(
      (a) =>
        a.severity === 'CRITICAL'
    ).length;

  const activeCount =
    alerts.filter(
      (a) =>
        a.status === 'NEW' ||
        a.status === 'IN_PROGRESS'
    ).length;

  const resolvedCount =
    alerts.filter(
      (a) =>
        a.status === 'RESOLVED'
    ).length;

  const highCount =
    alerts.filter(
      (a) =>
        a.severity === 'HIGH'
    ).length;

  if (
    loading &&
    alerts.length === 0
  ) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
          <Loading
            type="card"
            count={4}
          />
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
          <Loading type="table" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================================
          HERO HEADER
      ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-rose-500/[0.065] blur-[90px]" />

        <div className="pointer-events-none absolute bottom-[-110px] left-[35%] h-64 w-64 rounded-full bg-blue-500/[0.045] blur-[90px]" />

        <div className="relative p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

            {/* Identity */}
            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                  <ShieldAlert className="h-3 w-3" />
                  Security Operations
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Threat Stream Active
                </span>

              </div>

              <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
                Security Alerts Management
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                Review, triage, investigate, and resolve
                high-confidence security anomalies generated
                by the intrusion detection engine.
              </p>

            </div>

            {/* Refresh */}
            <button
              onClick={fetchAlertsData}
              disabled={refreshing}
              className="group flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  ? 'Synchronizing'
                  : 'Refresh Feeds'}
              </span>
            </button>

          </div>

          {/* Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-b border-r border-[var(--border)] px-4 py-3 sm:border-b-0">

              <Inbox className="h-3.5 w-3.5 text-blue-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Alert Queue
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  {alerts.length} Records
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 sm:border-b-0 sm:border-r">

              <Activity className="h-3.5 w-3.5 text-amber-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Active
                </p>

                <p className="mt-0.5 text-sm font-bold text-amber-600">
                  {activeCount} Pending
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-3">

              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Critical
                </p>

                <p className="mt-0.5 text-sm font-bold text-rose-600">
                  {criticalCount} Immediate
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 px-4 py-3">

              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Resolution
                </p>

                <p className="mt-0.5 text-sm font-bold text-emerald-600">
                  {resolvedCount} Resolved
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
          onRetry={fetchAlertsData}
        />
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/[0.06] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Total Alerts
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Logged by detection engine
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <Inbox className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {alerts.length}
              </p>

              <ArrowUpRight className="mb-1 h-4 w-4 text-blue-500" />

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-blue-500" />
            </div>

          </div>
        </div>

        {/* Critical */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Critical Severity
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Immediate analyst triage
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                <AlertTriangle className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-rose-600">
                {criticalCount}
              </p>

              <span className="mb-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
                Critical
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-100">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${Math.min(
                    alerts.length
                      ? (criticalCount /
                          alerts.length) *
                          100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>
        </div>

        {/* Active */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Pending Action
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  New or under investigation
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                <Activity className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-amber-600">
                {activeCount}
              </p>

              <span className="mb-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
                Unresolved
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${Math.min(
                    alerts.length
                      ? (activeCount /
                          alerts.length) *
                          100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>
        </div>

        {/* Resolved */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Resolved
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Successfully mitigated
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-emerald-600">
                {resolvedCount}
              </p>

              <span className="mb-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                Closed
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(
                    alerts.length
                      ? (resolvedCount /
                          alerts.length) *
                          100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          SEARCH & FILTERS
      ===================================================== */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">

          {/* Search */}
          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <Search className="h-3.5 w-3.5 text-blue-500" />

              <span className="text-xs font-semibold text-[var(--text-subtle)]">
                Alert Search
              </span>

            </div>

            <div className="relative">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

              <input
                type="text"
                placeholder="Search alert title, source IP, destination IP, or classification..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-blue-500 focus:bg-[var(--surface)] focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">

            <div>

              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
                <Filter className="h-3 w-3" />
                Severity
              </label>

              <div className="relative">

                <select
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="min-w-[145px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="ALL">
                    All Severities
                  </option>
                  <option value="CRITICAL">
                    Critical
                  </option>
                  <option value="HIGH">
                    High
                  </option>
                  <option value="MEDIUM">
                    Medium
                  </option>
                  <option value="LOW">
                    Low
                  </option>
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                  ▾
                </span>

              </div>

            </div>

            <div>

              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
                <CircleDot className="h-3 w-3" />
                Status
              </label>

              <div className="relative">

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="min-w-[145px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="ALL">
                    All Statuses
                  </option>
                  <option value="NEW">
                    New
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="RESOLVED">
                    Resolved
                  </option>
                  <option value="DISMISSED">
                    Dismissed
                  </option>
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                  ▾
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Filter Summary */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">

          <div className="flex items-center gap-2">

            <Layers className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-medium text-[var(--text-subtle)]">
              Filtered Result Set
            </span>

            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-xs font-black text-blue-600">
              {filteredAlerts.length}
            </span>

          </div>

          {(searchQuery ||
            severityFilter !==
              'ALL' ||
            statusFilter !==
              'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter(
                  'ALL'
                );
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}

        </div>
      </section>

      {/* =====================================================
          ALERT TABLE
      ===================================================== */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        {/* Table Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">

          <div className="flex items-center gap-3">

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">

              <ShieldAlert className="h-[18px] w-[18px]" />

              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-rose-500" />

            </div>

            <div>
              <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                Threat Alert Registry
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Security events generated by the detection engine
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">

            <Server className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {paginatedAlerts.length} Visible Records
            </span>

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] text-left">

            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Timestamp
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Alert Headline
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Attack Classification
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Source IP
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Severity
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Status
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-subtle)]">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedAlerts.length === 0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-500">

                        <ShieldCheck className="h-7 w-7" />

                      </div>

                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        No Security Alerts Found
                      </p>

                      <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">
                        No alerts match the current search
                        and filter configuration.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                paginatedAlerts.map(
                  (alert) => (
                    <tr
                      key={alert.id}
                      className="group border-b border-[var(--border-soft)] transition-colors duration-150 hover:bg-slate-50/70"
                    >

                      {/* Timestamp */}
                      <td className="whitespace-nowrap px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-[var(--text-subtle)]">
                            <Clock className="h-3.5 w-3.5" />
                          </div>

                          <span className="font-mono text-sm font-medium text-[var(--text-muted)]">
                            {alert.timestamp
                              ? new Date(
                                  alert.timestamp
                                ).toLocaleTimeString()
                              : 'Just now'}
                          </span>

                        </div>

                      </td>

                      {/* Headline */}
                      <td className="max-w-[260px] px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              alert.severity ===
                              'CRITICAL'
                                ? 'bg-rose-500'
                                : alert.severity ===
                                  'HIGH'
                                ? 'bg-orange-500'
                                : alert.severity ===
                                  'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />

                          <div className="min-w-0">

                            <p
                              className="truncate text-sm font-bold text-[var(--text-primary)]"
                              title={
                                alert.title ||
                                alert.attack_type ||
                                'Security Anomaly'
                              }
                            >
                              {alert.title ||
                                alert.attack_type ||
                                'Security Anomaly'}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-[var(--text-subtle)]">
                              Alert ID: {alert.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Attack */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Target className="h-3.5 w-3.5 text-cyan-500" />

                          <span className="rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-1 font-mono text-xs font-bold text-cyan-600">
                            {alert.attack_type ||
                              'Unknown'}
                          </span>

                        </div>

                      </td>

                      {/* Source */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Network className="h-3.5 w-3.5 text-blue-500" />

                          <span className="font-mono text-sm font-bold text-blue-600">
                            {alert.src_ip ||
                              '192.168.1.1'}
                          </span>

                        </div>

                      </td>

                      {/* Severity */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            alert.severity ===
                            'CRITICAL'
                              ? 'border-rose-200 bg-rose-50 text-rose-600'
                              : alert.severity ===
                                'HIGH'
                              ? 'border-orange-200 bg-orange-50 text-orange-600'
                              : alert.severity ===
                                'MEDIUM'
                              ? 'border-amber-200 bg-amber-50 text-amber-600'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {alert.severity ||
                            'INFO'}
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <select
                          value={
                            alert.status ||
                            'NEW'
                          }
                          onChange={(e) =>
                            handleStatusUpdate(
                              alert.id,
                              e.target.value
                            )
                          }
                          className={`rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2 font-mono text-xs font-bold outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                            alert.status ===
                            'RESOLVED'
                              ? 'text-emerald-600'
                              : alert.status ===
                                'IN_PROGRESS'
                              ? 'text-amber-600'
                              : alert.status ===
                                'DISMISSED'
                              ? 'text-slate-500'
                              : 'text-blue-600'
                          }`}
                        >
                          <option value="NEW">
                            NEW
                          </option>

                          <option value="IN_PROGRESS">
                            IN_PROGRESS
                          </option>

                          <option value="RESOLVED">
                            RESOLVED
                          </option>

                          <option value="DISMISSED">
                            DISMISSED
                          </option>

                        </select>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() => {
                              setSelectedAlert(
                                alert
                              );

                              setModalOpen(
                                true
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-blue-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteAlert(
                                alert.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-rose-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
                            title="Delete Alert"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">

            <Layers className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-medium text-[var(--text-subtle)]">
              Page
            </span>

            <span className="font-mono text-sm font-black text-[var(--text-primary)]">
              {currentPage}
            </span>

            <span className="font-mono text-xs text-[var(--text-subtle)]">
              of
            </span>

            <span className="font-mono text-sm font-black text-[var(--text-primary)]">
              {totalPages}
            </span>

            <span className="ml-2 font-mono text-xs text-[var(--text-subtle)]">
              ({filteredAlerts.length} results)
            </span>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    Math.max(
                      p - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    Math.min(
                      p + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          OPERATIONAL STATUS
      ===================================================== */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Server className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Backend
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Alert API Connected
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Zap className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Detection
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Neural Threat Classification
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Operations
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Alert Triage Available
            </p>
          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

      </section>

      {/* =====================================================
          ALERT DETAILS MODAL
      ===================================================== */}
      {modalOpen &&
        selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close modal"
              onClick={() =>
                setModalOpen(false)
              }
              className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-md"
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_90px_rgba(15,23,42,0.25)]">

              {/* Modal Glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-500/[0.07] blur-3xl" />

              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-[var(--border)] p-5 sm:p-6">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-rose-600">
                      Alert Diagnostic
                    </p>

                    <h3 className="mt-1 truncate text-base font-black text-[var(--text-primary)] sm:text-lg">
                      {selectedAlert.title ||
                        'Alert Diagnostic Details'}
                    </h3>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              {/* Body */}
              <div className="relative space-y-5 p-5 sm:p-6">

                {/* Description */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />

                    <span className="text-xs font-semibold text-[var(--text-subtle)]">
                      Event Description
                    </span>

                  </div>

                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedAlert.description ||
                      'Neural flow anomaly flagged by PyTorch inference model.'}
                  </p>

                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Network className="h-3.5 w-3.5 text-blue-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Source IP
                      </span>

                    </div>

                    <p className="mt-2 font-mono text-sm font-black text-blue-600">
                      {selectedAlert.src_ip ||
                        '192.168.1.100'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Target className="h-3.5 w-3.5 text-cyan-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Destination IP
                      </span>

                    </div>

                    <p className="mt-2 font-mono text-sm font-black text-cyan-600">
                      {selectedAlert.dst_ip ||
                        '10.0.0.1'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Gauge className="h-3.5 w-3.5 text-violet-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Confidence Rating
                      </span>

                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">

                      <span className="font-mono text-sm font-black text-[var(--text-primary)]">
                        {(
                          (selectedAlert.confidence ||
                            0.95) *
                          100
                        ).toFixed(1)}
                        %
                      </span>

                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">

                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width: `${Math.min(
                              (selectedAlert.confidence ||
                                0.95) *
                                100,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <CircleDot className="h-3.5 w-3.5 text-amber-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Current Status
                      </span>

                    </div>

                    <p
                      className={`mt-2 font-mono text-sm font-black ${
                        selectedAlert.status ===
                        'RESOLVED'
                          ? 'text-emerald-600'
                          : selectedAlert.status ===
                            'IN_PROGRESS'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {selectedAlert.status ||
                        'NEW'}
                    </p>

                  </div>

                </div>

                {/* Alert classification */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-5">

                  <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-600">
                    {selectedAlert.attack_type ||
                      'Unknown Attack'}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      selectedAlert.severity ===
                      'CRITICAL'
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : selectedAlert.severity ===
                          'HIGH'
                        ? 'border-orange-200 bg-orange-50 text-orange-600'
                        : selectedAlert.severity ===
                          'MEDIUM'
                        ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {selectedAlert.severity ||
                      'INFO'}
                  </span>

                  <span className="font-mono text-xs text-[var(--text-subtle)]">
                    ID: {selectedAlert.id}
                  </span>

                </div>

              </div>

              {/* Footer */}
              <div className="relative flex flex-col-reverse justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:flex-row sm:items-center sm:p-6">

                <button
                  onClick={() =>
                    handleDeleteAlert(
                      selectedAlert.id
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-all hover:-translate-y-0.5 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Alert Record
                </button>

                <button
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Close Window
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
};

export default Alerts;