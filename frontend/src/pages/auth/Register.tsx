import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Network,
  ShieldCheck,
  UserRound,
  Activity,
  ScanLine,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessage";

const benefits = [
  { icon: Network, title: 'Network Intelligence', desc: 'Analyze network flows and suspicious activity.' },
  { icon: Activity, title: 'Threat Detection', desc: 'Monitor malicious traffic with intelligent classification.' },
  { icon: Fingerprint, title: 'Federated Learning', desc: 'Distributed machine learning across nodes.' },
  { icon: ShieldCheck, title: 'SOC Operations', desc: 'Manage alerts, incidents, predictions and audits.' },
];

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (username.trim().length < 3) return setError("Username must be at least 3 characters long.");
    if (password.length < 8) return setError("Password must be at least 8 characters long.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await register({ username, email, password });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen text-[var(--text-primary)]">
      <main className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch lg:px-8">
        <section className="auth-hero-panel flex flex-col justify-between rounded-[28px] border border-white/10 p-7 sm:p-10 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-4 py-2 text-[#f1845d]">
              <ScanLine className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[.2em]">Operator registration gateway</span>
            </div>
            <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.04] sm:text-5xl xl:text-6xl">
              Build your <span className="block text-[#f1845d]">security workspace.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
              Create your FedSentry operator account and gain access to network intelligence, threat detection, federated learning, analytics, incident response and AI-assisted SOC workflows.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="auth-feature-card rounded-3xl border border-white/10 p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#f1845d]/15 text-[#f1845d]"><Icon className="h-4 w-4" /></div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/45">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[9px] font-semibold uppercase tracking-[.16em] text-white/35">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Protected registration</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Secure transport</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Operator access</span>
          </div>
        </section>

        <section className="auth-form-panel flex items-center rounded-[28px] border border-white/10 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1845d]/15 text-[#f1845d]"><UserRound className="h-5 w-5" /></div>
            <h2 className="text-3xl font-semibold text-white">Create account</h2>
            <p className="mt-2 text-sm text-white/50">Register a new FedSentry security operator.</p>
            {error && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><AlertCircle className="h-4 w-4" />{error}</div>}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <AuthField label="Username" icon={<UserRound className="h-4 w-4" />}><input value={username} onChange={(e)=>setUsername(e.target.value)} className="auth-input h-13 w-full rounded-2xl pl-11 pr-4" placeholder="Choose a username" /></AuthField>
              <AuthField label="Email" icon={<Mail className="h-4 w-4" />}><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="auth-input h-13 w-full rounded-2xl pl-11 pr-4" placeholder="you@example.com" /></AuthField>
              <AuthField label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
                <input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} className="auth-input h-13 w-full rounded-2xl pl-11 pr-12" placeholder="At least 8 characters" />
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
              </AuthField>
              <AuthField label="Confirm password" icon={<LockKeyhole className="h-4 w-4" />}>
                <input type={showConfirmPassword?'text':'password'} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="auth-input h-13 w-full rounded-2xl pl-11 pr-12" placeholder="Repeat your password" />
                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showConfirmPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
              </AuthField>
              <button disabled={submitting} className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#f1845d] text-sm font-semibold uppercase tracking-[.14em] text-white hover:bg-[#e97851]">{submitting?'Creating account...':'Create security account'}<ArrowRight className="h-4 w-4"/></button>
            </form>
            <div className="my-6 h-px bg-white/10" />
            <RouterLink to="/login" className="flex h-12 w-full items-center justify-center rounded-full border border-white/12 bg-white/[.055] text-xs font-semibold text-white/75 hover:bg-white/[.08]">Already registered? Sign in</RouterLink>
          </div>
        </section>
      </main>
    </div>
  );
}

function AuthField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">{label}</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35">{icon}</span>{children}</div></div>;
}
