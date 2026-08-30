import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronLeft,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Predict', path: '/predict', icon: Activity },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Alerts', path: '/alerts', icon: ShieldAlert },
  { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { name: 'Prediction History', path: '/prediction-history', icon: History },
  { name: 'Audit Logs', path: '/audit', icon: FileText },
  { name: 'AI Assistant', path: '/chatbot', icon: Bot },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`sidebar-root fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r text-white ${collapsed ? 'w-[76px]' : 'w-[232px]'}`}
      style={{ transition: 'width 260ms cubic-bezier(.22,1,.36,1)' }}
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <div className={`mb-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!collapsed && (
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[.14em] text-white/35">Workspace</div>
              <div className="mt-1 text-[13px] font-semibold text-white/88">Security cabinet</div>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[.055] text-white/55 hover:bg-white/[.09] hover:text-white"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        <nav className="space-y-1 overflow-y-auto pr-0.5">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? name : undefined}
              className={({ isActive }) =>
                `flex h-11 items-center rounded-xl text-[12px] font-medium transition ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${
                  isActive
                    ? 'border border-[#f36f45]/20 bg-[#f36f45]/15 text-[#ff9b79]'
                    : 'border border-transparent text-white/58 hover:bg-white/[.06] hover:text-white'
                }`
              }
            >
              <Icon className="h-[16px] w-[16px] shrink-0" />
              {!collapsed && <span className="truncate">{name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <div className={`rounded-2xl border border-white/10 bg-white/[.045] ${collapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d5ccc0] text-[11px] font-bold text-[#4a4741]">
                {(user?.username || 'O').slice(0, 1).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-semibold text-white/88">{user?.username || 'Operator'}</div>
                  <div className="mt-0.5 text-[9px] text-white/38">FedSentry operator</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.055] text-[10px] font-medium text-white/55 hover:bg-white/[.09] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            )}
          </div>

          {!collapsed && (
            <div className="mt-3 flex items-center gap-2 px-2 text-[9px] text-white/35">
              <ShieldCheck className="h-3 w-3 text-[#69c45d]" />
              Detection engine online
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
