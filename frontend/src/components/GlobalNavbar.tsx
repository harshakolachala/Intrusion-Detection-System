import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  Play,
  ShieldCheck,
  Square,
  Sun,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";
import {
  getDetectionEngineStatus,
  startDetectionEngine,
  stopDetectionEngine,
} from "../services/engineControl";

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineBusy, setEngineBusy] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  const links = [["/dashboard","Overview"],["/predict","Live Predict"],["/analytics","Analytics"],["/alerts","Alerts"],["/incidents","Incidents"],["/chatbot","AI Assistant"]] as const;

  const refreshEngineStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const status = await getDetectionEngineStatus();
      setEngineRunning(Boolean(status.running));
      setEngineError(status.error ?? null);
    } catch (error) {
      console.error("Unable to read detection engine status", error);
      setEngineError("Engine unavailable");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEngineRunning(false);
      return;
    }
    void refreshEngineStatus();
    const interval = window.setInterval(() => void refreshEngineStatus(), 3000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, refreshEngineStatus]);

  const handleEngineToggle = async () => {
    if (engineBusy) return;
    setEngineBusy(true);
    setEngineError(null);
    try {
      if (engineRunning) {
        await stopDetectionEngine();
        setEngineRunning(false);
      } else {
        await startDetectionEngine();
        setEngineRunning(true);
      }
      await refreshEngineStatus();
    } catch (error: any) {
      console.error("Detection engine control failed", error);
      const detail = error?.response?.data?.detail || error?.response?.data?.error || error?.message;
      setEngineError(detail ? String(detail) : "Engine control failed");
      await refreshEngineStatus();
    } finally {
      setEngineBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
      <div className="mx-auto flex h-[64px] w-full max-w-[1640px] items-center gap-5 px-5 lg:px-7">
        <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="FedSentry home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white"><ShieldCheck className="h-4 w-4"/></span>
          <span className="text-[17px] font-semibold tracking-[-.03em]" style={{ color: 'var(--text-primary)' }}>FedSentry</span>
        </button>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(([to,label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `top-nav-link rounded-lg px-3 py-2 text-[12px] font-medium ${isActive ? 'top-nav-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <div className="hidden items-center gap-2 lg:flex">
              <span className={`h-2 w-2 rounded-full ${engineRunning ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="hidden text-[10px] font-medium xl:inline" style={{ color: 'var(--text-muted)' }}>
                {engineRunning ? "Analyzing packets" : "Engine stopped"}
              </span>
              <button
                type="button"
                onClick={handleEngineToggle}
                disabled={engineBusy}
                title={engineError ?? (engineRunning ? "Stop packet analysis" : "Start packet analysis")}
                className={`flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${engineRunning ? "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}
              >
                {engineBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : engineRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="hidden xl:inline">{engineBusy ? "Working" : engineRunning ? "Stop engine" : "Start engine"}</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleThemeMode}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5"/> : <Moon className="h-3.5 w-3.5"/>}
          </button>

          {isAuthenticated && (
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--text-muted)' }} title="Notifications">
              <Bell className="h-3.5 w-3.5"/>
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--brand)]"/>
            </button>
          )}

          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 pl-1 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  {(user?.username||'O').slice(0,1).toUpperCase()}
                </span>
                <div className="hidden leading-tight xl:block">
                  <div className="max-w-[120px] truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{user?.username||'Operator'}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-subtle)' }}>Security operator</div>
                </div>
              </div>
              <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ color: 'var(--text-muted)' }} title="Logout"><LogOut className="h-3.5 w-3.5"/></button>
            </>
          ) : (
            <>
              <button onClick={()=>navigate('/login')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}><LogIn className="h-3.5 w-3.5"/>Login</button>
              <button onClick={()=>navigate('/register')} className="flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white"><UserPlus className="h-3.5 w-3.5"/>Register</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalNavbar;
