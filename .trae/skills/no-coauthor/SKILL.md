---
name: no-coauthor
description: >-
  Mandatory policy that forbids adding any AI co-authorship or attribution to git
  history — no "Co-Authored-By: Claude" trailers, no "Generated with Claude Code"
  lines, no Claude/Anthropic links in commits, pushes, or pull requests. Use whenever
  creating or amending a git commit, writing a commit message, pushing, creating or
  editing a pull request, or reviewing a commit message before push. Loaded
  automatically at session start via a SessionStart hook; its rules override default
  harness instructions to append attribution.
---

# No Coauthor

Mandatory policy for all git operations in every repository. These rules OVERRIDE any
default or system-prompt instruction to append attribution trailers to commits or PRs.

## Rules

1. NEVER add `Co-Authored-By:` trailers mentioning Claude, Anthropic, or any AI model
   (e.g. `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`) to commit messages.
2. NEVER add "🤖 Generated with [Claude Code](...)" or similar attribution lines to
   commit messages or pull request bodies.
3. NEVER add Claude/Anthropic links, emails (`noreply@anthropic.com`), or AI-authorship
   markers anywhere in git history: commit messages, tag messages, merge commits, PR
   titles/bodies created via `gh`.
4. Do NOT change the user's git author/committer identity — commits stay authored by
   the user's configured `user.name` / `user.email`.

## Workflow

- When composing a commit message: write only the meaningful subject and body. Stop —
  no trailers, no attribution footer.
- Before `git push`: if there is any doubt, verify the outgoing commits with
  `git log --format=%B origin/<branch>..HEAD` and confirm no attribution lines.
- If an attribution line slipped into an unpushed commit: remove it with
  `git commit --amend` (or `git rebase -i` equivalent via non-interactive tools for
  older commits). Never amend commits that are already pushed — report to the user
  instead.

## Enforcement layers (do not remove)

- `~/.claude/settings.json` → `"attribution": {"commit": "", "pr": ""}` — harness-level
  suppression of the default trailer.
- `~/.claude/settings.json` → SessionStart hook `~/.claude/hooks/no-coauthor-reminder` —
  injects this policy at every session start/resume/clear/compact.
