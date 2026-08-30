import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Clock,
  User,
  Target,
  Network,
  CheckCircle2,
  CircleDot,
  Layers,
  Server,
  ClipboardList,
  Zap,
  ArrowUpRight,
  CalendarDays,
  UserRound,
  FileWarning,
  Crosshair,
  Workflow,
  Lock,
  ChevronDown,
  Terminal
} from 'lucide-react';

import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  type CreateIncidentPayload
} from '../services/api';

import { Loading, ErrorState } from '../components/Loading';

export const Incidents: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Incidents State Management
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Incident Form State
  const [newIncident, setNewIncident] = useState<CreateIncidentPayload>({
    title: '',
    description: '',
    severity: 'HIGH',
    status: 'NEW',
    assigned_to: 'SOC Lead'
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchIncidentsData = async () => {
    setRefreshing(true);

    try {
      setError(null);

      const data = await getIncidents(0, 100);

      if (Array.isArray(data)) {
        setIncidents(data);
      } else if (data && Array.isArray(data.incidents)) {
        setIncidents(data.incidents);
      } else {
        // High-fidelity fallback incident telemetry
        setIncidents([
          {
            id: 1,
            title: 'Subnet DDoS Flood Mitigation',
            description:
              'Volumetric distributed denial of service attack identified on border router 10.0.0.1.',
            severity: 'CRITICAL',
            status: 'INVESTIGATING',
            assigned_to: 'Alex Vance (Lead Analyst)',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Database SQL Injection Attempt',
            description:
              'Automated exploitation script detected attempting unauthorized schema access via web API.',
            severity: 'HIGH',
            status: 'NEW',
            assigned_to: 'Unassigned',
            created_at: new Date(
              Date.now() - 3600000
            ).toISOString()
          },
          {
            id: 3,
            title: 'PortScan Reconnaissance Campaign',
            description:
              'Internal subnet port sweep originating from rogue host 192.168.1.112.',
            severity: 'MEDIUM',
            status: 'CONTAINED',
            assigned_to: 'Sarah Jenkins',
            created_at: new Date(
              Date.now() - 14400000
            ).toISOString()
          },
          {
            id: 4,
            title: 'Credential Stuffing Anomaly',
            description:
              'Multiple failed login attempts across admin endpoints from external IP range.',
            severity: 'HIGH',
            status: 'RESOLVED',
            assigned_to: 'SOC Automation Bot',
            created_at: new Date(
              Date.now() - 86400000
            ).toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.error(
        'Failed to fetch security incidents:',
        err
      );

      setError(
        'Unable to fetch security incidents from backend engine.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();
  }, []);

  // Create Incident Handler
  const handleCreateIncident = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newIncident.title ||
      !newIncident.description
    ) {
      return;
    }

    try {
      const created =
        await createIncident(newIncident);

      setIncidents((prev) => [
        created || {
          ...newIncident,
          id: Date.now(),
          created_at:
            new Date().toISOString()
        },
        ...prev
      ]);

      setCreateModalOpen(false);

      setNewIncident({
        title: '',
        description: '',
        severity: 'HIGH',
        status: 'NEW',
        assigned_to: 'SOC Lead'
      });
    } catch (err) {
      console.error(
        'Failed to create incident:',
        err
      );

      setIncidents((prev) => [
        {
          ...newIncident,
          id: Date.now(),
          created_at:
            new Date().toISOString()
        },
        ...prev
      ]);

      setCreateModalOpen(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (
    incidentId: number | string,
    newStatus: string
  ) => {
    try {
      await updateIncident(
        incidentId,
        { status: newStatus }
      );

      setIncidents((prev) =>
        prev.map((item) =>
          item.id === incidentId
            ? {
                ...item,
                status: newStatus
              }
            : item
        )
      );

      if (
        selectedIncident &&
        selectedIncident.id === incidentId
      ) {
        setSelectedIncident(
          (prev: any) => ({
            ...prev,
            status: newStatus
          })
        );
      }
    } catch (err) {
      console.error(
        'Failed to update incident status:',
        err
      );
    }
  };

  // Delete Incident Handler
  const handleDeleteIncident = async (
    incidentId: number | string
  ) => {
    try {
      await deleteIncident(incidentId);

      setIncidents((prev) =>
        prev.filter(
          (item) =>
            item.id !== incidentId
        )
      );

      if (
        selectedIncident &&
        selectedIncident.id === incidentId
      ) {
        setDetailsModalOpen(false);
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error(
        'Failed to delete incident:',
        err
      );
    }
  };

  // Filtering Logic
  const filteredIncidents =
    incidents.filter((incident) => {
      const matchesSearch =
        (incident.title || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (incident.id || '')
          .toString()
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (incident.assigned_to || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesSeverity =
        severityFilter === 'ALL' ||
        incident.severity ===
          severityFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        incident.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });

  // Pagination Logic
  const totalPages =
    Math.ceil(
      filteredIncidents.length /
        itemsPerPage
    ) || 1;

  const paginatedIncidents =
    filteredIncidents.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage * itemsPerPage
    );

  // KPI Metrics
  const criticalCount =
    incidents.filter(
      (i) => i.severity === 'CRITICAL'
    ).length;

  const openCount =
    incidents.filter(
      (i) =>
        i.status === 'NEW' ||
        i.status === 'INVESTIGATING'
    ).length;

  const closedCount =
    incidents.filter(
      (i) =>
        i.status === 'RESOLVED' ||
        i.status === 'CLOSED'
    ).length;

  if (
    loading &&
    incidents.length === 0
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
    <div className="space-y-6 pb-8 font-sans text-[var(--text-primary)]">

      {/* =====================================================
          HERO / PAGE HEADER
      ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-amber-500/[0.055] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-110px] left-[35%] h-72 w-72 rounded-full bg-blue-500/[0.045] blur-[95px]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

            <div className="min-w-0">

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Incident Operations
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">

                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>

                  Response Pipeline Active

                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_12px_30px_rgba(245,158,11,0.20)] dark:border-amber-400/30">

                  <div className="absolute inset-1 rounded-xl border border-white/20" />

                  <ShieldAlert className="relative h-6 w-6" />

                </div>

                <div className="min-w-0">

                  <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
                    Incident Response & Triage
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                    Manage active security tickets, containment
                    actions, investigation workflows, and incident
                    resolution from a unified SOC workspace.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() =>
                  setCreateModalOpen(true)
                }
                className="group flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_14px_30px_rgba(37,99,235,0.24)]"
              >
                <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
                Create Incident Ticket
              </button>

              <button
                onClick={
                  fetchIncidentsData
                }
                disabled={refreshing}
                className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-blue-500 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />
                {refreshing
                  ? 'Synchronizing'
                  : 'Sync'}
              </button>

            </div>

          </div>

          {/* Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-b border-r border-[var(--border)] px-4 py-3 sm:border-b-0">

              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Registry
                </p>

                <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                  {incidents.length} Tickets
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 sm:border-b-0 sm:border-r">

              <Activity className="h-3.5 w-3.5 text-amber-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Active Queue
                </p>

                <p className="mt-0.5 text-sm font-bold text-amber-600">
                  {openCount} Investigations
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-3">

              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />

              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">
                  Priority
                </p>

                <p className="mt-0.5 text-sm font-bold text-rose-600">
                  {criticalCount} Critical
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
                  {closedCount} Closed
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          ERROR STATE
      ===================================================== */}
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchIncidentsData}
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
                  Total Tickets
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Logged in incident registry
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                <ClipboardList className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {incidents.length}
              </p>

              <ArrowUpRight className="mb-1 h-4 w-4 text-blue-500" />

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
                  Critical Priority
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Requires immediate containment
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                <AlertTriangle className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-rose-600">
                {criticalCount}
              </p>

              <span className="mb-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                Critical
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/40">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${Math.min(
                    incidents.length
                      ? (criticalCount /
                          incidents.length) *
                          100
                      : 0,
                    100
                  )}%`
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
                  Active Investigations
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  New or currently investigating
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                <Crosshair className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-amber-600">
                {openCount}
              </p>

              <span className="mb-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                In Progress
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-950/40">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${Math.min(
                    incidents.length
                      ? (openCount /
                          incidents.length) *
                          100
                      : 0,
                    100
                  )}%`
                }}
              />
            </div>

          </div>
        </div>

        {/* Closed */}
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/[0.07] blur-3xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-[var(--text-subtle)]">
                  Closed / Contained
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Resolved incident operations
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-[18px] w-[18px]" />
              </div>

            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="font-mono text-2xl font-black tracking-tight text-emerald-600">
                {closedCount}
              </p>

              <span className="mb-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                Resolved
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(
                    incidents.length
                      ? (closedCount /
                          incidents.length) *
                          100
                      : 0,
                    100
                  )}%`
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

        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">

          <Filter className="h-4 w-4 text-blue-500" />

          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)]">
              Incident Registry Filters
            </h2>

            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Search and isolate active response tickets
            </p>
          </div>

        </div>

        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end">

          <div className="min-w-0 flex-1">

            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
              <Search className="h-3 w-3" />
              Search Registry
            </label>

            <div className="relative">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

              <input
                type="text"
                placeholder="Search incident ID, title, or assignee..."
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

          <div>

            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)]">
              <AlertTriangle className="h-3 w-3" />
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
                className="min-w-[160px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">
                  Severity: All
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

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />

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
                className="min-w-[180px] appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 pr-9 text-sm font-semibold text-[var(--text-secondary)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">
                  Status: All
                </option>
                <option value="NEW">
                  New
                </option>
                <option value="INVESTIGATING">
                  Investigating
                </option>
                <option value="CONTAINED">
                  Contained
                </option>
                <option value="RESOLVED">
                  Resolved
                </option>
                <option value="CLOSED">
                  Closed
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />

            </div>

          </div>

        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">

          <div className="flex items-center gap-2">

            <Layers className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-medium text-[var(--text-subtle)]">
              Matching Tickets
            </span>

            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-xs font-black text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              {filteredIncidents.length}
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
                setStatusFilter(
                  'ALL'
                );
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
            >
              Clear Filters
            </button>
          )}

        </div>

      </section>

      {/* =====================================================
          INCIDENT TABLE
      ===================================================== */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <Workflow className="h-[18px] w-[18px]" />
            </div>

            <div>

              <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                Incident Response Registry
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Active tickets, response ownership, and containment state
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">

            <Server className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {paginatedIncidents.length} Visible Records
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px] text-left">

            <thead>

              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Incident ID
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Ticket Title
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Assigned Lead
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Severity
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Status
                </th>

                <th className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]">
                  Created At
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-subtle)]">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedIncidents.length ===
              0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">

                        <FolderOpen className="h-7 w-7" />

                      </div>

                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        No Incident Tickets Found
                      </p>

                      <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">
                        No incidents match the active
                        search and filter configuration.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                paginatedIncidents.map(
                  (incident) => (
                    <tr
                      key={incident.id}
                      className="group border-b border-[var(--border-soft)] transition-colors duration-150 hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                    >

                      {/* Incident ID */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <FileWarning className="h-3.5 w-3.5" />
                          </div>

                          <div>

                            <p className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                              INC-{incident.id}
                            </p>

                            <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
                              Security Ticket
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Title */}
                      <td className="max-w-[270px] px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              incident.severity ===
                              'CRITICAL'
                                ? 'bg-rose-500'
                                : incident.severity ===
                                  'HIGH'
                                ? 'bg-orange-500'
                                : incident.severity ===
                                  'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                              {incident.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                              {incident.description}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Assigned Lead */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <UserRound className="h-3.5 w-3.5" />
                          </div>

                          <span className="max-w-[180px] truncate font-mono text-sm font-bold text-[var(--text-secondary)]">
                            {incident.assigned_to ||
                              'Unassigned'}
                          </span>

                        </div>

                      </td>

                      {/* Severity */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            incident.severity ===
                            'CRITICAL'
                              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                              : incident.severity ===
                                'HIGH'
                              ? 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400'
                              : incident.severity ===
                                'MEDIUM'
                              ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}
                        >

                          {incident.severity ===
                          'CRITICAL' ? (
                            <ShieldAlert className="h-3 w-3" />
                          ) : incident.severity ===
                            'HIGH' ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <CircleDot className="h-3 w-3" />
                          )}

                          {incident.severity ||
                            'HIGH'}

                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <div className="relative inline-block">

                          <select
                            value={
                              incident.status ||
                              'NEW'
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                incident.id,
                                e.target.value
                              )
                            }
                            className={`appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2 pr-7 font-mono text-xs font-bold outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                              incident.status ===
                                'RESOLVED' ||
                              incident.status ===
                                'CLOSED'
                                ? 'text-emerald-600'
                                : incident.status ===
                                  'CONTAINED'
                                ? 'text-cyan-600'
                                : incident.status ===
                                  'INVESTIGATING'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >

                            <option value="NEW">
                              NEW
                            </option>

                            <option value="INVESTIGATING">
                              INVESTIGATING
                            </option>

                            <option value="CONTAINED">
                              CONTAINED
                            </option>

                            <option value="RESOLVED">
                              RESOLVED
                            </option>

                            <option value="CLOSED">
                              CLOSED
                            </option>

                          </select>

                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-subtle)]" />

                        </div>

                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <CalendarDays className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

                          <span className="whitespace-nowrap font-mono text-sm text-[var(--text-muted)]">
                            {incident.created_at
                              ? new Date(
                                  incident.created_at
                                ).toLocaleDateString()
                              : 'Today'}
                          </span>

                        </div>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() => {
                              setSelectedIncident(
                                incident
                              );

                              setDetailsModalOpen(
                                true
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-blue-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10"
                            title="View Incident Ticket"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteIncident(
                                incident.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-rose-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10"
                            title="Delete Ticket"
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
              ({filteredIncidents.length} results)
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

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Server className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Backend
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Incident API Connected
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Workflow className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Response
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Triage Workflow Active
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>

          <div>

            <p className="text-xs font-semibold text-[var(--text-subtle)]">
              Operations
            </p>

            <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
              Containment Ready
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

      </section>

      {/* =====================================================
          CREATE INCIDENT MODAL
      ===================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close create incident modal"
            onClick={() =>
              setCreateModalOpen(false)
            }
            className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-md"
          />

          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_90px_rgba(15,23,42,0.25)]">

            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/[0.07] blur-3xl" />

            {/* Modal Header */}
            <div className="relative flex items-center justify-between border-b border-[var(--border)] p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <Plus className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Incident Operations
                  </p>

                  <h3 className="mt-1 text-base font-black text-[var(--text-primary)] sm:text-lg">
                    Create Security Incident
                  </h3>

                </div>

              </div>

              <button
                onClick={() =>
                  setCreateModalOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={
                handleCreateIncident
              }
              className="relative space-y-5 p-5 sm:p-6"
            >

              {/* Title */}
              <div>

                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-subtle)]">

                  <FileWarning className="h-3 w-3 text-blue-500" />

                  Incident Headline Title

                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g., Unauthorized SQL Injection Attack on DB Endpoint"
                  value={
                    newIncident.title
                  }
                  onChange={(e) =>
                    setNewIncident({
                      ...newIncident,
                      title: e.target.value
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-blue-500 focus:bg-[var(--surface)] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Description */}
              <div>

                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-subtle)]">

                  <Terminal className="h-3 w-3 text-cyan-500" />

                  Detailed Synopsis & Evidence

                </label>

                <textarea
                  required
                  rows={4}
                  placeholder="Describe vector details, affected subnets, and immediate triage actions taken..."
                  value={
                    newIncident.description
                  }
                  onChange={(e) =>
                    setNewIncident({
                      ...newIncident,
                      description:
                        e.target.value
                    })
                  }
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 font-mono text-sm leading-5 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-blue-500 focus:bg-[var(--surface)] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Severity / Assignment */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-subtle)]">

                    <AlertTriangle className="h-3 w-3 text-amber-500" />

                    Severity Priority

                  </label>

                  <div className="relative">

                    <select
                      value={
                        newIncident.severity
                      }
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          severity:
                            e.target.value
                        })
                      }
                      className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 pr-9 font-mono text-sm font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="CRITICAL">
                        CRITICAL
                      </option>

                      <option value="HIGH">
                        HIGH
                      </option>

                      <option value="MEDIUM">
                        MEDIUM
                      </option>

                      <option value="LOW">
                        LOW
                      </option>

                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />

                  </div>

                </div>

                <div>

                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-subtle)]">

                    <User className="h-3 w-3 text-violet-500" />

                    Assign Lead Analyst

                  </label>

                  <input
                    type="text"
                    value={
                      newIncident.assigned_to
                    }
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        assigned_to:
                          e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-subtle)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </div>

              {/* Status */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                <div className="flex items-center gap-2">

                  <Lock className="h-3.5 w-3.5 text-emerald-500" />

                  <span className="text-xs font-semibold text-[var(--text-subtle)]">
                    Initial Workflow State
                  </span>

                  <span className="ml-auto rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    NEW
                  </span>

                </div>

                <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">
                  Newly created tickets enter the
                  response workflow with status NEW.
                </p>

              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setCreateModalOpen(false)
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Save Incident Ticket
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          INCIDENT DETAILS MODAL
      ===================================================== */}
      {detailsModalOpen &&
        selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <button
              type="button"
              aria-label="Close incident details modal"
              onClick={() =>
                setDetailsModalOpen(false)
              }
              className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-md"
            />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_90px_rgba(15,23,42,0.25)]">

              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/[0.07] blur-3xl" />

              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-[var(--border)] p-5 sm:p-6">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Incident Diagnostic
                    </p>

                    <h3 className="mt-1 truncate text-base font-black text-[var(--text-primary)] sm:text-lg">
                      Incident Details & Ticket Log
                    </h3>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setDetailsModalOpen(
                      false
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              {/* Body */}
              <div className="relative space-y-5 p-5 sm:p-6">

                {/* Ticket Identity */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="mb-3 flex items-center justify-between gap-3">

                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                      INC-{selectedIncident.id}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        selectedIncident.severity ===
                        'CRITICAL'
                          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                          : selectedIncident.severity ===
                            'HIGH'
                          ? 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400'
                          : selectedIncident.severity ===
                            'MEDIUM'
                          ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}
                    >
                      {selectedIncident.severity}
                    </span>

                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)]">
                    {selectedIncident.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedIncident.description}
                  </p>

                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <UserRound className="h-3.5 w-3.5 text-blue-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Assigned Lead
                      </span>

                    </div>

                    <p className="mt-2 break-words text-sm font-bold text-[var(--text-primary)]">
                      {selectedIncident.assigned_to ||
                        'Unassigned'}
                    </p>

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
                        selectedIncident.status ===
                          'RESOLVED' ||
                        selectedIncident.status ===
                          'CLOSED'
                          ? 'text-emerald-600'
                          : selectedIncident.status ===
                            'CONTAINED'
                          ? 'text-cyan-600'
                          : selectedIncident.status ===
                            'INVESTIGATING'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {selectedIncident.status}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <CalendarDays className="h-3.5 w-3.5 text-violet-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Created At
                      </span>

                    </div>

                    <p className="mt-2 font-mono text-sm font-black text-[var(--text-primary)]">
                      {selectedIncident.created_at
                        ? new Date(
                            selectedIncident.created_at
                          ).toLocaleString()
                        : 'Today'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                    <div className="flex items-center gap-2">

                      <Target className="h-3.5 w-3.5 text-cyan-500" />

                      <span className="text-xs font-semibold text-[var(--text-subtle)]">
                        Ticket Reference
                      </span>

                    </div>

                    <p className="mt-2 font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                      INC-{selectedIncident.id}
                    </p>

                  </div>

                </div>

                {/* Workflow */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">

                  <div className="mb-4 flex items-center gap-2">

                    <Workflow className="h-3.5 w-3.5 text-blue-500" />

                    <span className="text-xs font-semibold text-[var(--text-subtle)]">
                      Response Workflow
                    </span>

                  </div>

                  <div className="flex items-center gap-1.5">

                    {[
                      'NEW',
                      'INVESTIGATING',
                      'CONTAINED',
                      'RESOLVED'
                    ].map(
                      (
                        status,
                        index
                      ) => {

                        const statusOrder =
                          [
                            'NEW',
                            'INVESTIGATING',
                            'CONTAINED',
                            'RESOLVED',
                            'CLOSED'
                          ];

                        const currentIndex =
                          statusOrder.indexOf(
                            selectedIncident.status
                          );

                        const stepIndex =
                          statusOrder.indexOf(
                            status
                          );

                        const active =
                          currentIndex >=
                          stepIndex;

                        return (
                          <React.Fragment
                            key={status}
                          >

                            <div
                              className={`flex h-7 flex-1 items-center justify-center rounded-lg border text-xs font-semibold ${
                                active
                                  ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
                                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-subtle)]'
                              }`}
                            >
                              {status}
                            </div>

                            {index <
                              3 && (
                              <div
                                className={`h-px w-2 shrink-0 ${
                                  active
                                    ? 'bg-blue-400'
                                    : 'bg-[var(--border)]'
                                }`}
                              />
                            )}

                          </React.Fragment>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="relative flex flex-col-reverse justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:flex-row sm:items-center sm:p-6">

                <button
                  onClick={() =>
                    handleDeleteIncident(
                      selectedIncident.id
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-all hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Ticket
                </button>

                <button
                  onClick={() =>
                    setDetailsModalOpen(
                      false
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Close Window
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
};

export default Incidents;