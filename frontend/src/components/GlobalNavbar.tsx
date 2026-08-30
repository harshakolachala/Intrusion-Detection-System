import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  Play,
  ShieldAlert,
  ShieldCheck,
  Square,
  Sun,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";
import { getAlerts } from "../services/api";
import {
  getDetectionEngineStatus,
  startDetectionEngine,
  stopDetectionEngine,
} from "../services/engineControl";

interface NotificationItem {
  id: string;
  title: string;
  severity: string;
  timestamp: string;
  description?: string;
}

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineBusy, setEngineBusy] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readAt, setReadAt] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const links = [["/dashboard","Overview"],["/predict","Live Predict"],["/analytics","Analytics"],["/alerts","Alerts"],["/incidents","Incidents"],["/chatbot","AI Assistant"]] as const;
  const readStorageKey = user?.id ? `fedsentry_notifications_read_${user.id}` : "";

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

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotificationsLoading(true);
    try {
      const alerts = await getAlerts(0, 8);
      setNotifications(alerts.map((alert: any) => ({
        id: String(alert.id),
        title: alert.title || alert.attack_type || "Security alert",
        severity: String(alert.severity || "INFO").toUpperCase(),
        timestamp: alert.timestamp || new Date().toISOString(),
        description: alert.description,
      })));
    } catch (error) {
      console.error("Unable to load notifications", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEngineRunning(false);
      setNotifications([]);
      return;
    }
    void refreshEngineStatus();
    void refreshNotifications();
    const engineInterval = window.setInterval(() => void refreshEngineStatus(), 3000);
    const notificationInterval = window.setInterval(() => void refreshNotifications(), 15000);
    return () => {
      window.clearInterval(engineInterval);
      window.clearInterval(notificationInterval);
    };
  }, [isAuthenticated, refreshEngineStatus, refreshNotifications]);

  useEffect(() => {
    if (readStorageKey) setReadAt(localStorage.getItem(readStorageKey));
  }, [readStorageKey]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const unreadCount = notifications.filter((item) => {
    if (!readAt) return true;
    return new Date(item.timestamp).getTime() > new Date(readAt).getTime();
  }).length;

  const markAllRead = () => {
    const now = new Date().toISOString();
    setReadAt(now);
    if (readStorageKey) localStorage.setItem(readStorageKey, now);
  };

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

  const severityClass = (severity: string) => {
    if (severity === "CRITICAL") return "bg-rose-500";
    if (severity === "HIGH") return "bg-orange-500";
    if (severity === "MEDIUM") return "bg-amber-500";
    return "bg-sky-500";
  };

  return (
    <header className="sticky top-0 z-[100] border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mx-auto flex h-[64px] w-full max-w-[1640px] items-center gap-5 px-5 lg:px-7">
        <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="FedSentry home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white"><ShieldCheck className="h-4 w-4"/></span>
          <span className="text-[17px] font-semibold tracking-[-.03em]" style={{ color: 'var(--text-primary)' }}>FedSentry</span>
        </button>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(([to,label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `top-nav-link rounded-lg px-3 py-2 text-[12px] font-medium ${isActive ? 'top-nav-active' : ''}`}>{label}</NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <div className="hidden items-center gap-2 lg:flex">
              <span className={`h-2 w-2 rounded-full ${engineRunning ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="hidden text-[10px] font-medium xl:inline" style={{ color: 'var(--text-muted)' }}>{engineRunning ? "Analyzing packets" : "Engine stopped"}</span>
              <button type="button" onClick={handleEngineToggle} disabled={engineBusy} title={engineError ?? (engineRunning ? "Stop packet analysis" : "Start packet analysis")} className={`flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${engineRunning ? "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
                {engineBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : engineRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="hidden xl:inline">{engineBusy ? "Working" : engineRunning ? "Stop engine" : "Start engine"}</span>
              </button>
            </div>
          )}

          <button onClick={toggleThemeMode} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--text-muted)' }} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkMode ? <Sun className="h-3.5 w-3.5"/> : <Moon className="h-3.5 w-3.5"/>}
          </button>

          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  if (!notificationsOpen) void refreshNotifications();
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
                title="Security notifications"
                aria-label={`${unreadCount} unread security notifications`}
              >
                <Bell className="h-3.5 w-3.5"/>
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[8px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-[120] w-[340px] overflow-hidden rounded-2xl border shadow-xl" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                    <div><div className="text-sm font-semibold">Security notifications</div><div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-subtle)' }}>{unreadCount} unread alert{unreadCount === 1 ? "" : "s"}</div></div>
                    <button type="button" onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-semibold text-[var(--brand)]"><CheckCheck className="h-3.5 w-3.5"/>Mark read</button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {notificationsLoading && notifications.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin"/>Loading alerts…</div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center"><ShieldCheck className="mx-auto h-6 w-6 text-emerald-500"/><div className="mt-2 text-sm font-semibold">No security alerts</div><div className="mt-1 text-xs text-[var(--text-subtle)]">Your notification center is clear.</div></div>
                    ) : notifications.map((item) => (
                      <button key={item.id} type="button" onClick={() => { markAllRead(); setNotificationsOpen(false); navigate('/alerts'); }} className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--surface-soft)]">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${severityClass(item.severity)}`} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold">{item.title}</span><span className="shrink-0 text-[9px] text-[var(--text-subtle)]">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                          <span className="mt-1 block truncate text-[10px] text-[var(--text-muted)]">{item.description || `${item.severity} severity security event`}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <button type="button" onClick={() => { markAllRead(); setNotificationsOpen(false); navigate('/alerts'); }} className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-xs font-semibold text-[var(--brand)]" style={{ borderColor: 'var(--border)' }}><ShieldAlert className="h-3.5 w-3.5"/>View all alerts</button>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <button type="button" onClick={() => navigate('/profile')} className="hidden items-center gap-2 rounded-xl px-1.5 py-1 text-left transition hover:bg-[var(--surface-soft)] sm:flex" title="Open profile">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{(user?.username||'O').slice(0,1).toUpperCase()}</span>
                <span className="hidden leading-tight xl:block"><span className="block max-w-[120px] truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{user?.username||'Operator'}</span><span className="block text-[9px]" style={{ color: 'var(--text-subtle)' }}>View profile</span></span>
              </button>
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
