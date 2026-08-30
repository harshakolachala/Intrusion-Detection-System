import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Fingerprint,
  CheckCircle2,
  Network,
  ScanLine,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessage";

const REGISTER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700;1,9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .register-root {
    --accent: #8B2FE0;
    --accent-dim: #F1E4FF;
    --rust: #FF3D6E;
    --amber: #FF9D2E;
    --grad: linear-gradient(90deg, var(--accent) 0%, var(--rust) 55%, var(--amber) 100%);
  }
  .register-root .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-style: italic; letter-spacing: -0.01em; }
  .register-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .register-root .grad-text {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .register-root .grad-bg { background: var(--grad); }

  @keyframes registerBlobDrift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(50px, 70px) scale(1.12); } }
  @keyframes registerBlobDrift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-60px, -40px) scale(1.08); } }
  @keyframes registerBlobDrift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(35px, -60px) scale(0.92); } }
  @keyframes registerGrainShift { 0% { transform: translate(0, 0); } 100% { transform: translate(-120px, -90px); } }

  .register-bg-blob { position: absolute; border-radius: 9999px; filter: blur(120px); will-change: transform; }
  .register-bg-grain {
    position: absolute; inset: -20%; opacity: 0.03; mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation: registerGrainShift 12s steps(6) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .register-root * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
  }
