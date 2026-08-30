import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart2,
  ShieldAlert,
  AlertTriangle,
  History,
  FileText,
  Bot,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';

/* ===============================================================
   Shares the SentinelAI brand system used on the Landing, Login,
   Register and Dashboard screens: Fraunces italic display type,
   IBM Plex Mono for technical labels, and the violet → rust →
   amber gradient for brand + active-state accents.
=============================================================== */
const SIDEBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700;1,9..144,900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .sidebar-root {
    --accent: #8B2FE0;
    --accent-light: #C9A0F5;
    --accent-dim: #F1E4FF;
    --rust: #FF3D6E;
    --amber: #FF9D2E;
    --grad: linear-gradient(135deg, var(--accent) 0%, var(--rust) 60%, var(--amber) 100%);
  }
  .sidebar-root .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-style: italic; letter-spacing: -0.01em; }
  .sidebar-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .sidebar-root .grad-bg { background: var(--grad); }
  .sidebar-root .grad-text {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @keyframes sidebarPulseDot { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.25); } }
  .sidebar-pulse { animation: sidebarPulseDot 2.4s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-root * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  }
`;

/* Shared cubic-bezier so the shrink/expand motion matches the
   easing already defined globally (index.css --ease-standard)
   and used for cards + entrances on Landing/Login/Dashboard. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeMode();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Predict', path: '/predict', icon: Activity },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Alerts', path: '/alerts', icon: ShieldAlert },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { name: 'Prediction History', path: '/prediction-history', icon: History },
    { name: 'Audit Logs', path: '/audit', icon: FileText },
    { name: 'AI Assistant', path: '/chatbot', icon: Bot },
  ];

  return (
    <aside
      className={`sidebar-root fade-up group/sidebar fixed left-0 top-0 z-40 flex h-screen flex-col justify-between border-r ${
        collapsed ? 'w-[76px] hover:w-[250px]' : 'w-[250px]'
      } ${
        isDarkMode
          ? 'border-slate-800/80 bg-[#080d17] shadow-[12px_0_50px_rgba(0,0,0,0.18)]'
          : 'border-slate-200/80 bg-white shadow-[12px_0_50px_rgba(15,23,42,0.045)]'
      }`}
      style={{
        overflow: 'visible',
        transition: `width 320ms ${EASE}, background-color 300ms ${EASE}, border-color 300ms ${EASE}, box-shadow 300ms ${EASE}`,
      }}
    >
      <style>{SIDEBAR_STYLES}</style>

      {/* =====================================================
          BACKGROUND AMBIENT LIGHT
      ===================================================== */}
      <div
        className={`pointer-events-none absolute left-0 top-0 h-64 w-full overflow-hidden transition-opacity duration-500 ${
          isDarkMode ? 'opacity-100' : 'opacity-60'
        }`}
      >
        <div
          className={`absolute -left-24 -top-24 h-64 w-64 rounded-full blur-[90px] ${
            isDarkMode ? 'bg-[#8B2FE0]/10' : 'bg-[#8B2FE0]/[0.05]'
          }`}
        />

        <div
          className={`absolute right-[-120px] top-[18%] h-52 w-52 rounded-full blur-[90px] ${
            isDarkMode ? 'bg-[#FF9D2E]/[0.06]' : 'bg-[#FF9D2E]/[0.03]'
          }`}
        />
      </div>

      {/* =====================================================
          BRANDING HEADER
      ===================================================== */}
      <div className="relative z-10">
        <div
          className={`relative flex h-[76px] items-center border-b px-3 transition-colors duration-300 ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-200/80'
          }`}
        >
          <NavLink
            to="/dashboard"
            className="group/brand flex min-w-0 items-center overflow-hidden"
          >
            {/* Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-bg text-white shadow-[0_12px_30px_rgba(139,47,224,0.24)]">
              <div className="absolute inset-1 rounded-lg border border-white/20" />
              <ShieldCheck className="relative h-[19px] w-[19px]" />
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 blur-sm transition-opacity duration-300 group-hover/brand:opacity-100" />
            </div>

            {/* Brand Text */}
            <div
              className={`ml-3 min-w-0 overflow-hidden transition-all duration-300 ${
                collapsed
                  ? 'w-0 translate-x-[-8px] opacity-0 group-hover/sidebar:w-[150px] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100'
                  : 'w-[150px] opacity-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`font-display whitespace-nowrap text-[17px] font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Sentinel<span className="grad-text">AI</span>
                </span>

                <Sparkles
                  className={isDarkMode ? 'h-3 w-3 text-[#FF9D2E]' : 'h-3 w-3 text-[#FF9D2E]'}
                />
              </div>

              <span
                className={`font-mono mt-0.5 block whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.18em] ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Security Console v2.4
              </span>
            </div>
          </NavLink>

          {/* Collapse / Expand Control */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
                collapsed
                  ? 'opacity-0 group-hover/sidebar:opacity-100'
                  : 'opacity-100'
              } ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900 text-slate-500 hover:border-[#8B2FE0]/40 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-[#8B2FE0]/30 hover:bg-white hover:text-slate-700'
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronLeft
                className="h-3.5 w-3.5 transition-transform duration-300"
                style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
          )}
        </div>

        {/* ===================================================
            ENGINE STATUS
        =================================================== */}
        <div
          className={`mx-3 mt-4 overflow-hidden rounded-xl border transition-all duration-300 ${
            collapsed
              ? 'h-10 px-0 group-hover/sidebar:h-[54px] group-hover/sidebar:px-3'
              : 'h-[54px] px-3'
          } ${
            isDarkMode
              ? 'border-emerald-500/10 bg-emerald-500/[0.045]'
              : 'border-emerald-100 bg-emerald-50/60'
          }`}
        >
          <div className="flex h-full items-center gap-2.5">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <span
                className={`sidebar-pulse absolute h-2 w-2 rounded-full ${
                  isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}
              />

              <span
                className={`absolute h-5 w-5 animate-ping rounded-full opacity-20 ${
                  isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}
              />
            </div>

            <div
              className={`min-w-0 overflow-hidden transition-all duration-300 ${
                collapsed
                  ? 'w-0 opacity-0 group-hover/sidebar:w-[120px] group-hover/sidebar:opacity-100'
                  : 'w-[120px] opacity-100'
              }`}
            >
              <p
                className={`font-mono whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.16em] ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                Detection Engine
              </p>

              <p
                className={`mt-1 whitespace-nowrap text-[8px] ${
                  isDarkMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Live · Operational
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}
        <nav
          className={`mt-4 max-h-[calc(100vh-260px)] space-y-1 overflow-y-auto px-3 pb-3 ${
            isDarkMode
              ? '[scrollbar-color:#334155_transparent]'
              : '[scrollbar-color:#cbd5e1_transparent]'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group/nav relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                    collapsed
                      ? 'justify-center px-0 group-hover/sidebar:justify-start group-hover/sidebar:px-3'
                      : 'px-3'
                  } ${
                    isActive
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-[#8B2FE0]/20 via-[#8B2FE0]/10 to-transparent text-[#C9A0F5]'
                        : 'bg-gradient-to-r from-[#F1E4FF] to-transparent text-[#7024B5]'
                      : isDarkMode
                        ? 'text-slate-500 hover:bg-slate-900/80 hover:text-slate-200'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active Indicator */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full grad-bg"
                      />
                    )}

                    {/* Icon Container */}
                    <span
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? isDarkMode
                            ? 'bg-[#8B2FE0]/15 text-[#C9A0F5]'
                            : 'bg-[#8B2FE0]/10 text-[#8B2FE0]'
                          : isDarkMode
                            ? 'text-slate-500 group-hover/nav:text-slate-200'
                            : 'text-slate-400 group-hover/nav:text-slate-700'
                      }`}
                    >
                      <Icon className="h-[17px] w-[17px]" />

                      {/* Active Glow */}
                      {isActive && (
                        <span
                          className={`absolute inset-0 rounded-lg blur-md ${
                            isDarkMode ? 'bg-[#8B2FE0]/15' : 'bg-[#8B2FE0]/10'
                          }`}
                        />
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={`ml-2.5 min-w-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wide transition-all duration-300 ${
                        collapsed
                          ? 'w-0 translate-x-[-5px] opacity-0 group-hover/sidebar:w-[150px] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100'
                          : 'w-[150px] opacity-100'
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Active Arrow */}
                    {isActive && (
                      <ChevronLeft
                        className={`ml-auto h-3.5 w-3.5 rotate-180 transition-all duration-300 ${
                          collapsed
                            ? 'translate-x-3 opacity-0 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100'
                            : 'opacity-70'
                        }`}
                      />
                    )}

                    {/* Collapsed Tooltip */}
                    <span
                      className={`pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[10px] font-bold shadow-lg opacity-0 transition-all duration-200 group-hover/nav:opacity-0 ${
                        collapsed
                          ? 'group-hover/sidebar:pointer-events-auto group-hover/nav:opacity-0'
                          : 'hidden'
                      } ${
                        isDarkMode
                          ? 'border-slate-700 bg-slate-900 text-slate-200'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          BOTTOM ACCOUNT AREA
      ===================================================== */}
      <div
        className={`relative z-10 border-t p-3 ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-200/80'
        }`}
      >
        {/* User Account */}
        {user && (
          <div
            className={`mb-2 overflow-hidden rounded-xl border transition-all duration-300 ${
              collapsed
                ? 'h-11 px-0 group-hover/sidebar:h-[62px] group-hover/sidebar:px-2.5'
                : 'h-[62px] px-2.5'
            } ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/70'
                : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            <div className="flex h-full items-center gap-2.5">
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${
                  isDarkMode
                    ? 'border-[#8B2FE0]/25 bg-[#8B2FE0]/10 text-[#C9A0F5]'
                    : 'border-[#8B2FE0]/15 bg-[#F1E4FF] text-[#8B2FE0]'
                }`}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>

              {/* User Text */}
              <div
                className={`min-w-0 overflow-hidden transition-all duration-300 ${
                  collapsed
                    ? 'w-0 opacity-0 group-hover/sidebar:w-[150px] group-hover/sidebar:opacity-100'
                    : 'w-[150px] opacity-100'
                }`}
              >
                <span
                  className={`block truncate text-[10px] font-bold ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  {user.username || 'SOC Analyst'}
                </span>

                <span
                  className={`font-mono mt-0.5 block truncate text-[8px] ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {user.email || 'analyst@sentinel.ai'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className={`group/logout relative flex h-11 w-full items-center rounded-xl text-left text-[10px] font-bold transition-all duration-200 ${
            collapsed
              ? 'justify-center px-0 group-hover/sidebar:justify-start group-hover/sidebar:px-3'
              : 'px-3'
          } ${
            isDarkMode
              ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
              : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
          title="Sign Out"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200">
            <LogOut className="h-[17px] w-[17px]" />
          </span>

          <span
            className={`ml-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed
                ? 'w-0 opacity-0 group-hover/sidebar:w-[100px] group-hover/sidebar:opacity-100'
                : 'w-[100px] opacity-100'
            }`}
          >
            Sign Out
          </span>
        </button>

        {/* Security Footer */}
        <div
          className={`mt-2 flex items-center overflow-hidden transition-all duration-300 ${
            collapsed
              ? 'h-0 opacity-0 group-hover/sidebar:h-6 group-hover/sidebar:opacity-100'
              : 'h-6 opacity-100'
          }`}
        >
          <div className="flex items-center gap-1.5 px-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
              }`}
            />

            <span
              className={`font-mono whitespace-nowrap text-[7px] uppercase tracking-[0.14em] ${
                isDarkMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Secure Session
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
