---
name: agi-agent
description: Compile human expert knowledge into agent-executable skills — extract rules, decisions, tacit signals and exceptions from documents, interviews, transcripts, code, tickets or past work, then emit a runnable SKILL.md plus knowledge map, decision rules, source ledger, test cases and gap list. Use when asked to turn expertise, documentation, an SOP, a regulation, a playbook, an expert interview or existing work products into a skill, agent instructions, an agent workflow or a multi-agent system; to audit, refine, update, merge, split, validate or reverse-engineer an existing skill or prompt; or when the user says "make a skill from this", "formalize this knowledge", "turn this expert into an agent", "AGI Agent", "knowledge compiler".
---

# AGI Agent — Expert Knowledge Compiler

Compile human-native knowledge into agent-native knowledge.

```
documents · interviews · cases · code · habits · intuition
        ↓  COMPILE
objectives · triggers · decision rules · guards · contracts · tests
```

The output is a system an agent executes, not a document a human reads. A summary that
reads well and cannot be run is a failed output.

## The one rule that separates this from summarizing

Every abstract expert statement must be converted into **observable, checkable behavior**.

Apply the **abstraction ladder** to each vague statement:

| Step | Question | Example |
|---|---|---|
| 1. Quote | What was actually said? | "Use professional judgment." |
| 2. Violation | What would I *see* if this were done badly? | Ships an irreversible change on thin evidence |
| 3. Signals | What observable inputs feed that judgment? | Reversibility, evidence quality, blast radius, deadline |
| 4. Thresholds | At what value does the answer flip? | Evidence < 2 independent sources → do not act |
| 5. Action | What does the agent *do*? | Reject / propose two options / escalate |
| 6. Boundary | When does this stop being true? | Emergency rollback: act, log, review after |

If step 3 or 5 cannot be filled, the unit is not knowledge yet — it is a **gap**. Record it in
`knowledge-gaps.md` and ask the expert. Never invent the missing rung.

## Knowledge Unit — the atom of every output

Everything the compiler extracts becomes a Knowledge Unit. One claim per unit. Every field
carries weight: `confidence` and `autonomy` gate runtime behavior, `source` gives traceability,
`fails_when` prevents over-generalization, `tests` makes it verifiable.

```yaml
- id: KU-014
  statement: Reject a migration plan that has no tested rollback path.
  type: hard-constraint          # see taxonomy below
  applies_when: schema change on a table with live writes
  fails_when: incident response — forward-fix is allowed with an incident commander on call
  signals: [rollback script exists, rollback rehearsed in staging, data volume, write QPS]
  action: block and return the missing rollback as the single blocking finding
  confidence: confirmed
  autonomy: auto
  source: ["SRE handbook §7.2", "interview:lead-dba 2026-03-11 14:12"]
  verified: 2026-08-21
  tests: [T-021, T-022]
  supersedes: KU-009
```

Rules:
- One statement per unit. If it contains "and" joining two decisions, split it.
- `fails_when: none known` is allowed only after actively searching for a boundary; it downgrades
  confidence to at most `probable`.
- A unit with no `source` is an inference. Mark `confidence: hypothesis` and flag it for review.
- Never merge units from experts who disagree. Emit both, plus a `Disagreement` unit naming the
  condition that selects between them.

## Modes

Pick the mode from the request, state it in the first line of output, then run its pipeline.
Detailed playbooks: `references/modes.md`.

| Mode | Use when | Core output |
|---|---|---|
| **Compile** | Raw expertise → new skill | Full artifact package |
| **Extract** | Harvest knowledge, do not package yet | Knowledge Units + gaps |
| **Interview** | The knowledge is in a person's head | Transcript-derived KUs |
| **Audit** | Existing skill of unknown quality | Findings ranked by severity |
| **Refine** | Structure is fine, execution is weak | Revised SKILL.md + diff |
| **Update** | New sources arrived | Changed KUs + regression result |
| **Merge** | Several experts/skills overlap | Unified skill + disagreement register |
| **Split** | One skill grew monolithic | Module tree + routing rules |
| **Validate** | Behavior needs proving | Test run + pass/fail per case |
| **Compare** | Agent vs expert vs prior version | Divergence table + causes |
| **Reverse Engineer** | Only finished work products exist | Inferred rules, all as hypotheses |
| **Orchestrate** | Domain too large for one agent | `agent-manifest.yaml` |

