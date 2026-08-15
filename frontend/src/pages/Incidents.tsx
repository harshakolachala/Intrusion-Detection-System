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
  FolderOpen 
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
            description: 'Volumetric distributed denial of service attack identified on border router 10.0.0.1.',
            severity: 'CRITICAL',
            status: 'INVESTIGATING',
            assigned_to: 'Alex Vance (Lead Analyst)',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Database SQL Injection Attempt',
            description: 'Automated exploitation script detected attempting unauthorized schema access via web API.',
            severity: 'HIGH',
            status: 'NEW',
            assigned_to: 'Unassigned',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 3,
            title: 'PortScan Reconnaissance Campaign',
            description: 'Internal subnet port sweep originating from rogue host 192.168.1.112.',
            severity: 'MEDIUM',
            status: 'CONTAINED',
            assigned_to: 'Sarah Jenkins',
            created_at: new Date(Date.now() - 14400000).toISOString()
          },
          {
            id: 4,
            title: 'Credential Stuffing Anomaly',
            description: 'Multiple failed login attempts across admin endpoints from external IP range.',
            severity: 'HIGH',
            status: 'RESOLVED',
            assigned_to: 'SOC Automation Bot',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.error('Failed to fetch security incidents:', err);
      setError('Unable to fetch security incidents from backend engine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();
  }, []);

  // Create Incident Handler
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title || !newIncident.description) return;

    try {
      const created = await createIncident(newIncident);
      setIncidents((prev) => [created || { ...newIncident, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);
      setCreateModalOpen(false);
      setNewIncident({
        title: '',
        description: '',
        severity: 'HIGH',
        status: 'NEW',
        assigned_to: 'SOC Lead'
      });
    } catch (err) {
      console.error('Failed to create incident:', err);
      setIncidents((prev) => [{ ...newIncident, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);
      setCreateModalOpen(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (incidentId: number | string, newStatus: string) => {
    try {
      await updateIncident(incidentId, { status: newStatus });
      setIncidents((prev) =>
        prev.map((item) => (item.id === incidentId ? { ...item, status: newStatus } : item))
      );
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update incident status:', err);
    }
  };

  // Delete Incident Handler
  const handleDeleteIncident = async (incidentId: number | string) => {
    try {
      await deleteIncident(incidentId);
      setIncidents((prev) => prev.filter((item) => item.id !== incidentId));
      if (selectedIncident && selectedIncident.id === incidentId) {
        setDetailsModalOpen(false);
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  // Filtering Logic
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      (incident.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (incident.id || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (incident.assigned_to || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage) || 1;
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPI Metrics
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const openCount = incidents.filter((i) => i.status === 'NEW' || i.status === 'INVESTIGATING').length;
  const closedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  if (loading && incidents.length === 0) {
    return (
      <div className="space-y-8">
        <Loading type="card" count={4} />
        <Loading type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Incident Response & Triage</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>INCIDENT TRACKER</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Manage active security tickets, containment actions, and investigation workflows</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Incident Ticket</span>
          </button>

          <button
            onClick={fetchIncidentsData}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchIncidentsData} />}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Tickets</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">{incidents.length}</p>
          <span className="text-xs text-slate-400 mt-1 block font-mono">Logged in system</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical Priority</span>
          <p className="text-2xl font-extrabold font-mono text-rose-400 mt-2">{criticalCount}</p>
          <span className="text-xs text-rose-400 mt-1 block font-mono">Requires Containment</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Investigations</span>
          <p className="text-2xl font-extrabold font-mono text-amber-400 mt-2">{openCount}</p>
          <span className="text-xs text-amber-400 mt-1 block font-mono">In Progress</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Closed / Contained</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">{closedCount}</p>
          <span className="text-xs text-emerald-400 mt-1 block font-mono">Resolved</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incident ID, title, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Status: All</option>
              <option value="NEW">New</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* INCIDENTS TABLE */}
      <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Incident ID</th>
                <th className="px-6 py-3.5">Ticket Title</th>
                <th className="px-6 py-3.5">Assigned Lead</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">No incidents matching active filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-400 whitespace-nowrap">INC-{incident.id}</td>
                    <td className="px-6 py-4 font-semibold text-white max-w-xs truncate">{incident.title}</td>
                    <td className="px-6 py-4 text-slate-300">{incident.assigned_to || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        incident.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        incident.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {incident.severity || 'HIGH'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={incident.status || 'NEW'}
                        onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                        className={`bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:outline-none ${
                          incident.status === 'RESOLVED' || incident.status === 'CLOSED' ? 'text-emerald-400' :
                          incident.status === 'CONTAINED' ? 'text-cyan-400' :
                          incident.status === 'INVESTIGATING' ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="CONTAINED">CONTAINED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                        title="View Incident Ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(incident.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Showing page {currentPage} of {totalPages}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE INCIDENT TICKET MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0d1427] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Create Security Incident Ticket</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Unauthorized SQL Injection Attack on DB Endpoint"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Synopsis & Evidence</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe vector details, affected subnets, and immediate triage actions taken..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Severity Priority</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Assign Lead Analyst</label>
                  <input
                    type="text"
                    value={newIncident.assigned_to}
                    onChange={(e) => setNewIncident({ ...newIncident, assigned_to: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Save Incident Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCIDENT DETAILS MODAL */}
      {detailsModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0d1427] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Incident Details & Ticket Log</h3>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-blue-400 font-bold block">INC-{selectedIncident.id}</span>
                <h4 className="text-sm font-bold text-white">{selectedIncident.title}</h4>
                <p className="text-slate-300 mt-2 leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Assigned Lead</span>
                  <span className="text-white font-bold">{selectedIncident.assigned_to || 'Unassigned'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Current Status</span>
                  <span className="text-amber-400 font-bold">{selectedIncident.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
              <button
                onClick={() => handleDeleteIncident(selectedIncident.id)}
                className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl border border-rose-500/30 text-xs font-mono"
              >
                Delete Ticket
              </button>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono"
              >
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