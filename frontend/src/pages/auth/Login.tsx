import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ArrowRight,
  Activity,
  Network,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  ScanLine,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    try {
      setLoading(true);
      await login({ username, password });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const capabilities = [
    { icon: <Network className="h-4 w-4" />, title: 'Network Intelligence', desc: 'Real-time traffic analysis and flow inspection.' },
    { icon: <Activity className="h-4 w-4" />, title: 'Threat Detection', desc: 'Machine-learning powered anomaly classification.' },
    { icon: <Fingerprint className="h-4 w-4" />, title: 'Federated Learning', desc: 'Distributed intelligence without centralized raw data.' },
    { icon: <ShieldCheck className="h-4 w-4" />, title: 'SOC Operations', desc: 'Centralized alerts, incidents, and audit visibility.' },
  ];

  return (
    <div className="auth-shell min-h-screen text-[var(--text-primary)]">
      <main className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-[1.2fr_.8fr] lg:items-stretch lg:px-8">
        <section className="auth-hero-panel flex flex-col justify-between rounded-[28px] border border-white/10 p-7 sm:p-10 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-4 py-2 text-[#f1845d]">
              <ScanLine className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[.2em]">Secure authentication gateway</span>
            </div>
            <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.04] sm:text-5xl xl:text-6xl">
              Intelligence for <span className="block text-[#f1845d]">modern networks.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
              Access the FedSentry Security Operations Console to monitor network traffic, inspect threats, evaluate predictions, and manage security incidents through a unified intelligence platform.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {capabilities.map((item) => (
                <div key={item.title} className="auth-feature-card rounded-3xl border border-white/10 p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#f1845d]/15 text-[#f1845d]">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/45">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[9px] font-semibold uppercase tracking-[.16em] text-white/35">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Secure session</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Encrypted transport</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> AI engine ready</span>
          </div>
        </section>

        <section className="auth-form-panel flex items-center rounded-[28px] border border-white/10 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1845d]/15 text-[#f1845d]"><LockKeyhole className="h-5 w-5" /></div>
            <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-white/50">Sign in to access your security operations console.</p>
            {error && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><AlertCircle className="h-4 w-4" />{error}</div>}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">Username</label>
                <div className="relative"><UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input value={username} onChange={(e)=>setUsername(e.target.value)} className="auth-input h-14 w-full rounded-2xl pl-11 pr-4" placeholder="Enter your username" /></div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">Password</label>
                <div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} className="auth-input h-14 w-full rounded-2xl pl-11 pr-12" placeholder="Enter your password" /><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
              </div>
              <button disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#f1845d] text-sm font-semibold uppercase tracking-[.14em] text-white hover:bg-[#e97851]">{loading?'Signing in...':'Sign in to console'}<ArrowRight className="h-4 w-4"/></button>
            </form>
            <div className="my-6 h-px bg-white/10" />
            <RouterLink to="/register" className="flex h-12 w-full items-center justify-center rounded-full border border-white/12 bg-white/[.055] text-xs font-semibold text-white/75 hover:bg-white/[.08]">Create security account</RouterLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
