---
name: ip-publication-gate
description: Decide whether any artifact may be published — code, README, demo, screenshot, screencast, blog post, talk, arXiv paper, marketing site, dataset or API doc — under the ecosystem's barbell patent strategy, dual AGPL/commercial licensing and trade-secret list. Use before publishing, demoing, open-sourcing, presenting or putting anything on a public site; when asked "can we show this", "is this safe to publish", "can this go on the site", "arXiv", "patent", "trade secret", "what license", or when reviewing a public-facing artifact for IP risk.
---

# IP Publication Gate

## 1. Mission
Stop irreversible IP loss before it happens. Publishing an enabling detail of a P0 invention
before filing destroys foreign patent rights permanently — there is no grace period in EP, JP or
CN. This gate runs before the artifact goes out, not after.

## 2. Core definition
Enables any agent to classify a proposed public artifact in the MAGIC/StudyNinja ecosystem,
respecting the barbell patent strategy, repository publication zones and the trade-secret list,
producing one of five verdicts with the rule and the reason.

## 3. Scope
Any artifact that leaves the private perimeter: repository contents, documentation, README,
website copy and media, screenshots, screencasts, demos, conference talks, blog posts, arXiv
submissions, SDK/API docs, datasets, sample code, investor materials.

## 4. Out of scope
Product decisions → `studyninja-product`. Architecture → `magic-architecture`. Strategy and
roadmap → `ecosystem-visionary`. Legal drafting — this skill routes to counsel, it does not
draft claims or give legal advice.

## 5. Activation triggers
A request to publish, demo, present, open-source or put something on a public site; a PR touching
a public-zone repository; preparation of a paper, deck or marketing asset; any question containing
patent, license, arXiv, trade secret, open source, or "can we show".

## 6. Goals
**User goal:** ship the artifact without losing rights. **Agent goal:** return a verdict fast, and
default to `file first` whenever the answer is unclear — the asymmetry is total, since delay costs
days and disclosure costs the right.

## 7. Domain model

| Term | Definition |
|---|---|
| Enabling detail | Information sufficient for a skilled practitioner to reproduce the mechanism. The trigger for `file first` |
| Non-enabling | Theory, motivation, results, high-level description that does not teach reproduction |
| P0 / P1 / P2 | Patent priority tiers: P0 filed immediately, P1 after e2e proof, P2 framed narrowly |
| Trade secret | Never patented, never published — value depends on secrecy |
| Defensive publication | Deliberate prior art to block others, accepting no patent |
| Repository zone | Public / partially public / private-commercial, per repo |
| Grace period | US 12 months after disclosure; **EP, JP, CN: none** |

## 8. Knowledge taxonomy
The five publication rules are hard constraints. Repository zones are policy. The trade-secret list
is a hard constraint with no exception path. Filing statuses are dated facts that expire.

## 9. Required inputs
What the artifact is; which repository or product it concerns; whether it contains enabling
detail; the intended channel. If enabling status cannot be determined, treat it as enabling.

## 10. Optional inputs
Current filing status for the affected invention, target date, audience. Default when absent:
assume nothing has been filed.

## 11. Evidence rules
`private/patents/` and counsel packets are authoritative on filing status. `PATENTS.md`,
`LICENSING.md` and the patent-gate files in `projects/*/papers/` are authoritative on zone and
gating. A statement that something "was already published" requires a link — assumption is not
evidence, and a prior leak does not license the next one.

## 12. Confidence model

| Confidence | Behavior |
|---|---|
| `confirmed` | Trade-secret list, the five rules, no-grace-period rule — apply autonomously |
| `probable` | Filing statuses dated 2026-07-10 — verify before relying on them |
| `unknown` | Enabling status unclear → treat as enabling, verdict `file first` |
| `conflicted` | Zone rules disagree → escalate, never resolve by picking the permissive one |

## 13. Main workflow
Trigger → identify affected invention and repository zone → test for trade-secret content →
test for enabling detail → apply the five rules → verdict + reason + required action →
if `file first`, name what must be filed and who is blocked.

## 14. Decision rules

**DR-01 — The five verdicts.** Evaluate in order; the first match wins.

| # | Verdict | Condition | Action |
|---|---|---|---|
| 1 | **Keep closed** | Contains a trade secret | Refuse. No redaction path — remove entirely |
| 2 | **File first** | Contains enabling detail of a patentable mechanism not yet filed | Block until provisional is filed; name the filing |
| 3 | **Redact** | High-level is safe, mechanism is not | Publish the high level; strip the mechanism |
| 4 | **Defensive publish** | Deliberate prior art, no patent intended | Publish, record as defensive |
| 5 | **Publish now** | Theory, docs, examples, non-enabling material in a public zone | Publish |

**DR-02 — Trade secrets (verdict 1, no exceptions).** Genome fitness functions and mutation
scoring; exact escalation thresholds and autonomy matrices; cross-service routing heuristics;
production telemetry and prompts; student digital-twin datasets; knowledge-graph quality weights.
These never appear anywhere public — including as illustrative examples in documentation.

**DR-03 — Patent tiers.**
| Tier | Invention | Publication stance |
|---|---|---|
| P0-A | ACT / Balansis compensated numerical substrate | File before any disclosure; blocks the arXiv upload |
| P0-B | MagicBrain genome-driven neurogenesis pipeline | Highest leak risk via demos and docs; file first |
| P1-A | MetaMind reflexive cognitive OS | File after e2e proof; redact mechanism until then |
| P1-B | KnowledgeBaseAI proposal-review-commit | Same family as P1-A |
| P2-A | StudyNinja adaptive digital-twin learning | Frame narrowly as multi-model inference orchestration, never as "adaptive education" |
| UWT | Theory | Defensive/scholarly publication; narrow applied methods only |

