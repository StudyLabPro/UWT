# Artifact Templates

Copy-ready structures for every output. Fill them; do not restate the template's own guidance in
the produced artifact.

## Contents
- [SKILL.md](#skillmd) — the 31-section executable skill
- [knowledge-units.yaml](#knowledge-unitsyaml)
- [knowledge-map.md](#knowledge-mapmd)
- [decision-rules.md](#decision-rulesmd)
- [source-ledger.md](#source-ledgermd)
- [test-cases.yaml](#test-casesyaml)
- [knowledge-gaps.md](#knowledge-gapsmd)
- [change-log.md](#change-logmd)
- [agent-manifest.yaml](#agent-manifestyaml)

---

## SKILL.md

Sections 1–13 are mandatory in every compiled skill. The rest are included when the domain calls
for them; note the omissions in `knowledge-gaps.md`. Body length and the references/ split: see
`skill-creator` (canonical).

```markdown
---
name: <kebab-case-name>
description: <what the agent can do with it, plus explicit trigger phrases and contexts>
---

# <Skill Title>

## 1. Mission
One paragraph: what this skill makes an agent capable of.

## 2. Core definition
The frame sentence: enables [agent] to perform [task class] in [domain] respecting [constraints]
producing [verifiable output].

## 3. Scope
Task classes covered. Be concrete.

## 4. Out of scope
What this skill must refuse or route elsewhere.

## 5. Activation triggers
Request patterns, keywords, file types, states that fire this skill.

## 6. Goals
User goal and agent goal, separately — they differ.

## 7. Domain model
Entities, relations, states, vocabulary. Every term used below is defined here.

## 8. Knowledge taxonomy
Which rule types apply here and how they are marked.

## 9. Required inputs
Inputs without which work cannot start, and what to do when each is missing.

## 10. Optional inputs
Inputs that improve the result, with their default when absent.

## 11. Evidence rules
What counts as sufficient evidence in this domain; source ranking.

## 12. Confidence model
The confidence→autonomy table, adapted to this domain's risk level.

## 13. Main workflow
Trigger → steps → decision points → validations → output → quality gate → delivery.

## 14. Decision rules
Tables with criteria, thresholds, tie behavior, escalation.

## 15. Exceptions
Per rule: when it stops applying.

## 16. Tool usage
One contract per tool: purpose, when, inputs, outputs, failures, retries, when NOT to use.

## 17. Memory and context
What persists between runs, what must be re-derived, what must never be cached.

## 18. Multi-agent delegation
When to hand off, to whom, with what contract.

## 19. Output contracts
Exact shape of each output: format, required fields, length, tone.

## 20. Failure handling
Per failure mode: detection signal, recovery, fallback.

## 21. Escalation rules
Trigger → recipient → what to include in the escalation.

## 22. Safety boundaries
Actions never taken autonomously; irreversibility rules.

## 23. Quality gates
Checks that run before delivery. Each must be objectively checkable.

## 24. Validation protocol
How to verify behavior; which test classes apply.

## 25. Examples
Real cases with inputs and correct behavior.

## 26. Counterexamples
Cases showing where rules stop applying.

## 27. Anti-patterns
Specific wrong behaviors observed in this domain.

## 28. Test cases
Reference to test-cases.yaml, plus the critical few inline.

## 29. Definition of Done
Checklist, objectively checkable.

## 30. Versioning and updates
How this skill is updated; what triggers a review.

## 31. Final internal review
Questions the agent answers before delivering.
```

---

## knowledge-units.yaml

```yaml
units:
  - id: KU-001
    statement: <one executable claim>
    type: hard-constraint          # fact|hard-constraint|soft-constraint|policy|heuristic|
                                   # preference|decision-rule|procedure|exception|risk|
                                   # failure-mode|signal|assumption|unknown|disagreement|
                                   # context-condition|example|counterexample|quality-criterion|
                                   # escalation-condition
    applies_when: <context>
    fails_when: <boundary, or "none known" only after searching>
    signals: [<observable>, <observable>]
    action: <what the agent does>
    confidence: confirmed          # confirmed|strongly-supported|probable|hypothesis|unknown|conflicted
    autonomy: auto                 # auto|auto-if-reversible|propose|escalate
    source: ["<source id> <location>"]
    verified: 2026-08-21
    tests: [T-001]
    supersedes: null
    notes: <only if it changes behavior>
```

---

## knowledge-map.md

```markdown
# Domain Map: <domain>

## Entities
| Entity | Definition | Key attributes | Owner |

## Relations
| From | Relation | To | Cardinality | Note |

## Roles
| Role | Responsibility | Authority | Escalates to |

## Processes
| Process | Trigger | Owner | Output | Frequency |

## States and transitions
| State | Entry condition | Exit condition | Allowed next |

## Vocabulary
| Term | Definition | Synonyms | Do not confuse with |

## Metrics
| Metric | Definition | Good | Bad | Measured by |

## External dependencies
| Dependency | Type | Failure impact | Fallback |
```

---

## decision-rules.md

```markdown
# Decision Rules

## DR-01 <decision name>
**Question:** <the choice being made>
**Inputs required:** <list; behavior if missing>
**Options:** <enumerated>

**Hard constraints (reject if violated):**
- <constraint> → reject with <message>

**Criteria:**
| Criterion | Weight | Source of value | Threshold |

**Tie behavior:** if top two within <margin> → <action>
**Escalate when:** <conditions>
**Explain as:** <required shape of the justification>
**Exceptions:** <fails_when>
**KUs:** KU-014, KU-015
```

---

## source-ledger.md

```markdown
# Source Ledger

## Sources
| ID | Type | Author/role | Date | Scope | Reliability | Notes |
| S1 | regulation | <issuer> | 2025-11 | national | high | binding |

## Rule provenance
| KU | Rule (short) | Source | Location | Type | Confidence | Last verified |
| KU-014 | rollback required | S1 | §7.2 | hard-constraint | confirmed | 2026-08-21 |

## Untraceable rules
Rules with no source, kept as hypotheses, with the question that would confirm each.
```

---

## test-cases.yaml

```yaml
cases:
  - id: T-001
    class: positive              # positive|negative|edge|ambiguous|missing-input|
                                 # conflicting-evidence|high-risk|tool-failure|regression
    covers: [KU-014]
    given: <inputs and context>
    when: <what the agent is asked>
    expect:
      behavior: <observable action>
      output_contains: [<required element>]
      must_not: [<forbidden behavior>]
      confidence_stated: true
      escalates: false
    rationale: <why this is correct>
```

Coverage requirement: every hard constraint has at least one negative case; every escalation rule
has at least one case that triggers it; every tool has one failure case.

---

## knowledge-gaps.md

```markdown
# Knowledge Gaps

## Blocking — autonomous execution is not safe until resolved
| ID | Gap | What it blocks | Question for expert | Interim rule |

## Non-blocking
| ID | Gap | Impact | Question |

## Contradictions
| ID | Position A (source) | Position B (source) | Selection condition | Status |

## Unconfirmed hypotheses
| KU | Statement | Basis for inference | Confirmation question |

## Graduation criteria
What must be answered for this skill to move from limited to full autonomy.
```

---

## change-log.md

```markdown
# Change Log

## v1.2.0 — 2026-08-21
**Trigger:** <new source | field feedback | policy change>
**Changed:** KU-014 (threshold 3→2), KU-021 (added fails_when)
**Added:** KU-047
**Superseded:** KU-009 by KU-014
**Reason:** <why>
**Regression:** 14/14 prior positive cases pass
**Migration impact:** agents using DR-01 must reload
**Confidence changes:** KU-021 probable → strongly-supported
```

---

## agent-manifest.yaml

```yaml
system: <name>
protocol: planner -> researcher -> specialist -> executor -> reviewer -> validator -> synthesizer

agents:
  - id: researcher
    role: <one sentence>
    justification: <the real difference that earns this agent: competence|context|tools|risk|accountability>
    inputs:
      required: [<contract fields>]
    outputs:
      shape: <schema>
      quality_gate: <checkable condition before handoff>
    tools: [<tool ids>]
    memory: <what persists>
    authority: <what it may decide alone>
    limits: <what it must not do>
    completion: <when its work is done>
    handoff_to: [specialist]
    on_conflict: <behavior when it disagrees with another agent>

escalation:
  - trigger: <condition>
    to: human
    include: [<context the human needs>]
```
