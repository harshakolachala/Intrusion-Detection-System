import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Primary Sidebar Navigation */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Sticky Header */}
        <Navbar />

        {/* Dynamic Page View Viewport */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        {/* SOC Console Footer */}
        <footer className="border-t border-slate-800/80 py-4 px-8 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#0a0f1d]/50">
          <span>SentinelAI Threat Detection Engine &bull; SOC Console</span>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400">&bull; Node Sync Active</span>
            <span>FastAPI Port 8000</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;