**DR-04 — Repository zones.**
Public: UWT (bridge details gated on filing), Balansis (ACT gate before arXiv), `docs/ip`
(public-safe, no counsel drafts). Partial: MagicBrain (research edition; fitness and tuning
private), xteam-agents (no P1-enabling detail before filing). Private/commercial: StudyNinja-API
(selected SDK/API docs only). Never: `private/patents/` — gitignored.

**DR-05 — arXiv ordering (irreversible if wrong).**
1. File the ACT provisional. 2. Then Balansis/ACT to `math.NA`. 3. Then UWT to `math-ph`.
4. Then record arXiv IDs in the docs. Uploading ACT before filing forfeits EP/JP/CN rights
permanently. Never reorder for convenience.

**DR-06 — Marketing and site material.** Screenshots and screencasts of the product are
`publish now` when they show the *interface*. They become `redact` when they expose the mechanism —
prerequisite logic that reveals question selection, mastery weights, confidence thresholds,
routing, or twin state. A public graph visualization may show aggregate scale and node types;
it may not show the weights or the selection rule. Anything under a P2-A framing gets the narrow
description, never the broad one.

## 15. Exceptions
The 12-month provisional → non-provisional/PCT deadline has no exception; missing it loses the
priority date. "It is already on the website" does not convert a `file first` into `publish now` —
it converts it into an incident to be assessed. Internal-only sharing is not publication, but an
unlisted URL, a public repo and a conference slide all are.

## 16. Tool usage
Check the patent-gate files (`projects/UWT/papers/arxiv/uwt_bilingual/patent_gate.md`,
`projects/Balansis/.../patent_gate.md`) before any paper action. Grep the artifact for
trade-secret terms before approving it. Never rely on a summary for filing status — read the
source and note its date.

## 17. Memory and context
The five rules and the trade-secret list are stable — carry them. Filing statuses are volatile —
re-read every time; a status from a previous session is not evidence.

## 18. Multi-agent delegation
Route to a human with counsel access when filing status is unknown, when a verdict would be
`file first` under time pressure, or when an incident (already-published enabling detail) is
detected. Route license-text questions to `LICENSING.md`, not to interpretation.

## 19. Output contracts
Verdict (one of the five), the invention or zone affected, the specific content that triggered it,
the required action, and — for `file first` — who is blocked and on what.

## 20. Failure handling
Cannot determine enabling status → treat as enabling. Cannot determine the zone → treat as
private. Conflicting sources → escalate. Never resolve uncertainty toward publication.

## 21. Escalation rules
Escalate when: an enabling detail may already be public; a deadline is near; a contributor's
inbound work carries patent risk (handle via CLA); a commercial licensee asks for material outside
their zone; a verdict of `file first` blocks a committed external date.

## 22. Safety boundaries
Never publish trade secrets. Never approve an arXiv upload of ACT material before the provisional
is filed. Never widen a P2 framing to the broad domain. Never grant a license interpretation —
route to the license text and to counsel.

## 23. Quality gates
Before returning a verdict: invention identified; zone identified; trade-secret grep run;
enabling test applied; source dated.

## 24. Validation protocol
Test the gate against known artifacts: the UWT arXiv package (expect `publish now` after gate
check), the ACT paper (expect `file first` if the provisional is unfiled), a MagicBrain fitness
function (expect `keep closed`), a product screenshot (expect `publish now`), a graph screenshot
exposing selection weights (expect `redact`).

## 25. Examples
- *A blog post explaining why compensated arithmetic avoids NaN, with no ACT structures.* →
  `publish now`: motivation and results, non-enabling.
- *The same post including the magnitude-direction structure and compensation telemetry.* →
  `file first`: that is the P0-A mechanism.

## 26. Counterexamples
- *A README for a public repo* looks automatically safe, but is `redact` if it documents the
  genome→tissue pipeline in reproducible detail. Zone does not override content.
- *A conference talk with "no slides shared"* is still disclosure.

## 27. Anti-patterns
Publishing because a deadline is near. Treating a prior leak as permission. Using a real fitness
function as a documentation example. Assuming an internal demo is private when it is recorded.
Reordering the arXiv sequence. Describing P2-A as "AI for education" in a filing context.

## 28. Test cases
Critical: ACT enabling detail before filing must return `file first`; any trade-secret term must
return `keep closed`; unknown enabling status must not return `publish now`.

## 29. Definition of Done
Verdict returned with rule, affected asset, triggering content, required action, and escalation
raised where §21 applies.

## 30. Versioning and updates
Statuses dated 2026-07-10: barbell triage done; dual licences on 8 repos; arXiv packages prepared;
IP execution pack in `docs/ip/`. Re-verify filing status before every use. Update when a
provisional is filed, a PCT decision is made, or a repository changes zone.

## 31. Final internal review
Did I identify the invention and the zone? Did I check the trade-secret list? Did I apply the
enabling test? Did I default toward caution on uncertainty? Did I verify filing status rather than
recall it?

## Sources
`docs/PATENT_STRATEGY_ROADMAP_2026-07-10.md`, `LICENSING.md`, `PATENTS.md`,
`docs/OPEN_REPOSITORY_PUBLICATION_PATENT_COMMERCIALIZATION_PLAN_2026-07-10.md`,
`docs/ARXIV_PUBLICATION_UWT_BALANSIS.md`, `docs/GOVERNANCE_IMPLEMENTATION_2026-07-10.md`,
`.claude/skills/ecosystem-visionary/references/ip-commercialization.md` (distillate, 2026-07-10).
