---
name: environment-drift
description: Compare Lab, Dev, Stage and Production factually and produce a drift report — commit SHA, branch, image tag and digest, dependency versions, migration head, environment config keys, feature flags, API versions, schemas and active services. Use when asked whether Dev matches Production, which version is deployed where, why a bug reproduces in one environment but not another, before promoting a release, when a fix "works on dev" but not in prod, or when planning parity work for a lab environment. Triggers include "drift", "расхождение", "какая версия на проде", "почему на деве работает", "parity", "какая разница между средами", "gap analysis".
---

# Environment Drift

## 1. Mission
Make "it works on dev" a checkable statement. Most cross-environment bugs in this ecosystem are not
code bugs — they are two environments quietly running different code, different migrations or
different config, with nobody able to state the difference.

## 2. Core definition
Enables an infrastructure agent to establish, per environment, the exact artifact that is running
and the config it runs under, and to express the differences as a prioritised drift report,
respecting the read-only and least-privilege rules of `production-access`.

## 3. Scope
Comparison across Lab ↔ Dev ↔ Stage ↔ Production; version and config provenance; gap analysis;
parity planning. Does not deploy or promote — a drift report is an input to the normal release
process, never a substitute for it.

## 4. The six dimensions

Drift is only meaningful per dimension. Comparing "the backend" tells you nothing; comparing these
does:

| Dimension | What identifies it | Why it drifts |
|---|---|---|
| **Code** | commit SHA, branch | environment built from a different branch or an old build |
| **Artifact** | image tag **and digest** | same tag rebuilt — the tag is not an identity |
| **Schema** | migration head revision | migration applied in one environment only |
| **Config** | env var *keys* present, feature flags | key added to one `.env` template only |
| **Dependencies** | lockfile hash, key package versions | image rebuilt at a different time |
| **Topology** | which services actually run | optional service enabled in one environment |

**The digest rule.** A tag is a moving pointer. Two environments both on `:dev` may run entirely
different code. Always resolve the digest:

```bash
docker inspect -f '{{index .RepoDigests 0}}' IMAGE          # local
kubectl get pod POD -o jsonpath='{.status.containerStatuses[*].imageID}'   # k8s
```

If a comparison reports "same tag, no drift" without digests, it has proved nothing.

## 5. Per-environment collection

The point of this section is that the *same six facts* are gathered by different means in each
environment. Collect all six or state UNKNOWN.

### Lab (local Docker)
```bash
git -C REPO rev-parse HEAD; git -C REPO rev-parse --abbrev-ref HEAD
docker inspect -f '{{.Config.Image}} {{index .RepoDigests 0}}' CONTAINER
docker exec CONTAINER alembic current 2>/dev/null            # schema head
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' CONTAINER | cut -d= -f1 | sort
```
Note the last line: keys only. Never dump env values into a report.

### Dev (VPS over SSH)
```bash
ssh dev 'docker ps --format "{{.Names}}\t{{.Image}}"'
ssh dev 'docker inspect -f "{{index .RepoDigests 0}}" CONTAINER'
ssh dev 'cd REPO && git rev-parse HEAD'
```

### Production (Kubernetes, read-only)
```bash
kubectl -n NS get deploy -o wide
kubectl -n NS get pod POD -o jsonpath='{.status.containerStatuses[*].imageID}'
kubectl -n NS get deploy DEPLOY -o jsonpath='{.metadata.annotations}'   # often carries the SHA
kubectl -n NS get cm,secret --no-headers | awk '{print $1}'             # names only, never values
```
Reading is safe; anything else is governed by `production-access`.

### When a running artifact carries no SHA
Common and worth fixing structurally: label images at build time with
`org.opencontainers.image.revision`. Until then, fall back to the registry tag's push time and the
repo's commit log for that window, and label the result INFERENCE, not FACT.

## 6. Drift report

```
Service: backend
  Lab      commit abc1234  image api-backend:dev     digest sha256:aaa…  migr c4d5e6f7a8b9
  Dev      commit def5678  image api-backend:dev     digest sha256:bbb…  migr c4d5e6f7a8b9
  Prod     commit ghi9012  image api-backend:1.8.3   digest sha256:ccc…  migr b3c4d5e6f7a8
  DRIFT    code: Lab is 14 commits ahead of Prod         P3
           artifact: Lab and Dev share a tag, differ by digest   P2
           schema: Prod is one migration behind          P1
```

Rate each drift, do not just list it:

| | Drift meaning |
|---|---|
| **P0** | Prod schema/config drift that risks data or availability |
| **P1** | Drift that makes a Production incident unreproducible |
| **P2** | Drift blocking development or testing |
| **P3** | Expected, benign version lead |

**Not all drift is a defect.** Lab ahead of Prod is normal and healthy. The finding is drift that is
*unexplained*, *undirectional* (Prod ahead of Dev), or *schema-level*.

## 7. Gap analysis table

For a full environment comparison, produce:

| Category | Lab | Dev | Prod | Drift | Risk |
|---|---|---|---|---|---|
| Backend | | | | | |
| Frontend | | | | | |
| DB | | | | | |
| Redis | | | | | |
| AI / LLM | | | | | |
| Knowledge Base | | | | | |
| Background jobs | | | | | |
| Monitoring | | | | | |
| CI/CD | | | | | |

Fill cells with the identifying fact (SHA, digest, version), never with "ok" or a checkmark.

## 8. Parity, honestly

The lab does not need to be a copy of Production. It needs to reproduce the properties a given
investigation depends on. Before parity work, name the property:

> To reproduce this bug the lab needs *the same migration head and the same feature flag* — not the
> same replica count, not the same node type, not production data.

Copying production data into the lab to "achieve parity" is forbidden by default — see
`production-access`. State which property is actually required and get only that.

Write results to `docs/studyninja/environment-drift.md` with a generation date.
