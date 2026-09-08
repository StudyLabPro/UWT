---
name: no-archived-repositories
description: Mandatory global policy that excludes archived repositories from discovery, search, analysis, plans, reports, GitHub operations, automation, and agent work unless the owner explicitly names the archived repository and requests a concrete action. Use for every repository inventory, organization-wide GitHub query, cross-project task, search, audit, migration, deployment, or governance operation.
---

# No Archived Repositories

## Hard rule

Treat archived repositories as outside the agent-visible working set.

- Do not mention or list them.
- Do not inspect their code, metadata, branches, issues, actions, settings, history, or deployment state.
- Do not include them in searches, inventories, counts, plans, reports, audits, bulk GitHub operations, migrations, rulesets, or deployments.
- Do not infer permission from phrases such as “all repositories”, “all projects”, “the whole organization”, or “global”. They always mean active, non-archived repositories only.
- Do not unarchive, transfer, delete, change visibility, or otherwise mutate them.

This rule applies even when an archived repository remains present in a local registry, filesystem, GitHub organization, cache, graph, or previous conversation context.

## Allowed exception

Proceed only when the owner explicitly:

1. names the exact archived repository; and
2. requests a concrete action involving it.

The exception covers only that repository and that action. It does not make other archived repositories visible or in scope. A generic request to work with archived repositories is insufficient unless the intended repositories are named.

## Discovery and tooling

Build the working set from active registry entries or server-side non-archived filters before reading repository details.

For GitHub organization/user listings, use a filter that omits archived repositories, for example:

```bash
gh repo list OWNER --no-archived
```

For GraphQL or REST automation, filter on the archive flag before returning, logging, counting, or dispatching any repository. If a tool cannot exclude archived results before exposure, do not use a broad query; call it only for an explicit active allowlist.

For filesystem and code search:

- search explicit active project roots;
- exclude directories marked as archived content;
- never run an unbounded repository scan from `/root` or an organization root;
- do not follow stale registry paths into excluded projects.

## Unknown status

When archive status is unknown, do not enumerate broadly and filter afterward. Use an API-side non-archived filter or an authoritative active-project allowlist. If neither exists, report that the active scope cannot be established without exposing excluded repositories and stop that part of the task.

## Output contract

Reports contain only active repositories. Do not add a section describing omitted repositories, their number, names, state, or reason for exclusion. State the active scope positively when scope matters.

## Definition of done

- Every repository read, search, GitHub call, mutation, plan item, and report entry belongs to the active non-archived working set.
- Broad GitHub discovery used server-side archive exclusion.
- No archived repository identifier or detail appears in user-visible output, logs intentionally emitted by the task, or downstream handoffs.
- Any exception is traceable to the owner’s explicit repository name and requested action.
