# Expert Interview Protocol

The goal is not what the expert *says* they do — it is the mechanism they actually use. Those two
diverge, reliably. Self-description yields the written layer; cases yield the tacit layer.

Run in sessions. After each, compile to Knowledge Units, then return with the contradictions you
found. Contradictions are the most productive interview material available.

## Contents
- [Session structure](#session-structure)
- [Block 1 — Frame](#block-1--frame)
- [Block 2 — Mechanism](#block-2--mechanism)
- [Block 3 — Case Replay](#block-3--case-replay)
- [Block 4 — Counterfactuals](#block-4--counterfactuals)
- [Block 5 — Boundaries and handoff](#block-5--boundaries-and-handoff)
- [Elicitation tactics](#elicitation-tactics)
- [Recording rules](#recording-rules)

---

## Session structure

| Session | Focus | Output |
|---|---|---|
| 1 | Frame + mechanism | Task class, success criteria, main workflow |
| 2 | Case replay ×3–5 | Real decision rules, signals, thresholds |
| 3 | Counterfactuals + boundaries | Exceptions, escalation, failure modes |
| 4 | Contradiction review | Resolved conflicts, confirmed hypotheses |

Do not attempt one long session. The tacit layer surfaces when the expert reacts to a compiled
draft, which requires a gap between sessions.

---

## Block 1 — Frame

- What task are you solving? Who asked for it?
- What does a good result look like? How do you know it is good?
- What does a bad result look like? What is the worst realistic outcome?
- Who else touches this work, before or after you?
- What must never happen?

---

## Block 2 — Mechanism

- What do you check first, before doing anything?
- What data do you need? What is merely useful?
- What do you do when that data is missing?
- Which options do you rule out immediately, and on what cue?
- How do you choose between two acceptable options?
- What tells you this case is not standard?
- When do you break your own usual rule?
- What makes you stop and re-check?
- How do you know you are finished?
- What do novices get wrong here?
- Which parts could a machine do? Which parts must not be delegated?

---

## Block 3 — Case Replay

The core technique. Take **real** cases, ideally including one failure. Reconstruct in order:

1. What was the starting situation?
2. What did you notice first?
3. What did you check next, and why that?
4. What options were on the table?
5. What did you rule out, and on what basis?
6. What did you decide?
7. Why that, and not the runner-up?
8. What risks were you weighing?
9. What actually happened?
10. What would you do differently now?
11. What general principle does this case carry?
12. Where would that principle fail?

Question 12 is mandatory. A principle with no known boundary is under-specified and will
over-apply at runtime.

Run at least three cases. One case gives an anecdote; three give a pattern; a failure case gives
the failure modes nothing else surfaces.

---

## Block 4 — Counterfactuals

These extract thresholds, which interviews otherwise rarely produce.

- What single fact would have changed your decision?
- How much would X have to change before you chose differently?
- What if you had half the time? A tenth of the budget?
- What if the data were unavailable?
- How would a less experienced person handle this, and where exactly would they go wrong?
- What option looks obviously right here but is actually wrong?
- What rare case completely changes the normal process?
- If you had to hand this to someone else tomorrow, what would you warn them about first?

---

## Block 5 — Boundaries and handoff

- When do you refuse the task outright?
- When do you escalate, and to whom?
- What decisions are irreversible here?
- What would you never sign off without a second opinion?
- Where do you and your colleagues disagree? What drives the difference?
- What in this domain changed in the last two years?
- What advice in the standard references is now outdated?

---

## Elicitation tactics

**Interrupt the abstraction.** When the answer is "it depends", ask "on what, specifically — name
the last time it depended." Abstractions are compressed cases; decompress them.

**Ask for the exception first.** "When does that not apply?" surfaces boundaries faster than asking
for the rule.

**Play the novice.** Propose a plausible-but-wrong approach and ask what is wrong with it. Experts
correct errors more precisely than they describe rules.

**Use the artifact.** Put a real document, ticket or screen in front of them and ask them to think
aloud. Recognition beats recall.

**Watch for hedges.** "Generally", "in most cases", "I'd probably" all mark heuristics — type them
accordingly, and ask what the exception is.

**Time the pauses.** Where the expert hesitates is where the rule is unwritten. Ask directly:
"you paused there — what were you weighing?"

**Chase the number.** Any "too big", "too slow", "too risky" needs a value. "Too slow compared to
what, at what point do you act?"

**Confirm by contradiction.** Present two of their own statements that conflict. The resolution is
usually a context condition neither statement mentioned.

---

## Recording rules

- Tag every unit `source: interview:<role> <timestamp>` — role, not name, unless attribution is
  required.
- Distinguish quoted from inferred. Anything you reconstructed is `confidence: hypothesis` until the
  expert confirms it in a later session.
- Record disagreement between experts without resolving it in the moment.
- Keep the expert's own vocabulary in `knowledge-map.md`, mapped to the neutral term used in rules.
- Never record a threshold the expert did not give. "Roughly a day" is a real answer; inventing
  "24 hours" is not.
