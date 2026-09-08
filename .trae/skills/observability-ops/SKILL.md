---
name: observability-ops
description: Investigate the running behaviour of the ecosystem using metrics, logs and traces — infrastructure metrics (CPU, RAM, disk, network, containers, pods), application metrics (RPS, latency p50/p95/p99, error rate, status codes), database and Redis health, LLM cost and latency, and product telemetry. Use when asked why something is slow or failing, when investigating an incident, when a claim about service health needs verification, when deciding what to instrument, or when building dashboards and alerts. Triggers include "почему медленно", "инцидент", "latency", "p95", "error rate", "метрики", "логи", "мониторинг", "dashboard", "alert", "сколько стоят LLM".
---

# Observability Ops

## 1. Mission
Answer questions about running systems with measurements instead of theories. "Probably the
database" has cost this ecosystem more debugging hours than any actual database problem.

## 2. Core definition
Enables an infrastructure agent to investigate live behaviour across the lab, Dev and Production,
respecting the read-only default of `production-access`, producing conclusions that cite the metric,
log line or trace that supports them.

## 3. Scope
Metric and log investigation; incident triage; instrumentation gaps; dashboards and alerts. Does not
fix — a diagnosis hands off to `lab-to-pr` for a code fix or to `xteam-control-center` §7 for an
infrastructure change.

## 4. What exists in the lab

Verify before relying on it; this is orientation, not a guarantee.

| Component | Where | Notes |
|---|---|---|
| Prometheus | `localhost:9090` | scrapes infra exporters + app endpoints |
| Grafana | `localhost:3002` | authenticated |
| cAdvisor | container metrics | per-container CPU/memory/IO |
| node-exporter | host metrics | CPU, RAM, disk, network |
| postgres-exporter | `:9187` | connections, locks, size |
| redis-exporter | `:9121` | memory, hit rate, commands |
| Log aggregation | **absent** | logs are per-container `docker logs` only |
| Tracing | **absent** | no Jaeger/Tempo/OTel collector |
| Error tracking | **absent** | no Sentry |

Two structural gaps follow from that table and should be stated whenever they bite: **there is no
centralised log search and no distributed tracing**, so cross-service latency attribution is
manual, and log investigation does not survive a container being recreated.

Check target health before trusting a dashboard — a green dashboard over a down scrape target shows
nothing, not health:

```bash
curl -s localhost:9090/api/v1/targets | python3 -c "
import json,sys
for t in json.load(sys.stdin)['data']['activeTargets']:
    print(t['labels'].get('job'), t['health'], t.get('lastError',''))"
```

## 5. The "why is it slow" runbook

Work outside-in. Stop at the first layer that explains the magnitude of the symptom; do not collect
the whole list out of habit.

```
1 Scope      Everyone or one user? One endpoint or all? Since when?
2 Change     What deployed, migrated or changed config near that time?
3 Edge       Traefik/ingress latency and status codes — is the delay before the app?
4 App        p50/p95/p99 per endpoint, error rate, saturation of workers
5 Downstream DB (slow queries, locks, connections), Redis (hit rate, latency), queues (depth, lag)
6 External   LLM provider latency, third-party APIs, payment gateway
7 Host       CPU steal, memory pressure, disk IO wait, network
```

Step 2 is the highest-yield and the most often skipped. Most "sudden" slowness has a deployment,
a migration or a config change within the hour before it.

Distinguish the two shapes: **p50 up** means everything got slower (saturation, a dependency);
**p99 up with flat p50** means a subset is pathological (a slow query on a particular key, a cold
cache path, one bad pod). They have different causes and different fixes.

## 6. What to measure

| Layer | Signals |
|---|---|
| Infrastructure | CPU, RAM, disk, filesystem, network, load, containers, nodes, pods |
| Application | RPS, latency p50/p95/p99, error rate, HTTP status distribution, per-endpoint timing |
| Database | connections, query latency, slow queries, locks, size, replication lag |
| Redis | memory, commands/s, hit rate, connections, latency, evictions |
| Queues | depth, consumer lag, redelivery rate, dead letters |
| AI / LLM | requests, latency, token usage, cost, model, error and retry rate |
| Product | registrations, active users, lessons started/completed, conversions, failures |

The AI and Product rows are the ones usually missing, and the ones a founder actually asks about.
When they are absent, say so as an instrumentation gap rather than answering from the database.

## 7. Instrumentation gaps are findings

An application endpoint that Prometheus cannot scrape is not a monitoring inconvenience — it means
application latency and error rate **do not exist as data**. Report it that way:

```
FACT      Prometheus targets api-backend and kb-fastapi are down (connection refused on /metrics)
INFERENCE No application-level latency, RPS or error-rate data exists for either service
RISK      P1 — incidents in the two main services can only be investigated from raw container logs
ACTION    Expose /metrics (prometheus-fastapi-instrumentator) in both services via PR
```

## 8. Logs without aggregation

Until central logging exists, use the container as the unit and always bound the query by time:

```bash
docker logs --since 30m --timestamps CONTAINER 2>&1 | grep -iE 'error|exception|traceback|timeout'
docker logs --since 2h CONTAINER 2>&1 | grep -c ERROR          # rate, not anecdote
kubectl -n NS logs deploy/NAME --since=30m --all-containers     # production, read-only
```

One error line is an anecdote. A count per unit time, compared against the same window yesterday, is
evidence. Prefer the second.

## 9. Alerts

Alert on symptoms users feel, not on causes: error rate, latency SLO breach, queue backlog growth,
disk approaching full, certificate expiry, a service down. Alerting on CPU produces noise; alerting
on "p95 above target for 10 minutes" produces action.

Every alert needs a runbook entry saying what to check first. An alert without one trains people to
ignore it.

## 10. Autonomy still applies

Monitoring may be aggregated in the Control Center. Production must not depend on it: if the lab is
switched off, Production keeps serving and keeps its own local metrics retention. A monitoring
design where Prod pushes its only copy of metrics to the lab violates `xteam-control-center` §4.