Default when unstated: **Compile**. If sources are thin, run **Extract** first and say so.

## Compile pipeline

Run in order. Each stage has an exit condition; do not advance without it.

### 1. Frame the skill
Write one sentence and get it right before anything else:

> This skill enables **[agent type]** to perform **[task class]** in **[domain/context]**, respecting
> **[constraints]**, producing **[verifiable output]**.

Also fix: users of the output, risk level (low/medium/high/critical), autonomy ceiling, available
tools, out-of-scope list. **Exit:** the sentence names a task class, not a topic. "Handle support
tickets" passes; "know about support" fails.

### 2. Inventory sources
Table every source: type, author, date, claimed scope, expertise basis, recency, reliability,
examples present, contradictions, bias, relation to other sources.

Confidence in a source comes from evidence and track record, never from its tone. A regulation
outranks a blog post; an expert's own decision log outranks the same expert's self-description of
how they decide. **Exit:** every source has a reliability rating and a known scope.

### 3. Map the domain
Build `knowledge-map.md`: entities, relations, roles, processes, states, events, resources,
constraints, metrics, risks, external dependencies. Fix the vocabulary — every term the agent must
not confuse gets a definition and its synonyms. Jargon left undefined becomes a runtime failure.
**Exit:** no term in later artifacts is undefined here.

### 4. Decompose into Knowledge Units
Split sources into units and type each one (taxonomy below). Do not paraphrase — restate as an
executable claim. Preserve the expert's distinctions even when they look redundant; they usually
encode a case you have not seen yet. **Exit:** every substantive sentence in the sources is either
a KU, a duplicate of one, or explicitly discarded as non-operational.

### 5. Surface tacit knowledge
The valuable knowledge is the part the expert never wrote down. Hunt it:

- What is checked *before* work starts?
- What is obvious to them and unknown to a novice?
- What tells them the situation is non-standard?
- Which options are discarded instantly, and on what cue?
- When do they break their own rule?
- What do they treat as irreversible?
- What novice mistakes do they predict in advance?
- How do they know the result is good enough?
- What makes them stop and re-check?
- When do they hand off to another specialist?

Anything reconstructed rather than stated is `confidence: hypothesis` until confirmed.
**Exit:** at least the stop conditions, the escalation cues and the "good enough" test exist as KUs.

### 6. Formalize decisions
For each decision: the question, required inputs, options, hard constraints, soft constraints,
criteria and weights, thresholds, disqualifiers, tolerable uncertainty, cost of error,
reversibility, escalation need, explanation format.

```text
# Simple
IF <condition> THEN <action> ELSE <alternative>

# Multi-factor
Score: criterion A (w=.4), B (w=.35), C (w=.25)
Reject when: any hard constraint violated | evidence below threshold
Escalate when: top two within <margin> | irreversible | required input missing

# Risk-weighted
priority = impact × probability × irreversibility × evidence_uncertainty
```

**Exit:** no decision resolves to "decide appropriately". Every branch names its action.

### 7. Design workflows
Per process: trigger, preconditions, required inputs, optional inputs, tools, steps, decision
points, branches, validations, intermediate outputs, final output, failure handling, recovery,
escalation, completion criteria.

```text
Trigger → validate context → prepare inputs → gather evidence → analyze
→ decide → produce output → quality gate → deliver → capture feedback
```

**Exit:** an agent with no access to the source material could execute it.

### 8. Define the agent interface
Activation triggers; in-scope and out-of-scope requests; inputs that must be supplied vs derivable;
mandatory tool use; actions needing confirmation; output format; how uncertainty is reported; how
work is handed off. **Exit:** triggers are concrete enough to fire without a human deciding.

### 9. Write tool contracts
Per tool: purpose, use conditions, required and optional inputs, expected result, failure modes,
retry policy, result validation, limits, safety, handoff format. A tool existing does not mean it
must always be used — state when *not* to. **Exit:** every tool has a failure branch.

