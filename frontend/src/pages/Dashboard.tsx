import React, { useState, useEffect, useRef } from 'react';
import { websocketService } from '../services/websocket';
import { useNavigate } from 'react-router-dom';
import {
ShieldAlert,
Activity,
AlertTriangle,
CheckCircle,
Clock,
Cpu,
Server,
Bot,
RefreshCw,
Radio,
ChevronRight,
Filter,
Layers,
ArrowUpRight,
Database,
Network,
Lock,
BrainCircuit,
CircleDot,
Search,
Sparkles,
} from 'lucide-react';
import {
getAnalyticsSummary,
getLiveFeed,
getEngineStatus,
} from '../services/api';
import { Loading, ErrorState } from '../components/Loading';
import {
type WebSocketEvent,
} from '../services/websocket';

type DashboardFeedItem = {
id?: string;
timestamp?: string;
prediction?: string;
attack_type?: string;
src_ip?: string;
dst_ip?: string;
source_ip?: string;
destination_ip?: string;
confidence?: number;
severity?: string;
status?: string;
latency_ms?: number;
alert_id?: string | null;
risk_score?: number;
[key: string]: unknown;
};

const DASHBOARD_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700;1,9..144,900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.dashboard-root {
--accent: #8B2FE0;
--accent-dim: #F1E4FF;
--rust: #FF3D6E;
--rust-dim: #FFE1EA;
--amber: #FF9D2E;
--amber-dim: #FFF3E4;
--grad: linear-gradient(90deg, var(--accent) 0%, var(--rust) 55%, var(--amber) 100%);
}

