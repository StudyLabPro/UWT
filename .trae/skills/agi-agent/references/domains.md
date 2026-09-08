# Domain Adapters

The pipeline is domain-independent; the *calibration* is not. What counts as evidence, how much
autonomy is safe, and what must always escalate differ sharply by field. Load the adapter for the
domain in play and apply it at stages 2 (sources), 10 (autonomy) and 11 (exceptions).

## How to use an adapter

Each adapter fixes four things:
- **Evidence standard** — what makes a claim usable in this field.
- **Source ranking** — which source wins when two conflict.
- **Default autonomy ceiling** — the highest autonomy any rule may claim before domain review.
- **Always escalate** — conditions that override any confidence level.

When the domain is not listed, pick the nearest adapter by *consequence structure*, not by subject:
how bad is a wrong answer, how reversible is it, and who is harmed.

---

## Regulated & high-consequence

### Medicine / clinical
- **Evidence:** guideline or peer-reviewed study > clinical experience > case report. Study design
  matters more than recency.
- **Ranking:** current clinical guideline > systematic review > specialist opinion > local habit.
- **Autonomy ceiling:** `propose`. Never `auto` on anything patient-affecting.
- **Always escalate:** any individual patient decision, dosing, contraindication, triage,
  off-guideline recommendation, anything a licensed professional must sign.
- **Note:** compile the *process* (intake, documentation, checklists, coordination), not the
  clinical judgment.

### Law
- **Evidence:** statute and binding precedent > regulator guidance > commentary > practitioner habit.
- **Ranking:** jurisdiction-specific text wins absolutely. A rule without a jurisdiction is invalid.
- **Autonomy ceiling:** `propose` for anything advisory; `auto` acceptable for classification,
  extraction, deadline computation and document assembly against a fixed template.
- **Always escalate:** legal advice, filings, deadlines with limitation consequences, conflicts of
  interest, anything privileged.
- **Note:** `applies_when` must always carry jurisdiction and effective date.

### Finance / accounting
- **Evidence:** regulation and accounting standard > auditor position > firm policy > analyst view.
- **Ranking:** binding standard > regulator interpretation > internal policy.
- **Autonomy ceiling:** `auto` for reconciliation, classification and reporting against fixed rules;
  `escalate` for anything valuation- or judgment-based.
- **Always escalate:** money movement, irreversible transactions, tax positions, anything crossing a
  materiality threshold, anything a controller signs.

### Manufacturing / engineering
- **Evidence:** standard and spec > test data > field experience > supplier claim.
- **Ranking:** safety standard > design spec > tribal knowledge.
- **Autonomy ceiling:** `auto-if-reversible`.
- **Always escalate:** safety margins, tolerance changes, material substitution, anything touching a
  certified design or a physical-harm path.

---

## Operational & technical

### Software development
- **Evidence:** the running system > tests > code > docs > tickets > memory. Docs lie earliest.
- **Ranking:** observed behavior beats every description of behavior.
- **Autonomy ceiling:** `auto` for reversible changes with test coverage; `propose` for schema,
  auth, data migration, public API.
- **Always escalate:** data loss potential, irreversible migration, credentials, production
  deletion, anything without a rollback path.
- **Note:** rich in reverse-engineering material — commit history, test suites and post-mortems
  encode decisions no one wrote down.

### Operations / IT
- **Evidence:** runbook validated by an incident > monitoring data > post-mortem > habit.
- **Ranking:** what actually restored service beats what the runbook claims.
- **Autonomy ceiling:** `auto` for diagnosis and reversible remediation.
- **Always escalate:** customer-visible degradation, irreversible remediation, actions during an
  active incident without an incident commander.

### Analytics / data science
- **Evidence:** reproducible query > documented metric definition > analyst recollection.
- **Ranking:** the metric definition of record beats any convenient variant.
- **Autonomy ceiling:** `auto` for computation, `propose` for interpretation and causal claims.
- **Always escalate:** causal claims, results contradicting an official metric, anything feeding an
  external report.
- **Note:** the highest-value KUs are usually definitional — which rows are excluded, and why.

### Science / research
- **Evidence:** replication > pre-registered study > single study > preprint > expert opinion.
- **Ranking:** effect size and method quality over publication venue.
- **Autonomy ceiling:** `propose`.
- **Always escalate:** any novel claim, any statistical inference presented as conclusion.
- **Note:** preserving uncertainty is the deliverable, not a caveat on it.

---

## Judgment & craft

### Design / creative
- **Evidence:** stated brand system > user research > craft convention > personal taste.
- **Ranking:** the project's own system beats general best practice.
- **Autonomy ceiling:** `auto` within an explicit design system; `propose` outside it.
- **Always escalate:** brand identity changes, accessibility regressions, anything that ships under
  someone else's name.
- **Note:** the hardest and most valuable extraction is separating **preference** from
  **principle**. Test: can the expert name a consequence for doing it the other way? No consequence,
  no rule — record it as a default.

### Management / strategy
- **Evidence:** outcome data > documented decision rationale > stated policy > opinion.
- **Ranking:** what the organization did beats what it says it does.
- **Autonomy ceiling:** `propose`.
- **Always escalate:** anything about people, compensation, hiring, firing, org structure,
  commitments to third parties.

### Sales / marketing
- **Evidence:** conversion data > tested messaging > channel convention > opinion.
- **Ranking:** measured result beats confident narrative, and this field produces more confident
  narrative than most.
- **Autonomy ceiling:** `auto` for drafting and research; `propose` for anything customer-facing.
- **Always escalate:** pricing, claims about the product, contractual language, anything published
  under the brand.
- **Note:** heavy in `preference` disguised as `heuristic`. Demand the number.

### Education
- **Evidence:** learning outcome data > curriculum standard > pedagogical research > practice.
- **Ranking:** the mandated standard beats method preference.
- **Autonomy ceiling:** `auto` for content generation against a standard; `propose` for assessment.
- **Always escalate:** grading of record, anything affecting a student's progression, content for
  minors that has not been reviewed.

---

## Building a child skill for a specific domain

When a domain recurs, compile a specialized child skill rather than re-deriving:

1. Inherit this skill's pipeline, taxonomy and confidence model by reference — do not copy them.
2. Override only: evidence standard, source ranking, autonomy ceiling, escalation set, vocabulary,
   and domain-specific failure modes.
3. Add the domain's regulatory or contractual constraints as `hard-constraint` KUs with sources.
4. Keep the parent's Definition of Done; add domain-specific gates on top.
5. Name it `agi-agent-<domain>` and record the parent version it was derived from, so a parent
   update can be propagated.