### 10. Bind confidence to autonomy
This table is the safety core of every compiled skill. Reproduce it in the output.

| Confidence | Meaning | Permitted behavior |
|---|---|---|
| `confirmed` | Verified, multiple sources or authoritative | Act autonomously |
| `strongly-supported` | Consistent evidence, no counterexample | Act; log the basis |
| `probable` | Usually true, boundaries partly unknown | Act only if reversible and low-risk |
| `hypothesis` | Reconstructed, unconfirmed | State the assumption; do not rely on it alone |
| `unknown` | Insufficient information | Gather data or narrow the claim; never guess |
| `conflicted` | Sources disagree | Present positions with selection conditions |

Escalate regardless of confidence when: the action is irreversible, a hard constraint is near, cost
of error exceeds the configured ceiling, a required input is missing, the case falls outside every
recorded `applies_when`, or two options are within the tie margin.

### 11. Handle exceptions
For every rule, test it against: missing data, role change, risk level, scale, time pressure, tool
unavailable, low-quality sources. Fill `fails_when`. **Exit:** no rule in the output lacks a
boundary of applicability.

### 12. Modularize
Line-count threshold and the references/ split: see `skill-creator` (canonical). For a compiled
skill specifically, split on these triggers even under the line limit: several task classes, mixed
risk levels, or different tools per branch. Keep the router in the parent skill and put variants in
`references/`. Do not split what is read together every time. **Exit:** a task loads only the
modules it needs.

## Knowledge taxonomy

Type every unit. Wrong typing is the most common compile error — it converts a preference into a
law, or a law into a suggestion. Detection cues and formalization targets: `references/taxonomy.md`.

| Type | Compiles to |
|---|---|
| Fact | Verifiable statement, dated |
| Hard Constraint | Blocking guard, no override |
| Soft Constraint | Default with a documented override path |
| Policy | Organizational rule with an owner |
| Heuristic | Weighted signal, not a gate |
| Preference | Default only, never a rejection reason |
| Decision Rule | Branch with named criteria |
| Procedure | Numbered executable steps |
| Exception | `fails_when` on its parent unit |
| Risk | Entry in the risk-weighted priority model |
| Failure Mode | Detection signal + recovery step |
| Signal | Observable input to a decision |
| Assumption | `hypothesis` unit with a confirmation question |
| Unknown | Entry in `knowledge-gaps.md` |
| Disagreement | Both positions + selection condition |
| Context Condition | `applies_when` |
| Example | Positive test case |
| Counterexample | Negative test case / boundary |
| Quality Criterion | Quality gate assertion |
| Escalation Condition | Escalation rule |

Never blur: fact vs habit, rule vs preference, evidence vs confidence, one case vs a pattern.

## Output package

`SKILL.md` is mandatory. Produce the rest when the material supports it; state which were skipped
and why. Templates for all of them: `references/templates.md`.

| Artifact | Contents |
|---|---|
| `SKILL.md` | The executable skill — 31-section structure in the template |
| `knowledge-map.md` | Entities, relations, roles, processes, vocabulary |
| `decision-rules.md` | Decision tables, thresholds, exceptions, escalation |
| `source-ledger.md` | KU ↔ source ↔ location ↔ type ↔ confidence ↔ last verified |
| `test-cases.yaml` | Positive, negative, edge, ambiguous, missing-input, conflict, high-risk, tool-failure |
| `knowledge-gaps.md` | Unknowns, contradictions, unconfirmed hypotheses, questions for the expert |
| `change-log.md` | Version, trigger, changed KUs, reason, regression risk |
| `agent-manifest.yaml` | Multi-agent only: roles, contracts, handoffs, escalation paths |

## Validation

A skill is not finished until its behavior has been checked. Run `scripts/lint_skill.py` on the
produced `SKILL.md` for the mechanical checks — missing sections, banned vagueness, untraceable
rules, absent tests — then run the case classes and expert comparison from `references/validation.md`.

```bash
python3 scripts/lint_skill.py <path/to/SKILL.md> [--package-dir <dir>] [--json]
```

