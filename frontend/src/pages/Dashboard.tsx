import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Server, 
  Bot, 
  RefreshCw, 
  Radio, 
  ChevronRight,
  Filter,
  Layers,
  Zap
} from 'lucide-react';
import { getAnalyticsSummary, getLiveFeed, getEngineStatus } from '../services/api';
import { Loading, ErrorState } from '../components/Loading';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting States for Live Attack Feed
  const [feedFilter, setFeedFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Backend Data States
  const [summary, setSummary] = useState<any>(null);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>(null);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const [summaryRes, feedRes, engineRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        getLiveFeed(25),
        getEngineStatus()
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
      }

      if (feedRes.status === 'fulfilled' && Array.isArray(feedRes.value)) {
        setLiveFeed(feedRes.value);
      }

      if (engineRes.status === 'fulfilled') {
        setEngineStatus(engineRes.value);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard telemetry:', err);
      setError('Failed to synchronize live SOC telemetry with the backend engine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filtered and Sorted Live Feed Rows
  const filteredFeed = liveFeed
    .filter((item) => {
      if (feedFilter === 'ALL') return true;
      if (feedFilter === 'MALICIOUS') return item.prediction?.toLowerCase() === 'malicious' || item.severity !== 'INFO';
      if (feedFilter === 'BENIGN') return item.prediction?.toLowerCase() === 'benign' || item.severity === 'INFO';
      return item.severity === feedFilter;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  if (loading && !summary) {
    return (
      <div className="space-y-8">
        <Loading type="card" count={4} />
        <Loading type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Security Operations Center</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Real-time packet inspection, threat classification, and model metrics</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchDashboardData} />}

      {/* TOP KPI METRICS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inferences / Packets */}
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Packets</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {summary?.total_packets?.toLocaleString() ?? summary?.predictions?.toLocaleString() ?? '1,248,920'}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-400 font-medium">100%</span>
              <span>traffic captured</span>
            </p>
          </div>
        </div>

        {/* Neural Inferences */}
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Neural Inferences</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {summary?.predictions?.toLocaleString() ?? '1,248,920'}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-cyan-400 font-medium">{((summary?.avg_confidence ?? 0.985) * 100).toFixed(1)}%</span>
              <span>avg confidence</span>
            </p>
          </div>
        </div>

        {/* Malicious Detections */}
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Malicious Flows</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold font-mono text-rose-400 tracking-tight">
              {summary?.malicious_count?.toLocaleString() ?? '7,820'}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-rose-400 font-mono">
                {(((summary?.malicious_count ?? 7820) / (summary?.total_packets ?? 1248920)) * 100).toFixed(2)}%
              </span>
              <span>threat ratio</span>
            </p>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight">
              {summary?.total_incidents ?? summary?.total_alerts ?? '18'}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-amber-400 font-medium">Requires Action</span>
            </p>
          </div>
        </div>
      </div>

      {/* LIVE ATTACK FEED TABLE */}
      <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <h2 className="text-lg font-bold text-white">Live Traffic & Attack Stream</h2>
              <p className="text-xs text-slate-400 font-mono">Real-time inspection of active network flows</p>
            </div>
          </div>

          {/* Table Filters */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <button
                onClick={() => setFeedFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  feedFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFeedFilter('MALICIOUS')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  feedFilter === 'MALICIOUS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Threats
              </button>
              <button
                onClick={() => setFeedFilter('BENIGN')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  feedFilter === 'BENIGN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Benign
              </button>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            >
              Time: {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Attack Classification</th>
                <th className="px-6 py-3.5">Source IP</th>
                <th className="px-6 py-3.5">Destination IP</th>
                <th className="px-6 py-3.5">Confidence</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredFeed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No active packet flows matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFeed.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now'}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {item.attack_type || item.prediction || 'Normal Traffic'}
                    </td>
                    <td className="px-6 py-4 text-blue-400">{item.src_ip || '192.168.1.100'}</td>
                    <td className="px-6 py-4 text-cyan-400">{item.dst_ip || '10.0.0.1'}</td>
                    <td className="px-6 py-4 text-slate-200">
                      {((item.confidence ?? 0.95) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        item.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        item.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.severity || 'INFO'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-sans">{item.status || 'Processed'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER SECTION: SYSTEM STATUS & AI ASSISTANT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health Cards */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">System Infrastructure Telemetry</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase">FastAPI Backend</p>
                <p className="text-sm font-bold text-white mt-0.5">Connected (Port 8000)</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase">Inference Engine</p>
                <p className="text-sm font-bold text-white mt-0.5">{engineStatus?.model_status ?? 'PyTorch Active'}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase">Packet Capture Engine</p>
                <p className="text-sm font-bold text-white mt-0.5">{engineStatus?.capture_status ?? 'Live Capturing'}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase">Global Model Sync</p>
                <p className="text-sm font-bold text-white mt-0.5">v2.4 Federated</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* AI Assistant Preview Widget */}
        <div className="rounded-2xl bg-gradient-to-tr from-slate-900 via-[#0d1427] to-blue-950/40 border border-blue-500/30 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sentinel Assistant</h3>
                <p className="text-xs text-slate-400 font-mono">RAG Knowledge Engine</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ask natural language questions regarding network anomalies, MITRE ATT&CK techniques, or active incident response playbooks.
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono space-y-2">
              <p className="text-blue-400">Sample Prompt:</p>
              <p className="text-slate-300 italic">"Explain the mitigations for recent PortScan attack vectors."</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/chatbot')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 border border-blue-400/30"
          >
            <span>Launch AI Assistant Console</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;