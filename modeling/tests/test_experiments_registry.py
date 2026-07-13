"""Тесты реестра именованных экспериментов (вычислительная программа теории)."""
from __future__ import annotations

import numpy as np
import pytest

from uwt_modeling.config import UWTConfig
from uwt_modeling.experiments_registry import EXPERIMENTS, run_named_experiment

FAST = UWTConfig(n_parts=8, modulus=32, steps=24, seed=7)


def test_registry_lists_experiments_with_valid_markers():
    assert set(EXPERIMENTS) == {
        "psi_evolution",
        "condensation",
        "quantized_distance",
        "speed_bound_invariance",
        "dimensional_reduction",
    }
    for spec in EXPERIMENTS.values():
        assert spec.description
        assert spec.marker in ("THEORY", "HYPOTHESIS", "MODEL", "VERIFIED")


def test_unknown_experiment_raises():
    with pytest.raises(ValueError, match="unknown experiment"):
        run_named_experiment("bogus", FAST)


def test_psi_evolution_produces_snapshot_series():
    result = run_named_experiment("psi_evolution", FAST)
    assert result["marker"] == "MODEL"
    series = result["series"]
    assert len(series) == 6
    assert all(np.isfinite(s["mean_position_spread"]) for s in series)
    assert all(s["mean_participation_ratio"] >= 1.0 for s in series)
    assert series[-1]["step"] > series[0]["step"]


def test_condensation_descends_energy_and_localizes_psi():
    cfg = UWTConfig(n_parts=10, modulus=32, steps=60, seed=7)
    result = run_named_experiment("condensation", cfg)
    assert result["energy_descent_confirmed"]
    # эмпирически устойчиво для этого сида/конфига: отжиг сужает пакеты ψ
    assert result["localization_delta_spread"] < 0.0
    assert result["annealed"]["mean_participation_ratio"] < result["random"]["mean_participation_ratio"]


def test_quantized_distance_reports_positive_quantum_and_gaps():
    result = run_named_experiment("quantized_distance", FAST)
    assert result["min_positive_distance"] > 0.0
    assert result["distinct_distances"] > 1
    assert result["min_spectrum_gap"] is None or result["min_spectrum_gap"] > 0.0


def test_speed_bound_invariance_holds_across_scan():
    result = run_named_experiment("speed_bound_invariance", FAST)
    assert result["all_respected"]
    assert len(result["bounds_by_config"]) == 3  # по одному инварианту на max_step
    assert result["max_observed_velocity"] <= max(result["bounds_by_config"]) + 1e-9


def test_dimensional_reduction_returns_finite_estimates():
    result = run_named_experiment("dimensional_reduction", FAST)
    assert result["marker"] == "HYPOTHESIS"
    for key in ("effective_dim_small_scale", "effective_dim_large_scale"):
        assert result[key] is None or np.isfinite(result[key])
