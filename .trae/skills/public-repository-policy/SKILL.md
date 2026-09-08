---
name: public-repository-policy
description: Mandatory global policy for moving active repositories to a public dual-license model while preserving an explicit private allowlist, production-data boundaries, patent and trade-secret gates, and copyright provenance. Use for repository visibility, licensing, publication, open-source preparation, public branches, releases, mirrors, and organization-wide GitHub governance.
---

# Public Repository Policy

## Declared target state

The owner has declared public visibility to be the default target for every active,
non-archived repository. The following repositories remain private:

- `StudyLabPro/StudyNinja-API`;
- `StudyLabPro/StudyNinjaUIKit`;
- `StudyLabPro/KnowledgeBaseAI`;
- `AndrewHakmi/APLO`;
- `AndrewHakmi/MarketPlaceML`;
- the owner-named project `Sallerya`, after its exact GitHub owner/repository slug is
  identified and registered.

Do not guess or fuzzy-match the unresolved `Sallerya` identifier. Until its exact
repository identity is confirmed, do not change the visibility of a possible match.

This is a desired end state, not evidence that a repository is safe to open and not
permission to bypass a publication gate. Work only with active repositories under
`no-archived-repositories`.

## Default dual-license model

The target public code license is:

1. `AGPL-3.0-only` for open-source use; and
2. a separate proprietary commercial license issued by the copyright holder.

Each repository must contain the exact GNU AGPL v3 text in `LICENSE`, a concise
`LICENSING.md` that explains the two choices without changing the AGPL terms, and
consistent package metadata, source headers, README statements and commercial
contact details. Documentation, datasets, model artifacts, trademarks and third-party
components must declare their own terms when the code license does not cover them.

Dual licensing is allowed only for code whose copyright holder has authority to offer
both licenses. Before changing an existing license, build a contributor and provenance
map, inspect dependency and vendored-code licenses, and obtain any permissions needed
for third-party contributions. Never claim that a new license cancels rights already
granted under an earlier release.

## Mandatory publication gate

Before a private repository becomes public, or before a new public branch, release,
package, image, site or mirror is published:

1. Resolve the exact repository and candidate commit SHA.
2. Apply `no-production-data-publication` to the working tree, every reachable Git
   object and every non-Git collaboration/publication surface.
3. Apply `ip-publication-gate` to patentable implementation details, trade secrets,
   security-sensitive topology, customer material and contractual restrictions.
4. Verify copyright provenance and the complete license matrix.
5. Produce a path-level allowlist for public content. Unknown or mixed-sensitivity
   paths are private by default.
6. Build a clean publication candidate from the allowlist, scan it again, and bind the
   verdict to its immutable SHA.
7. Record one verdict: `KEEP CLOSED`, `FILE FIRST`, `REDACT THEN PUBLISH`,
   `DEFENSIVE PUBLICATION`, or `PUBLISH NOW`.

Only `PUBLISH NOW`, or an explicit owner decision for `DEFENSIVE PUBLICATION`, permits
the visibility/publication mutation. `FILE FIRST` remains blocked until filing evidence
is recorded. Changing visibility is not a substitute for rewriting unsafe history or
cleaning Actions logs, artifacts, releases, issues, pull requests and wikis.

## Research-first rollout

The first publication/runtime wave consists only of:

- `StudyLabPro/Balansis`;
- `StudyLabPro/UWT`;
- `StudyLabPro/agent-native-universe`;
- `StudyLabPro/MagicBrain`.

Existing public visibility does not imply a clean gate. Audit already-public history
as an incident surface and prevent further disclosure until the current candidate is
classified. A repository that mixes publishable research with protected implementation
must be split into a clean-history public research edition and a private core; branch
filtering inside one public repository is not a confidentiality boundary.

## Hot-development interaction

A public repository makes its `hot-dev` branch and unreviewed commits public too.
Therefore `hot-dev` may be created or activated only after the same repository-level
publication gate passes. Patent-sensitive or mixed repositories use a private core
hot-development branch and export only reviewed allowlisted snapshots to the public
research edition.

Hot-development never receives production data, telemetry, prompts, weights, dumps,
secrets or derived user artifacts. Production parity uses immutable code/image
identities, schema and contract metadata, configuration key names and synthetic data.

## Definition of done

- The repository is in the active non-archived working set and is not on the private
  allowlist.
- A clean verdict covers the exact public SHA, full reachable history and non-Git
  surfaces.
- Patent/trade-secret disposition and copyright authority are recorded.
- AGPL and commercial terms are consistent across files and package metadata.
- Public and private components have a technically enforced boundary when a split is
  required.
- Visibility, branch protection and published artifacts match the recorded decision.
