import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LogIn,
  LogOut,
  Moon,
  Orbit,
  ShieldCheck,
  Sun,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleThemeMode } = useThemeMode();

  const authenticatedLinks = [
    ["/dashboard", "Dashboard"],
    ["/predict", "Predict"],
    ["/analytics", "Analytics"],
    ["/alerts", "Alerts"],
    ["/incidents", "Incidents"],
    ["/chatbot", "AI Assistant"],
  ] as const;

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/90 text-[var(--text-primary)] shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1640px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          className="group flex shrink-0 items-center gap-3.5 rounded-2xl px-1 py-1"
          aria-label="FedSentry home"
        >
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_12px_32px_rgba(79,70,229,0.28)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-2deg]">
            <span className="absolute inset-[1px] rounded-[15px] border border-white/20" />
            <ShieldCheck className="relative h-5 w-5" />
          </span>

          <span className="flex flex-col items-start leading-none">
            <span
              className="slanted-accent bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-[1.8rem] font-bold tracking-[-0.06em] text-transparent sm:text-[1.95rem]"
            >
              FedSentry
            </span>
            <span className="mt-1 hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--text-subtle)] sm:flex">
              <Orbit className="h-2.5 w-2.5" />
              Federated Security Intelligence
            </span>
          </span>
        </button>

        {isAuthenticated && (
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)]/55 p-1.5 shadow-[var(--shadow-xs)] backdrop-blur-xl lg:flex">
            {authenticatedLinks.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated && (
            <div className="hidden items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] backdrop-blur-lg sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span className="max-w-[150px] truncate">{user?.username || "Operator"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleThemeMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] shadow-[var(--shadow-xs)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-indigo-500"
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-sm font-bold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-rose-400/40 hover:text-rose-500"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-sm font-bold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-indigo-500"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(79,70,229,0.25)] hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalNavbar;
