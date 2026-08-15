import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Radio, 
  ChevronDown,
  Activity,
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
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
      message: 'Source 192.168.1.105 initiated 10,000 requests/sec targeting primary gateway.'
    },
    {
      id: 2,
      title: 'Global FL Model Aggregated',
      time: '12 mins ago',
      type: 'success',
      message: 'Federated global weight update v2.4 successfully synchronized across active nodes.'
    },
    {
      id: 3,
      title: 'PortScan Probe Sweep',
      time: '45 mins ago',
      type: 'warning',
      message: 'Port sweep detected across SSH (22) and HTTPS (443) from 192.168.1.112.'
    }
  ]);

  const unreadCount = notifications.length;

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Search Input & Live Health Pill */}
      <div className="flex items-center space-x-6">
        <div className="relative hidden sm:block w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP, Attack Vector, Rules..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
          />
        </div>

        {/* Live Engine Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>IDS Engine Active</span>
        </div>
      </div>

      {/* Action Controls & Profile Menu */}
      <div className="flex items-center space-x-4">
        {/* Theme Mode Toggle */}
        <button
          onClick={toggleThemeMode}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0a0f1d]"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0d1427] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">Security Event Feed</h4>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 font-mono text-xs">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <span>No unread security notifications.</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold font-mono ${
                          item.type === 'danger' ? 'text-rose-400' :
                          item.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px] font-sans">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-mono font-bold flex items-center justify-center text-xs shadow-md">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white truncate max-w-[100px]">{user?.username || 'Analyst'}</span>
              <span className="text-[9px] text-blue-400 font-mono uppercase">SOC Lead</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#0d1427] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-800 text-slate-400">
                Logged in as <span className="text-white font-bold">{user?.username || 'analyst'}</span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;