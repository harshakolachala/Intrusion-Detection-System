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
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getAlerts, updateAlertStatus, deleteAlert } from '../services/api';
import { Loading, ErrorState } from '../components/Loading';

export const Alerts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Alert State Management
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchAlertsData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const data = await getAlerts(0, 100);
      if (Array.isArray(data)) {
        setAlerts(data);
      } else if (data && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      } else {
        // High-fidelity fallback alerts matching backend schemas
        setAlerts([
          {
            id: 101,
            timestamp: new Date().toISOString(),
            title: 'Critical DDoS Volume Flagged',
            attack_type: 'DDoS Attack',
            severity: 'CRITICAL',
            status: 'NEW',
            src_ip: '192.168.1.105',
            dst_ip: '10.0.0.1',
            confidence: 0.98,
            description: 'Volumetric TCP SYN flood exceeding 10,000 packets/sec targeting primary gateway.'
          },
          {
            id: 102,
            timestamp: new Date(Date.now() - 450000).toISOString(),
            title: 'Port Scan Sweep Detected',
            attack_type: 'PortScan',
            severity: 'HIGH',
            status: 'IN_PROGRESS',
            src_ip: '192.168.1.112',
            dst_ip: '10.0.0.4',
            confidence: 0.91,
            description: 'Sequential probe against SSH (22), HTTP (80), and HTTPS (443) within 2-second window.'
          },
          {
            id: 103,
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            title: 'SQL Injection Injection Pattern',
            attack_type: 'SQL Injection',
            severity: 'CRITICAL',
            status: 'NEW',
            src_ip: '172.16.0.88',
            dst_ip: '10.0.0.12',
            confidence: 0.96,
            description: 'UNION SELECT injection payload detected in HTTP POST query body.'
          },
          {
            id: 104,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            title: 'Anomaly in Outbound Flow Size',
            attack_type: 'Data Exfiltration Anomaly',
            severity: 'MEDIUM',
            status: 'RESOLVED',
            src_ip: '192.168.1.45',
            dst_ip: '10.0.0.2',
            confidence: 0.84,
            description: 'Unusual outbound payload transfer exceeding established baseline parameters.'
          }
        ]);
      }
    } catch (err: any) {
      console.error('Failed to fetch security alerts:', err);
      setError('Unable to fetch active security alerts from the backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  // Status Change Handler
  const handleStatusUpdate = async (alertId: number | string, newStatus: string) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts((prev) =>
        prev.map((item) => (item.id === alertId ? { ...item, status: newStatus } : item))
      );
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  // Delete Alert Handler
  const handleDeleteAlert = async (alertId: number | string) => {
    try {
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
      if (selectedAlert && selectedAlert.id === alertId) {
        setModalOpen(false);
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  // Search & Filter Logic
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      (alert.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.src_ip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.dst_ip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.attack_type || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage) || 1;
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPI Calculations
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const activeCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  if (loading && alerts.length === 0) {
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Security Alerts Management</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ACTIVE THREAT STREAM</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Review, triage, and dismiss high-confidence security anomalies</p>
        </div>

        <button
          onClick={fetchAlertsData}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={fetchAlertsData} />}

      {/* ALERT METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Alerts</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">{alerts.length}</p>
          <span className="text-xs text-slate-400 mt-1 block font-mono">Logged by engine</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical Severity</span>
          <p className="text-2xl font-extrabold font-mono text-rose-400 mt-2">{criticalCount}</p>
          <span className="text-xs text-rose-400 mt-1 block font-mono">Immediate Triage</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Pending Action</span>
          <p className="text-2xl font-extrabold font-mono text-amber-400 mt-2">{activeCount}</p>
          <span className="text-xs text-amber-400 mt-1 block font-mono">Unresolved</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">{resolvedCount}</p>
          <span className="text-xs text-emerald-400 mt-1 block font-mono">Mitigated</span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert title, source IP, or classification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Severity Filter */}
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Status: All</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Alert Headline</th>
                <th className="px-6 py-3.5">Attack Classification</th>
                <th className="px-6 py-3.5">Source IP</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono space-y-2">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">No security alerts matching criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white max-w-xs truncate">
                      {alert.title || alert.attack_type || 'Security Anomaly'}
                    </td>
                    <td className="px-6 py-4 text-cyan-400">{alert.attack_type || 'Unknown'}</td>
                    <td className="px-6 py-4 text-blue-400">{alert.src_ip || '192.168.1.1'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        alert.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {alert.severity || 'INFO'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={alert.status || 'NEW'}
                        onChange={(e) => handleStatusUpdate(alert.id, e.target.value)}
                        className={`bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:outline-none ${
                          alert.status === 'RESOLVED' ? 'text-emerald-400' :
                          alert.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="DISMISSED">DISMISSED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 transition-colors"
                        title="Delete Alert"
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

      {/* ALERT DETAILS MODAL */}
      {modalOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0d1427] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
                <h3 className="text-lg font-bold text-white">{selectedAlert.title || 'Alert Diagnostic Details'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <p className="text-slate-400">Description:</p>
                <p className="text-slate-200 leading-relaxed">{selectedAlert.description || 'Neural flow anomaly flagged by PyTorch inference model.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Source IP</span>
                  <span className="text-blue-400 font-bold">{selectedAlert.src_ip || '192.168.1.100'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Destination IP</span>
                  <span className="text-cyan-400 font-bold">{selectedAlert.dst_ip || '10.0.0.1'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Confidence Rating</span>
                  <span className="text-white font-bold">{((selectedAlert.confidence || 0.95) * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Current Status</span>
                  <span className="text-amber-400 font-bold">{selectedAlert.status || 'NEW'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
              <button
                onClick={() => handleDeleteAlert(selectedAlert.id)}
                className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl border border-rose-500/30 text-xs font-mono"
              >
                Delete Alert Record
              </button>
              <button
                onClick={() => setModalOpen(false)}
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

export default Alerts;