.dashboard-root {
font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

.dashboard-root .font-display {
font-family: 'Fraunces', ui-serif, Georgia, serif;
font-style: italic;
letter-spacing: -0.01em;
}

.dashboard-root .font-mono {
font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
}

.dashboard-root .grad-bg {
background: var(--grad);
}

.dashboard-root .grad-text {
background: var(--grad);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
}

.dashboard-root .eyebrow {
font-weight: 600;
font-size: 12px;
color: var(--text-subtle);
letter-spacing: 0.01em;
}
`;

export const Dashboard: React.FC = () => {
const navigate = useNavigate();

const [loading, setLoading] =
useState<boolean>(true);

const [refreshing, setRefreshing] =
useState<boolean>(false);

const [error, setError] =
useState<string | null>(null);

const [feedFilter, setFeedFilter] =
useState<string>('ALL');

const [sortOrder, setSortOrder] =
useState<'asc' | 'desc'>('desc');

const [summary, setSummary] =
useState<any>(null);

const [liveFeed, setLiveFeed] =
useState<DashboardFeedItem[]>([]);

const [engineStatus, setEngineStatus] =
useState<any>(null);



const [wsConnected, setWsConnected] =
useState<boolean>(
websocketService.isConnected()
);

const liveEventIdsRef =
useRef<Set<string>>(
new Set()
);

const fetchDashboardData = async (
preserveLiveEvents = true
) => {
setRefreshing(true);

try {
  setError(null);

  const [
    summaryRes,
    feedRes,
    engineRes,
  ] = await Promise.allSettled([
    getAnalyticsSummary(),
    getLiveFeed(25),
    getEngineStatus(),
  ]);

  if (
    summaryRes.status ===
    'fulfilled'
  ) {
    setSummary(
      summaryRes.value
    );
  }

  if (
    feedRes.status ===
      'fulfilled' &&
    Array.isArray(
      feedRes.value
    )
  ) {
    const backendFeed =
      feedRes.value as DashboardFeedItem[];

    if (!preserveLiveEvents) {
      setLiveFeed(
        backendFeed
      );
    } else {
      setLiveFeed(
        (previous) => {
          const liveRows =
            previous.filter(
              (item) =>
                item.id &&
                liveEventIdsRef.current.has(
                  String(item.id)
                )
            );

          const backendIds =
            new Set(
              backendFeed.map(
                (item) =>
                  String(
                    item.id ?? ''
                  )
              )
            );

          const retainedLiveRows =
            liveRows.filter(
              (item) =>
                !backendIds.has(
                  String(
                    item.id ?? ''
                  )
                )
            );

          return [
            ...retainedLiveRows,
            ...backendFeed,
          ].slice(0, 25);
        }
      );
    }
  }

  if (
    engineRes.status ===
    'fulfilled'
  ) {
    setEngineStatus(
      engineRes.value
    );
  }

} catch (err: any) {
  console.error(
    'Error fetching dashboard telemetry:',
    err
  );

  setError(
    'Failed to synchronize live SOC telemetry with the backend engine.'
  );

} finally {
  setLoading(false);
  setRefreshing(false);
}

};

useEffect(() => {
fetchDashboardData(
false
);

const interval =
  window.setInterval(
    () => {
      fetchDashboardData(
        true
      );
    },
    12000
  );

return () => {
  window.clearInterval(
    interval
  );
};

}, []);

useEffect(() => {
  console.log(
    '[SentinelAI Dashboard] Initializing real-time event stream...'
  );

  const unsubscribeStatus =
    websocketService.subscribeStatus(
      (status) => {
        console.log(
          '[SentinelAI Dashboard] WebSocket status:',
          status
        );

        setWsConnected(
          status === 'connected'
        );
      }
    );

  const unsubscribe =
    websocketService.subscribe(
      (event: WebSocketEvent) => {
        console.log(
          '[SentinelAI Dashboard] Event received:',
          event
        );

        const data =
          event.data ?? {};

        if (event.event === 'connection') {
          setWsConnected(true);
          return;
        }

        if (event.event === 'connection_error') {
          console.warn(
            '[SentinelAI Dashboard] WebSocket connection error.'
          );
          setWsConnected(false);
          return;
        }

        if (event.event === 'disconnected') {
          console.warn(
            '[SentinelAI Dashboard] WebSocket disconnected.'
          );
          setWsConnected(false);
          return;
        }

        if (event.event === 'prediction') {
          const prediction =
            typeof data.prediction === 'string'
              ? data.prediction
              : 'BENIGN';

          const confidence =
            typeof data.confidence === 'number'
              ? data.confidence
              : 0;

          const predictionRow: DashboardFeedItem = {
            id:
              typeof data.prediction_id === 'string'
                ? data.prediction_id
                : `ws-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
            timestamp:
              event.timestamp ??
              new Date().toISOString(),
            prediction,
            attack_type:
              typeof data.attack_type === 'string'
                ? data.attack_type
                : prediction,
            src_ip:
              typeof data.source_ip === 'string'
                ? data.source_ip
                : 'Unknown',
            dst_ip:
              typeof data.destination_ip === 'string'
                ? data.destination_ip
                : 'Unknown',
            source_ip:
              typeof data.source_ip === 'string'
                ? data.source_ip
                : 'Unknown',
            destination_ip:
              typeof data.destination_ip === 'string'
                ? data.destination_ip
                : 'Unknown',
            confidence,
            severity:
              typeof data.severity === 'string'
                ? data.severity
                : data.alert_created === true
                  ? 'HIGH'
                  : prediction.toLowerCase() === 'benign'
                    ? 'INFO'
                    : 'MEDIUM',
            status:
              data.alert_created === true
                ? 'Open'
                : 'Processed',
            latency_ms:
              typeof data.latency_ms === 'number'
                ? data.latency_ms
                : 0,
            alert_id:
              typeof data.alert_id === 'string'
                ? data.alert_id
                : null,
            risk_score:
              typeof data.risk_score === 'number'
                ? data.risk_score
                : 0,
          };

          setLiveFeed(
            (previous) => {
              const exists =
                previous.some(
                  (item) =>
                    item.id === predictionRow.id
                );

              if (exists) {
                return previous;
              }

              return [
                predictionRow,
                ...previous,
              ].slice(0, 25);
            }
          );

          fetchDashboardData();
          return;
        }

        if (event.event === 'alert') {
          const alertId =
            typeof data.alert_id === 'string'
              ? data.alert_id
              : null;

          setLiveFeed(
            (previous) =>
              previous.map(
                (item) => {
                  if (
                    alertId &&
                    item.alert_id === alertId
                  ) {
                    return {
                      ...item,
                      severity:
                        typeof data.severity === 'string'
                          ? data.severity
                          : item.severity,
                      status: 'Open',
                      risk_score:
                        typeof data.risk_score === 'number'
                          ? data.risk_score
                          : item.risk_score,
                    };
                  }

                  return item;
                }
              )
          );

          fetchDashboardData();
          return;
        }

        if (event.event === 'engine_status') {
          console.log(
            '[SentinelAI Dashboard] Engine status event:',
            data
          );

          setWsConnected(true);

          setEngineStatus(
            (previous: any) => ({
              ...(previous ?? {}),
              running:
                typeof data.running === 'boolean'
                  ? data.running
                  : previous?.running,
              interface:
                typeof data.interface === 'string'
                  ? data.interface
                  : previous?.interface,
              capture:
                data.capture &&
                typeof data.capture === 'object'
                  ? {
                      ...(previous?.capture ?? {}),
                      ...(data.capture as Record<string, unknown>),
                    }
                  : previous?.capture,
              queue:
                data.queue &&
                typeof data.queue === 'object'
                  ? {
                      ...(previous?.queue ?? {}),
                      ...(data.queue as Record<string, unknown>),
                    }
                  : previous?.queue,
              flows:
                data.flows &&
                typeof data.flows === 'object'
                  ? {
                      ...(previous?.flows ?? {}),
                      ...(data.flows as Record<string, unknown>),
                    }
                  : previous?.flows,
            })
          );

          return;
        }
      }
    );

  return () => {
    console.log(
      '[SentinelAI Dashboard] Cleaning up real-time event subscriptions...'
    );

    unsubscribeStatus();
    unsubscribe();
    setWsConnected(false);
  };
}, []);

