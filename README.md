[![License](https://img.shields.io/badge/license-AGPL--3.0--only%20%2B%20Commercial-blue.svg)](./LICENSING.md)

# Unified Whole Theory (UWT)

Unified Whole Theory (UWT), по-русски **ТЕЦ — Теория Единого Целого**, — это
исследовательский проект, объединяющий теоретические материалы, arXiv-ready
публикации, вычислительное моделирование и web-atlas визуализаций.

UWT в экосистеме StudyNinja-Eco отвечает за верхний теоретический и
моделирующий слой: relations-first ontology, конечные модели, wavefunction from
relations, проверяемые вычислительные эксперименты и публичный web-интерфейс.

## Repository Map

| Path | Purpose |
|---|---|
| `theory/` | Monograph sources and generated PDF artifacts. |
| `papers/` | arXiv drafts, problem-solution papers, and patent-gated publication materials. |
| `modeling/` | Python package `uwt-modeling` for relational simulation, verification, and forecasting experiments. |
| `web-app/` | React/Vite web atlas served in the ecosystem as `uwt-web`. |
| `donations-api/` | Lightweight Node.js API for donation/checkout integration. |
| `simple_explanation.md` | Public-friendly explanation layer. |

## Quick Start: Modeling

```bash
cd modeling
python -m pip install -e ".[test]"
pytest
uwt-model --steps 200 --parts 24 --out results/run.json
```

The modeling package uses Balansis/ACT semantics for compensated numerical
workflows where relevant. See `modeling/README.md` for the wavefunction and
verification details.

## Quick Start: Web Atlas

```bash
cd web-app
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
npm run check
npm run preview
```

## Full Local Check

On Windows/PowerShell:

```powershell
.\check-all.ps1
```

The script validates the web application and modeling package:

- `npm run build` for `web-app`;
- `npm run lint` for `web-app`;
- `python -m pytest` for `modeling`.

## Publication and Patent Boundary

UWT is intended for publication, but applied simulation and prediction methods
must pass the patent/publication gate before broad disclosure.

Read before publishing or opening implementation-heavy pull requests:

- `papers/arxiv/uwt_bilingual/patent_gate.md`
- `papers/patents/relational_simulation_provisional/README.md`
- `PATENTS.md`
- root ecosystem plan:
  `../../docs/OPEN_REPOSITORY_PUBLICATION_PATENT_COMMERCIALIZATION_PLAN_2026-07-10.md`

Allowed public layer: theory, high-level finite models, public arXiv material,
non-confidential visualizations, and reproducible non-secret examples.

Keep private until reviewed or filed: step-by-step compensated prediction
pipelines, private thresholds, customer workflows, prompts, telemetry, claim
language, filing receipts, and attorney work product.

## Licensing and Governance

UWT uses a dual-license model:

- `LICENSE`: AGPL-3.0-only
- `COMMERCIAL_LICENSE.md`: proprietary commercial terms
- `LICENSING.md`: route selection guide
- `CLA.md`, `CONTRIBUTING.md`, `SECURITY.md`: contribution and security rules
- `PATENTS.md`, `TRADEMARKS.md`, `CITATION.cff`: IP boundaries, brand policy,
  and citation metadata

Author/contact: Andrey Tikhonov (Тихонов Андрей) — `uwt@xteam.pro`.
