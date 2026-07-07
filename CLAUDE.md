# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Research monorepo for the **Unified Whole Theory** (UWT; Russian: ТЕЦ — Теория Единого Целого), a relational physics theory. Most documentation, paper content, UI text, and comments are in **Russian** — keep new user-facing text and docs in Russian unless asked otherwise.

Everything lives under the top-level directory `Unified Whole Theory/` (note the spaces — always quote paths in shell commands):

- `theory/`, `papers/` — LaTeX/Markdown monograph and papers. Compiled PDFs are committed alongside the `.tex` sources.
- `modeling/` — Python package `uwt_modeling`: computational model, theory verification, and forecasting. The only part with tests.
- `web-app/` — static Vite + React 18 + TypeScript SPA presenting the theory (no backend, no router). Scaffolded by TRAE; PRD and architecture docs are in `.trae/documents/`.
- `simple_explanation.md` — popular-science slide source that `web-app/src/data/slides.ts` is derived from.

## Commands

### Python modeling (run from `Unified Whole Theory/modeling`)

There is a `.venv` (Python 3.11) at the repo root. Requires Python >= 3.10.

```powershell
python -m pip install -e .[test]   # editable install with pytest
pytest                              # run all tests (testpaths=tests, pythonpath=src via pyproject.toml)
pytest tests/test_theory_checks.py::test_metric_and_speed_bound   # single test

uwt-model --steps 200 --parts 24 --out results/run.json           # CLI entry point
python -m uwt_modeling.cli --steps 200 --parts 24 --out results/run.json  # equivalent
```

### Web app (run from `Unified Whole Theory/web-app`)

```powershell
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run check     # typecheck only (tsc -b --noEmit)
npm run lint      # eslint
npm run preview
```

There are no web-app tests.

## Architecture

### Modeling package (`modeling/src/uwt_modeling/`)

Implements the UWT modeling chain documented in `modeling/README.md`:

```
U -> A -> Disc -> R -> V -> S -> Time -> d -> v,a -> m,p,F,E,L,H
```

Parts are not points in space; their states live in the discrete group Z_N^d. Relations are componentwise differences mod N, distance is a metric projection of relations, and all physical quantities (velocity, mass-from-stability, momentum, force, energy, Lagrangian, entropy) are derived from relation changes per step.

Module roles:

- `config.py` — `UWTConfig`, a frozen dataclass of all simulation parameters (defaults double as CLI defaults).
- `structures.py` — `RelationSpace`: the discrete relation space, `rho` and metric projection.
- `universe.py` — `RelationalUniverse`: the core simulator. `step()` produces a full snapshot dict; `theory_checks()` validates the theory's claims: metric axioms, local speed bound, entropy non-decrease (arrow of time), and energy accounting.
- `metrics.py` — metric-axiom checking.
- `balansis_adapter.py` — thin wrapper over the external `balansis` library (`AbsoluteValue`/`Operations`) for compensated summation; all energy/Lagrangian totals go through `compensated_sum`, which also returns the compensation term as a numerical-error diagnostic.
- `forecast.py` — `forecast_observables`, `parameter_scan`.
- `experiments.py` — `run_experiment(cfg)` orchestrates simulate → checks → forecast → parameter scan into one result dict.
- `cli.py` / `serialization.py` — argparse CLI writing JSON results (default `results/`).

Public API (`__init__.py`): `UWTConfig`, `RelationalUniverse`, `run_experiment`.

`modeling/uwt_relational_model.py` is a self-contained earlier MVP script (run with `python uwt_relational_model.py`); the package under `src/` is the current implementation.

### Web app (`web-app/src/`)

Static SPA with tab-based navigation held as state in `App.tsx` (tabs: `home`, `examples`, `act`, `bridge`) — deliberately no react-router usage despite it being in dependencies. All content is embedded locally in `src/data/` (no API calls). Simulations (`MiniUniverseCanvas`, `ElectronInteractionSimulation`, etc.) are Canvas/SVG components animated with `requestAnimationFrame`; keep scenes to tens of nodes and avoid heavy 3D libraries (per `.trae/documents/uwt_web_app_architecture.md`).
