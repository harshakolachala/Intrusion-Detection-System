import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Activity, LogIn, LogOut, Moon, ShieldCheck, Sun, UserPlus } from "lucide-react";
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
    <header className={`sticky top-0 z-[100] border-b backdrop-blur-xl ${
      isDarkMode
        ? "border-slate-800 bg-slate-950/90 text-slate-100"
        : "border-slate-200 bg-white/90 text-slate-900"
    }`}>
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="FedSentry home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 text-white shadow-sm">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">FedSentry</span>
        </button>

        {isAuthenticated && (
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {authenticatedLinks.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : isDarkMode
                        ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
            <div className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold sm:flex">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span>{user?.username || "Operator"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleThemeMode}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
            }`}
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${
                  isDarkMode ? "border-slate-700" : "border-slate-300"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-sm font-bold text-white"
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
