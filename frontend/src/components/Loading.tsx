import React from "react";
import {
  RefreshCw,
  ShieldAlert,
  Activity,
  Wifi,
  AlertCircle,
} from "lucide-react";

interface LoadingProps {
  type?: "card" | "table" | "chart" | "full";
  count?: number;
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  type = "card",
  count = 4,
  fullScreen = false,
  message = "Syncing SOC Telemetry...",
}) => {
  /*
   * =========================================================
   * FULL SCREEN LOADING
   * =========================================================
   */

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--page-bg)]/85 px-6 backdrop-blur-xl">

        {/* Ambient background */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.07] blur-[100px]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--page-bg)_72%)]" />

        </div>

        {/* Loading Core */}

        <div className="relative flex flex-col items-center">

          <div className="relative flex h-20 w-20 items-center justify-center">

            {/* Outer ring */}

            <div className="absolute inset-0 rounded-full border border-blue-500/15" />

            <div className="absolute inset-1 rounded-full border border-dashed border-blue-500/25 animate-[spin_8s_linear_infinite]" />

            {/* Inner ring */}

            <div className="absolute inset-3 rounded-full border-2 border-slate-200 dark:border-slate-800" />

            <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-500 animate-spin" />

            {/* Icon */}

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.28)]">

              <Activity className="h-4 w-4" />

            </div>

          </div>

          {/* Status */}

          <div className="mt-7 flex items-center gap-2">

            <span className="relative flex h-1.5 w-1.5">

              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-50" />

              <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />

            </span>

            <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-primary)]">
              {message}
            </span>

          </div>

          <span className="mt-2 font-mono text-[7px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Establishing secure telemetry channel
          </span>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * CARD SKELETON
   * =========================================================
   */

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
          >

            {/* Shimmer */}

            <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[loadingShimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent dark:via-white/[0.025]" />

            <div className="relative space-y-4">

              <div className="flex items-center justify-between">

                <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />

                <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

              </div>

              <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

              <div className="h-2.5 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-2 pt-1">

                <div className="h-1.5 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

                <div className="h-1.5 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

              </div>

            </div>

          </div>
        ))}

      </div>
    );
  }

  /*
   * =========================================================
   * TABLE SKELETON
   * =========================================================
   */

  if (type === "table") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]">

        {/* Shimmer */}

        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[loadingShimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent dark:via-white/[0.025]" />

        <div className="relative space-y-5">

          {/* Header */}

          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">

            <div className="h-5 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />

            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

          </div>

          {/* Table Header */}

          <div className="hidden grid-cols-5 gap-4 px-3 sm:grid">

            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"
              />
            ))}

          </div>

          {/* Rows */}

          <div className="space-y-2.5">

            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid min-h-[52px] grid-cols-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 sm:grid-cols-5"
              >

                {Array.from({ length: 5 }).map((_, column) => (
                  <div
                    key={column}
                    className={`h-2.5 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${
                      column === 0
                        ? "w-24"
                        : column === 1
                        ? "w-32"
                        : column === 2
                        ? "w-20"
                        : column === 3
                        ? "w-24"
                        : "w-16"
                    }`}
                  />
                ))}

              </div>
            ))}

          </div>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * CHART SKELETON
   * =========================================================
   */

  if (type === "chart") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">

        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[loadingShimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent dark:via-white/[0.025]" />

        <div className="relative space-y-5">

          {/* Chart Header */}

          <div className="flex items-center justify-between">

            <div className="space-y-2">

              <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />

              <div className="h-2.5 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />

            </div>

            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

          </div>

          {/* Chart Area */}

          <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">

            {/* Grid */}

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Loader */}

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-500/[0.05]">

              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />

            </div>

          </div>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * DEFAULT / FULL CONTENT LOADING
   * =========================================================
   */

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-[var(--text-muted)]">

      <div className="relative flex h-14 w-14 items-center justify-center">

        <div className="absolute inset-0 rounded-2xl border border-blue-500/15" />

        <div className="absolute inset-0 rounded-2xl border border-transparent border-t-blue-500 animate-spin" />

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-500">

          <RefreshCw className="h-4 w-4 animate-spin" />

        </div>

      </div>

      <div className="text-center">

        <span className="block font-mono text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-primary)]">
          {message}
        </span>

        <span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          Processing security telemetry
        </span>

      </div>

    </div>
  );
};

/*
 * ===========================================================
 * ERROR STATE
 * ===========================================================
 */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Telemetry Synchronization Failed",
  message = "Unable to establish connection with the SentinelAI backend service.",
  onRetry,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] dark:border-rose-500/20 sm:p-8">

      {/* Ambient glow */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-rose-500/[0.07] blur-[70px]" />

      <div className="relative flex flex-col items-center text-center">

        {/* Icon */}

        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10">

          <div className="absolute inset-0 rounded-2xl border border-rose-500/10 animate-pulse" />

          <ShieldAlert className="relative h-6 w-6" />

        </div>

        {/* Status Label */}

        <div className="mb-2 flex items-center gap-2">

          <span className="relative flex h-1.5 w-1.5">

            <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-40" />

            <span className="relative h-1.5 w-1.5 rounded-full bg-rose-500" />

          </span>

          <span className="font-mono text-[7px] font-black uppercase tracking-[0.17em] text-rose-500">
            Connection Fault
          </span>

        </div>

        {/* Title */}

        <h3 className="max-w-xl text-base font-black tracking-[-0.02em] text-[var(--text-primary)] sm:text-lg">
          {title}
        </h3>

        {/* Message */}

        <p className="mt-2 max-w-md text-xs leading-5 text-[var(--text-muted)]">
          {message}
        </p>

        {/* Retry */}

        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="group mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-500 px-5 py-2.5 font-mono text-[8px] font-black uppercase tracking-[0.13em] text-white shadow-[0_10px_25px_rgba(225,29,72,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-[0_14px_30px_rgba(225,29,72,0.22)] focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:border-rose-400/20"
          >

            <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />

            <span>
              Retry Connection
            </span>

          </button>
        )}

        {/* Diagnostic Footer */}

        <div className="mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-4">

          <Wifi className="h-3 w-3 text-[var(--text-subtle)]" />

          <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            Backend telemetry channel unavailable
          </span>

        </div>

      </div>

    </div>
  );
};

export default Loading;