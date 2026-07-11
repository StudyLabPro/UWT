# Provisional Outline — UWT Relational Simulation

**Working title:** Computer-implemented relational simulation and prediction
using compensated relation dynamics  
**Date:** 2026-07-10  
**Inventor / author contact:** Andrey Tikhonov (Тихонов Андрей) —
`uwt@xteam.pro`  
**Status:** non-confidential provisional outline, not filed, not legal advice

> This outline is intentionally narrower than Unified Whole Theory itself. It is
> aimed at a practical computer-implemented method. The theory can go to arXiv;
> the filing, if pursued, should protect the applied simulation/prediction
> machinery.

## 1. Strategic Position

Do not patent "UWT as a theory." Patent a concrete computational system that:

1. stores a finite relational universe as distinguishable parts and relation
   values;
2. updates relation states over discrete time;
3. derives distance, motion, stability, mass/energy-like metrics, and optional
   wavefunction observables from relation histories;
4. performs numerically compensated updates and reductions through Balansis/ACT;
5. emits prediction, stability, and consistency diagnostics.

The patentable contribution should be framed as an improvement in computer
simulation and numerical prediction, not as a claim over physical law.

## 2. Technical Problem

Conventional simulations often start with coordinates, metric space, and
floating-point state variables. In relation-first models, the core state is not
a coordinate vector but a history of pairwise or higher-order relations. This
creates three technical problems:

- relation histories can be numerically unstable under repeated aggregation;
- derived observables such as distance, velocity, stability, and energy can drift
  when computed through ordinary floating-point reductions;
- prediction from relation histories requires a reproducible state update and
  diagnostic pipeline rather than an informal theoretical interpretation.

## 3. Technical Solution

A computer system maintains a relational state graph over parts and relation
values, updates relation values through a selected relational dynamics policy,
derives observables from the relation history, and routes critical reductions
through compensated arithmetic. The system outputs:

- relational distances and changes;
- stability measures;
- derived motion and energy-like quantities;
- optional wavefunction observables;
- prediction/forecast records;
- compensation telemetry and consistency checks.

## 4. Claim Focus

### Independent Claim A — Relational Simulation Method

A computer-implemented method comprising:

1. receiving a set of distinguishable parts of a whole;
2. storing relation values between pairs of parts in a finite relational state;
3. updating the relation values over a sequence of simulation steps;
4. deriving distances from normalized relation values;
5. deriving motion and stability metrics from changes in the relation values;
6. computing at least one forecast or diagnostic from the derived metrics;
7. using compensated arithmetic for one or more reductions in the update,
   derivation, or forecast path;
8. outputting the forecast or diagnostic with compensation telemetry.

### Independent Claim B — Compensated Relation Dynamics System

A system comprising:

1. memory storing relation-state data structures;
2. a relation dynamics engine;
3. a derived-observable engine;
4. a compensated numerical backend;
5. a forecast/diagnostic engine;
6. an output interface exposing simulation results and numerical diagnostics.

### Independent Claim C — Computer-Readable Medium

A non-transitory computer-readable medium storing instructions that cause one or
more processors to perform the relational simulation method.

## 5. Dependent Claim Candidates

- The relation values are normalized through an ordered relation-value structure.
- Distances are derived from relation values rather than stored as primitive
  coordinates.
- Stability is computed from accumulated changes of relation distances over a
  history window.
- Motion metrics are computed from time-indexed relation changes.
- Energy-like metrics are computed from relation-derived motion and stability.
- The compensated arithmetic backend records compensation factors for reductions.
- A wavefunction-like observable is derived from relation stability and
  accumulated action.
- Momentum-space observables are computed through a unitary transform whose
  normalization is checked.
- The output includes Born-normalization, unitarity, interference, uncertainty,
  and compensation diagnostics.
- A forecast module predicts future relation-state summaries or derived
  observables from prior relation histories.
- A policy gate rejects or flags forecasts when compensation telemetry exceeds a
  threshold.

## 6. Evidence Package To Attach Privately

The actual filing package should attach private appendices with:

- architecture diagrams for the relational state and simulation pipeline;
- flowcharts for update, derivation, forecast, and compensation telemetry;
- code excerpts from `uwt_modeling` only after counsel review;
- example run configuration and JSON output;
- benchmark or reproducibility evidence;
- wavefunction dispersion note as scientific limitation and calibration context;
- comparison with coordinate-first simulation baselines.

## 7. Prior-Art Pressure

Expected prior-art areas:

- graph-based simulation;
- cellular automata and relational/agent-based modeling;
- discrete physics and causal set simulations;
- numerical stability and compensated summation;
- interval/exact arithmetic simulation engines;
- quantum-inspired wavefunction simulators;
- predictive analytics over temporal graphs.

The differentiation should be:

> relation-first state representation + derived observables + compensated
> numerical policy + forecast/diagnostic output with telemetry.

## 8. What To Keep Out Of Public Drafts

If the repository is public or may become public, do not place confidential
filing material here. Keep private:

- exact claim language prepared by counsel;
- complete prior-art search notes;
- confidential diagrams;
- unpublished benchmark datasets;
- exact calibration heuristics;
- private commercial use cases;
- application serial numbers until intentionally disclosed.

## 9. Relationship To arXiv

- The arXiv UWT paper should publish the scientific foundation.
- This provisional track should protect applied computation if it is novel,
  useful, and worth commercial protection.
- If the arXiv paper includes enabling details for this applied method, file the
  provisional before uploading.
- If the arXiv paper remains theoretical and high-level, it can proceed first as
  scholarly publication and defensive prior art.

## 10. Immediate TODO

- [ ] Decide whether to file this UWT provisional before arXiv.
- [ ] Prepare one architecture diagram.
- [ ] Prepare one end-to-end flowchart.
- [ ] Select one reproducible example run from `uwt_modeling`.
- [ ] Add a short technical-effect table: stability, forecast reproducibility,
      compensation telemetry, and failure detection.
- [ ] Run prior-art sanity search before counsel review.