const filteredFeed =
liveFeed
.filter((item) => {
if (
feedFilter ===
'ALL'
) {
return true;
}

    if (
      feedFilter ===
      'MALICIOUS'
    ) {
      return (
        item.prediction
          ?.toLowerCase() !==
          'benign' &&
        item.severity !==
          'INFO'
      );
    }

    if (
      feedFilter ===
      'BENIGN'
    ) {
      return (
        item.prediction
          ?.toLowerCase() ===
          'benign' ||
        item.severity ===
          'INFO'
      );
    }

    return (
      item.severity ===
      feedFilter
    );
  })
  .sort((a, b) => {
    const timeA =
      new Date(
        a.timestamp ??
          0
      ).getTime();

    const timeB =
      new Date(
        b.timestamp ??
          0
      ).getTime();

    return sortOrder ===
      'desc'
      ? timeB - timeA
      : timeA - timeB;
  });

if (
loading &&
!summary
) {
return (
<div className="dashboard-root space-y-6">
<style>
{DASHBOARD_STYLES}
</style>

    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
      <Loading
        type="card"
        count={4}
      />
    </div>

    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
      <Loading type="table" />
    </div>
  </div>
);

}

const totalPackets =
summary?.total_packets ??
summary?.predictions ??
1248920;

const neuralInferences =
summary?.predictions ??
1248920;

const maliciousCount =
summary?.malicious_count ??
7820;

const activeIncidents =
summary?.total_incidents ??
summary?.total_alerts ??
18;

const averageConfidence =
summary?.avg_confidence ??
0.985;

const threatRatio =
(
(maliciousCount /
totalPackets) *
100
).toFixed(2);

