# Validation

A compiled skill is a claim about behavior. Until the behavior is exercised, the claim is untested.

## Contents
- [Case classes](#case-classes)
- [Running the suite](#running-the-suite)
- [Defect classification](#defect-classification)
- [Expert comparison](#expert-comparison)
- [Regression](#regression)
- [Metric rubric](#metric-rubric)

---

## Case classes

Nine classes. A suite with only positive cases proves almost nothing — the defects live in the
other eight.

| Class | Purpose | Minimum coverage |
|---|---|---|
| **Positive** | Typical tasks, correct handling | Every main workflow |
| **Negative** | Tasks the agent must refuse or route away | Every hard constraint, every out-of-scope class |
| **Edge** | Rare, extreme, boundary values | Every named threshold, tested at and just past it |
| **Ambiguous** | Under-specified requests | At least one per decision rule with a tie margin |
| **Missing input** | A required input is absent | Every required input, individually |
| **Conflicting evidence** | Sources disagree | Every recorded disagreement |
| **High risk** | Error causes serious harm | Every irreversible action |
| **Tool failure** | Tool unavailable, erroring, or returning garbage | Every tool contract |
| **Regression** | Previously correct behavior still holds | All prior positive cases, after any update |

Write each case with `given / when / expect`. The expectation must be observable: an action taken,
an output element present, a refusal, an escalation, a stated confidence. "Handles it well" is not
an expectation.

---

## Running the suite

1. Run mechanical checks first: `python3 scripts/lint_skill.py <SKILL.md> --package-dir <dir>`.
   Fix errors before behavioral testing — a missing output contract makes every behavioral result
   ambiguous.
2. Execute each case against the skill as written, using only the skill and the case inputs. Do not
   consult the source material; if the skill needs it, that is the finding.
3. Record expected vs actual per case.
4. Classify every failure before fixing anything.

---

## Defect classification

Fixing the wrong layer is how skills rot. Classify first:

| Defect | Signature | Fix |
|---|---|---|
| **Knowledge defect** | The rule is absent or wrong | Return to sources or the expert; add/correct the KU |
| **Instruction defect** | The rule is right but unexecutable as written | Apply the abstraction ladder; add threshold or branch |
| **Typing defect** | Rule fires too widely or too weakly | Re-type the unit; add `applies_when` / `fails_when` |
| **Coverage defect** | The case falls outside every rule | Add the branch, or add an explicit out-of-scope rule |
| **Test defect** | The expectation itself is wrong | Correct the case; check whether the expert agrees |

A failure with no classification is not allowed to be fixed.

---

## Expert comparison

The strongest available validation. Run the same cases past the expert and compare five things,
not one:

| Compare | Question |
|---|---|
| Decision | Same choice? |
| Reasoning | Same path, or right answer by luck? |
| Signals | Did the agent use the inputs the expert used? |
| Exceptions | Did the agent catch the boundary the expert caught? |
| Confidence | Did the agent claim more certainty than the expert? |

For each divergence, name the cause: missing knowledge, mis-typed knowledge, missing signal,
threshold mismatch, or **expert inconsistency**. The last one is a real and valuable outcome — when
the expert's own cases contradict their stated rule, the compiler has found something the
organization did not know.

Right answer by wrong reasoning counts as a failure. It will not survive a case the suite does not
contain.

---

## Regression

After any update:

1. Re-run every prior positive case.
2. Re-run every case that previously exposed a defect.
3. Check that superseded rules are gone from behavior, not just from the document.
4. Record the pass rate in `change-log.md`.

Regression failure blocks release regardless of how good the new knowledge is.

---

## Metric rubric

Score 0–5. **For every score below 4, write the specific fix.** An observation without a fix is not
a finding.

| Metric | 0–1 | 2–3 | 4–5 |
|---|---|---|---|
| **Fidelity** | Distorts or over-simplifies the expertise | Mostly faithful, some flattening | Preserves distinctions, boundaries and uncertainty |
| **Coverage** | Happy path only | Main cases, gaps at edges | Tasks, states and exceptions covered |
| **Executability** | Requires human interpretation | Executable with effort | Directly runnable by an agent |
| **Decision clarity** | "Use judgment" | Criteria named, thresholds vague | Criteria, thresholds, ties and escalation explicit |
| **Traceability** | No sources | Some rules traceable | Every substantive rule traceable and dated |
| **Testability** | No tests | Positive cases only | All applicable case classes covered |
| **Safety** | No autonomy limits | Limits mentioned informally | Confidence→autonomy bound; irreversible actions escalate |
| **Modularity** | Monolith or shards | Sections exist | Modules load independently, router explicit |
| **Maintainability** | Update = rewrite | Partial updates painful | KU-level updates with regression |
| **Tool awareness** | Tools unmentioned | Tools listed | Contracts with failure branches and when-not-to-use |
| **Multi-agent compat.** | Unusable in a system | Usable with glue | Clean input/output contracts and handoffs |
| **Uncertainty handling** | False confidence | Uncertainty mentioned | Levels bound to permitted behavior |
| **Context efficiency** | Must load everything always | Large but workable | Loads only what the task needs |
| **Expert equivalence** | Diverges on typical cases | Matches on typical, misses edges | Matches decisions and reasoning, including boundaries |

**Release threshold:** no metric below 3; Safety, Executability and Traceability at 4 or above.
Below that, the skill ships with a lowered autonomy ceiling and the gap list attached.
