import React from 'react';
import { RefreshCw, ShieldAlert, Activity } from 'lucide-react';

interface LoadingProps {
  type?: 'card' | 'table' | 'chart' | 'full';
  count?: number;
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  type = 'card', 
  count = 4,
  fullScreen = false,
  message = 'Syncing SOC Telemetry...'
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b19]/80 backdrop-blur-sm space-y-4 text-slate-400">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm font-mono tracking-wider text-slate-200">{message}</span>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0d1427] border border-slate-800/80 shadow-lg animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-800 rounded"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
            </div>
            <div className="h-8 w-32 bg-slate-800 rounded"></div>
            <div className="h-3 w-20 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 p-5 shadow-xl animate-pulse space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="h-5 w-48 bg-slate-800 rounded"></div>
          <div className="h-4 w-24 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-900/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="rounded-2xl bg-[#0d1427] border border-slate-800/80 p-6 shadow-xl animate-pulse space-y-4">
        <div className="h-5 w-40 bg-slate-800 rounded"></div>
        <div className="h-64 w-full bg-slate-900/60 rounded-xl flex items-center justify-center">
          <Activity className="w-8 h-8 text-slate-800 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-slate-400">
      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-sm font-mono tracking-wider">{message}</span>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Telemetry Synchronization Failed",
  message = "Unable to establish connection with the SentinelAI backend service.",
  onRetry
}) => {
  return (
    <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-8 text-center space-y-4 shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition-all inline-flex items-center space-x-2 border border-rose-400/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};

export default Loading;