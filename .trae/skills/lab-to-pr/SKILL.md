---
name: lab-to-pr
description: Turn a problem found in a running environment into a merged change through the team's normal Git workflow — locate the owning repository (including git submodules), reproduce locally, branch, fix, test, commit, push and open a Pull Request. Use when a bug is found by observing Dev or Production, when asked to fix something discovered through diagnostics, when working across the submodule projects under projects/, or when tempted to patch a running container instead of the source. Triggers include "найди и исправь", "сделай PR", "почини баг", "submodule", "запушь", "create a pull request", "исправь на проде".
---

# Lab to PR

## 1. Mission
Ensure that a fix discovered through observation reaches Production the same way every other change
does. A patch applied directly to a running container fixes the symptom and guarantees it returns
at the next deploy, with nobody able to explain why.

## 2. Core definition
Enables an engineering agent to convert an operational finding into a reviewed change, respecting
the team's existing branch/PR/CI workflow and the submodule topology of this ecosystem, producing a
Pull Request that states what was observed, what was changed and how it was verified.

## 3. Scope
Locating source, reproducing, fixing, testing and shipping. Does not deploy to Production — merge
and the existing pipeline do that. Defers to `production-access` for anything read from a live
environment and to `xteam-control-center` §7 for infrastructure changes that are not code.

## 4. The path

```
Investigate → Find source → Reproduce → Locate repository → Create branch
→ Implement fix → Write/update tests → Run tests → Run the application → Verify
→ Commit → Push → Pull Request
```

**Reproduce before fixing.** A fix for a bug that was never reproduced locally is a guess with a
diff attached. If it cannot be reproduced, say so and state what would make it reproducible — that
is often a `environment-drift` finding, not a code problem.

## 5. Submodule topology

`StudyNinja-Eco` is orchestration only; application code lives in **git submodules** under
`projects/`, each pinned to its own branch and its own remote. Consequences that bite:

- A change to application code is **two commits in two repositories**: one in the submodule, one in
  the superproject moving the pointer. Pushing only the first leaves everyone else on the old code;
  pushing only the second breaks the checkout.
- The submodule's branch, not `config/projects.yml`, is what is actually checked out.
- Work inside the submodule directory. `git -C projects/StudyNinja-API ...` — the superproject's
  branch is irrelevant to a submodule commit.

Before starting, know where you are:

```bash
git -C projects/StudyNinja-API rev-parse --abbrev-ref HEAD
git submodule status
```

### Known traps in this ecosystem
- A global `pull.rebase=true` will eat merge commits when updating submodules. Check
  `git config --get pull.rebase` before merging.
- Narrowed fetch refspecs can hide fresh commits — a submodule can look up to date while the remote
  branch is ahead. `git -C SUB fetch origin BRANCH && git -C SUB log HEAD..origin/BRANCH --oneline`.
- Some submodules use HTTPS and some SSH remotes; a failing push may be an auth mismatch, not a
  permission problem.

## 6. Before the branch

- **Never commit someone else's dirt.** If the working tree is already dirty, that is unfinished
  work belonging to a person or another session. Do not stage it, do not stash it. Branch from a
  clean base or ask.
- Confirm the base branch is current: `git fetch origin && git status -sb`.
- Branch name says what and why: `fix/exam-roadmap-limit`, not `fix/bug`.

## 7. Tests

- Run the suite **before** the change and record the baseline. Pre-existing failures are common
  here; without a baseline any failure afterwards looks like yours and any of yours looks
  pre-existing.
- Add a test that fails without the fix. A fix with no failing-before test has not been shown to fix
  anything.
- **Never delete or weaken a failing test to make a suite green.** Read it, determine what it
  asserts, and if its thesis is genuinely obsolete, rewrite it with the reasoning in the docstring
  and say so in the PR.
- Run the app and exercise the actual path, not only the unit test.

## 8. Commit and PR

Commit message: what changed and why, imperative mood, no invented attribution. Push only when the
user has asked for it; branch first if on the default branch.

The PR body should let a reviewer skip the investigation:

```
## What was observed
Where, in which environment, with what evidence (metric, log line, request).

## Root cause
The mechanism, not the symptom.

## What changed
The diff in one paragraph.

## How it was verified
Baseline, new test, manual check, environment used.

## Risk and rollback
Blast radius; what reverting costs.
```

## 9. The boundary

Publishing, pushing and opening a PR are outward-facing actions. Confirm before the first push to a
remote unless the user has already authorised it in this session; approval to fix is not approval to
publish. Nothing about an operational finding justifies bypassing review — the urgency of an
incident is an argument for a human deciding, not for an agent shipping unreviewed.
