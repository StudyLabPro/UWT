import math
from pathlib import Path

import numpy as np
import pytest

import uwt_modeling.wavefunction as wavefunction_module
from uwt_modeling.balansis_adapter import compensated_complex_matmul, compensated_matmul
from uwt_modeling.config import UWTConfig
from uwt_modeling.experiments import run_experiment
from uwt_modeling.universe import RelationalUniverse
from uwt_modeling.wavefunction import circular_spread, relational_wavefunction, wavefunction_checks


def make_universe(**overrides) -> RelationalUniverse:
    params = {"n_parts": 6, "modulus": 32, "steps": 8, "seed": 7}
    params.update(overrides)
    universe = RelationalUniverse(UWTConfig(**params))
    universe.run()
    return universe


def test_wavefunction_shapes_and_born_rule():
    universe = make_universe()
    result = relational_wavefunction(universe)
    cfg = universe.cfg
    assert result["psi"].shape == (cfg.n_parts, cfg.dim, cfg.modulus)
    assert np.allclose(result["probability"].sum(axis=-1), 1.0, atol=1e-9)
    assert result["probability"].min() >= 0.0


def test_momentum_representation_is_unitary():
    result = relational_wavefunction(make_universe())
    assert np.allclose(result["momentum_probability"].sum(axis=-1), 1.0, atol=1e-9)


def test_wavefunction_checks_report():
    universe = make_universe()
    checks = wavefunction_checks(relational_wavefunction(universe), universe.cfg)
    assert checks["born_rule"]["is_valid"]
    assert checks["momentum"]["unitary_transform"]
    assert checks["interference"]["detected"]
    assert checks["uncertainty"]["min_product"] > 0.0


def test_wavefunction_reports_act_compensations():
    universe = make_universe()
    result = relational_wavefunction(universe)
    expected_stages = {
        "history_action",
        "history_stability",
        "weight_normalization",
        "superposition_gemm",
        "classical_gemm",
        "wave_normalization",
        "dft_gemm",
    }
    assert set(result["compensations"]) == expected_stages
    assert all(math.isfinite(v) for v in result["compensations"].values())
    checks = wavefunction_checks(result, universe.cfg)
    numerics = checks["numerics"]
    assert numerics["backend"] == "balansis-act"
    assert numerics["raw_float64_reductions"] is False
    assert set(numerics["compensations"]) == expected_stages


def test_wavefunction_module_has_no_raw_float64_reductions():
    source = Path(wavefunction_module.__file__).read_text(encoding="utf-8")
    forbidden = [
        "np.fft",
        "np.sum",
        ".sum(",
        "np.dot",
        ".dot(",
        "np.matmul",
        "np.einsum",
        "np.mean",
        ".mean(",
        "np.cumsum",
        "np.prod",
        "np.linalg",
        " @ ",
        "np.trapz",
        "np.average",
    ]
    for token in forbidden:
        assert token not in source, f"raw float64 reduction found in wavefunction.py: {token}"


def test_wavefunction_runtime_forbids_numpy_reductions(monkeypatch):
    universe = make_universe(n_parts=4, modulus=16, steps=4)

    def forbidden(*args, **kwargs):
        raise AssertionError("raw numpy float64 reduction used inside wavefunction computation")

    for name in ("sum", "dot", "matmul", "einsum", "mean", "cumsum", "prod", "vdot", "inner", "tensordot", "average"):
        monkeypatch.setattr(np, name, forbidden)
    monkeypatch.setattr(np.fft, "fft", forbidden)
    monkeypatch.setattr(np.fft, "fftn", forbidden)
    result = relational_wavefunction(universe)
    checks = wavefunction_checks(result, universe.cfg)
    assert checks["born_rule"]["is_valid"]
    assert checks["momentum"]["unitary_transform"]


