import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, LogIn, LogOut, Moon, Search, ShieldCheck, Sun, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const links = [["/dashboard","Overview"],["/predict","Live Predict"],["/analytics","Analytics"],["/alerts","Alerts"],["/incidents","Incidents"],["/chatbot","AI Assistant"]] as const;

  return (
    <header className="sticky top-0 z-[100] text-white">
      <div className="mx-auto flex h-[64px] w-full max-w-[1640px] items-center gap-5 px-5 lg:px-7">
        <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="flex shrink-0 items-center gap-2.5" aria-label="FedSentry home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f36f45] text-white"><ShieldCheck className="h-4 w-4"/></span>
          <span className="text-[17px] font-semibold tracking-[-.03em]">FedSentry</span>
        </button>
        {isAuthenticated && <nav className="hidden items-center gap-1 lg:flex">{links.map(([to,label])=><NavLink key={to} to={to} className="px-3 py-2 text-[12px] font-medium">{label}</NavLink>)}</nav>}
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && <div className="hidden h-9 min-w-[230px] items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 text-white/55 xl:flex"><Search className="h-3.5 w-3.5"/><span className="text-[11px]">Search security workspace</span></div>}
          <button onClick={toggleThemeMode} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[.07] text-white/70">{isDarkMode?<Sun className="h-3.5 w-3.5"/>:<Moon className="h-3.5 w-3.5"/>}</button>
          {isAuthenticated && <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[.07] text-white/70"><Bell className="h-3.5 w-3.5"/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f36f45]"/></button>}
          {isAuthenticated ? <><div className="hidden items-center gap-2 pl-1 sm:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d0c4] text-[11px] font-bold text-[#4b4842]">{(user?.username||'O').slice(0,1).toUpperCase()}</span><div className="hidden leading-tight xl:block"><div className="max-w-[120px] truncate text-[11px] font-medium">{user?.username||'Operator'}</div><div className="text-[9px] text-white/45">Security operator</div></div></div><button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 hover:bg-white/[.07] hover:text-white" title="Logout"><LogOut className="h-3.5 w-3.5"/></button></> : <><button onClick={()=>navigate('/login')} className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/75"><LogIn className="h-3.5 w-3.5"/>Login</button><button onClick={()=>navigate('/register')} className="flex items-center gap-1.5 bg-[#f36f45] px-4 py-2 text-xs font-semibold text-white"><UserPlus className="h-3.5 w-3.5"/>Register</button></>}
        </div>
      </div>
    </header>
  );
};
export default GlobalNavbar;
