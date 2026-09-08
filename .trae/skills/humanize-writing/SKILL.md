---
name: humanize-writing
description: >-
  How to write text whose reader is a human — documentation, README/ARCHITECTURE
  files, PR and commit descriptions, chat replies, reports, onboarding guides,
  incident writeups, comments on tickets addressed to people. Use whenever the
  next reader of the text is a person, not another agent. Governs tone, structure
  and phrasing so output reads like something a competent colleague wrote, not
  like machine-generated boilerplate — without sacrificing technical accuracy.
  Does NOT apply to agent-to-agent artifacts (handoffs, bus messages, ADR/graph
  payloads, structured tool output) — see agent-native-comms for that register.
---

# Humanize Writing

Mandatory for every agent, in every project, whenever the text being produced will
be read by a human. It does not relax technical accuracy — it removes the tells
that make text read as generated rather than written.

## When this applies

Any output whose direct reader is a person: chat replies, README/ARCHITECTURE/
DEPLOYMENT docs, specs meant for a human reviewer, PR and commit descriptions,
code review comments addressed to a person, incident postmortems, onboarding
material, marketing/product copy, tickets and issue comments written to a human.

It does not apply to text produced for another agent to parse — see
`agent-native-comms`. A pipeline that ends in a human-facing summary still
humanizes that final summary, even if every step before it was agent-to-agent.

## Rules

1. **No stock AI phrasing.** Cut "Certainly!", "I hope this helps!", "It's worth
   noting that", "Let's dive in", "In conclusion", "Feel free to...", restating the
   question before answering, and enthusiasm that isn't earned by content.
2. **No padding.** No throat-clearing intros ("In this document we will explore...")
   or summarizing outros that just repeat what was already said.
3. **Prose over bullets for reasoning.** Reserve lists for things that are actually
   enumerable — steps, parameters, options. Explanations, trade-offs and nuance
   read better as prose with normal connective logic than as fragments stitched
   into bullets.
4. **Vary rhythm.** Avoid mechanical parallelism ("Firstly... Secondly... Thirdly...")
   and repeating the same sentence skeleton across a paragraph.
5. **Vary structure, not just wording.** Don't default to the same shape every
   time — the same opening move, the same "topic sentence + three bullets +
   one-line conclusion" template, the same header set on every piece regardless
   of what it's about. If two consecutive pieces of writing would come out with
   an identical skeleton, change one. Structure follows what the content
   actually needs, not a reusable mold.
6. **Ration punctuation crutches.** The em dash is a known tell of generated
   text when it shows up in nearly every sentence — use it sparingly, only where
   it's genuinely the right mark for an abrupt break or asides, and prefer
   commas, periods, colons, or parentheses the rest of the time. The same
   restraint applies to other habitual tics: a colon before every list, "→" as
   a cause-effect shorthand, chained semicolons, or bolding scattered keywords
   for emphasis that isn't load-bearing.
7. **Say the specific thing.** Use the actual file, name, number, or command
   instead of a vague abstraction ("the config file" → `config/versions.yml:14`).
8. **Match register to the actual reader.** A README for engineers, a note to a
   non-technical stakeholder, and a public blog post are different registers —
   adjust jargon and formality, don't default to one voice for all three.
9. **Don't over-hedge.** If something is a verified fact, state it as one. Reserve
   "might", "possibly", "it seems" for genuine uncertainty.
10. **Headers earn their place.** Use section headers only when the piece is long
    enough to need navigation — a three-paragraph answer doesn't need `## Summary`.
11. **Human ≠ casual.** Technical precision is never traded for a friendlier tone.
    Specs and API references stay exact; "human" means naturally readable and
    well-organized for a person, not softened or dumbed down.

## Boundary

Code comments follow the project's own comment conventions (usually: none unless
the WHY is non-obvious) — this skill governs prose documentation and messages to
people, not what gets written inline in source.

Humanizing tone and structure never reintroduces content another core rule
forbids. `no-human-time-estimates` still applies in full: no person-hours,
days, weeks, sprints, or ETAs when describing effort or scope of work, no
matter how naturally the surrounding prose reads. Work is still described
through phases, dependencies, and completion criteria — this skill changes the
phrasing, never the substance of what may be said about time or effort.
