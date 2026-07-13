"""Тесты модельного прогноза (exp-релаксация vs линейный) и оценок энтропии."""
from __future__ import annotations

import numpy as np
import pytest

from uwt_modeling.config import UWTConfig
from uwt_modeling.forecast import forecast_observables, linear_forecast, model_forecast
from uwt_modeling.universe import RelationalUniverse


def test_model_forecast_selects_exp_relaxation_on_synthetic_decay():
    t = np.arange(120, dtype=float)
    y = 5.0 + 3.0 * np.exp(-t / 15.0)
    result = model_forecast(y, horizon=30)
    assert result["selected"] == "exp_relaxation"
    fit = result["exp_relaxation"]
    assert fit["tau"] == pytest.approx(15.0, rel=0.2)
    assert fit["x_inf"] == pytest.approx(5.0, abs=0.2)
    # прогноз стремится к асимптоте x_inf
    assert result["forecast"][-1] == pytest.approx(5.0, abs=0.1)


def test_model_forecast_selects_linear_on_linear_series():
    t = np.arange(50, dtype=float)
    y = 2.0 + 0.3 * t
    result = model_forecast(y, horizon=10)
    assert result["selected"] == "linear"
    assert result["forecast"] == linear_forecast(y, 10)
    assert result["linear"]["sse"] == pytest.approx(0.0, abs=1e-12)


def test_model_forecast_short_and_flat_series_are_safe():
    assert model_forecast([1.0], horizon=5)["selected"] == "linear"
    flat = model_forecast([2.0] * 10, horizon=5)
    assert flat["forecast"] == pytest.approx([2.0] * 5)


def test_forecast_observables_keeps_backward_compatible_keys():
    cfg = UWTConfig(steps=20, n_parts=8, forecast_horizon=5)
    out = forecast_observables(cfg)
    for key in ("energy", "entropy", "mean_mass", "max_velocity"):
        assert len(out[key]) == 5  # старый формат — линейный список
        assert key in out["models"]
        assert out["models"][key]["selected"] in ("linear", "exp_relaxation")


def test_smoothed_entropy_estimator_is_finite_and_handles_degenerate_input():
    cfg = UWTConfig(n_parts=8, entropy_estimator="smoothed")
    universe = RelationalUniverse(cfg)
    value = universe.entropy(universe.distances())
    assert np.isfinite(value) and value > 0.0
    # вырожденный случай: все расстояния равны нулю — сглаженная оценка конечна
    degenerate = np.zeros((cfg.n_parts, cfg.n_parts))
    assert np.isfinite(universe.entropy(degenerate))


def test_raw_entropy_default_is_unchanged_behavior():
    cfg = UWTConfig(n_parts=8, seed=11)
    universe = RelationalUniverse(cfg)
    d = universe.distances()
    vals = d[~np.eye(cfg.n_parts, dtype=bool)]
    bins = min(32, max(4, int(np.sqrt(vals.size))))
    hist, _ = np.histogram(vals, bins=bins, density=False)
    probs = hist[hist > 0] / hist.sum()
    expected = float(-(probs * np.log(probs)).sum() * cfg.entropy_weight)
    assert universe.entropy(d) == pytest.approx(expected)


def test_entropy_estimator_validation():
    with pytest.raises(ValueError):
        UWTConfig(entropy_estimator="bogus")
