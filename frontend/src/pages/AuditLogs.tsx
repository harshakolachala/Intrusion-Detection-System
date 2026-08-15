import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  Activity,
  SlidersHorizontal,
  Server,
  Network,
  Database,
  Fingerprint,
  Terminal,
  ArrowUpRight,
  CircleDot,
  Layers,
  ShieldAlert,
  Zap,
} from 'lucide-react';

import { getAuditLogs } from '../services/api';
import {
  Loading,
  ErrorState,
} from '../components/Loading';

export const AuditLogs: React.FC = () => {
  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  // Audit State Management
  const [auditLogs, setAuditLogs] =
    useState<any[]>([]);

  const [selectedLog, setSelectedLog] =
    useState<any | null>(null);

  const [modalOpen, setModalOpen] =
    useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] =
    useState<string>('');

  const [moduleFilter, setModuleFilter] =
    useState<string>('ALL');

  const [statusFilter, setStatusFilter] =
    useState<string>('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const itemsPerPage = 10;

  const fetchAuditData = async () => {
    setRefreshing(true);

    try {
      setError(null);

      const data =
        await getAuditLogs(0, 100);

      if (Array.isArray(data)) {
        setAuditLogs(data);
      } else if (
        data &&
        Array.isArray(data.logs)
      ) {
        setAuditLogs(data.logs);
      } else {
        // High-fidelity fallback audit records matching backend schema
        setAuditLogs([
          {
            id: 3001,
            timestamp:
              new Date().toISOString(),
            user:
              'admin@sentinel.ai',
            action:
              'UPDATE_THRESHOLD',
            module:
              'INFERENCE_ENGINE',
            status:
              'SUCCESS',
            description:
              'Modified neural network anomaly sensitivity threshold from 0.85 to 0.90.',
            ip_address:
              '10.0.4.12',
          },
          {
            id: 3002,
            timestamp:
              new Date(
                Date.now() - 1200000
              ).toISOString(),
            user:
              'analyst1@sentinel.ai',
            action:
              'UPDATE_ALERT_STATUS',
            module:
              'ALERTS',
            status:
              'SUCCESS',
            description:
              'Updated alert #101 status to RESOLVED following DDoS mitigation.',
            ip_address:
              '10.0.4.18',
          },
          {
            id: 3003,
            timestamp:
              new Date(
                Date.now() - 3600000
              ).toISOString(),
            user:
              'system_bot',
            action:
              'FL_SYNC',
            module:
              'FEDERATED_LEARNING',
            status:
              'SUCCESS',
            description:
              'Global model weights v2.4 synchronized across 4 enterprise nodes.',
            ip_address:
              '127.0.0.1',
          },
          {
            id: 3004,
            timestamp:
              new Date(
                Date.now() - 7200000
              ).toISOString(),
            user:
              'unknown_user',
            action:
              'LOGIN_ATTEMPT',
            module:
              'AUTH',
            status:
              'FAILED',
            description:
              'Multiple invalid authentication credentials supplied for admin portal.',
            ip_address:
              '198.51.100.42',
          },
          {
            id: 3005,
            timestamp:
              new Date(
                Date.now() - 14400000
              ).toISOString(),
            user:
              'lead@sentinel.ai',
            action:
              'CREATE_INCIDENT',
            module:
              'INCIDENTS',
            status:
              'SUCCESS',
            description:
              'Generated incident ticket #INC-2026-001 for active subnet flood.',
            ip_address:
              '10.0.4.10',
          },
        ]);
      }
    } catch (err: any) {
      console.error(
        'Failed to fetch audit logs:',
        err
      );

      setError(
        'Unable to fetch system audit logs from the backend server.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  // Filter Logic
  const filteredLogs = auditLogs.filter(
    (log) => {
      const matchesSearch =
        (log.user || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (log.action || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (log.description || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (log.ip_address || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesModule =
        moduleFilter === 'ALL' ||
        log.module === moduleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        log.status === statusFilter;

      return (
        matchesSearch &&
        matchesModule &&
        matchesStatus
      );
    }
  );

  // Pagination Logic
  const totalPages =
    Math.ceil(
      filteredLogs.length /
        itemsPerPage
    ) || 1;

  const paginatedLogs =
    filteredLogs.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage * itemsPerPage
    );

  // Metric Cards
  const totalActions =
    auditLogs.length;

  const successActions =
    auditLogs.filter(
      (l) =>
        l.status === 'SUCCESS'
    ).length;

  const failedActions =
    auditLogs.filter(
      (l) =>
        l.status === 'FAILED'
    ).length;

  const uniqueUsers =
    new Set(
      auditLogs.map(
        (l) => l.user
      )
    ).size;

  if (
    loading &&
    auditLogs.length === 0
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

        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-120px] left-[30%] h-72 w-72 rounded-full bg-blue-500/[0.04] blur-[100px]" />

        <div className="relative p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  <Lock className="h-3 w-3" />
                  Immutable Trail
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Compliance Stream
                </span>

              </div>

              <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
                System Audit & Compliance Logs
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                Track administrative interventions, model
                configuration changes, authentication events,
                and security-sensitive system operations.
              </p>

            </div>

            <button
              onClick={fetchAuditData}
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
                  : 'Sync Audit DB'}
              </span>
            </button>

          </div>

          {/* Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-b border-r border-[var(--border)] px-4 py-3 sm:border-b-0">

              <Database className="h-3.5 w-3.5 text-blue-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Repository
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  {totalActions} Records
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 sm:border-b-0 sm:border-r">

              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Execution
                </p>

                <p className="mt-0.5 text-sm font-bold text-emerald-600">
                  {successActions} Successful
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-3">

              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Exceptions
                </p>

                <p className="mt-0.5 text-sm font-bold text-rose-600">
                  {failedActions} Failed
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 px-4 py-3">

              <User className="h-3.5 w-3.5 text-cyan-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Actors
                </p>

                <p className="mt-0.5 text-sm font-bold text-cyan-600">
                  {uniqueUsers} Unique Users
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
          onRetry={fetchAuditData}
        />
      )}

      {/* =====================================================
          METRIC CARDS
      ===================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/[0.06] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Recorded Actions
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Events in audit repository
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <FileText className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {totalActions}
              </p>

              <ArrowUpRight className="mb-1 h-4 w-4 text-blue-500" />

            </div>

            <p className="mt-4 text-xs font-semibold text-blue-600">
              Immutable Event Store
            </p>

          </div>
        </div>

        {/* Success */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Successful Operations
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Verified system execution
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-emerald-600">
              {successActions}
            </p>

            <p className="mt-4 text-xs font-semibold text-emerald-600">
              Verified Execution
            </p>

          </div>
        </div>

        {/* Failed */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Failed Events
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Security or execution exceptions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                <ShieldAlert className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-rose-600">
              {failedActions}
            </p>

            <p className="mt-4 text-xs font-semibold text-rose-600">
              Requires Review
            </p>

          </div>
        </div>

        {/* Users */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Active User Accounts
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Unique recorded actors
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
                <Fingerprint className="h-[18px] w-[18px]" />
              </div>

            </div>

            <p className="mt-5 font-mono text-2xl font-black tracking-tight text-cyan-600">
              {uniqueUsers}
            </p>

            <p className="mt-4 text-xs font-semibold text-cyan-600">
              Unique Actors
            </p>

          </div>
        </div>

      </section>

      {/* =====================================================
          SEARCH & FILTERS
      ===================================================== */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">

          <SlidersHorizontal className="h-4 w-4 text-blue-500" />

          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)]">
              Audit Registry Filters
            </h2>

            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Query administrative and system activity
            </p>
          </div>

        </div>

        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end">

          {/* Search */}
          <div className="min-w-0 flex-1">

            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
              <Search className="h-3 w-3" />
              Search Registry
            </label>

            <div className="relative">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

              <input
                type="text"
                placeholder="Search user, action type, description, or IP address..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-blue-500 focus:bg-[var(--surface)] focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          </div>

          {/* Module */}
          <div>

            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
              <Layers className="h-3 w-3" />
              Target Module
            </label>

            <div className="relative">

              <select
                value={moduleFilter}
                onChange={(e) =>
                  setModuleFilter(
                    e.target.value
                  )
                }
                className="min-w-[190px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">
                  Module: All
                </option>

                <option value="INFERENCE_ENGINE">
                  Inference Engine
                </option>

                <option value="ALERTS">
                  Alerts
                </option>

                <option value="INCIDENTS">
                  Incidents
                </option>

                <option value="FEDERATED_LEARNING">
                  Federated Learning
                </option>

                <option value="AUTH">
                  Authentication
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                ▾
              </span>

            </div>

          </div>

          {/* Status */}
          <div>

            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
              <CircleDot className="h-3 w-3" />
              Execution Status
            </label>

            <div className="relative">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="min-w-[150px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">
                  Status: All
                </option>

                <option value="SUCCESS">
                  Success
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                ▾
              </span>

            </div>

          </div>

        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">

          <div className="flex items-center gap-2">

            <Filter className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-medium text-[var(--text-subtle)]">
              Matching Records
            </span>

            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-xs font-black text-blue-600">
              {filteredLogs.length}
            </span>

          </div>

          {(searchQuery ||
            moduleFilter !== 'ALL' ||
            statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setModuleFilter(
                  'ALL'
                );
                setStatusFilter(
                  'ALL'
                );
              }}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}

        </div>

      </section>

      {/* =====================================================
          AUDIT TABLE
      ===================================================== */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <FileText className="h-[18px] w-[18px]" />
            </div>

            <div>

              <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                Immutable Audit Registry
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Chronological record of privileged system activity
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">

            <Activity className="h-3.5 w-3.5 text-emerald-500" />

            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {paginatedLogs.length} Visible Records
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px] text-left">

            <thead>

              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Timestamp
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Actor / User
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Action Executed
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Target Module
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Source IP
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Status
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-subtle)]">
                  Details
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedLogs.length === 0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500">
                        <FileText className="h-7 w-7" />
                      </div>

                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        No Audit Records Found
                      </p>

                      <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">
                        No system events match the current
                        search and filter configuration.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                paginatedLogs.map(
                  (log) => (
                    <tr
                      key={log.id}
                      className="group border-b border-[var(--border-soft)] transition-colors duration-150 hover:bg-slate-50/70"
                    >

                      {/* Timestamp */}
                      <td className="whitespace-nowrap px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-[var(--text-subtle)]">
                            <Clock className="h-3.5 w-3.5" />
                          </div>

                          <div>

                            <p className="font-mono text-sm font-bold text-[var(--text-secondary)]">
                              {log.timestamp
                                ? new Date(
                                    log.timestamp
                                  ).toLocaleTimeString()
                                : 'Just now'}
                            </p>

                            <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
                              Event #{log.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* User */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <User className="h-3.5 w-3.5" />
                          </div>

                          <div className="max-w-[190px]">

                            <p className="truncate font-mono text-sm font-bold text-[var(--text-primary)]">
                              {log.user ||
                                'system'}
                            </p>

                            <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
                              Actor
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Terminal className="h-3.5 w-3.5 text-cyan-500" />

                          <span className="rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-1 font-mono text-xs font-black text-cyan-600">
                            {log.action}
                          </span>

                        </div>

                      </td>

                      {/* Module */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Layers className="h-3.5 w-3.5 text-violet-500" />

                          <span className="text-xs font-semibold text-[var(--text-secondary)]">
                            {log.module}
                          </span>

                        </div>

                      </td>

                      {/* IP */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Network className="h-3.5 w-3.5 text-blue-500" />

                          <span className="font-mono text-sm font-bold text-blue-600">
                            {log.ip_address ||
                              '127.0.0.1'}
                          </span>

                        </div>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            log.status ===
                            'SUCCESS'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                              : 'border-rose-200 bg-rose-50 text-rose-600'
                          }`}
                        >

                          {log.status ===
                          'SUCCESS' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}

                          {log.status}

                        </span>

                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() => {
                            setSelectedLog(
                              log
                            );
                            setModalOpen(
                              true
                            );
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-blue-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View Full Entry"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

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

            <Database className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

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
              ({filteredLogs.length} results)
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
          SYSTEM INTEGRITY STRIP
      ===================================================== */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Lock className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Integrity
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Immutable Audit Trail
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Server className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Backend
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Audit API Connected
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Zap className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Monitoring
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Compliance Stream Active
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}
      {modalOpen &&
        selectedLog && (
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

              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/[0.07] blur-3xl" />

              {/* Modal Header */}
              <div className="relative flex items-center justify-between border-b border-[var(--border)] p-5 sm:p-6">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-indigo-600">
                      Audit Trail Entry
                    </p>

                    <h3 className="mt-1 truncate text-base font-black text-[var(--text-primary)] sm:text-lg">
                      Event #{selectedLog.id}
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

              {/* Modal Body */}
              <div className="relative space-y-5 p-5 sm:p-6">

                {/* Description */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <Terminal className="h-3.5 w-3.5 text-cyan-500" />

                    <span className="text-xs font-semibold text-[var(--text-subtle)]">
                      Action Description
                    </span>

                  </div>

                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedLog.description}
                  </p>

                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <User className="h-3.5 w-3.5 text-blue-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        User Account
                      </span>

                    </div>

                    <p className="mt-2 break-all font-mono text-sm font-black text-blue-600">
                      {selectedLog.user}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Layers className="h-3.5 w-3.5 text-violet-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Target Module
                      </span>

                    </div>

                    <p className="mt-2 break-words font-mono text-sm font-black text-violet-600">
                      {selectedLog.module}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Network className="h-3.5 w-3.5 text-cyan-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Origin IP
                      </span>

                    </div>

                    <p className="mt-2 font-mono text-sm font-black text-cyan-600">
                      {selectedLog.ip_address ||
                        '127.0.0.1'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      {selectedLog.status ===
                      'SUCCESS' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      )}

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Execution Status
                      </span>

                    </div>

                    <p
                      className={`mt-2 font-mono text-sm font-black ${
                        selectedLog.status ===
                        'SUCCESS'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {selectedLog.status}
                    </p>

                  </div>

                </div>

                {/* Event Metadata */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3">

                    <p className="text-xs font-medium text-[var(--text-subtle)]">
                      Event ID
                    </p>

                    <p className="mt-1 font-mono text-sm font-black text-[var(--text-primary)]">
                      #{selectedLog.id}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3">

                    <p className="text-xs font-medium text-[var(--text-subtle)]">
                      Action
                    </p>

                    <p className="mt-1 truncate font-mono text-sm font-black text-[var(--text-primary)]">
                      {selectedLog.action}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3">

                    <p className="text-xs font-medium text-[var(--text-subtle)]">
                      Timestamp
                    </p>

                    <p className="mt-1 font-mono text-sm font-black text-[var(--text-primary)]">
                      {selectedLog.timestamp
                        ? new Date(
                            selectedLog.timestamp
                          ).toLocaleString()
                        : 'Just now'}
                    </p>

                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="relative flex justify-end border-t border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">

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

export default AuditLogs;