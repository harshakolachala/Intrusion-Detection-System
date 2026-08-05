import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Activity, 
  Info, 
  Terminal, 
  Save, 
  RefreshCw,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';
import { useThemeMode } from '../context/ThemeModeContext';
import { getEngineStatus, getHealthStatus } from '../services/api';
import { Loading, ErrorState } from '../components/Loading';

export const Settings: React.FC = () => {
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // System Telemetry States
  const [engineTelemetry, setEngineTelemetry] = useState<any>(null);
  const [healthTelemetry, setHealthTelemetry] = useState<any>(null);

  // Configuration Preferences
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(12);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [enableAlertToasts, setEnableAlertToasts] = useState<boolean>(true);
  const [activeModelProfile, setActiveModelProfile] = useState<string>('Federated_v2.4_Global');

  const fetchSystemData = async () => {
    try {
      setError(null);
      const [engineRes, healthRes] = await Promise.allSettled([
        getEngineStatus(),
        getHealthStatus()
      ]);

      if (engineRes.status === 'fulfilled') setEngineTelemetry(engineRes.value);
      if (healthRes.status === 'fulfilled') setHealthTelemetry(healthRes.value);
    } catch (err) {
      console.error('Failed to fetch settings telemetry:', err);
      setError('Unable to load real-time engine telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Loading type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-100 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Settings & Configurations</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>CONSOLE CONFIG</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Configure telemetry intervals, neural model sensitivity, theme, and system metadata</p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 border border-blue-400/30 self-start md:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration updated successfully.</span>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchSystemData} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PREFERENCES FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme & Display Preferences */}
          <div className="p-6 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Appearance & Theme Mode</h2>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-white block">Console Theme</span>
                <span className="text-xs text-slate-400">Toggle between SOC Dark/Blue mode and High Contrast mode</span>
              </div>
              <button
                type="button"
                onClick={toggleThemeMode}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono text-slate-200 flex items-center space-x-2 border border-slate-700"
              >
                {isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>{isDarkMode ? 'Dark SOC' : 'Light Mode'}</span>
              </button>
            </div>
          </div>

          {/* Engine & Detection Tuning */}
          <div className="p-6 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Inference Engine Parameters</h2>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Telemetry Sync Interval (Seconds)</label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5 Seconds (High Density)</option>
                  <option value={12}>12 Seconds (Standard SOC)</option>
                  <option value={30}>30 Seconds (Low Overhead)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Confidence Anomaly Threshold: <strong className="text-cyan-400">{(confidenceThreshold * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-900 rounded-lg cursor-pointer h-2"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Inferences with confidence below this threshold will be flagged for review.</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Active Neural Model Version</label>
                <select
                  value={activeModelProfile}
                  onChange={(e) => setActiveModelProfile(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Federated_v2.4_Global">Federated Global Model (v2.4 PyTorch)</option>
                  <option value="Baseline_Local_Model">Local Baseline Model (v1.0)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM METADATA & TELEMETRY */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Platform Information</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Platform</span>
                <span className="text-white font-bold">SentinelAI Enterprise</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Console UI Version</span>
                <span className="text-blue-400 font-bold">v2.4.0 (React + TS)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">FastAPI Backend</span>
                <span className="text-emerald-400 font-bold">Python 3.11</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Deep Learning Engine</span>
                <span className="text-cyan-400 font-bold">PyTorch + Flower FL</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Database Engine</span>
                <span className="text-slate-200 font-bold">SQLite / SQLAlchemy</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#0d1427] to-blue-950/40 border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Privacy & Security Guarantee</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Federated Learning Protocol</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              SentinelAI utilizes privacy-preserving federated model aggregation. Raw network packets and sensitive flow payloads never leave your local infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;