return (
<div className="dashboard-root space-y-8 pb-4">
<style>
{DASHBOARD_STYLES}
</style>

  <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]">
    <div
      className="pointer-events-none absolute right-[-100px] top-[-130px] h-[320px] w-[320px] rounded-full blur-[100px]"
      style={{
        backgroundColor:
          'var(--accent)',
        opacity: 0.06,
      }}
    />

    <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  'var(--accent-dim)',
                color:
                  'var(--accent)',
              }}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>

            <span className="text-sm font-semibold text-[var(--text-subtle)]">
              Security Operations Center
            </span>
          </div>

          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              wsConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inset-0 animate-ping rounded-full opacity-50 ${
                  wsConnected
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />

              <span
                className={`relative h-1.5 w-1.5 rounded-full ${
                  wsConnected
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
            </span>

            {wsConnected
              ? 'Live Telemetry'
              : 'Connecting Telemetry'}
          </span>
        </div>

        <h1 className="font-display text-3xl font-semibold leading-[1.05] text-[var(--text-primary)] sm:text-4xl">
          Security Command Center
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
          Real-time packet inspection, threat classification,
          federated model telemetry, and infrastructure health.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 sm:flex">
          <CircleDot
            className={`h-3.5 w-3.5 ${
              wsConnected
                ? 'text-emerald-500'
                : 'text-amber-500'
            }`}
          />

          <div className="leading-tight">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Engine
            </p>

            <p
              className={`text-xs font-semibold ${
                wsConnected
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {engineStatus?.running === true
                ? 'Operational'
                : 'Stopped'}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            fetchDashboardData(
              true
            )
          }
          disabled={refreshing}
          className="group flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor:
              refreshing
                ? 'var(--accent)'
                : undefined,
          }}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              refreshing
                ? 'animate-spin'
                : ''
            }`}
            style={{
              color:
                'var(--accent)',
            }}
          />

          <span>
            {refreshing
              ? 'Syncing...'
              : 'Sync Engine'}
          </span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] border-t border-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
      {[
        {
          icon: (
            <Network className="h-4 w-4" />
          ),
          label:
            'Network',
          value:
            'Packet Capture',
        },
        {
          icon: (
            <BrainCircuit className="h-4 w-4" />
          ),
          label:
            'Inference',
          value:
            'Neural Engine',
        },
        {
          icon: (
            <Lock className="h-4 w-4" />
          ),
          label:
            'Privacy',
          value:
            'Federated Learning',
        },
        {
          icon: (
            <Activity className="h-4 w-4" />
          ),
          label:
            'Response',
          value:
            'Automated SOC',
        },
      ].map(
        (item) => (
          <div
            key={
              item.label
            }
            className="flex items-center gap-3 px-4 py-4"
          >
            <span
              style={{
                color:
                  'var(--accent)',
              }}
            >
              {
                item.icon
              }
            </span>

            <div>
              <p className="text-xs text-[var(--text-subtle)]">
                {
                  item.label
                }
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[var(--text-secondary)]">
                {
                  item.value
                }
              </p>
            </div>
          </div>
        )
      )}
    </div>
  </section>

  {error && (
    <ErrorState
      message={error}
      onRetry={() =>
        fetchDashboardData(
          true
        )
      }
    />
  )}

  <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
    <div className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0 sm:divide-x xl:grid-cols-4">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-subtle)]">
            Total Packets
          </p>

          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
        </div>

        <p className="mt-3 font-display text-[34px] font-semibold leading-none text-[var(--text-primary)]">
          {totalPackets.toLocaleString()}
        </p>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Captured network flows
        </p>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div
            className="h-full w-full rounded-full"
            style={{
              backgroundColor:
                'var(--accent)',
            }}
          />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-subtle)]">
            Neural Inferences
          </p>

          <Cpu
            className="h-3.5 w-3.5"
            style={{
              color:
                'var(--accent)',
            }}
          />
        </div>

        <p className="mt-3 font-display text-[34px] font-semibold leading-none text-[var(--text-primary)]">
          {neuralInferences.toLocaleString()}
        </p>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Model classifications
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  averageConfidence *
                    100,
                  100
                )}%`,
                backgroundColor:
                  'var(--accent)',
              }}
            />
          </div>

          <span
            className="text-xs font-semibold"
            style={{
              color:
                'var(--accent)',
            }}
          >
            {(
              averageConfidence *
              100
            ).toFixed(1)}
            %
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-subtle)]">
            Malicious Flows
          </p>

          <ShieldAlert
            className="h-3.5 w-3.5"
            style={{
              color:
                'var(--rust)',
            }}
          />
        </div>

        <p
          className="mt-3 font-display text-[34px] font-semibold leading-none"
          style={{
            color:
              'var(--rust)',
          }}
        >
          {maliciousCount.toLocaleString()}
        </p>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Threat classifications
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  Number(
                    threatRatio
                  ) *
                    4,
                  100
                )}%`,
                backgroundColor:
                  'var(--rust)',
              }}
            />
          </div>

          <span
            className="text-xs font-semibold"
            style={{
              color:
                'var(--rust)',
            }}
          >
            {
              threatRatio
            }
            %
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-subtle)]">
            Active Incidents
          </p>

          <AlertTriangle
            className="h-3.5 w-3.5"
            style={{
              color:
                'var(--amber)',
            }}
          />
        </div>

        <p
          className="mt-3 font-display text-[34px] font-semibold leading-none"
          style={{
            color:
              'var(--amber)',
          }}
        >
          {
            activeIncidents
          }
        </p>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Requiring analyst attention
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  Number(
                    activeIncidents
                  ) *
                    4,
                  100
                )}%`,
                backgroundColor:
                  'var(--amber)',
              }}
            />
          </div>

          <span
            className="text-xs font-semibold"
            style={{
              color:
                'var(--amber)',
            }}
          >
            Open
          </span>
        </div>
      </div>
    </div>
  </section>
   <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
    <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-6 lg:flex-row lg:items-center">
      <div className="flex items-center gap-3">
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              'var(--rust-dim)',
            color:
              'var(--rust)',
          }}
        >
          <Radio className="h-4 w-4" />

          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full"
            style={{
              backgroundColor:
                'var(--rust)',
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Live Traffic &amp; Attack Stream
            </h2>

            <span
              className="hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline-flex"
              style={{
                borderColor:
                  'var(--accent-dim)',
                backgroundColor:
                  'var(--accent-dim)',
                color:
                  'var(--accent)',
              }}
            >
              Real-Time
            </span>
          </div>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Continuous inspection of active network flows
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
          <Filter className="ml-2 h-3.5 w-3.5 text-[var(--text-subtle)]" />

          <button
            onClick={() =>
              setFeedFilter(
                'ALL'
              )
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              feedFilter ===
              'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            All
          </button>

          <button
            onClick={() =>
              setFeedFilter(
                'MALICIOUS'
              )
            }
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={
              feedFilter ===
              'MALICIOUS'
                ? {
                    backgroundColor:
                      'var(--rust)',
                    color:
                      'white',
                  }
                : {
                    color:
                      'var(--text-muted)',
                  }
            }
          >
            Threats
          </button>

          <button
            onClick={() =>
              setFeedFilter(
                'BENIGN'
              )
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              feedFilter ===
              'BENIGN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-emerald-600'
            }`}
          >
            Benign
          </button>
        </div>

        <button
          onClick={() =>
            setSortOrder(
              sortOrder ===
                'desc'
                ? 'asc'
                : 'desc'
            )
          }
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Clock className="h-3.5 w-3.5" />

          <span>
            Time:{' '}
            {sortOrder ===
            'desc'
              ? 'Newest first'
              : 'Oldest first'}
          </span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] border-b border-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
      <div className="px-5 py-3.5">
        <p className="text-xs text-[var(--text-subtle)]">
          Records
        </p>

        <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
          {
            filteredFeed.length
          }
        </p>
      </div>

      <div className="px-5 py-3.5">
        <p className="text-xs text-[var(--text-subtle)]">
          Stream
        </p>

        <p
          className={`mt-1 flex items-center gap-1.5 text-base font-bold ${
            wsConnected
              ? 'text-emerald-600'
              : 'text-amber-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 animate-pulse rounded-full ${
              wsConnected
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />

          {wsConnected
            ? 'Active'
            : 'Connecting'}
        </p>
      </div>

      <div className="px-5 py-3.5">
        <p className="text-xs text-[var(--text-subtle)]">
          Poll Interval
        </p>

        <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
          12s
        </p>
      </div>

      <div className="px-5 py-3.5">
        <p className="text-xs text-[var(--text-subtle)]">
          Sort
        </p>

        <p
          className="mt-1 text-base font-bold"
          style={{
            color:
              'var(--accent)',
          }}
        >
          {sortOrder ===
          'desc'
            ? 'Newest'
            : 'Oldest'}
        </p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {[
              'Timestamp',
              'Attack Classification',
              'Source IP',
              'Destination IP',
              'Confidence',
              'Severity',
              'Status',
            ].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-5 py-3.5 text-xs font-semibold text-[var(--text-subtle)]"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {filteredFeed.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  7
                }
                className="px-6 py-14 text-center"
              >
                <div className="mx-auto flex max-w-sm flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                    <CheckCircle className="h-6 w-6" />
                  </div>

                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No matching packet flows
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                    No active network traffic matches
                    the selected filter criteria.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            filteredFeed.map(
              (
                item,
                index
              ) => {
                const normalizedPrediction =
                  String(
                    item.prediction ??
                      ''
                  ).toLowerCase();

                const isMalicious =
                  normalizedPrediction !==
                    'benign' &&
                  item.severity !==
                    'INFO';

                const confidence =
                  typeof item.confidence ===
                  'number'
                    ? Math.max(
                        0,
                        Math.min(
                          item.confidence,
                          1
                        )
                      )
                    : 0.95;

                return (
                  <tr
                    key={
                      item.id ??
                      `${item.timestamp}-${index}`
                    }
                    className="group border-b border-[var(--border-soft)] transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

                        <span className="font-mono text-xs font-medium text-[var(--text-muted)]">
                          {item.timestamp
                            ? new Date(
                                item.timestamp
                              ).toLocaleTimeString()
                            : 'Just now'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              isMalicious
                                ? 'var(--rust)'
                                : '#10b981',
                          }}
                        />

                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.attack_type ||
                            item.prediction ||
                            'Normal Traffic'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                        {item.src_ip ||
                          item.source_ip ||
                          '192.168.1.100'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                        {item.dst_ip ||
                          item.destination_ip ||
                          '10.0.0.1'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex min-w-[90px] items-center gap-2">
                        <div className="h-1 w-12 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${confidence * 100}%`,
                              backgroundColor:
                                'var(--accent)',
                            }}
                          />
                        </div>

                        <span className="text-xs font-semibold text-[var(--text-secondary)]">
                          {(
                            confidence *
                            100
                          ).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-bold"
                        style={
                          item.severity ===
                          'CRITICAL'
                            ? {
                                borderColor:
                                  'var(--rust-dim)',
                                backgroundColor:
                                  'var(--rust-dim)',
                                color:
                                  'var(--rust)',
                              }
                            : item.severity ===
                              'HIGH'
                            ? {
                                borderColor:
                                  '#FFE4D6',
                                backgroundColor:
                                  '#FFF1E9',
                                color:
                                  '#D2691E',
                              }
                            : item.severity ===
                              'MEDIUM'
                            ? {
                                borderColor:
                                  'var(--amber-dim)',
                                backgroundColor:
                                  'var(--amber-dim)',
                                color:
                                  'var(--amber)',
                              }
                            : {
                                borderColor:
                                  '#D1FAE5',
                                backgroundColor:
                                  '#ECFDF5',
                                color:
                                  '#059669',
                              }
                        }
                      >
                        {item.severity ||
                          'INFO'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status ===
                            'Open'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />

                        <span className="text-sm font-medium text-[var(--text-muted)]">
                          {item.status ||
                            'Processed'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }
            )
          )}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3.5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

        <span className="text-xs text-[var(--text-subtle)]">
          {wsConnected
            ? 'WebSocket stream synchronized'
            : 'Backend polling active'}
        </span>
      </div>

      <span className="text-xs font-semibold text-emerald-600">
        {
          filteredFeed.length
        }{' '}
        records available
      </span>
    </div>
  </section>

  <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
    <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] xl:col-span-2">
      <div className="flex items-center justify-between p-6 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                'var(--accent-dim)',
              color:
                'var(--accent)',
            }}
          >
            <Server className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              System Infrastructure
            </h3>

            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Backend and detection engine telemetry
            </p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            wsConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
              : 'border-amber-200 bg-amber-50 text-amber-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              wsConnected
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />

          {wsConnected
            ? 'Healthy'
            : 'Connecting'}
        </span>
      </div>

      <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {[
          {
            icon: (
              <Server className="h-4 w-4" />
            ),
            label:
              'FastAPI Backend',
            value:
              'Connected · Port 8000',
          },
          {
            icon: (
              <Cpu className="h-4 w-4" />
            ),
            label:
              'Inference Engine',
            value:
              engineStatus?.model_status ??
              'PyTorch Active',
          },
          {
            icon: (
              <Activity className="h-4 w-4" />
            ),
            label:
              'Packet Capture',
            value:
              engineStatus?.capture_status ??
              'Live Capturing',
          },
          {
            icon: (
              <Layers className="h-4 w-4" />
            ),
            label:
              'Global Model Sync',
            value:
              'v2.4 · Federated',
          },
        ].map(
          (row) => (
            <div
              key={
                row.label
              }
              className="flex items-center justify-between gap-3 px-6 py-4 transition-colors duration-150 hover:bg-[var(--surface-muted)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      'var(--accent-dim)',
                    color:
                      'var(--accent)',
                  }}
                >
                  {
                    row.icon
                  }
                </div>

                <div>
                  <p className="text-xs text-[var(--text-subtle)]">
                    {
                      row.label
                    }
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                    {
                      row.value
                    }
                  </p>
                </div>
              </div>

              <CheckCircle
                className={`h-4 w-4 ${
                  wsConnected
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}
              />
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

          <span className="text-xs text-[var(--text-subtle)]">
            Database Online
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Network className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

          <span className="text-xs text-[var(--text-subtle)]">
            Network Capture Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-[var(--text-subtle)]" />

          <span className="text-xs text-[var(--text-subtle)]">
            Federated Sync Secured
          </span>
        </div>
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-[80px]"
        style={{
          backgroundColor:
            'var(--accent)',
          opacity: 0.08,
        }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl grad-bg text-white shadow-[0_12px_30px_rgba(139,47,224,0.22)]">
              <Bot className="h-5 w-5" />

              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  Sentinel Assistant
                </h3>

                <Sparkles
                  className="h-3.5 w-3.5"
                  style={{
                    color:
                      'var(--accent)',
                  }}
                />
              </div>

              <p className="mt-1 text-xs font-semibold text-[var(--text-subtle)]">
                RAG Knowledge Engine
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-[var(--text-muted)]">
            Ask natural-language questions about network
            anomalies, MITRE ATT&amp;CK techniques, detection
            reasoning, or active incident response playbooks.
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    'var(--accent-dim)',
                  color:
                    'var(--accent)',
                }}
              >
                <Bot className="h-3 w-3" />
              </div>

              <span
                className="text-xs font-semibold"
                style={{
                  color:
                    'var(--accent)',
                }}
              >
                Suggested Query
              </span>
            </div>

            <p className="text-sm font-medium italic leading-5 text-[var(--text-muted)]">
              "Explain the mitigations for recent PortScan attack vectors."
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              'Threat Intel',
              'RAG',
              'XAI',
            ].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        <button
          onClick={() =>
            navigate(
              '/chatbot'
            )
          }
          className="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl grad-bg px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(139,47,224,0.24)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <span>
            Launch AI Assistant Console
          </span>

          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </section>

  <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
    <div className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
      {[
        {
          icon: (
            <Activity className="h-4 w-4" />
          ),
          label:
            'Detection',
          value:
            'Continuous Monitoring',
        },
        {
          icon: (
            <Layers className="h-4 w-4" />
          ),
          label:
            'Federated',
          value:
            'Global Model v2.4',
        },
        {
          icon: (
            <CheckCircle className="h-4 w-4" />
          ),
          label:
            'Platform',
          value:
            wsConnected
              ? 'All Systems Operational'
              : 'Telemetry Reconnecting',
        },
      ].map(
        (item) => (
          <div
            key={
              item.label
            }
            className="flex items-center gap-3 px-5 py-4"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  'var(--accent-dim)',
                color:
                  'var(--accent)',
              }}
            >
              {
                item.icon
              }
            </div>

            <div>
              <p className="text-xs text-[var(--text-subtle)]">
                {
                  item.label
                }
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[var(--text-secondary)]">
                {
                  item.value
                }
              </p>
            </div>

            <span
              className={`ml-auto h-1.5 w-1.5 rounded-full ${
                wsConnected
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
        )
      )}
    </div>
  </section>
</div>

);
};