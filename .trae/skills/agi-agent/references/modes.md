# Mode Playbooks

Twelve operating modes. Each lists entry conditions, procedure, output and the failure that mode
most often produces. Read only the mode in play.

- [Compile](#compile) · [Extract](#extract) · [Interview](#interview) · [Audit](#audit)
- [Refine](#refine) · [Update](#update) · [Merge](#merge) · [Split](#split)
- [Validate](#validate) · [Compare](#compare) · [Reverse Engineer](#reverse-engineer) · [Orchestrate](#orchestrate)

---

## Compile

**Entry:** raw human material exists and a runnable skill is wanted.
**Procedure:** the 12-stage pipeline in SKILL.md, start to finish.
**Output:** full artifact package.
**Characteristic failure:** producing a well-organized restatement of the sources. Guard: after
drafting, delete every sentence the agent would never act on. If more than a third of the document
disappears, it was a summary.

---

## Extract

**Entry:** sources are large, contradictory, or of unknown value; packaging is premature.
**Procedure:**
1. Inventory and rate sources.
2. Sweep for Knowledge Units without regard to final structure.
3. Type each unit; leave structure flat.
4. Cluster by decision, not by source document.
5. Emit gaps and contradictions as first-class results.

**Output:** `knowledge-units.yaml` + `knowledge-gaps.md` + `source-ledger.md`. No `SKILL.md`.
**Characteristic failure:** organizing by source. The output must be organized by decision — the
same rule appearing in four documents is one unit with four sources.

---

## Interview

**Entry:** the knowledge lives in a person and is not written anywhere.
**Procedure:** `references/interview.md`. Run in sessions, not one pass. After each session,
compile what was said into KUs and bring the contradictions back to the expert.
**Output:** KUs tagged with `source: interview:<role> <timestamp>`.
**Characteristic failure:** accepting the expert's self-description of their process. What people
say they do and what their cases show they do diverge. Always cross-check against Case Replay.

---

## Audit

**Entry:** an existing skill, prompt or SOP of unknown quality.
**Procedure:**
1. Run `scripts/lint_skill.py` for mechanical defects.
2. Check every rule for `applies_when` / `fails_when`.
3. Trace rules to sources; flag untraceable ones.
4. Look for preference-as-law and case-as-universal errors.
5. Test against the case classes in `references/validation.md`.
6. Rank findings: blocking → degrading → cosmetic.

**Output:** findings table (severity, location, defect, fix), metric scores, no rewrite.
**Characteristic failure:** rewriting instead of auditing. Audit reports; Refine changes.

---

## Refine

**Entry:** the skill's structure is sound but execution is weak.
**Procedure:** keep the section skeleton; replace vague instructions using the abstraction ladder;
add missing branches, thresholds and failure handling; leave working parts untouched.
**Output:** revised `SKILL.md` + a diff explaining each change.
**Characteristic failure:** gratuitous restructuring, which destroys the user's familiarity and any
external references to section names.

---

## Update

**Entry:** new sources, a changed policy, or field feedback.
**Procedure:**
1. Identify affected KUs by ID.
2. Detect contradictions with existing units.
3. Decide per unit: supersede (record `supersedes`), coexist with distinct `applies_when`, or reject
   the new source.
4. Update `confidence` and `verified`.
5. Update dependent workflows and tests.
6. Run regression on prior positive cases.
7. Record migration impact and which downstream skills must be re-issued.

**Output:** changed KUs, updated artifacts, `change-log.md` entry, regression result.
**Characteristic failure:** letting recency win. New does not outrank verified. A blog post does not
supersede a regulation.

---

## Merge

**Entry:** several experts, teams or skills cover overlapping ground.
**Procedure:**
1. Normalize vocabulary first — the same word rarely means the same thing across teams.
2. Align units by decision, not by wording.
3. Classify each overlap: identical, compatible-with-different-scope, or genuinely conflicting.
4. For conflicts, emit both positions plus the condition that selects between them. Never average.
5. Build a single router; keep source-specific modules where scope differs.

**Output:** unified skill + disagreement register.
**Characteristic failure:** manufacturing consensus. If the selection condition is unknown, that is
a gap and an escalation rule, not a decision to make on the experts' behalf.

---

## Split

**Entry:** one skill exceeds ~500 lines, spans several task classes, mixes risk levels, or needs
different tools per branch.
**Procedure:**
1. Cluster by task class and by what is read together.
2. Keep shared vocabulary, safety rules and the router in the parent.
3. One module per branch; no cross-module dependencies deeper than one level.
4. Write explicit routing rules — when to load which module.

**Output:** module tree + routing rules in the parent skill.
**Characteristic failure:** splitting content that is always read together, which multiplies context
loads instead of reducing them.

---

## Validate

**Entry:** the skill exists and its behavior must be proven.
**Procedure:** run every case class in `references/validation.md`; record expected vs actual per
case; classify failures as knowledge defect, instruction defect or test defect.
**Output:** pass/fail per case + defect classification.
**Characteristic failure:** testing only the happy path. Negative, missing-input and tool-failure
cases find more defects than positive cases do.

---

## Compare

**Entry:** two behaviors need to be set side by side — agent vs expert, or version N vs N+1.
**Procedure:** run both on the same cases; compare decision, reasoning, signals used, exceptions
caught, confidence expressed. For each divergence name the cause: missing knowledge, mis-typed
knowledge, missing signal, threshold mismatch, or expert inconsistency.
**Output:** divergence table with causes and fixes.
**Characteristic failure:** treating every divergence as an agent error. Sometimes the expert is
inconsistent, and that finding is the valuable one.

---

## Reverse Engineer

**Entry:** only finished work products exist — no documentation, no available expert.
**Procedure:**
1. Collect a sample of outputs, ideally including rejected and failed ones.
2. Look for invariants: what is always present, always absent, always ordered a certain way.
3. Look for conditionals: what differs, and what input correlates with the difference.
4. Formulate candidate rules; test each against the whole sample.
5. Mark every rule `confidence: hypothesis`; no exceptions.
6. List the confirmation questions.

**Output:** inferred rule set, entirely hypotheses, plus the confirmation plan.
**Characteristic failure:** promoting a correlation to a rule. Ten samples sharing a trait may share
an author, a client or a quarter — not a principle.

---

## Orchestrate

**Entry:** the domain is too large, too varied in risk, or too tool-diverse for one agent.
**Procedure:**
1. Justify each agent by a real difference in competence, context, tools, risk, decision type or
   accountability. No difference, no agent.
2. Per agent: role, responsibility boundary, input contract, output contract, tools, memory,
   authority, limits, completion criteria, handoff rules, conflict behavior.
3. Define the protocol, e.g. `Planner → Researcher → Domain Specialist → Executor → Reviewer →
   Validator → Synthesizer`.
4. Define escalation paths to a human, not only between agents.

**Output:** `agent-manifest.yaml` + protocol diagram.
**Characteristic failure:** inventing agents for tidiness. Every extra agent adds a handoff, and
handoffs lose context. Prefer fewer agents with clearer contracts.
