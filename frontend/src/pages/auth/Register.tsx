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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessage";

const benefits = [
  { icon: Network, title: "Network intelligence", text: "Inspect traffic and suspicious flows in one workspace." },
  { icon: ShieldCheck, title: "Threat operations", text: "Triage alerts, incidents and model detections faster." },
  { icon: Fingerprint, title: "Federated learning", text: "Collaborative intelligence without centralizing raw data." },
];

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

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
    <div className="register-root min-h-screen bg-[#e9e5de] px-4 py-5 text-[#f7f5f0] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px] overflow-hidden rounded-[30px] border border-black/10 bg-[#585650] shadow-[0_30px_90px_rgba(45,41,36,.20)]">
        <div className="flex min-h-[calc(100vh-40px)] flex-col lg:grid lg:grid-cols-[1.1fr_.9fr]">
          <section className="relative border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-12 xl:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,.08),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(242,124,82,.08),transparent_35%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f27c52] text-white"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <div className="text-lg font-semibold tracking-[-.03em] text-white">FedSentry</div>
                  <div className="text-[10px] uppercase tracking-[.18em] text-white/45">Security intelligence platform</div>
                </div>
              </div>

              <div className="mt-14 max-w-2xl lg:mt-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-[#ff9d79]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Secure operator enrollment
                </div>
                <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-white sm:text-5xl xl:text-6xl">
                  Create your security workspace.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
                  Register once to access FedSentry predictions, analytics, alerts, incidents and the AI security assistant from one unified console.
                </p>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:mt-auto lg:grid-cols-1 xl:grid-cols-3">
                {benefits.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-[18px] border border-white/10 bg-[#4a4843]/85 p-4 shadow-[0_12px_30px_rgba(28,26,23,.12)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f27c52]/15 text-[#ff946f]"><Icon className="h-4 w-4" /></div>
                    <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/48">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-[520px] rounded-[26px] border border-white/12 bg-[#4c4944] p-6 shadow-[0_24px_70px_rgba(31,28,24,.20)] sm:p-8">
              <div className="mb-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#f27c52]/15 text-[#ff946f]"><UserRound className="h-5 w-5" /></div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-.035em] text-white">Create account</h2>
                <p className="mt-2 text-sm text-white/55">Register a FedSentry operator account.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#e7655c]/30 bg-[#e7655c]/12 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8e84]" />
                  <p className="text-xs leading-5 text-[#ffd0cc]">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field label="Username" icon={<UserRound className="h-4 w-4" />}>
                  <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="Choose a username" className="auth-input" />
                </Field>

                <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" className="auth-input" />
                </Field>

                <Field label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
                  <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Minimum 8 characters" className="auth-input pr-12" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756f66] hover:text-[#3f3b35]" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <Field label="Confirm password" icon={<LockKeyhole className="h-4 w-4" />}>
                  <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Repeat your password" className="auth-input pr-12" />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756f66] hover:text-[#3f3b35]" aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <button type="submit" disabled={submitting} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f27c52] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(242,124,82,.22)] hover:bg-[#e96b42] disabled:opacity-60">
                  {submitting ? "Creating account..." : "Create security account"}<ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50">
                Already registered?
                <RouterLink to="/login" className="font-semibold text-[#ff9b78] hover:text-[#ffb39a]">Sign in</RouterLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#827a70]">{icon}</span>
        {children}
      </div>
    </div>
  );
}
