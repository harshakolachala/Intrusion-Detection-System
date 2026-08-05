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
  Settings, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggleCollapse 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-[#0a0f1d] border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Branding Header */}
      <div>
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Sentinel<span className="text-blue-500">AI</span>
                </span>
                <span className="text-[9px] tracking-widest text-slate-400 font-mono -mt-1 uppercase">Console v2.4</span>
              </div>
            )}
          </NavLink>

          {onToggleCollapse && (
            <button 
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-md shadow-blue-500/20 border border-blue-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Account & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!collapsed && user && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-xs border border-blue-400/30">
              {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user.username || 'SOC Analyst'}</span>
              <span className="text-[10px] text-slate-400 font-mono truncate">{user.email || 'analyst@sentinel.ai'}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;