import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  downloadAlertsCsv,
  downloadIncidentPdf,
  downloadIncidentsCsv,
  downloadPredictionsCsv,
  downloadSecuritySummaryPdf,
  getIncidents,
} from '../services/api';

type ExportKey = 'alerts' | 'incidents' | 'predictions' | 'summary' | string;

export const Reports: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [busy, setBusy] = useState<ExportKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const data = await getIncidents(0, 20);
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Unable to load incidents for reporting', error);
      setIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  };

  useEffect(() => {
    void loadIncidents();
  }, []);

  const runDownload = async (key: ExportKey, action: () => Promise<void>, success: string) => {
    if (busy) return;
    setBusy(key);
    setMessage(null);
    try {
      await action();
      setMessage(success);
    } catch (error: any) {
      console.error('Report download failed', error);
      const detail = error?.response?.data?.detail || error?.message || 'Report generation failed.';
      setMessage(String(detail));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5 pb-10 text-[var(--text-primary)]">
      <section className="dashboard-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--brand)]">FedSentry / Reporting</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Security reports & exports</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Export operational datasets as CSV, generate an executive security PDF, or download a complete report for an individual incident.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Reports generated from live FedSentry records
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--text-muted)] shadow-[var(--shadow-xs)]">
          {message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExportCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Alerts CSV"
          description="Download the complete alert queue with severity, confidence, risk, network endpoints and status."
          busy={busy === 'alerts'}
          onClick={() => runDownload('alerts', downloadAlertsCsv, 'Alerts CSV downloaded.')}
        />
        <ExportCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Incidents CSV"
          description="Export incident ownership, state, severity, resolution and linked-alert identifiers for analysis."
          busy={busy === 'incidents'}
          onClick={() => runDownload('incidents', downloadIncidentsCsv, 'Incidents CSV downloaded.')}
        />
        <ExportCard
          icon={<Database className="h-5 w-5" />}
          title="Predictions CSV"
          description="Export inference history including model version, class, confidence, latency and network endpoints."
          busy={busy === 'predictions'}
          onClick={() => runDownload('predictions', downloadPredictionsCsv, 'Predictions CSV downloaded.')}
        />
        <ExportCard
          icon={<FileText className="h-5 w-5" />}
          title="Security summary PDF"
          description="Generate a professional SOC summary with current metrics, recent alerts and incident registry status."
          busy={busy === 'summary'}
          primary
          onClick={() => runDownload('summary', downloadSecuritySummaryPdf, 'Security summary PDF downloaded.')}
        />
      </section>

      <section className="dashboard-panel overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Individual incident reports</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Generate a PDF containing incident metadata, resolution and linked detection evidence.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadIncidents()}
            disabled={loadingIncidents}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingIncidents ? 'animate-spin' : ''}`} />
            Refresh registry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-[var(--surface-soft)] text-[var(--text-subtle)]">
              <tr>
                <th className="px-5 py-3">Incident</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => {
                const reportKey = `incident-${incident.id}`;
                return (
                  <tr key={String(incident.id)} className="border-t border-[var(--border-soft)]">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text-primary)]">{incident.title || 'Security incident'}</div>
                      <div className="mt-1 font-mono text-[10px] text-[var(--text-subtle)]">{String(incident.id)}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[var(--text-muted)]">{incident.severity || '—'}</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">{incident.status || '—'}</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {incident.created_at ? new Date(incident.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => runDownload(reportKey, () => downloadIncidentPdf(incident.id), `Incident ${incident.id} PDF downloaded.`)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2 text-[10px] font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
                      >
                        {busy === reportKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Download PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loadingIncidents && incidents.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--text-muted)]">No incidents are available yet. Create an incident first, then generate its report here.</td></tr>
              )}
              {loadingIncidents && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--text-muted)]"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading incident registry…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ExportCard = ({
  icon,
  title,
  description,
  busy,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  busy: boolean;
  onClick: () => void;
  primary?: boolean;
}) => (
  <div className="dashboard-panel flex min-h-[220px] flex-col p-5">
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${primary ? 'bg-[var(--brand)] text-white' : 'bg-[var(--brand-soft)] text-[var(--brand)]'}`}>{icon}</div>
    <h3 className="mt-5 text-base font-semibold">{title}</h3>
    <p className="mt-2 flex-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition disabled:opacity-50 ${primary ? 'bg-[var(--brand)] text-white hover:brightness-95' : 'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {busy ? 'Generating…' : 'Download'}
    </button>
  </div>
);

export default Reports;
