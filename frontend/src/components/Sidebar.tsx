import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard,Activity,BarChart2,ShieldAlert,AlertTriangle,History,FileText,Bot,LogOut,ShieldCheck,ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps { collapsed?: boolean; onToggleCollapse?: () => void; }
const EASE='cubic-bezier(0.22,1,0.36,1)';

export const Sidebar: React.FC<SidebarProps> = ({collapsed=false,onToggleCollapse}) => {
  const {user,logout}=useAuth(); const navigate=useNavigate();
  const navItems=[
    {name:'Overview',path:'/dashboard',icon:LayoutDashboard},{name:'Live Predict',path:'/predict',icon:Activity},{name:'Analytics',path:'/analytics',icon:BarChart2},{name:'Alerts',path:'/alerts',icon:ShieldAlert},{name:'Incidents',path:'/incidents',icon:AlertTriangle},{name:'Prediction History',path:'/prediction-history',icon:History},{name:'Audit Logs',path:'/audit',icon:FileText},{name:'AI Assistant',path:'/chatbot',icon:Bot},
  ];
  const handleLogout=()=>{logout();navigate('/login')};
  return <aside className={`sidebar-root group/sidebar fixed left-0 top-[64px] z-40 flex h-[calc(100vh-64px)] flex-col border-r ${collapsed?'w-[76px] hover:w-[250px]':'w-[250px]'}`} style={{transition:`width 300ms ${EASE}`}}>
    <div className="px-3 pt-4">
      <div className="mb-4 flex h-12 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.045] px-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f36f45] text-white"><ShieldCheck className="h-3.5 w-3.5"/></span>
        <div className={`${collapsed?'w-0 opacity-0 group-hover/sidebar:w-[140px] group-hover/sidebar:opacity-100':'w-[140px]'} overflow-hidden transition-all`}><div className="whitespace-nowrap text-[11px] font-semibold text-white">Security workspace</div><div className="mt-0.5 whitespace-nowrap text-[9px] text-white/40">Detection engine active</div></div>
        {onToggleCollapse&&<button onClick={onToggleCollapse} className={`${collapsed?'opacity-0 group-hover/sidebar:opacity-100':''} ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.05] text-white/45`}><ChevronLeft className="h-3 w-3" style={{transform:collapsed?'rotate(180deg)':'none'}}/></button>}
      </div>
      <div className={`${collapsed?'opacity-0 group-hover/sidebar:opacity-100':'opacity-100'} mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.12em] text-white/30 transition-opacity`}>Workspace</div>
      <nav className="space-y-1">{navItems.map(item=>{const Icon=item.icon;return <NavLink key={item.path} to={item.path} title={collapsed?item.name:undefined} className={({isActive})=>`flex h-10 items-center rounded-xl text-[11px] font-medium transition ${collapsed?'justify-center px-0 group-hover/sidebar:justify-start group-hover/sidebar:px-3':'px-3'} ${isActive?'bg-white/[.10] text-white':'text-white/48 hover:bg-white/[.055] hover:text-white/85'}`}><Icon className="h-4 w-4 shrink-0"/><span className={`${collapsed?'w-0 opacity-0 group-hover/sidebar:ml-3 group-hover/sidebar:w-[150px] group-hover/sidebar:opacity-100':'ml-3 w-[150px]'} overflow-hidden whitespace-nowrap transition-all`}>{item.name}</span></NavLink>})}</nav>
    </div>
    <div className="mt-auto border-t border-white/10 p-3">
      {user&&<div className="mb-2 flex h-12 items-center gap-2.5 rounded-xl bg-white/[.045] px-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9d0c4] text-[10px] font-bold text-[#4b4842]">{(user.username||'A').charAt(0).toUpperCase()}</span><div className={`${collapsed?'w-0 opacity-0 group-hover/sidebar:w-[145px] group-hover/sidebar:opacity-100':'w-[145px]'} overflow-hidden transition-all`}><div className="truncate text-[10px] font-semibold text-white/85">{user.username||'SOC Analyst'}</div><div className="truncate text-[8px] text-white/35">{user.email||'Security operator'}</div></div></div>}
      <button onClick={handleLogout} className={`flex h-10 w-full items-center rounded-xl text-[10px] font-medium text-white/45 hover:bg-white/[.05] hover:text-[#ff9a78] ${collapsed?'justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-3':'px-3'}`}><LogOut className="h-4 w-4 shrink-0"/><span className={`${collapsed?'w-0 opacity-0 group-hover/sidebar:ml-3 group-hover/sidebar:w-[100px] group-hover/sidebar:opacity-100':'ml-3 w-[100px]'} overflow-hidden whitespace-nowrap transition-all`}>Sign out</span></button>
    </div>
  </aside>;
};
export default Sidebar;