Score the result 0–5 on: fidelity, coverage, executability, decision clarity, traceability,
testability, safety, modularity, maintainability, tool awareness, multi-agent compatibility,
uncertainty handling, context efficiency, expert equivalence. **For every score below 4, write the
specific fix, not an observation.** Rubric with level descriptors: `references/validation.md`.

## Incomplete information

Never stall, never invent. When sources are thin:

1. Compile everything that *is* supported.
2. Separate confirmed knowledge from hypotheses in the artifact itself.
3. List critical gaps; mark which ones block autonomous execution.
4. Write the questions with the highest information value — the ones whose answers change the most rules.
5. Propose safe interim rules, explicitly labelled as interim.
6. Lower the autonomy ceiling to match the evidence.
7. State the conditions under which the skill graduates to confirmed status.

## Updating

On new knowledge: identify affected KUs → find contradictions → decide supersede vs coexist (record
`supersedes`) → bump confidence and `verified` → update dependent workflows → update tests → run
regression against prior positive cases → record migration impact → name which downstream skills or
agents must be re-issued. Never silently overwrite a confirmed unit with an unconfirmed one.

## Anti-patterns

Reject the output if it contains any of these:

- "Use good judgment", "act like an expert", "consider all factors" — unresolved abstraction
- Theory the agent never acts on
- No trigger, no inputs, or no output contract
- Rules with no boundary of applicability
- Preferences promoted to hard constraints
- A single case generalized into a universal law
- Contradictions smoothed into false consensus
- Confidence higher than the evidence supports
- Source text copied instead of compiled
- Undefined jargon
- A monolith where modules were needed, or fragmentation where one file sufficed
- Requiring the agent to read the original human material before every task
- No examples, no counterexamples, no tests
- Beautiful documentation that cannot be executed

## Definition of Done

- [ ] Frame sentence names a task class, constraints and a verifiable output
- [ ] Every source rated; every substantive rule traceable to one
- [ ] Domain vocabulary fixed; no undefined jargon in the output
- [ ] Every KU typed, with `applies_when`, `fails_when`, `confidence`, `autonomy`
- [ ] Tacit layer surfaced: stop conditions, escalation cues, "good enough" test
- [ ] Every decision has named criteria, thresholds and branches
- [ ] Every workflow has trigger, steps, failure handling, completion criteria
- [ ] Confidence→autonomy table present; irreversible actions escalate
- [ ] Tool contracts include failure branches
- [ ] Test cases cover positive, negative, edge, ambiguous, missing-input, conflict, high-risk, tool-failure
- [ ] Gaps listed with the questions that close them
- [ ] `lint_skill.py` passes with no errors
- [ ] Metrics scored; every score below 4 has a written fix
- [ ] An agent with no access to the source material can execute the skill

## Final internal review

Answer honestly before delivering. Any "no" on 1–6 blocks delivery.

1. Is this a compiler output, or a summary in disguise?
2. Can an agent execute it without a human explaining the domain?
3. Is every abstract instruction reduced to observable behavior?
4. Are facts, policies, heuristics, preferences and hypotheses kept apart?
5. Does every rule state where it stops applying?
6. Is it clear when to act alone and when to escalate?
7. Is tacit knowledge surfaced, or only the written layer?
8. Are contradictions and uncertainty preserved rather than smoothed?
9. Are tool rules, examples, counterexamples and tests present?
10. Can each rule be traced to its origin?
11. Can this be updated in parts?
12. Could a different agent apply this with no access to the human sources?

## References

Load only what the current stage needs.

- `references/modes.md` — playbooks for all 12 modes, with entry conditions and outputs
- `references/taxonomy.md` — 20 knowledge types: detection cues, target form, typing errors
- `references/interview.md` — expert interview protocol, case replay, counterfactuals, elicitation tactics
- `references/templates.md` — copy-ready templates for every artifact, incl. the 31-section `SKILL.md`
- `references/validation.md` — test classes, expert comparison, regression, 0–5 metric rubric
- `references/domains.md` — per-domain adapters: evidence standards, risk profile, escalation defaults
- `scripts/lint_skill.py` — mechanical checks on a produced skill package
