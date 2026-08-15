import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  Cpu,
  Lock,
  Server,
  Layers,
  CheckCircle2,
  ArrowRight,
  Database,
  Globe,
  Sparkles,
  BarChart3,
  Radio,
  FileSearch,
  Menu,
  X,
  BrainCircuit,
  Workflow,
  ScanSearch,
  Waypoints,
  Activity,
} from "lucide-react";

/* ===============================================================
   DESIGN TOKENS + GLOBAL KEYFRAMES
   Palette: bright white field, electric violet → hot pink → amber
   gradient for highlights. Bold, oversized display type.
=============================================================== */

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700;1,9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .sentinel-root {
    --bg: #FFFFFF;
    --card: #F7F4FC;
    --surface: #C4C5BA;
    --ink: #150B24;
    --accent: #8B2FE0;
    --accent-dim: #F1E4FF;
    --accent-deep: #5B12A8;
    --line: #E9E1F5;
    --muted: #6B6478;
    --rust: #FF3D6E;
    --rust-dim: #FFE1EA;
    --amber: #FF9D2E;
    --grad: linear-gradient(90deg, var(--accent) 0%, var(--rust) 55%, var(--amber) 100%);
  }

  .sentinel-root .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-style: italic; font-optical-sizing: auto; letter-spacing: -0.01em; }
  .sentinel-root .font-body { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
  .sentinel-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

  .sentinel-root .grad-text {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .sentinel-root .grad-bg { background: var(--grad); }

  @keyframes radarSpin { to { transform: rotate(360deg); } }
  @keyframes contourDriftA { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-18px, 12px); } }
  @keyframes contourDriftB { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(16px, -10px); } }
  @keyframes pulseDot { 0%, 100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes riseIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .sentinel-animate-in { animation: riseIn 0.7s ease both; }

  /* ---- ambient page background: slow-drifting colour blooms behind every section ---- */
  @keyframes blobDrift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(60px, 90px) scale(1.15); } }
  @keyframes blobDrift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-70px, -50px) scale(1.1); } }
  @keyframes blobDrift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, -80px) scale(0.9); } }
  @keyframes grainShift { 0% { transform: translate(0, 0); } 100% { transform: translate(-120px, -90px); } }

  .sentinel-bg-layer { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .sentinel-bg-blob { position: absolute; border-radius: 9999px; filter: blur(110px); opacity: 0.32; will-change: transform; }
  .sentinel-bg-grain {
    position: absolute; inset: -20%; opacity: 0.035; mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation: grainShift 12s steps(6) infinite;
  }

  /* ---- header: signal animation glowing through a translucent bar, weighted to the right ---- */
  @keyframes headerGlowDrift { 0%, 100% { transform: translate(0, -6px) scale(1); opacity: 0.85; } 50% { transform: translate(-24px, 10px) scale(1.2); opacity: 1; } }
  @keyframes headerLineFlow { to { stroke-dashoffset: -240; } }
  @keyframes headerNodePulse { 0%, 100% { opacity: 0.35; r: 2.4; } 50% { opacity: 1; r: 4; } }
  @keyframes headerSweep { 0% { transform: translateX(-10%); } 100% { transform: translateX(110%); } }

  .sentinel-header-bg { position: absolute; inset: 0; overflow: hidden; }
  .sentinel-header-glow {
    position: absolute; right: -6%; top: 50%; width: 340px; height: 340px; border-radius: 9999px;
    background: radial-gradient(circle, rgba(139,47,224,0.55) 0%, rgba(255,61,110,0.28) 45%, transparent 72%);
    transform: translateY(-50%); filter: blur(6px); mix-blend-mode: screen;
    animation: headerGlowDrift 7s ease-in-out infinite;
  }
  .sentinel-header-sweep {
    position: absolute; inset-y: 0; left: 0; width: 30%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: headerSweep 6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .sentinel-root * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
  }
`;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navLinks: { id: string; label: string }[] = [
    { id: "features", label: "Capabilities" },
    { id: "architecture", label: "Architecture" },
    { id: "federated", label: "Federated AI" },
    { id: "xai", label: "Explainability" },
    { id: "tech", label: "Technology" },
  ];

  const stages = [
    { tag: "01", title: "Network Traffic", icon: <Radio className="h-4.5 w-4.5" />, desc: "Authorized traffic is captured across monitored segments and normalized into structured flow records." },
    { tag: "02", title: "Feature Extraction", icon: <Waypoints className="h-4.5 w-4.5" />, desc: "Each flow is reduced to statistical, temporal and behavioral features the model can reason about." },
    { tag: "03", title: "Neural Inference", icon: <Cpu className="h-4.5 w-4.5" />, desc: "A PyTorch model scores the feature vector against known attack classes in real time." },
    { tag: "04", title: "Security Decision", icon: <ShieldCheck className="h-4.5 w-4.5" />, desc: "Verdicts become alerts, evidence, and analyst-ready records inside the SOC workflow." },
  ];

  const capabilities = [
    {
      icon: <Radio className="h-5 w-5" />,
      title: "Live Detection",
      desc: "Monitor live network flows and flag suspicious behavior the moment traffic moves through the environment.",
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "Neural Inference",
      desc: "PyTorch models transform flow features into actionable intrusion classifications in milliseconds.",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Federated Privacy",
      desc: "Improve one global detection model while raw telemetry stays inside each organization's boundary.",
    },
    {
      icon: <FileSearch className="h-5 w-5" />,
      title: "Explainable AI",
      desc: "Surface the network characteristics behind every decision for analyst-ready investigation.",
    },
  ];

  const techStack = [
    { label: "PyTorch", icon: <BrainCircuit className="h-4 w-4" /> },
    { label: "FastAPI / Python", icon: <Cpu className="h-4 w-4" /> },
    { label: "React + TypeScript", icon: <Layers className="h-4 w-4" /> },
    { label: "Tailwind CSS", icon: <Workflow className="h-4 w-4" /> },
    { label: "Flower Federated Learning", icon: <Globe className="h-4 w-4" /> },
    { label: "PostgreSQL", icon: <Database className="h-4 w-4" /> },
    { label: "LLM + RAG", icon: <Sparkles className="h-4 w-4" /> },
    { label: "JWT Authentication", icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="sentinel-root min-h-screen w-full overflow-x-hidden bg-[var(--bg)] font-body text-[var(--ink)] selection:bg-[var(--accent)] selection:text-white">
      <style>{GLOBAL_STYLES}</style>

      {/* ambient background — drifting colour blooms + fine grain, fixed behind every section */}
      <div className="sentinel-bg-layer" aria-hidden="true">
        <div className="sentinel-bg-blob" style={{ top: "-8%", left: "-6%", width: 520, height: 520, backgroundColor: "var(--accent)", animation: "blobDrift1 26s ease-in-out infinite" }} />
        <div className="sentinel-bg-blob" style={{ top: "22%", right: "-10%", width: 460, height: 460, backgroundColor: "var(--rust)", animation: "blobDrift2 32s ease-in-out infinite" }} />
        <div className="sentinel-bg-blob" style={{ top: "55%", left: "8%", width: 380, height: 380, backgroundColor: "var(--amber)", opacity: 0.22, animation: "blobDrift3 29s ease-in-out infinite" }} />
        <div className="sentinel-bg-blob" style={{ top: "82%", right: "6%", width: 440, height: 440, backgroundColor: "var(--accent)", animation: "blobDrift2 24s ease-in-out infinite reverse" }} />
        <div className="sentinel-bg-grain" />
      </div>

      {/* =========================================================
          NAVBAR — translucent black bar with a signal animation
          glowing through it, weighted toward the right side
      ========================================================= */}
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0A]/75 backdrop-blur-xl">
        <div className="sentinel-header-bg" aria-hidden="true">
          <div className="sentinel-header-sweep" />
          <div className="sentinel-header-glow" />
          <svg viewBox="0 0 640 64" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 h-full w-full opacity-70">
            <defs>
              <linearGradient id="headerLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M340,14 C400,14 400,32 460,32 C500,32 500,18 560,18 C590,18 600,30 630,30" fill="none" stroke="url(#headerLineGrad)" strokeWidth="1.6" strokeDasharray="6 10" style={{ animation: "headerLineFlow 5s linear infinite" }} />
            <path d="M330,50 C390,50 390,34 450,34 C495,34 495,46 555,46 C585,46 595,36 632,36" fill="none" stroke="url(#headerLineGrad)" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="4 8" style={{ animation: "headerLineFlow 6.5s linear infinite reverse" }} />
            <circle cx="460" cy="32" r="3" fill="var(--rust)" style={{ animation: "headerNodePulse 2.2s ease-in-out infinite" }} />
            <circle cx="560" cy="18" r="3" fill="var(--accent)" style={{ animation: "headerNodePulse 2.6s ease-in-out infinite", animationDelay: "0.4s" }} />
            <circle cx="600" cy="30" r="3" fill="var(--amber)" style={{ animation: "headerNodePulse 2.4s ease-in-out infinite", animationDelay: "0.8s" }} />
          </svg>
        </div>
        <div className="relative z-10 mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-7 lg:px-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`group flex shrink-0 items-center gap-2.5 rounded-lg ${focusRing}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06]">
              <ShieldCheck className="h-4.5 w-4.5 text-[var(--accent-dim)]" />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-body text-[17px] font-semibold tracking-tight text-white">
                sentinel<span className="grad-text">AI</span>
              </span>
              <span className="hidden font-body text-[10px] font-medium text-white/40 sm:block">
                Threat intelligence platform
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={`rounded-lg px-3.5 py-2 font-body text-[13.5px] font-medium text-white/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white ${focusRing}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`flex h-10 items-center rounded-lg border border-white/15 px-4 text-[13.5px] font-semibold leading-none text-white transition-colors duration-200 hover:bg-white/[0.08] ${focusRing}`}
            >
              Sign In
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden ${focusRing}`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0B0B0A] px-4 pb-4 pt-2 md:hidden">
            <div className="space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/80 hover:bg-white/[0.06] ${focusRing}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`flex h-11 w-full items-center justify-center rounded-lg border border-white/15 text-[13.5px] font-bold text-white ${focusRing}`}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO — recon / radar signature background
      ========================================================= */}
      <section className="relative z-10 overflow-hidden px-5 pb-20 pt-[132px] sm:px-7 sm:pt-[150px] lg:px-10">
        {/* faint ambient grid, low enough it never competes with content */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 10%, black 25%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 10%, black 25%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* left — copy, left-aligned */}
          <div className="sentinel-animate-in text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--card)] px-3.5 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              Federated Intrusion Detection
            </div>

            <h1 className="max-w-[620px] font-display text-[54px] font-bold leading-[0.96] tracking-[-0.01em] text-[var(--ink)] sm:text-[80px] lg:text-[96px]">
              See the threat.
              <br />
              Understand <span className="grad-text">the why.</span>
            </h1>

            <p className="mt-7 max-w-[500px] text-[16px] leading-8 text-[var(--muted)] sm:text-[17px]">
              SentinelAI classifies live network traffic with a PyTorch detection model, improves itself through
              Federated Learning across organizations, and explains every verdict in language a SOC analyst can act on.
            </p>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className={`group grad-bg flex w-full items-center justify-center gap-2.5 rounded-lg px-7 py-3.5 text-[14.5px] font-bold text-white shadow-[0_16px_36px_rgba(139,47,224,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto ${focusRing}`}
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>Launch Console</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("architecture")}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--card)] px-7 py-3.5 text-[14.5px] font-bold text-[var(--ink)] transition-colors duration-300 hover:bg-white sm:w-auto ${focusRing}`}
              >
                <Workflow className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <span>View Architecture</span>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              <span>78 flow features</span>
              <span className="h-1 w-1 rounded-full bg-[var(--line)]" />
              <span>15 attack classes</span>
              <span className="h-1 w-1 rounded-full bg-[var(--line)]" />
              <span>24/7 inference</span>
            </div>
          </div>

          {/* right — the animation, contained in its own frame so it never collides with copy */}
          <div className="relative mx-auto aspect-square w-full max-w-[440px] overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--card)] lg:ml-auto">
            {/* drifting topographic contours */}
            <svg viewBox="0 0 440 440" className="absolute inset-0 h-full w-full opacity-[0.45]" aria-hidden="true">
              <g style={{ animation: "contourDriftA 22s ease-in-out infinite" }}>
                <path d="M20,180 C90,120 190,120 240,170 C290,220 380,220 430,170" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                <path d="M10,240 C80,190 190,190 240,230 C300,280 390,280 440,230" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
              </g>
              <g style={{ animation: "contourDriftB 26s ease-in-out infinite" }}>
                <path d="M0,120 C70,70 180,70 230,110 C290,160 380,160 440,110" fill="none" stroke="var(--muted)" strokeWidth="1" />
                <path d="M0,320 C70,270 180,270 230,310 C290,360 380,360 440,310" fill="none" stroke="var(--muted)" strokeWidth="1" />
              </g>
            </svg>

            {/* radar sweep, centered in the frame */}
            <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 sm:h-[300px] sm:w-[300px]">
              <div className="absolute inset-0 rounded-full border border-[var(--line)]" />
              <div className="absolute inset-[22%] rounded-full border border-[var(--line)]" />
              <div className="absolute inset-[44%] rounded-full border border-[var(--line)]" />
              <div className="absolute inset-0 overflow-hidden rounded-full" style={{ animation: "radarSpin 8s linear infinite" }}>
                <div
                  className="absolute inset-0"
                  style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(89,95,57,0.35) 55deg, transparent 100deg)" }}
                />
              </div>
              <span className="absolute left-[30%] top-[36%] h-2 w-2 rounded-full" style={{ backgroundColor: "var(--rust)", animation: "pulseDot 2.4s ease-in-out infinite" }} />
              <span className="absolute right-[24%] bottom-[28%] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)", animation: "pulseDot 2.8s ease-in-out infinite", animationDelay: "0.6s" }} />
              <span className="absolute left-[20%] bottom-[22%] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--muted)", animation: "pulseDot 3s ease-in-out infinite", animationDelay: "1s" }} />
              <span className="absolute flex left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full grad-bg">
                <ShieldCheck className="h-4 w-4 text-white" />
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-[var(--line)] bg-[var(--card)]/90 px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)", animation: "pulseDot 2s ease-in-out infinite" }} />
                Live scan
              </span>
              <span style={{ color: "var(--ink)" }}>4ms latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CAPABILITIES — 4 uniform cards, no per-card gimmicks
      ========================================================= */}
      <section id="features" className="relative z-10 scroll-mt-24 px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-[640px]">
            <span className="font-mono text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--accent)" }}>
              The Platform
            </span>
            <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.01em] text-[var(--ink)] sm:text-[54px]">
              One workflow. Four disciplines.
            </h2>
            <p className="mt-4 text-[15.5px] leading-7 text-[var(--muted)]">
              Detection, inference, privacy and explainability work as a single connected pipeline instead of four
              separate tools.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--card)] p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
                >
                  {cap.icon}
                </span>
                <h3 className="mt-6 font-display text-[20px] font-bold tracking-[-0.01em] text-[var(--ink)]">
                  {cap.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ARCHITECTURE — sequential pipeline (numbering earned here)
      ========================================================= */}
      <section id="architecture" className="relative z-10 scroll-mt-24 px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[560px]">
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-[var(--muted)]">
                How SentinelAI Works
              </span>
              <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.01em] text-[var(--ink)] sm:text-[54px]">
                From packet to protection.
              </h2>
            </div>
            <p className="max-w-[320px] text-[14.5px] leading-7 text-[var(--muted)]">
              Traffic moves through four connected stages. Select one to inspect it on the pipeline below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stages.map((stage, index) => {
              const active = activeStage === index;
              return (
                <button
                  key={stage.tag}
                  type="button"
                  onClick={() => setActiveStage(index)}
                  className={`rounded-xl border p-4 text-left transition-colors duration-300 ${focusRing} ${
                    active
                      ? "border-transparent bg-[var(--ink)] text-white"
                      : "border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: active ? "rgba(255,255,255,0.14)" : "var(--accent-dim)",
                        color: active ? "white" : "var(--accent)",
                      }}
                    >
                      {stage.icon}
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${active ? "text-white/60" : "text-[var(--muted)]"}`}>
                      {stage.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-[13.5px] font-bold leading-tight">{stage.title}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-7">
              <span className="font-mono text-[10px] font-bold tracking-[0.1em]" style={{ color: "var(--accent)" }}>
                Stage {stages[activeStage].tag}
              </span>
              <h3 className="mt-2 font-display text-[24px] font-bold tracking-[-0.01em] text-[var(--ink)]">
                {stages[activeStage].title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-7 text-[var(--muted)]">{stages[activeStage].desc}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
              <svg viewBox="0 0 620 140" className="h-[130px] w-full" aria-hidden="true">
                <line x1="60" y1="70" x2="560" y2="70" stroke="var(--line)" strokeWidth="2" />
                <line
                  x1="60"
                  y1="70"
                  x2={60 + activeStage * (500 / 3)}
                  y2="70"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  style={{ transition: "x2 0.6s ease" }}
                />
                <circle r="3.5" fill="var(--rust)">
                  <animateMotion dur="5s" repeatCount="indefinite" path="M60,70 L560,70" />
                </circle>
                {stages.map((stage, i) => {
                  const cx = 60 + i * (500 / 3);
                  const isActive = i === activeStage;
                  const isDone = i < activeStage;
                  return (
                    <g key={stage.tag}>
                      <circle
                        cx={cx}
                        cy="70"
                        r={isActive ? 15 : 10}
                        fill={isActive ? "var(--ink)" : isDone ? "var(--accent)" : "var(--bg)"}
                        stroke={isActive || isDone ? "transparent" : "var(--line)"}
                        strokeWidth="2"
                        style={{ transition: "all 0.4s ease" }}
                      />
                      <text x={cx} y="106" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="'IBM Plex Mono', monospace" fill={isActive ? "var(--ink)" : "var(--muted)"}>
                        {stage.tag}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] font-semibold text-[var(--muted)]">
                <span>TRAFFIC</span>
                <span>EXTRACTION</span>
                <span>INFERENCE</span>
                <span>DECISION</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEDERATED LEARNING — hub / spoke
      ========================================================= */}
      <section id="federated" className="relative z-10 scroll-mt-24 px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                Federated Intelligence
              </span>
              <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.01em] text-[var(--ink)] sm:text-[54px]">
                Learn together. Keep data local.
              </h2>
              <p className="mt-5 max-w-[480px] text-[15.5px] leading-7 text-[var(--muted)]">
                Federated Learning lets participating environments improve a shared intrusion detection model without
                moving raw network telemetry into a central dataset.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  ["Local training", "Each participating node trains using its own network environment."],
                  ["Secure aggregation", "Model updates — not raw data — contribute to a stronger global model."],
                  ["Reduced exposure", "Raw network telemetry never leaves the originating environment."],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: i === 2 ? "var(--accent)" : "var(--bg)", color: i === 2 ? "white" : "var(--ink)" }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] font-bold text-[var(--ink)]">{title}</h3>
                      <p className="mt-1 text-[13.5px] leading-6 text-[var(--muted)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto h-[400px] w-full max-w-[400px]">
              <div className="absolute inset-10 rounded-full border border-dashed" style={{ borderColor: "var(--line)" }} />

              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d="M84,84 L200,200" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="4 6" />
                <path d="M316,84 L200,200" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="4 6" />
                <path d="M84,316 L200,200" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="4 6" />
                <path d="M316,316 L200,200" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="4 6" />

                <circle r="3" fill="var(--accent)">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path="M84,84 L200,200" />
                </circle>
                <circle r="3" fill="var(--rust)">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path="M200,200 L316,84" />
                </circle>
                <circle r="3" fill="var(--accent)">
                  <animateMotion dur="2.9s" begin="0.4s" repeatCount="indefinite" path="M84,316 L200,200" />
                </circle>
                <circle r="3" fill="var(--rust)">
                  <animateMotion dur="2.9s" begin="0.4s" repeatCount="indefinite" path="M200,200 L316,316" />
                </circle>
              </svg>

              <div className="absolute left-1/2 top-1/2 flex h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl grad-bg text-white shadow-[0_20px_44px_rgba(139,47,224,0.30)]">
                <Globe className="h-6 w-6" style={{ color: "var(--accent-dim)" }} />
                <span className="font-mono text-[9px] font-bold tracking-[0.06em]">GLOBAL</span>
                <span className="font-mono text-[8px] text-white/60">MODEL</span>
              </div>

              {[
                { top: 84, left: 84, label: "CLIENT 01", icon: <Server className="h-4.5 w-4.5" /> },
                { top: 84, left: 316, label: "CLIENT 02", icon: <Database className="h-4.5 w-4.5" /> },
                { top: 316, left: 84, label: "CLIENT 03", icon: <Activity className="h-4.5 w-4.5" /> },
                { top: 316, left: 316, label: "CLIENT 04", icon: <Layers className="h-4.5 w-4.5" /> },
              ].map((node, i) => (
                <div
                  key={i}
                  className="absolute flex w-[90px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-center"
                  style={{ top: node.top, left: node.left }}
                >
                  <span style={{ color: "var(--accent)" }}>{node.icon}</span>
                  <span className="font-mono text-[9px] font-bold text-[var(--muted)]">{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EXPLAINABLE AI — analyst console
      ========================================================= */}
      <section id="xai" className="relative z-10 scroll-mt-24 px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                Explainable AI
              </span>
              <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.01em] text-[var(--ink)] sm:text-[54px]">
                Don't just detect. Understand it.
              </h2>
              <p className="mt-5 max-w-[460px] text-[15.5px] leading-7 text-[var(--muted)]">
                A classification alone isn't enough for a security analyst. SentinelAI exposes the features that
                influenced each prediction and turns model behavior into usable context.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  [<BarChart3 className="h-4 w-4" key="i1" />, "Feature attribution", "Identify the strongest factors behind a prediction."],
                  [<ScanSearch className="h-4 w-4" key="i2" />, "Analyst-ready evidence", "Model behavior becomes interpretable investigation context."],
                  [<Sparkles className="h-4 w-4" key="i3" />, "AI-assisted explanation", "Predictions connect to broader security intelligence."],
                ].map(([icon, title, desc], i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-[14.5px] font-bold text-[var(--ink)]">{title as string}</h3>
                      <p className="mt-1 text-[13.5px] leading-6 text-[var(--muted)]">{desc as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--line)" }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--line)" }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                </div>
                <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-[var(--muted)]">
                  Verdict Analysis
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center">
                    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--rust)" strokeWidth="10" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="4.7" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-display text-[22px] font-bold text-[var(--ink)]">98.5%</span>
                      <span className="font-mono text-[8.5px] font-semibold text-[var(--muted)]">CONFIDENCE</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Classification</p>
                    <h3 className="mt-1 font-display text-[20px] font-bold text-[var(--ink)]">Malicious Traffic</h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold" style={{ backgroundColor: "var(--rust-dim)", color: "var(--rust)" }}>
                      <Shield className="h-3 w-3" /> DDoS Pattern
                    </span>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {[
                    ["Flow Packets/s Rate", "+48.2%", 86, "var(--rust)"],
                    ["SYN Flag Count", "+24.7%", 63, "var(--accent)"],
                    ["Average Packet Size", "-12.1%", 37, "var(--muted)"],
                  ].map(([label, val, w, color], i) => (
                    <div key={i}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-[var(--muted)]">{label as string}</span>
                        <span className="font-mono text-[11px] font-bold" style={{ color: color as string }}>{val as string}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                        <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color as string }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono text-[11px] font-semibold text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)", animation: "pulseDot 2s ease-in-out infinite" }} />
                    Neural engine active
                  </span>
                  <span style={{ color: "var(--ink)" }}>4ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TECHNOLOGY — marquee rail
      ========================================================= */}
      <section id="tech" className="relative z-10 scroll-mt-24 px-5 py-14 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col justify-between gap-6 py-2 md:flex-row md:items-center">
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-[var(--muted)]">
                Technology Foundation
              </span>
              <h2 className="mt-2 font-display text-[28px] font-bold tracking-[-0.01em] text-[var(--ink)] sm:text-[34px]">
                Built on a modern security stack.
              </h2>
            </div>
            <p className="max-w-[380px] text-[14px] leading-6 text-[var(--muted)]">
              React and TypeScript power the console, while FastAPI, PyTorch, Flower and PostgreSQL run the security
              infrastructure beneath it.
            </p>
          </div>

          <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max items-center gap-3 py-1" style={{ animation: "marquee 26s linear infinite" }}>
              {[...techStack, ...techStack].map((t, i) => (
                <div key={i} className="flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5">
                  <span style={{ color: "var(--accent)" }}>{t.icon}</span>
                  <span className="whitespace-nowrap text-[13px] font-semibold text-[var(--ink)]">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative z-10 px-5 py-16 sm:px-7 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--card)] px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full opacity-25 blur-[90px]" style={{ backgroundColor: "var(--accent-dim)" }} />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-[600px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.08em] text-[var(--accent)]">
                  <Shield className="h-3.5 w-3.5" /> SentinelAI Security Console
                </div>
                <h2 className="font-display text-[38px] font-bold leading-[1.0] tracking-[-0.01em] text-[var(--ink)] sm:text-[52px]">
                  Secure the network.
                  <br />
                  Understand <span className="grad-text">the threat.</span>
                </h2>
                <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[var(--muted)]">
                  Bring real-time detection, federated intelligence and explainable security into one operational
                  workflow.
                </p>
              </div>

              <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className={`group grad-bg inline-flex items-center justify-center gap-2.5 rounded-lg px-7 py-3.5 text-[14.5px] font-extrabold text-white shadow-[0_16px_36px_rgba(139,47,224,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 ${focusRing}`}
                >
                  <span>Launch SentinelAI</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <span className="text-[11px] font-semibold text-[var(--muted)]">Start your security workflow</span>
              </div>
            </div>

            <div className="relative z-10 mt-9 flex flex-col gap-3 border-t border-[var(--line)] pt-5 font-mono text-[10.5px] font-bold text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)", animation: "pulseDot 2s ease-in-out infinite" }} />
                THREAT DETECTION READY
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[var(--ink)]">
                <span>REAL-TIME</span>
                <span>FEDERATED</span>
                <span>EXPLAINABLE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER — solid black, matches navbar
      ========================================================= */}
      <footer className="relative z-10 bg-[#0B0B0A] px-5 py-8 sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-6 sm:flex-row">
          <button type="button" onClick={() => navigate("/")} className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06]">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-dim)]" />
            </span>
            <span className="font-body text-[15px] font-semibold text-white">
              sentinel<span className="grad-text">AI</span>
            </span>
          </button>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[11px] font-semibold text-white/45">
            <span>Federated NIDS</span>
            <span>Privacy First</span>
            <span>Explainable AI</span>
            <span>Real-Time Detection</span>
            <span>&copy; 2026 SentinelAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
