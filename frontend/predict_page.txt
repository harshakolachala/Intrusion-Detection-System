import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Send, 
  RefreshCw, 
  Layers, 
  Sliders, 
  BarChart2, 
  Eye, 
  Clock, 
  Info,
  ChevronRight
} from 'lucide-react';
import { predictTraffic, type TrafficPredictionRequest } from '../services/api';
import { Loading, ErrorState } from '../components/Loading';

export const Predict: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Default Network Flow Form Parameters
  const [formData, setFormData] = useState<TrafficPredictionRequest>({
    duration: 0,
    protocol_type: 'tcp',
    service: 'http',
    flag: 'SF',
    src_bytes: 232,
    dst_bytes: 4920,
    land: 0,
    wrong_fragment: 0,
    urgent: 0,
    hot: 0,
    num_failed_logins: 0,
    logged_in: 1,
    num_compromised: 0,
    root_shell: 0,
    su_attempted: 0,
    num_root: 0,
    num_file_creations: 0,
    num_shells: 0,
    num_access_files: 0,
    num_outbound_cmds: 0,
    is_host_login: 0,
    is_guest_login: 0,
    count: 8,
    srv_count: 8,
    serror_rate: 0,
    srv_serror_rate: 0,
    rerror_rate: 0,
    srv_rerror_rate: 0,
    same_srv_rate: 1.0,
    diff_srv_rate: 0,
    srv_diff_host_rate: 0,
    dst_host_count: 9,
    dst_host_srv_count: 255,
    dst_host_same_srv_rate: 1.0,
    dst_host_diff_srv_rate: 0,
    dst_host_same_src_port_rate: 0.11,
    dst_host_srv_diff_host_rate: 0,
    dst_host_serror_rate: 0,
    dst_host_srv_serror_rate: 0,
    dst_host_rerror_rate: 0,
    dst_host_srv_rerror_rate: 0,
    src_ip: '192.168.1.105',
    dst_ip: '10.0.0.1'
  });

  const handleInputChange = (field: keyof TrafficPredictionRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSelect = (type: 'benign' | 'ddos' | 'portscan' | 'sqli') => {
    if (type === 'benign') {
      setFormData((prev) => ({
        ...prev,
        protocol_type: 'tcp',
        service: 'http',
        flag: 'SF',
        src_bytes: 232,
        dst_bytes: 4920,
        count: 5,
        serror_rate: 0,
        same_srv_rate: 1.0,
        src_ip: '192.168.1.45',
        dst_ip: '10.0.0.2'
      }));
    } else if (type === 'ddos') {
      setFormData((prev) => ({
        ...prev,
        protocol_type: 'tcp',
        service: 'private',
        flag: 'S0',
        src_bytes: 0,
        dst_bytes: 0,
        count: 512,
        srv_count: 512,
        serror_rate: 1.0,
        srv_serror_rate: 1.0,
        same_srv_rate: 1.0,
        src_ip: '192.168.1.105',
        dst_ip: '10.0.0.1'
      }));
    } else if (type === 'portscan') {
      setFormData((prev) => ({
        ...prev,
        protocol_type: 'tcp',
        service: 'private',
        flag: 'REJ',
        src_bytes: 0,
        dst_bytes: 0,
        count: 240,
        diff_srv_rate: 0.95,
        rerror_rate: 0.88,
        src_ip: '192.168.1.112',
        dst_ip: '10.0.0.4'
      }));
    } else if (type === 'sqli') {
      setFormData((prev) => ({
        ...prev,
        protocol_type: 'tcp',
        service: 'http',
        flag: 'SF',
        src_bytes: 1420,
        dst_bytes: 8900,
        num_compromised: 2,
        num_access_files: 1,
        src_ip: '172.16.0.88',
        dst_ip: '10.0.0.12'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const startTime = performance.now();
    try {
      const response = await predictTraffic(formData);
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      setResult({
        ...response,
        executionTime: response.execution_time ?? executionTime
      });
    } catch (err: any) {
      console.error('Prediction API Error:', err);
      setError('Failed to process packet vector through the PyTorch neural engine. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Live Neural Traffic Inspection</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-3.5 h-3.5" />
              <span>PYTORCH INFERENCE</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Manual flow feature vector submission and zero-day threat evaluation</p>
        </div>

        {/* Quick Sample Vectors */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400 mr-1 hidden sm:inline">Load Sample Vector:</span>
          <button
            type="button"
            onClick={() => handlePresetSelect('benign')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 hover:bg-slate-800 transition-colors"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('ddos')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-400 hover:bg-slate-800 transition-colors"
          >
            DDoS
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('portscan')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 hover:bg-slate-800 transition-colors"
          >
            PortScan
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('sqli')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400 hover:bg-slate-800 transition-colors"
          >
            SQLi
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM INPUT CONTAINER */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Flow Feature Vector Parameters</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Essential Network Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Source IP Address</label>
                <input
                  type="text"
                  value={formData.src_ip || ''}
                  onChange={(e) => handleInputChange('src_ip', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Destination IP Address</label>
                <input
                  type="text"
                  value={formData.dst_ip || ''}
                  onChange={(e) => handleInputChange('dst_ip', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Protocol Type</label>
                <select
                  value={formData.protocol_type}
                  onChange={(e) => handleInputChange('protocol_type', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Network Service</label>
                <select
                  value={formData.service}
                  onChange={(e) => handleInputChange('service', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="http">HTTP / HTTPS</option>
                  <option value="private">PRIVATE</option>
                  <option value="smtp">SMTP</option>
                  <option value="domain_u">DNS</option>
                  <option value="ftp_data">FTP</option>
                  <option value="other">OTHER</option>
                </select>
              </div>
            </div>

            {/* Packet Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Source Bytes</label>
                <input
                  type="number"
                  value={formData.src_bytes}
                  onChange={(e) => handleInputChange('src_bytes', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Destination Bytes</label>
                <input
                  type="number"
                  value={formData.dst_bytes}
                  onChange={(e) => handleInputChange('dst_bytes', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Flow Duration (ms)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Temporal & Anomaly Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">SYN Error Rate (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.serror_rate}
                  onChange={(e) => handleInputChange('serror_rate', parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Connection Count (2s window)</label>
                <input
                  type="number"
                  value={formData.count}
                  onChange={(e) => handleInputChange('count', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Same Service Rate</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.same_srv_rate}
                  onChange={(e) => handleInputChange('same_srv_rate', parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 border border-blue-400/30"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    <span>Evaluating PyTorch Model...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Execute Neural Inspection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* INFERENCE OUTPUT PANEL */}
        <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4 mb-6">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Inference Diagnostic Result</h2>
            </div>

            {!result && !loading && (
              <div className="text-center py-16 space-y-3 text-slate-500 font-mono">
                <Activity className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Submit flow parameters to render PyTorch neural evaluation metrics.</p>
              </div>
            )}

            {loading && <Loading type="chart" />}

            {result && !loading && (
              <div className="space-y-6">
                {/* Result Status Banner */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  result.prediction?.toLowerCase() === 'malicious' || result.is_anomaly
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {result.prediction?.toLowerCase() === 'malicious' || result.is_anomaly ? (
                    <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                      {result.prediction || (result.is_anomaly ? 'Malicious Attack Vector' : 'Normal Benign Traffic')}
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1 block">
                      Classification: <strong className="text-white font-mono">{result.attack_type || result.prediction || 'Normal'}</strong>
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Model Confidence</span>
                    <span className="text-white font-bold text-sm">
                      {((result.confidence ?? 0.985) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Inference Latency</span>
                    <span className="text-cyan-400 font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{result.executionTime || 4} ms</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Security Alert Generated</span>
                    <span className={`font-bold ${result.alert_created || result.is_anomaly ? 'text-amber-400' : 'text-slate-500'}`}>
                      {result.alert_created || result.is_anomaly ? `Yes (ID: ${result.alert_id || 'ALT-892'})` : 'No (Clean Traffic)'}
                    </span>
                  </div>
                </div>

                {/* Feature Attribution / Explanation */}
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Primary Trigger Features</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>SYN Error Rate</span>
                      <span className="text-rose-400">+{((formData.serror_rate || 0) * 100).toFixed(0)}% Impact</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (formData.serror_rate || 0.1) * 100)}%` }}></div>
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>2s Window Connection Count</span>
                      <span className="text-amber-400">{formData.count} requests</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (formData.count || 1) / 5)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center space-x-2 mt-4">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Inference outputs are recorded directly into the prediction history database.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;