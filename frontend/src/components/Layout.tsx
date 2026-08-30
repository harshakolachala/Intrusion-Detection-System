import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useThemeMode } from '../context/ThemeModeContext';
import { Activity, Circle, Server, ShieldCheck } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const { isDarkMode } = useThemeMode();

  return (
    <div className={`min-h-[calc(100vh-4rem)] w-full overflow-x-hidden font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-[#080c14] text-slate-100' : 'bg-[#f7f9fc] text-slate-900'}`}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-100' : 'opacity-70'}`} style={{ backgroundImage: isDarkMode ? 'linear-gradient(rgba(71,85,105,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.035) 1px, transparent 1px)' : 'linear-gradient(rgba(100,116,139,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`relative z-10 flex min-h-[calc(100vh-4rem)] flex-col ${sidebarCollapsed ? 'ml-[76px]' : 'ml-[250px]'}`} style={{ transition: `margin-left 320ms ${EASE}` }}>
        <main className="relative flex-1 px-4 pb-10 pt-4 sm:px-5 lg:px-7">
          <div className="relative mx-auto w-full max-w-[1600px]">{children}</div>
        </main>

        <footer className={`relative border-t px-5 py-4 sm:px-7 ${isDarkMode ? 'border-slate-800/70 bg-slate-950/40' : 'border-slate-200/80 bg-white/55'}`}>
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 sm:flex-row">
            <div className={`flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.13em] sm:text-[9px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>FedSentry Threat Detection Engine</span>
              <span className="hidden sm:inline">• SOC Console</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-500">
                <Circle className="h-2 w-2 fill-current" /><span>Node Sync Active</span>
              </div>
              <div className={`hidden items-center gap-1.5 font-mono text-[8px] uppercase sm:flex ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}><Server className="h-3 w-3" /><span>FastAPI :8000</span></div>
              <div className={`hidden items-center gap-1.5 font-mono text-[8px] uppercase md:flex ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}><Activity className="h-3 w-3" /><span>Inference Online</span></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
