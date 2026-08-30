import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Circle, ShieldCheck } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden text-white antialiased">
      <div className="pointer-events-none fixed inset-0 opacity-35" aria-hidden="true">
        <div className="absolute left-[18%] top-[10%] h-72 w-72 rounded-full bg-white/20 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[8%] h-80 w-80 rounded-full bg-[#8b8175]/30 blur-[120px]" />
      </div>

      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={`relative flex min-h-[calc(100vh-4rem)] flex-col ${sidebarCollapsed ? 'ml-[76px]' : 'ml-[232px]'}`}
        style={{ transition: `margin-left 260ms ${EASE}` }}
      >
        <main className="relative flex-1 px-4 pb-8 pt-5 sm:px-5 lg:px-6 xl:px-7">
          <div className="mx-auto w-full max-w-[1540px]">{children}</div>
        </main>

        <footer className="mx-4 mb-4 rounded-2xl border border-white/10 bg-[#3d3b37]/45 px-5 py-3 backdrop-blur-2xl sm:mx-6 xl:mx-7">
          <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-3 text-[10px] text-white/48">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#f36f45]" />
              <span>FedSentry security workspace</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#91d888]">
              <Circle className="h-2 w-2 fill-current" />
              <span>Detection engine online</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
