---
name: no-production-data-publication
description: Mandatory global privacy boundary that prevents real production user data, personal data, telemetry, logs, prompts, learned weights, embeddings, checkpoints, graph-quality weights, secrets, dumps, and derived production artifacts from entering public repositories, releases, packages, images, demos, development fixtures, or hot-development environments. Use before every publication, repository visibility change, public push, release, dataset export, environment copy, demo, or production-to-lab/dev synchronization.
---

# No Production Data Publication

## Hard boundary

Never publish or copy out of the production trust boundary:

- real user, student, parent, teacher, employee, customer, or tenant records;
- personal, identifying, pseudonymized, behavioral, financial, authentication, session, message, interaction, or uploaded-content data;
- raw or sampled production telemetry, analytics events, logs, traces, metrics labels, crash dumps, prompts, responses, feedback, or audit events;
- model weights, checkpoints, adapters, embeddings, vector snapshots, graph-quality weights, ranking weights, digital-twin state, calibration, or other learned artifacts derived from real production activity;
- database dumps, object-store exports, queues, caches, backups, search indexes, volume snapshots, packet captures, or support bundles;
- API keys, tokens, cookies, certificates, private endpoints, credentials, secret values, or production configuration values.

This boundary applies to public Git history, branches, tags, releases, packages, container images, registries, build caches, CI artifacts, issues, pull requests, wikis, documentation, screenshots, demos, test fixtures, seed data, Lab, Dev, and hot-development environments.

An owner request to make code public does not authorize publication of these data classes.

## Safe parity rule

Reproduce production behavior through code SHA, image digest, schema revision, configuration-key shape, feature flags, API contracts, and synthetic scenarios. Never use production data as the shortcut to parity.

Allowed test material must be generated or demonstrably synthetic. Replacing names or emails is not sufficient anonymization when records, event sequences, free text, identifiers, embeddings, or rare attributes remain linkable to a real person.

## Publication gate

Before changing repository visibility or publishing a new artifact:

1. Inspect the working tree and every reachable Git object, branch, tag, and submodule revision that will become visible.
2. Inspect Git LFS objects, release attachments, packages, container layers, generated sites, CI artifacts, issue/PR attachments, and repository wiki content in scope.
3. Scan for secrets and prohibited data patterns without printing matched values. Report only classification, location, commit/object identity, and remediation state.
4. Verify ignore rules and build contexts exclude local data, model, telemetry, dump, backup, cache, upload, and secret paths.
5. Verify runtime examples and screenshots use synthetic identities and synthetic telemetry.
6. Record a machine-readable clean result tied to the exact commit SHA being published.

Changing only the current files is insufficient: making a private repository public exposes its reachable history and repository-level collaboration surfaces.

## Production-to-Lab/Dev/Hot synchronization

Synchronization may import code and non-secret structural facts only:

- commit SHA and branch ancestry;
- immutable image digest and non-sensitive labels;
- migration revision identifiers;
- environment-variable names, never values;
- feature-flag names and explicitly public-safe values;
- schemas, contracts, synthetic seeds, and sanitized aggregate behavior specifications.

Do not copy production databases, volumes, object stores, queues, caches, logs, traces, telemetry, prompts, weights, or user-derived artifacts.

## Detection response

If prohibited material is found:

- block publication or environment copy;
- do not echo or quote the value;
- identify every reachable occurrence, derivative artifact, and publication surface;
- remove it from the complete publication set, including history when necessary;
- rotate or revoke exposed credentials;
- invalidate derived caches, packages, images, and releases;
- require a new clean scan against the final exact SHA.

Previously published material is an incident, not permission to republish it.

## Output contract

Use `FACT`, `UNKNOWN`, `RISK`, and `ACTION`. Never include secret values, personal records, raw telemetry, weights, or excerpts that could reconstruct them. A clean verdict must identify the exact SHA and all surfaces scanned; otherwise report `UNKNOWN` and keep publication blocked.

## Definition of done

- No prohibited data class exists in the publication set or target non-production environment.
- Full-history and non-Git publication surfaces were checked.
- Fixtures and demos are synthetic and non-linkable.
- The result is tied to an immutable SHA.
- Any detected exposure has been removed, invalidated, and rescanned without displaying its contents.
