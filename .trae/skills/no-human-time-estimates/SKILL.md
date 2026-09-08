---
name: no-human-time-estimates
description: >-
  Mandatory global rule that forbids human time estimates in any plan, spec (ТЗ),
  roadmap, or development/testing estimate. No person-hours, days, weeks, months,
  sprints, team deadlines, or ETAs. Use whenever writing or reviewing a plan, spec,
  roadmap, estimate, task breakdown, or any description of how code/app work will be
  carried out. The ecosystem is built by multi-agent systems, so work is described
  through phases, dependencies, sequential/parallel execution, transition conditions,
  completion criteria, reversible/irreversible actions, and blocking/non-blocking
  tasks — never calendar time. Overrides any default instinct to give a time estimate.
---

# No Human Time Estimates (agent-native planning)

Mandatory global rule for every agent, in every project. It OVERRIDES any default
tendency to estimate work in human calendar time.

## Rule

For any plan, spec (ТЗ), roadmap, development/testing estimate, or any other action
involving code or applications, it is **forbidden** to use human time units:
person-hours, days, weeks, months, sprints, team deadlines, "ETA", "how long it
takes", and the like.

## Describe work this way instead

The ecosystem is built by multi-agent systems. Always describe work through:

- **phases and stages**
- **dependencies** (what depends on what)
- **sequential vs parallel execution**
- **transition conditions between stages** (what must be true to start the next stage)
- **completion criteria** (checkable, per stage)
- **reversible vs irreversible actions** (irreversible ones require explicit owner
  confirmation)
- **blocking vs non-blocking tasks** (blocking hold the phase; non-blocking run alongside)

Do **not** transfer human project-management models (calendars, capacity, velocity,
story points as time) onto the agent environment.

## Only exception

If a specific task is explicitly assigned to a **human**, that will be stated
explicitly — only then are human time estimates allowed, and only for that task.
