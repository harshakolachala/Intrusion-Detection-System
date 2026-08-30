import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Circle, ShieldCheck } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden text-white antialiased">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className={`relative flex min-h-[calc(100vh-4rem)] flex-col ${sidebarCollapsed ? 'ml-[76px]' : 'ml-[250px]'}`}
        style={{ transition: `margin-left 320ms ${EASE}` }}
      >
        <main className="relative flex-1 px-4 pb-8 pt-5 sm:px-5 lg:px-7">
          <div className="mx-auto w-full max-w-[1640px]">{children}</div>
        </main>
        <footer className="mx-5 mb-5 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 backdrop-blur-xl sm:mx-7">
          <div className="mx-auto flex w-full max-w-[1640px] items-center justify-between gap-3 text-[10px] text-white/55">
            <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#f36f45]"/><span>FedSentry Security Console</span></div>
            <div className="flex items-center gap-1.5 text-[#8ce181]"><Circle className="h-2 w-2 fill-current"/><span>Detection engine online</span></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