`;

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

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
        },
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Registration failed. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-root relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <style>{REGISTER_STYLES}</style>

      {/* Background — same slow-drifting colour blooms as Login */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="register-bg-blob left-[-14%] top-[-12%] h-[520px] w-[520px]" style={{ backgroundColor: 'var(--accent)', opacity: 0.06, animation: 'registerBlobDrift1 28s ease-in-out infinite' }} />

        <div className="register-bg-blob bottom-[-16%] right-[-10%] h-[540px] w-[540px]" style={{ backgroundColor: 'var(--rust)', opacity: 0.05, animation: 'registerBlobDrift2 34s ease-in-out infinite' }} />

        <div className="register-bg-blob left-[46%] top-[20%] h-[300px] w-[300px]" style={{ backgroundColor: 'var(--amber)', opacity: 0.035, animation: 'registerBlobDrift3 30s ease-in-out infinite' }} />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        <div className="register-bg-grain" />

      </div>

      {/* Top Brand Bar */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

        <div className="flex items-center gap-3">

          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl grad-bg text-white shadow-[0_12px_30px_rgba(139,47,224,0.22)]">

            <div className="absolute inset-1 rounded-lg border border-white/20" />

            <ShieldCheck className="relative h-5 w-5" />

          </div>

          <div>

            <div className="font-display text-base font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              SentinelX
            </div>

            <div className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
              Security Intelligence Platform
            </div>

          </div>

        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-[var(--shadow-sm)] sm:flex">

          <span className="relative flex h-1.5 w-1.5">

            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />

            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />

          </span>

          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
            Registration Gateway Online
          </span>

        </div>

      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl items-center px-5 pb-10 pt-4 sm:px-8 lg:px-10">

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_480px] xl:gap-20">

          {/* Left Information Panel */}
          <section className="hidden lg:block">

            <div className="max-w-2xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5" style={{ color: 'var(--accent)' }}>

                <ScanLine className="h-3.5 w-3.5" />

                <span className="font-mono text-[8px] font-black uppercase tracking-[0.18em]">
                  Operator Registration Gateway
                </span>

              </div>

              <h1 className="font-display max-w-xl text-5xl font-semibold leading-[1.05] text-[var(--text-primary)] xl:text-6xl">

                Build your

                <span className="grad-text block">
                  security workspace.
                </span>

              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
                Create your SentinelX operator account and gain access to the
                security operations console, network intelligence, threat
                detection, and incident management capabilities.
              </p>

              {/* Capability Cards */}
              <div className="mt-9 grid max-w-xl grid-cols-2 gap-3">

                {[
                  { icon: <Network className="h-4 w-4" />, title: 'Network Intelligence', desc: 'Analyze network flows and identify suspicious activity.' },
                  { icon: <Activity className="h-4 w-4" />, title: 'Threat Detection', desc: 'Monitor malicious traffic with intelligent classification.' },
                  { icon: <Fingerprint className="h-4 w-4" />, title: 'Federated Learning', desc: 'Distributed machine-learning intelligence across nodes.' },
                  { icon: <ShieldCheck className="h-4 w-4" />, title: 'SOC Operations', desc: 'Manage alerts, incidents, predictions, and audit records.' },
                ].map((item) => (
                  <div key={item.title} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]">

                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>

                      {item.icon}

                    </div>

                    <p className="text-xs font-black text-[var(--text-primary)]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-[var(--text-muted)]">
                      {item.desc}
                    </p>

                  </div>
                ))}

              </div>

              {/* Security Status */}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                    Protected Registration
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                    Secure Transport
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                    Operator Access
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* Register Panel */}
          <section className="w-full">

            <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">

              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[90px]" style={{ backgroundColor: 'var(--accent)', opacity: 0.07 }} />

              <div className="relative p-6 sm:p-8">

                {/* Mobile Brand */}
                <div className="mb-7 lg:hidden">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl grad-bg text-white shadow-lg">

                      <ShieldCheck className="h-5 w-5" />

                    </div>

                    <div>

                      <div className="font-display text-base font-semibold text-[var(--text-primary)]">
                        SentinelX
                      </div>

                      <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-subtle)]">
                        Security Intelligence
                      </div>

                    </div>

                  </div>

                </div>

                {/* Register Header */}
                <div className="mb-7">

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>

                    <UserRound className="h-5 w-5" />

                  </div>

                  <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                    Create account
                  </h2>

                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
                    Register a new operator account for SentinelX.
                  </p>

                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">

                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                    <p className="text-[10px] font-medium leading-5 text-rose-600 dark:text-rose-400">
                      {error}
                    </p>

                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >

                  {/* Username */}
                  <div>

                    <label
                      htmlFor="username"
                      className="mb-2 block font-mono text-[8px] font-black uppercase tracking-[0.13em] text-[var(--text-subtle)]"
                    >
                      Username
                    </label>

                    <div className="relative">

                      <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoFocus
                        autoComplete="username"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value)
                        }
                        placeholder="Choose a username"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-11 pr-4 text-xs font-medium text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[#8B2FE0] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[#8B2FE0]/10"
                      />

                    </div>

                    <p className="mt-1.5 pl-1 font-mono text-[7px] text-[var(--text-subtle)]">
                      3–50 characters
                    </p>

                  </div>

                  {/* Email */}
                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block font-mono text-[8px] font-black uppercase tracking-[0.13em] text-[var(--text-subtle)]"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="operator@example.com"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-11 pr-4 text-xs font-medium text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[#8B2FE0] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[#8B2FE0]/10"
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div>

                    <label
                      htmlFor="password"
                      className="mb-2 block font-mono text-[8px] font-black uppercase tracking-[0.13em] text-[var(--text-subtle)]"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Create a secure password"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-11 pr-12 text-xs font-medium text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[#8B2FE0] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[#8B2FE0]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                      >

                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}

                      </button>

                    </div>

                    <p className="mt-1.5 pl-1 font-mono text-[7px] text-[var(--text-subtle)]">
                      Minimum 8 characters
                    </p>

                  </div>

                  {/* Confirm Password */}
                  <div>

                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block font-mono text-[8px] font-black uppercase tracking-[0.13em] text-[var(--text-subtle)]"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />

                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Re-enter your password"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-11 pr-12 text-xs font-medium text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[#8B2FE0] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[#8B2FE0]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                      >

                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}

                      </button>

                    </div>

                  </div>

                  {/* Password Security Indicator */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2">

                        <Fingerprint className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />

                        <span className="font-mono text-[7px] font-black uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                          Credential Security
                        </span>

                      </div>

                      <span
                        className={`font-mono text-[7px] font-black uppercase tracking-wider ${
                          password.length >= 8
                            ? "text-emerald-500"
                            : "text-[var(--text-subtle)]"
                        }`}
                      >
                        {password.length >= 8
                          ? "Minimum satisfied"
                          : "8+ characters required"}
                      </span>

                    </div>

                    <div className="mt-2 flex gap-1">

                      <span
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: password.length >= 3 ? 'var(--accent)' : 'var(--border)' }}
                      />

                      <span
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: password.length >= 6 ? 'var(--rust)' : 'var(--border)' }}
                      />

                      <span
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: password.length >= 8 ? 'var(--amber)' : 'var(--border)' }}
                      />

                    </div>

                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl grad-bg font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_32px_rgba(139,47,224,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(139,47,224,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        <span className="relative">
                          Creating Account...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          Create Security Account
                        </span>

                        <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}

                  </button>

                </form>

                {/* Login Link */}
                <div className="mt-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-[var(--border)]" />

                  <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                    Existing operator?
                  </span>

                  <div className="h-px flex-1 bg-[var(--border)]" />

                </div>

                <RouterLink
                  to="/login"
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] font-mono text-[8px] font-black uppercase tracking-[0.13em] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface)] hover:text-[var(--accent)]"
                >
                  Sign In to Existing Account
                </RouterLink>

                {/* Security Footer */}
                <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3">

                  <div className="flex items-start gap-2.5">

                    <Fingerprint className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />

                    <div>

                      <p className="font-mono text-[7px] font-black uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                        Secure Registration
                      </p>

                      <p className="mt-1 text-[8px] leading-4 text-[var(--text-muted)]">
                        Your account credentials are transmitted through the
                        SentinelX security gateway.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Bottom Status */}
            <div className="mt-4 flex items-center justify-center gap-2">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />

                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />

              </span>

              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
                Secure Registration Gateway Operational
              </span>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
