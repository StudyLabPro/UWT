# Knowledge Taxonomy

Twenty types. For each: how to detect it in human material, what it compiles into, and the typing
error it invites. Mis-typing is the highest-cost compile error — it turns a preference into a law
that blocks valid work, or a law into a suggestion that gets ignored.

## Typing procedure

For each candidate unit ask, in order:

1. Can it be checked against reality? → **Fact**
2. Does violating it cause harm that cannot be accepted? → **Hard Constraint**
3. Does it come from the organization rather than the domain? → **Policy**
4. Is it usually-but-not-always true? → **Heuristic**
5. Would another competent expert do it differently with equal results? → **Preference**
6. Does it select between options? → **Decision Rule**
7. Is it a sequence? → **Procedure**
8. Does it disable another rule? → **Exception**

The first match wins. When two types fit equally, pick the weaker one (Preference over Policy,
Heuristic over Hard Constraint) and record the ambiguity as a question for the expert. Over-strong
typing blocks legitimate work and is discovered late; under-strong typing surfaces immediately in
testing.

---

## Types

### Fact
**Detect:** stated as verifiable; measurable; has a source of truth.
**Compiles to:** dated statement with a source. Facts expire — record `verified`.
**Error:** recording a fact about a moment as a permanent property ("the API returns 12 fields").

### Hard Constraint
**Detect:** "never", "must", "under no circumstances"; legal, safety, contractual or physical.
**Compiles to:** blocking guard checked before action, with no override path.
**Error:** treating a strongly-held preference as one. Test: would violating it be a *reportable*
event, or merely disliked?

### Soft Constraint
**Detect:** "should", "prefer", "unless there's a reason".
**Compiles to:** default plus a documented override path that records the justification.
**Error:** silently dropping it because it is not mandatory. A soft constraint still requires the
agent to state why it was overridden.

### Policy
**Detect:** originates from the organization; has an owner; could differ at another company.
**Compiles to:** rule with an owner and a review date.
**Error:** presenting it as domain truth. Policies travel badly between organizations — mark them
so a derived skill can drop them.

### Heuristic
**Detect:** "usually", "in my experience", "nine times out of ten".
**Compiles to:** weighted signal feeding a decision, never a gate.
**Error:** promoting it to a hard constraint because it is stated confidently.

### Preference
**Detect:** stylistic; the expert cannot name a consequence for doing it differently.
**Compiles to:** default value only. Never a rejection reason.
**Error:** letting one expert's taste become the standard in a merged skill.

### Decision Rule
**Detect:** describes choosing among options.
**Compiles to:** explicit branch with criteria, thresholds, tie behavior and escalation.
**Error:** leaving the tie case undefined — the most frequent runtime stall.

### Procedure
**Detect:** ordered steps; "first, then, after that".
**Compiles to:** numbered executable steps with preconditions and completion criteria.
**Error:** recording the steps without recording *why* the order matters, so the agent reorders them
under pressure.

### Exception
**Detect:** "except when", "unless", "but if".
**Compiles to:** `fails_when` on its parent unit — never a free-floating rule.
**Error:** storing it far from the rule it modifies, so the rule gets applied unconditionally.

### Risk
**Detect:** a possible negative outcome with a probability.
**Compiles to:** entry in the risk model: impact × probability × irreversibility × evidence
uncertainty.
**Error:** listing risks without attaching a mitigating action or detection signal.

### Failure Mode
**Detect:** "what usually goes wrong is…"; post-mortems; recurring incidents.
**Compiles to:** detection signal + recovery step + prevention rule.
**Error:** naming the failure without naming how to *notice* it early.

### Signal
**Detect:** an observable the expert reacts to, often mentioned in passing.
**Compiles to:** named input to a decision, with the value range that triggers a response.
**Error:** leaving it qualitative ("if the code smells off") instead of decomposing it into what was
actually observed.

### Assumption
**Detect:** unstated premise the reasoning depends on; often found by asking "what must be true for
this to work?"
**Compiles to:** `hypothesis` unit plus a confirmation question.
**Error:** inheriting the assumption invisibly, so the rule silently misfires outside its context.

### Unknown
**Detect:** the material simply does not say.
**Compiles to:** entry in `knowledge-gaps.md` with the question and what it blocks.
**Error:** filling the hole with a plausible invention.

### Disagreement
**Detect:** two sources give incompatible instructions.
**Compiles to:** both positions, each with its context, plus the selection condition — or an
escalation rule if the condition is unknown.
**Error:** picking a winner by seniority or recency and hiding the conflict.

### Context Condition
**Detect:** the scope in which the knowledge holds — role, scale, phase, jurisdiction, environment.
**Compiles to:** `applies_when`.
**Error:** omitting it, producing a rule that fires everywhere.

### Example
**Detect:** a case shown as correct.
**Compiles to:** positive test case with inputs and expected behavior.
**Error:** generalizing a single example into a rule without checking other cases.

### Counterexample
**Detect:** a case shown as wrong, or as the boundary.
**Compiles to:** negative test case; often also yields a `fails_when`.
**Error:** discarding it as an anomaly. Counterexamples are where the real boundary lives.

### Quality Criterion
**Detect:** how the expert judges the result.
**Compiles to:** quality gate assertion, checkable without the expert present.
**Error:** leaving it subjective ("looks professional") instead of decomposing into observables.

### Escalation Condition
**Detect:** "at that point I'd ask", "that's above my level", "I'd never decide that alone".
**Compiles to:** escalation rule with the trigger and who receives it.
**Error:** recording only the escalation cases the expert remembered, missing the structural ones —
irreversibility, missing input, out-of-scope case.

---

## Cross-cutting distinctions

Keep these four pairs separate. Collapsing any of them is what turns a compiler into a summarizer.

| Not the same | Test that separates them |
|---|---|
| Fact vs habit | Would it still be true at a different company? |
| Rule vs preference | Is there a consequence for doing it differently? |
| Evidence vs confidence | How many independent sources, and how good? |
| One case vs a pattern | Does it hold across the whole sample, or only this one? |
