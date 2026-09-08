---
name: hot-development-lane
description: Mandatory global workflow for low-latency multi-agent development through the owner-controlled hot-dev lane. Use at the start of every coding, testing, repair, integration, preview, deployment or promotion task in an enrolled project, and when creating worktrees, checking Dev/Production drift, integrating agent commits, activating a live preview, or extracting a Draft PR.
---

# Hot Development Lane

## Scope and command source

The canonical manifest is `/root/StudyNinja-Eco/config/hot-development.yml`; the
controller is `xt-hot`. Only projects explicitly enrolled in that manifest use the
hot lane. Expansion requests mean active, non-archived repositories only and remain
subject to `no-archived-repositories`.

## Mandatory task-start barrier

Before reading code for implementation or creating/editing a task worktree, run:

```bash
xt-hot begin --project <project-id> --task <stable-task-id>
```

The command must observe exact active refs and actual configured Dev/Production
artifact identities, classify drift, and create a content-addressed sync epoch. It may
transfer code/artifact identifiers and non-secret structural metadata only. Apply
`no-production-data-publication`: never read or copy Production records, volumes,
objects, logs, telemetry, prompts, responses, weights, dumps or secrets.

If `xt-hot begin` returns `blocked`, do not edit from a stale or unclassified baseline.
Report the exact blocker and evidence path. Do not bypass it by using an existing
checkout, inventing a SHA, or asserting that a running container matches a branch.

The only bootstrap exception is a task whose sole purpose is to remove one of the
recorded publication/controller/branch blockers. It uses a new isolated
`bootstrap/<task-id>` worktree rooted at an exact SHA from the evidence record, changes
only blocker-remediation paths, performs no public push or runtime activation, and
reruns `xt-hot begin` afterward. It does not authorize ordinary feature development.

During staged rollout, `mode: observe-only` is expected. It proves drift but does not
claim that synchronization, branch creation or runtime activation happened.

## Agent isolation and integration

- Each task uses a distinct worktree and task branch rooted at the recorded hot SHA.
- Task agents never write the coordinator checkout and never receive GitHub/SSH owner
  credentials.
- Task agents commit coherent checkpoints locally and submit their exact commit SHA
  plus verification evidence to the single-writer coordinator.
- The coordinator serializes updates per repository. It never force-pushes and never
  chooses conflict sides automatically.
- A conflict gets a dedicated conflict worktree; unrelated active tasks and the
  last-known-good runtime remain unchanged.

The protected `hot-dev` branch accepts normal non-rewriting updates only as GitHub
user `AndrewHakmi`. It has no PR, review, required status, deployment or GitHub Actions
gate. Force-push and deletion remain blocked. This is the sole direct-push exception:
individual agents do not gain direct protected-branch authority.

## Public repository boundary

A public `hot-dev` push is an immediate publication. Before every new public hot
commit, apply `public-repository-policy`, `ip-publication-gate` and the local
publication scanner to the exact candidate. This local privacy/disclosure gate is
mandatory even though GitHub has no required checks on the branch.

Mixed-sensitivity work stays in a private core hot lane. Only a clean-history,
path-allowlisted export may enter a public research edition. Never use a branch inside
a public repository as a confidentiality boundary.

## Runtime contract

Task preview and active hot are separate:

- task preview uses reload/HMR and may temporarily fail;
- active hot uses an immutable SHA/digest candidate and switches only after declared
  readiness and smoke evidence;
- a failed candidate never replaces the last-known-good active slot;
- project containers use synthetic state, isolated volumes/networks, bounded resources
  and no host/runtime/owner credentials;
- Dev, Production and CI never depend on the laboratory host.

Do not claim deployment from a container name alone. Record source SHA, image digest,
revision label, health, readiness, route state and previous last-known-good identity.

## Completing a coherent block

When `xt-hot checkpoint` is available, freeze the selected task commits and evidence.
Promotion repeats drift observation, creates a fresh feature branch from the current
product integration ref, and replays only selected task commits. Never merge the whole
hot branch into development, release or Production.

The generated Draft PR includes base/hot/task SHAs, multi-repository dependencies,
local checks, runtime evidence, data-handling assertion, rollout and rollback. Normal
repository review and promotion rules resume at the Draft PR boundary.

## Output contract

Report:

- task-start epoch path and resulting baseline SHA, or exact blocker;
- worktree/task branch and submitted checkpoint SHA;
- local checks and preview/active revision evidence;
- GitHub Actions triggered by hot updates: always `none`;
- remote branch/settings/runtime changes, or `none`;
- publication/data/IP verdict for any public candidate;
- selected commits and fresh product base for any Draft PR.

Never finish with a statement of future action when a required controller/tool call
has not followed it.
