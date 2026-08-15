import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useThemeMode } from '../context/ThemeModeContext';
import {
  Activity,
  Circle,
  Server,
  ShieldCheck,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

/* Matches the shrink/expand easing used in Sidebar.tsx so the
   content shell glides in sync with the sidebar width change. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const { isDarkMode } = useThemeMode();

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
        isDarkMode ? 'bg-[#080c14] text-slate-100' : 'bg-[#f7f9fc] text-slate-900'
      }`}
    >
      {/* =====================================================
          GLOBAL BACKGROUND GRID
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${isDarkMode ? 'opacity-100' : 'opacity-70'}`}
          style={{
            backgroundImage: isDarkMode
              ? 'linear-gradient(rgba(71,85,105,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.035) 1px, transparent 1px)'
              : 'linear-gradient(rgba(100,116,139,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.035) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div
          className={`absolute -left-56 -top-56 h-[560px] w-[560px] rounded-full blur-[140px] ${
            isDarkMode ? 'bg-[#8B2FE0]/[0.06]' : 'bg-[#8B2FE0]/[0.035]'
          }`}
        />

        <div
          className={`absolute -bottom-64 right-[-180px] h-[620px] w-[620px] rounded-full blur-[150px] ${
            isDarkMode ? 'bg-[#FF9D2E]/[0.04]' : 'bg-[#FF9D2E]/[0.025]'
          }`}
        />
      </div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* =====================================================
          MAIN APPLICATION SHELL
      ===================================================== */}
      <div
        className={`relative z-10 flex min-h-screen flex-col ${
          sidebarCollapsed ? 'ml-[76px]' : 'ml-[250px]'
        }`}
        style={{ transition: `margin-left 320ms ${EASE}` }}
      >
        {/* ===================================================
            TOP NAVBAR
        =================================================== */}
        <Navbar />

        {/* ===================================================
            PAGE VIEWPORT
        =================================================== */}
        <main className="relative flex-1 px-4 pb-10 pt-3 transition-colors duration-300 sm:px-5 sm:pt-4 lg:px-7">
          {/* Decorative top glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[60%] -translate-x-1/2 rounded-full bg-[#8B2FE0]/[0.025] blur-[80px]" />

          <div className="relative mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

        {/* ===================================================
            SOC CONSOLE FOOTER
        =================================================== */}
        <footer
          className={`relative border-t px-5 py-4 transition-colors duration-300 sm:px-7 ${
            isDarkMode
              ? 'border-slate-800/70 bg-slate-950/40'
              : 'border-slate-200/80 bg-white/55'
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 sm:flex-row">
            {/* Left */}
            <div
              className={`flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.13em] sm:text-[9px] ${
                isDarkMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <ShieldCheck
                className={`h-3.5 w-3.5 ${
                  isDarkMode ? 'text-[#C9A0F5]/80' : 'text-[#8B2FE0]/70'
                }`}
              />

              <span>SentinelAI Threat Detection Engine</span>

              <span className="hidden text-slate-300 sm:inline">•</span>

              <span className="hidden sm:inline">SOC Console</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              {/* Node Sync */}
              <div
                className={`flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] ${
                  isDarkMode ? 'text-emerald-400/80' : 'text-emerald-600'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inset-0 animate-ping rounded-full opacity-30 ${
                      isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                  />
                  <Circle className="relative h-2 w-2 fill-current" />
                </span>

                <span>Node Sync Active</span>
              </div>

              {/* API */}
              <div
                className={`hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] sm:flex ${
                  isDarkMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Server className="h-3 w-3" />
                <span>FastAPI :8000</span>
              </div>

              {/* Engine */}
              <div
                className={`hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] md:flex ${
                  isDarkMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Activity className="h-3 w-3" />
                <span>Inference Online</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
