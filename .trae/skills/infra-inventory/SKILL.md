---
name: infra-inventory
description: Establish the factual state of a server or environment before changing it — host, kernel, CPU/RAM/disk, network, firewall, open ports, users, SSH, cron, systemd, Docker, containers, volumes, networks, reverse proxy, SSL, databases, git repositories and their dirty state, domains and service maps. Use when asked what runs on a server, what a project consists of, which services are broken or stale, what has uncommitted changes, before an audit or gap analysis, when onboarding a new host, or when any answer would otherwise be a guess about what exists. Triggers include "инвентаризация", "что запущено", "что есть на сервере", "audit", "какие контейнеры", "какие репозитории", "what is running".
---

# Infrastructure Inventory

## 1. Mission
Replace belief with observation. Every wrong infrastructure decision in this ecosystem so far
started with someone describing a system from documentation instead of from its running state.

## 2. Core definition
Enables an infrastructure agent to produce a complete, labelled factual inventory of a host or
environment, respecting read-only discipline and the evidence classification of
`xteam-control-center`, producing an inventory document that other work can be built on.

## 3. Scope
Host, containers, repositories, networks, domains, storage, scheduled work, access surface.
Read-only by construction. Does not fix, restart, commit, or clean anything — see
`xteam-control-center` §7 before any change follows from what is found.

## 4. Hard rules

- **Read-only.** Inventory never mutates. Do not `docker restart`, do not `git stash`, do not clean.
- **Never auto-commit a dirty working tree.** Record that it is dirty and what is in it. The dirt
  may be someone's unfinished work.
- **Never print secrets.** Environment variables are inventoried by *key*, never by value. For
  Kubernetes, secret *metadata* only. If a value appears in output, it must not reach a file or a
  report.
- **Label everything** FACT / INFERENCE / ASSUMPTION / UNKNOWN. A container that exists is a FACT;
  what it is for is often an ASSUMPTION until its config or repo is read.
- **Exited is not the same as broken.** Distinguish `Exited (0)` long ago (likely a one-shot or an
  abandoned experiment) from a restart loop (a live defect).

## 5. Procedure

Run `scripts/inventory.sh` for the mechanical sweep, then interpret. The script is deliberately
plain so its output can be diffed between runs and between hosts.

```bash
bash ~/.claude/skills/infra-inventory/scripts/inventory.sh > /tmp/inv-$(hostname).txt
```

### 5.1 Host
hostname, OS, kernel, CPU, RAM, swap, disks, filesystems, mounts, network interfaces, routes, DNS,
firewall, open ports with owning process, users, sudo, SSH config and keys, cron, systemd units.

### 5.2 Containers
For each container record:

```
name  image  image digest  tag  status/health  restarts  ports  volumes  network
restart policy  compose project  compose file  purpose  owning repository
```

Two questions the raw list does not answer, and that matter most:
- **Which compose project owns it?** `docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}'`
  — a container's name prefix lies; the label does not.
- **How old is the running image relative to the repo?** Compare `docker inspect -f '{{.Created}}'`
  on the image against the repo's last commit. A container "Up 5 weeks" on an image built before a
  month of commits is stale, and that is a P2 finding.

### 5.3 Repositories
For each repository:

```
project  path  remote  branch  HEAD sha  dirty(count)  last commit date
submodules  language  Dockerfile  compose  CI config  dependency manifest
```

Submodules need their own pass — a clean superproject can contain drifted submodules. Record each
submodule's branch, HEAD and whether it is behind its remote.

### 5.4 Service map
For each project, build the chain and stop at the first UNKNOWN rather than inventing links:

```
Component → Repository → Service → Container → Port → Domain
          → Dependencies → Database → External integration
```

### 5.5 Access surface
What this host can actually reach, tested rather than assumed:

```bash
# port reachability without a login attempt
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/HOST/PORT' && echo open || echo closed
# ssh: BatchMode so a missing key fails instead of prompting
timeout 8 ssh -o BatchMode=yes -o ConnectTimeout=5 user@HOST 'hostname'
```

Record for each remote environment: reachable / authenticated / unauthorised / unreachable. These
are four different states and only the first two are access.

## 6. Categorising a stack

Do not describe an architecture by its documentation. Walk these categories and mark each
present / absent / UNKNOWN with the evidence:

```
Frontend  Backend  Auth  Database  Cache  Queue  Knowledge Base  AI/LLM  Agents
Vector DB  Search  Storage  Analytics  Payments  Background jobs
Monitoring  Logging  Tracing  CI/CD  Networking  Reverse proxy  DNS  Kubernetes
External APIs
```

## 7. Output

Write to `docs/infrastructure/inventory.md` in the relevant repository, with a generation date and
the host it describes. An inventory without a date is worse than none — it will be trusted after it
has gone stale.

Structure:

```
# Inventory — <host> — <date>
## Host
## Containers            (table; group by compose project, not by name prefix)
## Repositories          (table; dirty state explicit)
## Networks and domains
## Storage and volumes
## Scheduled work
## Access surface
## Findings              (labelled, prioritised P0–P4)
## UNKNOWN               (what could not be established, and what access would establish it)
```

The `UNKNOWN` section is not an admission of failure — it is the input to the next access request.
