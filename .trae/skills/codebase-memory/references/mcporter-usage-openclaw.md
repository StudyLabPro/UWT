---
name: codebase-memory
description: Work with the local Codebase Memory MCP server (graph index of the repo). Use it to index repositories, explore architecture, trace calls, search symbols, and surface diffs via `mcporter`.
---

# Codebase Memory MCP Skill

This skill exposes the locally running `codebase-memory-mcp` server through `mcporter` (stdio transport). Use it whenever you need deep knowledge-graph insight on the StudyNinja/XTeam repos.

## Prerequisites
- Configured server name: `codebase-memory` (defined in `/root/.openclaw/workspace/config/mcporter.json`).
- Command path: `/root/.local/bin/codebase-memory-mcp`.
- Indexed projects (run `list_projects` to inspect). Today these exist:
  - `root-StudyNinja-Eco`
  - `root-StudyNinja-Eco-projects-Balansis`
  - `root-StudyNinja-Eco-projects-UWT`
  - `root-xteam-pro-site`

## Quick Commands
> Always run from workspace root (`/root/.openclaw/workspace`) so mcporter picks the project config.

- List indexed projects:
  ```bash
  mcporter call --output json codebase-memory.list_projects
  ```
- Search graph (natural-language or regex labels):
  ```bash
  mcporter call --output json codebase-memory.search_graph \
    --args '{"project":"root-StudyNinja-Eco","query":"checkout flow"}'
  ```
- Regex/grep-style search enriched by graph:
  ```bash
  mcporter call --output json codebase-memory.search_code \
    --args '{"project":"root-StudyNinja-Eco","pattern":"class StudyPlan","limit":25}'
  ```
- Read source for a qualified name (get this from `search_graph` results):
  ```bash
  mcporter call --output json codebase-memory.get_code_snippet \
    --args '{"project":"root-StudyNinja-Eco","qualified_name":"apps.dashboard.handlers.getStudyPlan"}'
  ```
- Trace callers/callees/data-flow:
  ```bash
  mcporter call --output json codebase-memory.trace_path \
    --args '{"project":"root-StudyNinja-Eco","function_name":"services.payment.createInvoice","direction":"both","depth":4}'
  ```
- Diff detector / impact report:
  ```bash
  mcporter call --output json codebase-memory.detect_changes \
    --args '{"project":"root-StudyNinja-Eco","since":"HEAD~5"}'
  ```
- Architecture summary (pick aspects you need):
  ```bash
  mcporter call --output json codebase-memory.get_architecture \
    --args '{"project":"root-StudyNinja-Eco","aspects":["overview","clusters"]}'
  ```

## Indexing / Refreshing Graphs
Use when repo changed massively or a new project needs indexing.
```bash
mcporter call --output json codebase-memory.index_repository \
  --args '{"repo_path":"/root/StudyNinja-Eco","mode":"moderate"}'
```
- Modes: `full` (all files + semantic edges), `moderate` (filtered files + semantic), `fast` (filtered, no semantic), `cross-repo-intelligence` (requires `target_projects`).
- Artifacts land under `.codebase-memory/` inside the repo when `persistence:true`.

Check status:
```bash
mcporter call --output json codebase-memory.index_status \
  --args '{"project":"root-StudyNinja-Eco"}'
```

## Typical Workflow
1. **Discover**: `search_graph` (natural query) → optionally `semantic_query` array for vector search.
2. **Inspect**: capture `qualified_name` from hits → `get_code_snippet` to read source.
3. **Trace**: `trace_path` for callers, `mode":"data_flow"` to follow value propagation, or `mode":"cross_service"` for route/async hops.
4. **Reason about structure**: `get_architecture` (clusters, dependencies, hotspots) or `query_graph` with Cypher for custom analytics.
5. **Communicate Diffs**: `detect_changes` to summarize impact vs another ref.
6. **Maintain ADRs**: `manage_adr` get/update design decisions from the knowledge graph store.

## Query Tips
- Always pass `project` explicitly.
- Pagination: `search_graph` returns `total` + `has_more`; page by re-calling with higher `offset`.
- `search_code` has `limit` only (no offset) — increase limit or narrow `file_pattern`.
- For `trace_path`, default depth=3; increase for broader traversal but expect larger payloads.
- `query_graph` runs straight Cypher; keep row counts reasonable (100k hard cap) and add `LIMIT` for wide queries.

## Troubleshooting
- **"project required"**: call `list_projects` to confirm name; indexes must exist.
- **Large payloads**: add `limit`, `offset`, or `file_pattern` to keep responses manageable.
- **Stale graph**: rerun `index_repository` or `detect_changes` (which auto-refreshes necessary subgraphs).
- **Server missing**: ensure `/root/.local/bin/codebase-memory-mcp` exists and `mcporter config list` shows `codebase-memory`.

Use this skill whenever you need inter-file understanding, architecture context, call graphs, or cross-service traces beyond what grep provides.
