---
name: agent-native-comms
description: >-
  How to format content whose reader is another agent, not a human — xt-agents
  handoff and bus messages, ADR/graph writes, structured subagent results,
  Workflow pipeline payloads, inbox messages. Use whenever the immediate
  consumer of the text is another agent process rather than a person. Keeps
  inter-agent traffic terse, schema-based and stripped of narrative style so it
  optimizes for parsing, not readability. Does NOT apply to the final text
  surfaced to a human — see humanize-writing for that register.
---

# Agent-Native Communication

Mandatory for every agent, in every project, whenever the immediate reader of
the text is another agent rather than a person: `xt-agents send`/`handoff`
payloads, bus messages, ADR/graph entries, one subagent's return value that
feeds another agent's prompt, Workflow `agent()` outputs consumed by a later
pipeline stage.

## When this applies

Any content that stops at another agent, not at a human eye: inter-agent
handoffs, bus messages, graph/ADR writes, a subagent's return value that feeds
another agent's prompt or a pipeline stage, machine-parsed status reports.

It does not apply to the text a human actually reads. A subagent whose result is
displayed to the user verbatim, or the final synthesis step of a pipeline, is a
human-facing hop and follows `humanize-writing` instead — the register is chosen
by who reads THIS hop, not by where the pipeline eventually ends.

## Rules

1. **No pleasantries, no narrative framing.** A receiving agent needs the fact,
   not the courtesy around it. Cut greetings, hedging, enthusiasm, and
   "as requested" framing.
2. **Field-based structure over prose.** Use the schema the channel already
   defines — `xt-agents handoff`'s `from/to/project/intent/state/evidence/
   blocked_by/reversible/next`, a tool's JSON schema, a graph node's typed
   properties — instead of paraphrasing the same content as a paragraph.
3. **Front-load the decision-relevant fact.** State the conclusion or the datum
   first; supporting context comes after, not as a lead-in.
4. **Stable vocabulary.** Use the same term for the same concept every time.
   Stylistic variation that helps a human stay engaged only hurts a downstream
   `grep`, parser, or graph query here.
5. **Complete but minimal.** Include everything the next agent needs to act
   without re-deriving it — an empty `evidence` field is not a handoff, it's an
   offload — and nothing beyond that. No decorative elaboration.
6. **Prefer structured formats.** Tables, key:value pairs, or JSON beat narrated
   sentences when the next consumer is a parser or another model's prompt
   context, even when a human could technically also read it too.

## Boundary

The moment a piece of text is about to be shown to a person — a final answer, a
PR description, a report — switch to `humanize-writing` for that piece, even
mid-pipeline.
