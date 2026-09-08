---
name: xteam-control-center
description: Governing doctrine for the XTeam.Pro Infrastructure & R&D Control Center — the autonomy rule (Lab observes Prod, Prod never depends on Lab), the Observe/Diagnose/Manage layering, evidence classification (FACT/INFERENCE/ASSUMPTION/UNKNOWN/RISK/ACTION), P0–P4 prioritisation, the pre-change checklist and the post-action report format. Use before any infrastructure decision, when adding a service to the lab, when centralising anything, when asked "should this live in the Control Center", when reporting the result of infra work, when prioritising infra problems, or when a proposal would make Dev/Prod/CI depend on this server. Triggers include "control center", "лаборатория", "централизовать", "инфраструктура", "архитектурный риск", "приоритет P0".
---

# XTeam.Pro Control Center

## 1. Mission
Build one engineering layer over the company's infrastructure without turning it into a single
point of failure. The failure mode this doctrine prevents is silent: a convenience added to the lab
quietly becomes load-bearing for Production, and nobody notices until the lab goes down.

## 2. Core definition
Enables an infrastructure agent to decide what belongs in the Control Center, in what order to work,
and how to report, respecting the autonomy rule and the evidence discipline, producing decisions
that name the rule applied and the facts that justified it.

## 3. Scope
Architecture of the lab; what to centralise; prioritisation of infra work; classification of
findings; pre-change safety analysis; reporting. Defers to `production-access` for anything touching
Production or credentials, to `infra-inventory` for establishing state, to `environment-drift` for
comparing environments, to `observability-ops` for metrics and logs, to `lab-to-pr` for code changes.

## 4. The autonomy rule

> **Centralized visibility. Distributed execution.**

Apply the deletion test to every proposal:

> If the Control Center were switched off or deleted right now, what breaks?

| Answer | Verdict |
|---|---|
| Dev, Prod, CI/CD, GitHub and the team workflow keep running; only dashboards, diagnostics, R&D and tooling are lost | **ALLOWED** |
| Any of Dev, Prod, CI/CD or the team's daily workflow stops or degrades | **ARCHITECTURAL RISK — redesign** |

Direction of dependency is the whole rule:

```
ALLOWED      Lab → Prod      Lab → Dev      Lab → GitHub      Lab → Monitoring
FORBIDDEN    Prod → Lab      Dev → Lab      CI/CD → Lab
```

Centralisable without risk: dashboards, aggregated monitoring, log search, tracing, error tracking,
infra maps, inventory, documentation, runbooks, environment comparison, deployment visibility,
alerts, incident investigation, AI agents, R&D, test environments, Git tooling, SSH/K8s contexts.

Not centralisable: anything a production request path would traverse, any secret store Prod reads
from at runtime, any registry Prod pulls from, any DNS or auth Prod resolves through.

A cross-check that catches most violations: if the lab hosts it and Prod *reads* it at runtime, it
is a violation regardless of how small it looks.

## 5. Evidence discipline

Never blur what is verified with what is guessed. Label every non-trivial claim:

| Label | Meaning | Bar |
|---|---|---|
| **FACT** | Directly observed | A command was run, its output read |
| **INFERENCE** | Logical conclusion from stated FACTs | The FACTs it rests on are named |
| **ASSUMPTION** | Plausible, unverified | Say what would verify it |
| **UNKNOWN** | Insufficient data | Say what access or command is missing |
| **RISK** | Architectural or operational exposure | Say the blast radius |
| **ACTION** | Recommended next step | Say the expected result |

Do not assume the existence of Kubernetes, Redis, Grafana, Prometheus, CI/CD, a database, VPN,
reverse proxy or monitoring until observed. Documentation mentioning a component is not evidence
that the component runs. A container named for a thing is evidence the container exists, not that
the thing works — check health, then behaviour.

When a claim is checkable, check it:

| Claim | Verify with |
|---|---|
| "the service works" | pod/container status, healthcheck, logs, metrics, real traffic |
| "the feature is used" | API traffic, analytics events, database rows, telemetry |
| "Dev matches Prod" | commit SHA, image digest, migration head, config, feature flags |

## 6. Priorities

Work in this order — do not skip forward:

```
1 Visibility  → 2 Observability → 3 Access → 4 Documentation
→ 5 Drift detection → 6 Reproducibility → 7 Automation → 8 Optimisation
```

Optimising an architecture that has not yet been measured is the most common wasted effort here.

Classify each finding:

| | Meaning |
|---|---|
| **P0** | Production at risk, security exposure, or data loss |
| **P1** | Serious infrastructure or observability defect |
| **P2** | Environment divergence blocking development or testing |
| **P3** | Developer experience, optimisation |
| **P4** | Experimental improvement |

## 7. Pre-change checklist

Answer all eight before changing anything, in writing when the change is not trivial:

```
What changes?            Why?
Expected result?         How will it be verified?
Blast radius?            Rollback path?
Impact on Dev?           Impact on Production?
```

Anything that touches a live system follows the fix-to-merge workflow — see `lab-to-pr` §4 for the
full sequence (investigate → reproduce → fix → test → PR). That skill stops at the PR; what happens
after merge continues through the team's existing pipeline (§11), which is what actually carries a
fix through Dev to Production. Never invert the order into "discover → rebuild everything": discovery
justifies measurement, not surgery.

## 8. Multi-project layout

The Control Center is a multi-project platform from the start — StudyNinja, ANU, MagicBrain,
xteam-agents, Balansis, UWT, and future client projects. Keep project infrastructure logically
separated:

```
projects/<project>/{lab,dev,stage,production}/
```

Never let one project's tooling become a hidden dependency of another's.

## 9. Reproducibility of the lab itself

The lab must not become an irreproducible snowflake. Target:

```
Fresh server + Git repositories + infrastructure config + secrets from secure storage
= restored Control Center
```

Anything that exists only as an undocumented hand-run command on this host is a RISK. Record it.

## 10. Report format

After substantive action, report in this shape. Omit obvious commands; keep what changes the
reader's understanding.

```
Что проверено
Что обнаружено
Что изменено
Почему
Как проверено
Какие риски остаются
Следующий рекомендуемый шаг
```

## 11. Team workflow is not to be rebuilt

The team's existing path — branch → commit → push → PR → CI → review → merge → Dev → Prod — stays.
The Control Center adds capability alongside it; it never becomes a mandatory intermediary. If a
proposal requires the team to change how they ship in order to use a lab feature, the feature is
wrong, not the team.

## 12. Known coordinates

Environments, as of the last inventory. `docs/infrastructure/inventory.md` is the source of truth;
this table is orientation only.

| Environment | Where | Kind |
|---|---|---|
| Lab / Control Center | this host | Docker Compose, multi-project |
| StudyNinja Dev | 188.94.155.20 (1cloud.ru) | plain VPS |
| StudyNinja Production | 85.208.85.154 (cloud.ru) | Kubernetes |

Re-verify before relying on any of it — see `infra-inventory`.
