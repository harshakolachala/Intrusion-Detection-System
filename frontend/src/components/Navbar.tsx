import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Radio,
  ChevronDown,
  Activity,
  CheckCircle2,
  Shield,
  Wifi,
  UserRound,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';

const NAVBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700;1,9..144,900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .navbar-root {
    --accent: #8B2FE0;
    --accent-dim: #F1E4FF;
    --rust: #FF3D6E;
    --rust-dim: #FFE1EA;
    --amber: #FF9D2E;
    --grad: linear-gradient(90deg, var(--accent) 0%, var(--rust) 55%, var(--amber) 100%);
  }
  .navbar-root .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-style: italic; letter-spacing: -0.01em; }
  .navbar-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .navbar-root .grad-bg { background: var(--grad); }
`;

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Dynamic Notification Center Items
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High Volumetric Traffic Flagged',
      time: '2 mins ago',
      type: 'danger',
      message:
        'Source 192.168.1.105 initiated 10,000 requests/sec targeting primary gateway.',
    },
    {
      id: 2,
      title: 'Global FL Model Aggregated',
      time: '12 mins ago',
      type: 'success',
      message:
        'Federated global weight update v2.4 successfully synchronized across active nodes.',
    },
    {
      id: 3,
      title: 'PortScan Probe Sweep',
      time: '45 mins ago',
      type: 'warning',
      message:
        'Port sweep detected across SSH (22) and HTTPS (443) from 192.168.1.112.',
    },
  ]);

  const unreadCount = notifications.length;

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header
      className={`navbar-root sticky top-0 z-30 h-[76px] px-3 sm:px-5 lg:px-7 ${
        isDarkMode ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <style>{NAVBAR_STYLES}</style>

      <div
        className={`relative flex h-full items-center justify-between rounded-b-2xl border px-3 shadow-sm backdrop-blur-2xl transition-all duration-300 sm:px-4 lg:px-5 ${
          isDarkMode
            ? 'border-slate-800/80 bg-slate-950/80 shadow-black/20'
            : 'border-slate-200/80 bg-white/80 shadow-slate-900/[0.04]'
        }`}
      >
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}
        <div className="flex min-w-0 items-center gap-3 lg:gap-5">
          {/* Brand Mark — click to return to the homepage */}
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Go to homepage"
            aria-label="Go to homepage"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl transition-opacity duration-200 hover:opacity-80"
          >
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-bg text-white shadow-[0_10px_24px_rgba(139,47,224,0.22)] sm:flex">
              <Shield className="h-[18px] w-[18px]" />
            </div>

            <span
              className={`hidden font-display text-base font-semibold leading-none md:block ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Sentinel<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </button>

          {/* ===================================================
              LIVE ENGINE STATUS
          =================================================== */}
          <div
            className={`hidden items-center gap-2 rounded-xl border px-3 py-2 lg:flex ${
              isDarkMode
                ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
                : 'border-emerald-200 bg-emerald-50/70'
            }`}
          >
            <Radio
              className={`h-3.5 w-3.5 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            />

            <div className="flex flex-col leading-none">
              <span
                className={`text-xs font-semibold ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                IDS Engine
              </span>

              <span
                className={`mt-1 text-xs ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Compact Connection Status */}
          <div
            className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-2 xl:flex ${
              isDarkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
            title="Network connection active"
          >
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold">
              Secure
            </span>
          </div>

          {/* ===================================================
              THEME MODE TOGGLE
          =================================================== */}
          <button
            onClick={toggleThemeMode}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/80 text-amber-400 hover:border-slate-700 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-50/80 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800'
            }`}
            title={
              isDarkMode
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            }
          >
            <span
              className={`absolute inset-1 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                isDarkMode ? 'bg-amber-400/5' : 'bg-[#8B2FE0]/5'
              }`}
            />

            {isDarkMode ? (
              <Sun className="relative z-10 h-4 w-4" />
            ) : (
              <Moon className="relative z-10 h-4 w-4" />
            )}
          </button>

          {/* ===================================================
              NOTIFICATION CENTER
          =================================================== */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-slate-50/80 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800'
              }`}
              title="Notification Center"
            >
              <Bell className="h-4 w-4" />

              {unreadCount > 0 && (
                <>
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full"
                    style={{ backgroundColor: 'var(--rust)' }}
                  />

                  <span
                    className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full ring-2 ${
                      isDarkMode ? 'ring-slate-950' : 'ring-white'
                    }`}
                    style={{ backgroundColor: 'rgba(255,61,110,0.1)' }}
                  />
                </>
              )}
            </button>

            {/* =================================================
                NOTIFICATIONS DROPDOWN
            ================================================= */}
            {notificationsOpen && (
              <div
                className={`absolute right-0 mt-3 w-[calc(100vw-24px)] max-w-[390px] overflow-hidden rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl sm:w-96 ${
                  isDarkMode
                    ? 'border-slate-800 bg-slate-950/95 shadow-black/40'
                    : 'border-slate-200 bg-white/95 shadow-slate-900/10'
                }`}
              >
                {/* Header */}
                <div
                  className={`flex items-center justify-between border-b px-2 pb-3 ${
                    isDarkMode
                      ? 'border-slate-800'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
                    >
                      <Activity className="h-4 w-4" />
                    </div>

                    <div>
                      <h4
                        className={`font-display text-xs font-semibold ${
                          isDarkMode
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        Security Event Feed
                      </h4>

                      <p
                        className={`mt-0.5 text-xs font-medium ${
                          isDarkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        Live monitoring
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className={`rounded-lg px-2 py-1 text-sm font-semibold transition-colors ${
                        isDarkMode
                          ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400'
                          : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div
                        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
                          isDarkMode
                            ? 'bg-emerald-500/10'
                            : 'bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            isDarkMode
                              ? 'text-emerald-400'
                              : 'text-emerald-500'
                          }`}
                        />
                      </div>

                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        All clear
                      </p>

                      <span
                        className={`mt-1 text-sm ${
                          isDarkMode
                            ? 'text-slate-600'
                            : 'text-slate-400'
                        }`}
                      >
                        No unread security notifications.
                      </span>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`group rounded-xl border p-3 transition-all duration-200 ${
                          isDarkMode
                            ? 'border-slate-800/80 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                            : 'border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={
                              item.type === 'danger'
                                ? { backgroundColor: isDarkMode ? 'rgba(255,61,110,0.1)' : 'var(--rust-dim)', color: 'var(--rust)' }
                                : item.type === 'warning'
                                  ? { backgroundColor: isDarkMode ? 'rgba(255,157,46,0.1)' : '#FFF3E4', color: 'var(--amber)' }
                                  : isDarkMode
                                    ? { backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399' }
                                    : { backgroundColor: '#ecfdf5', color: '#10b981' }
                            }
                          >
                            {item.type === 'danger' ? (
                              <Shield className="h-3.5 w-3.5" />
                            ) : item.type === 'warning' ? (
                              <Activity className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <span
                                className="text-sm font-bold leading-4"
                                style={
                                  item.type === 'danger'
                                    ? { color: 'var(--rust)' }
                                    : item.type === 'warning'
                                      ? { color: 'var(--amber)' }
                                      : { color: isDarkMode ? '#34d399' : '#059669' }
                                }
                              >
                                {item.title}
                              </span>

                              <span
                                className={`shrink-0 font-mono text-xs ${
                                  isDarkMode
                                    ? 'text-slate-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {item.time}
                              </span>
                            </div>

                            <p
                              className={`mt-1.5 text-sm leading-5 ${
                                isDarkMode
                                  ? 'text-slate-500'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ===================================================
              USER ACCOUNT
          =================================================== */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex h-10 items-center gap-2 rounded-xl border pl-1.5 pr-2 transition-all duration-200 sm:gap-2.5 sm:pr-3 ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* Avatar */}
              <div className="grad-bg flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-white shadow-sm sm:h-8 sm:w-8">
                {user?.username
                  ? user.username.charAt(0).toUpperCase()
                  : 'A'}
              </div>

              {/* User Information */}
              <div className="hidden min-w-0 flex-col text-left sm:flex">
                <span
                  className={`max-w-[100px] truncate text-sm font-bold ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  {user?.username || 'Analyst'}
                </span>

                <span
                  className="mt-0.5 text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  SOC Lead
                </span>
              </div>

              <ChevronDown
                className={`hidden h-3.5 w-3.5 transition-transform duration-200 sm:block ${
                  userMenuOpen ? 'rotate-180' : ''
                } ${
                  isDarkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              />
            </button>

            {/* =================================================
                USER DROPDOWN
            ================================================= */}
            {userMenuOpen && (
              <div
                className={`absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${
                  isDarkMode
                    ? 'border-slate-800 bg-slate-950/95 shadow-black/40'
                    : 'border-slate-200 bg-white/95 shadow-slate-900/10'
                }`}
              >
                {/* Account Header */}
                <div
                  className={`rounded-xl px-3 py-3 ${
                    isDarkMode
                      ? 'bg-slate-900/70'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grad-bg flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white">
                      {user?.username
                        ? user.username.charAt(0).toUpperCase()
                        : 'A'}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`truncate text-xs font-bold ${
                          isDarkMode
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {user?.username || 'analyst'}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-sm ${
                          isDarkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {user?.email || 'analyst@sentinel.ai'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div
                  className={`mx-1 mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 ${
                    isDarkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  <UserRound className="h-3.5 w-3.5" />

                  <span className="text-sm font-medium">
                    Authenticated Session
                  </span>

                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className={`mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all duration-200 ${
                    isDarkMode
                      ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                      : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