def test_compensated_matmul_matches_reference():
    rng = np.random.default_rng(3)
    a = rng.normal(size=(5, 7))
    b = rng.normal(size=(7, 4))
    product, compensation = compensated_matmul(a, b)
    assert np.allclose(product, a @ b, atol=1e-12)
    assert math.isfinite(compensation)
    ca = rng.normal(size=(3, 5)) + 1j * rng.normal(size=(3, 5))
    cb = rng.normal(size=(5, 6)) + 1j * rng.normal(size=(5, 6))
    cproduct, _ = compensated_complex_matmul(ca, cb)
    assert np.allclose(cproduct, ca @ cb, atol=1e-12)


def test_wavefunction_is_deterministic_for_seed():
    first = relational_wavefunction(make_universe())
    second = relational_wavefunction(make_universe())
    assert np.array_equal(first["psi"], second["psi"])


def test_wavefunction_runs_universe_when_history_empty():
    cfg = UWTConfig(n_parts=4, modulus=16, steps=5, seed=1)
    universe = RelationalUniverse(cfg)
    result = relational_wavefunction(universe)
    assert len(universe.history) == cfg.steps
    assert result["probability"].shape == (cfg.n_parts, cfg.dim, cfg.modulus)


def test_circular_spread_localized_and_uniform():
    localized = np.zeros(64)
    localized[10] = 1.0
    assert circular_spread(localized) < 1e-3
    uniform = np.full(64, 1.0 / 64.0)
    assert circular_spread(uniform) > 10.0


@pytest.mark.parametrize(
    ("field", "message"),
    [
        ("hbar_eff", "hbar_eff must be greater than 0"),
        ("wave_sigma", "wave_sigma must be greater than 0"),
    ],
)
def test_config_rejects_non_positive_wave_parameters(field, message):
    with pytest.raises(ValueError, match=message):
        UWTConfig(**{field: 0})


def test_stability_width_gamma_changes_psi_but_preserves_physics():
    """Связь ширины пакета с устойчивостью (gamma != 0) меняет ψ, но сохраняет физику."""
    baseline = relational_wavefunction(make_universe(n_parts=10, modulus=24, steps=12))
    coupled_universe = make_universe(n_parts=10, modulus=24, steps=12, stability_width_gamma=-0.5)
    coupled = relational_wavefunction(coupled_universe)
    # ψ действительно изменилась относительно фиксированной ширины.
    assert not np.allclose(coupled["psi"], baseline["psi"])
    # Правило Борна и унитарность импульсного перехода сохраняются.
    assert np.allclose(coupled["probability"].sum(axis=-1), 1.0, atol=1e-9)
    assert coupled["probability"].min() >= -1e-12
    assert np.allclose(coupled["momentum_probability"].sum(axis=-1), 1.0, atol=1e-9)
    checks = wavefunction_checks(coupled, coupled_universe.cfg)
    assert checks["born_rule"]["is_valid"]
    assert checks["momentum"]["unitary_transform"]


def test_stability_width_gamma_path_is_act_clean(monkeypatch):
    """Путь по-реляционной ширины не использует сырых numpy-редукций."""
    universe = make_universe(n_parts=4, modulus=16, steps=4, stability_width_gamma=-0.5)

    def forbidden(*args, **kwargs):
        raise AssertionError("raw numpy float64 reduction used inside wavefunction computation")

    for name in ("sum", "dot", "matmul", "einsum", "mean", "cumsum", "prod", "vdot", "inner", "tensordot", "average"):
        monkeypatch.setattr(np, name, forbidden)
    monkeypatch.setattr(np.fft, "fft", forbidden)
    result = relational_wavefunction(universe)
    assert wavefunction_checks(result, universe.cfg)["born_rule"]["is_valid"]


def test_run_experiment_includes_wavefunction_section():
    result = run_experiment(UWTConfig(n_parts=5, modulus=16, steps=5, forecast_horizon=2, seed=2))
    assert result["wavefunction"]["born_rule"]["is_valid"]
    assert result["wavefunction"]["momentum"]["unitary_transform"]
    assert result["wavefunction"]["numerics"]["backend"] == "balansis-act"
    assert result["summary"]["wavefunction_born_rule"] is True
