import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  ShieldAlert,
  Radar,
  Activity
} from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-8 text-[var(--text-primary)]">

      {/* =====================================================
          AMBIENT 3D BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.045] blur-[120px]" />

        <div className="absolute -left-32 top-[-100px] h-80 w-80 rounded-full bg-cyan-500/[0.04] blur-[100px]" />

        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-500/[0.035] blur-[110px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />

        {/* Radial dots */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--text-primary) 0.7px, transparent 0.7px)",
            backgroundSize: "18px 18px"
          }}
        />

      </div>

      {/* =====================================================
          DECORATIVE ORBIT ELEMENTS
      ===================================================== */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.07] lg:block" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/[0.07] lg:block" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/[0.06] lg:block" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">

        <div className="w-full max-w-2xl">

          {/* Main Glass Card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-md)] backdrop-blur-xl">

            {/* Decorative lighting */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/[0.055] blur-[75px]" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-500/[0.04] blur-[75px]" />

            <div className="relative p-7 text-center sm:p-10 lg:p-12">

              {/* =================================================
                  SYSTEM STATUS
              ================================================= */}
              <div className="mb-8 flex flex-wrap items-center justify-center gap-2">

                <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 font-mono text-[8px] font-black uppercase tracking-[0.16em] text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">

                  <span className="relative flex h-1.5 w-1.5">

                    <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-50" />

                    <span className="relative h-1.5 w-1.5 rounded-full bg-rose-500" />

                  </span>

                  Navigation Fault

                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">

                  <Activity className="h-3 w-3" />

                  System Online

                </span>

              </div>

              {/* =================================================
                  3D ERROR ICON
              ================================================= */}
              <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">

                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/[0.055] blur-2xl" />

                {/* Outer ring */}
                <div className="absolute inset-1 rounded-full border border-blue-500/[0.12]" />

                {/* Middle ring */}
                <div className="absolute inset-4 rounded-full border border-cyan-500/[0.13]" />

                {/* Inner surface */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-500 shadow-[0_18px_45px_rgba(244,63,94,0.14)] dark:border-rose-500/20 dark:from-rose-500/10 dark:to-orange-500/10 dark:text-rose-400">

                  <div className="absolute inset-1 rounded-[1.4rem] border border-white/70 dark:border-white/10" />

                  <AlertTriangle className="relative h-9 w-9" />

                </div>

                {/* Orbit markers */}
                <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.55)]" />

                <div className="absolute bottom-2 right-0 h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.55)]" />

                <div className="absolute right-3 top-5 h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />

              </div>

              {/* =================================================
                  ERROR CODE
              ================================================= */}
              <div className="mb-3">

                <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                  HTTP RESPONSE / ROUTE NOT FOUND
                </span>

              </div>

              <h1 className="bg-gradient-to-r from-slate-950 via-blue-700 to-cyan-600 bg-clip-text text-7xl font-black tracking-[-0.08em] text-transparent dark:from-white dark:via-blue-400 dark:to-cyan-400 sm:text-8xl">
                404
              </h1>

              <h2 className="mt-4 text-xl font-black tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">
                Page Not Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[10px] leading-6 text-[var(--text-muted)] sm:text-xs">
                The requested route does not exist, may have been moved,
                or is currently unavailable within the SentinelAI interface.
              </p>

              {/* =================================================
                  SYSTEM DIAGNOSTIC STRIP
              ================================================= */}
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">

                <div className="border-r border-[var(--border)] px-3 py-3">

                  <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                    <Radar className="h-3.5 w-3.5" />
                  </div>

                  <p className="font-mono text-[7px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                    Route
                  </p>

                  <p className="mt-1 font-mono text-[8px] font-bold text-rose-500">
                    NOT FOUND
                  </p>

                </div>

                <div className="border-r border-[var(--border)] px-3 py-3">

                  <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>

                  <p className="font-mono text-[7px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                    Status
                  </p>

                  <p className="mt-1 font-mono text-[8px] font-bold text-amber-500">
                    404 ERROR
                  </p>

                </div>

                <div className="px-3 py-3">

                  <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Activity className="h-3.5 w-3.5" />
                  </div>

                  <p className="font-mono text-[7px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                    Core
                  </p>

                  <p className="mt-1 font-mono text-[8px] font-bold text-emerald-500">
                    ONLINE
                  </p>

                </div>

              </div>

              {/* =================================================
                  ACTION
              ================================================= */}
              <button
                onClick={() => navigate("/dashboard")}
                className="group mx-auto mt-8 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_16px_34px_rgba(37,99,235,0.27)]"
              >

                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />

                Back to Dashboard

                <Home className="h-3.5 w-3.5" />

              </button>

              {/* Footer Identifier */}
              <div className="mt-8 flex items-center justify-center gap-2">

                <span className="h-px w-10 bg-[var(--border)]" />

                <span className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                  SentinelAI Navigation Layer
                </span>

                <span className="h-px w-10 bg-[var(--border)]" />

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default NotFound;