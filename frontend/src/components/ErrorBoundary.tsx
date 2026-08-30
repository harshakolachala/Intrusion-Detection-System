import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  Terminal,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors thrown by any page rendered inside the layout so a
 * single broken page (e.g. Dashboard) can't blank out the whole app.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(
    error: Error
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ): void {
    console.error(
      "Unhandled UI error:",
      error,
      info.componentStack
    );
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--page-bg)] px-5 py-10 text-[var(--text-primary)] transition-colors duration-200 sm:px-8">
          {/* Ambient background */}

          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/[0.05] blur-[120px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--page-bg)_78%)]" />
          </div>

          <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center">
            <div className="w-full max-w-xl">
              {/* Error Card */}

              <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
                {/* Top status strip */}

                <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />

                <div className="p-6 sm:p-8">
                  {/* Header */}

                  <div className="flex items-start gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10">
                      <div className="absolute inset-0 rounded-2xl border border-rose-500/20 animate-pulse" />

                      <ShieldAlert className="relative h-7 w-7" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-50" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-rose-500" />
                        </span>

                        <span className="font-mono text-[8px] font-black uppercase tracking-[0.18em] text-rose-500">
                          UI Runtime Fault
                        </span>
                      </div>

                      <h1 className="text-xl font-black tracking-[-0.025em] text-[var(--text-primary)] sm:text-2xl">
                        Something went wrong
                      </h1>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        The security console encountered an unexpected rendering error.
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic message */}

                  <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-3.5 w-3.5 text-[var(--text-muted)]" />

                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Runtime Diagnostic
                        </span>
                      </div>

                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    </div>

                    <div className="p-4">
                      <p className="break-words font-mono text-[10px] leading-5 text-[var(--text-secondary)]">
                        {this.state.error?.message ??
                          "An unexpected error occurred while rendering this page."}
                      </p>
                    </div>
                  </div>

                  {/* Recovery actions */}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={this.handleReset}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 font-mono text-[9px] font-black uppercase tracking-[0.13em] text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_14px_32px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

                      <span>
                        Back to Dashboard
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-3 font-mono text-[9px] font-black uppercase tracking-[0.13em] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />

                      <span>
                        Reload Console
                      </span>
                    </button>
                  </div>

                  {/* Footer status */}

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

                      <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                        Rendering halted
                      </span>
                    </div>

                    <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                      SentinelAI Security Console
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}