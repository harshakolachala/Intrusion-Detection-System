import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Activity, Circle, Server, ShieldCheck, Sparkles } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-transparent text-[var(--text-primary)] antialiased">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="security-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-28 top-10 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[110px]" />
        <div className="absolute -right-24 top-[18%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10rem] left-[34%] h-[34rem] w-[34rem] rounded-full bg-violet-500/10 blur-[130px]" />
      </div>

      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={`relative z-10 flex min-h-[calc(100vh-4rem)] flex-col ${sidebarCollapsed ? 'ml-[76px]' : 'ml-[250px]'}`}
        style={{ transition: `margin-left 320ms ${EASE}` }}
      >
        <main className="relative flex-1 px-4 pb-10 pt-5 sm:px-5 lg:px-7">
          <div className="relative mx-auto w-full max-w-[1640px]">
            <div className="pointer-events-none absolute inset-x-0 -top-2 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
            {children}
          </div>
        </main>

        <footer className="relative border-t border-[var(--border-soft)] bg-[var(--glass-bg)]/70 px-5 py-4 backdrop-blur-2xl sm:px-7">
          <div className="mx-auto flex w-full max-w-[1640px] flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              </span>
              <span className="slanted-accent normal-case tracking-normal">FedSentry Threat Intelligence Fabric</span>
              <span className="hidden sm:inline">• SOC Console</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-500">
                <Circle className="h-2 w-2 fill-current" />
                <span>Node Sync Active</span>
              </div>
              <div className="hidden items-center gap-1.5 text-[9px] uppercase text-[var(--text-subtle)] sm:flex">
                <Server className="h-3 w-3" />
                <span>FastAPI :8000</span>
              </div>
              <div className="hidden items-center gap-1.5 text-[9px] uppercase text-[var(--text-subtle)] md:flex">
                <Activity className="h-3 w-3" />
                <span>Inference Online</span>
              </div>
              <div className="hidden items-center gap-1.5 text-[9px] uppercase text-indigo-500 lg:flex">
                <Sparkles className="h-3 w-3" />
                <span>Glass UI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
