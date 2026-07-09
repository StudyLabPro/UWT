"""Волновая функция, выведенная из отношений UWT; вычисления через Balansis (АКТ).

Конструкция:

- амплитуда вклада отношения (i, j) — корень из устойчивости отношения
  w_ij = 1 / (1 + сумма |Δd_ij| по истории): устойчивые отношения дают
  доминирующие, локализованные вклады (устойчивость = "вещественность");
- фаза вклада — накопленное действие S_ij = сумма L_ij·dt по истории,
  делённое на hbar_eff, в духе интеграла по путям: exp(i·S/ħ);
- ψ_i по каждой оси — суперпозиция круговых гауссовых пакетов на решётке
  Z_N, нормированная по правилу Борна; импульсное представление —
  унитарная ДПФ-матрица (без библиотечного FFT).

Численная политика (АКТ — теория абсолютной компенсации):

- все накопления — суммы по истории, суперпозиция, классическая смесь,
  ДПФ, нормировки и проверки — идут через Balansis: ACT-GEMM с
  компенсацией Неймайера и суммирование Кахана; сырых numpy-редукций
  в модуле нет, это закреплено статическим и runtime-тестами;
- поэлементные функции (exp, cos, sin, sqrt, log, деление, умножение)
  идут через компенсированные операции Balansis;
- решётка, смещения и их квадраты — целочисленные, то есть точные;
  аргументы ДПФ приводятся точно по модулю решётки до взятия косинуса;
- компенсационные члены каждого этапа возвращаются в результате
  и попадают в отчёт проверок (раздел numerics).
"""
from __future__ import annotations

import numpy as np

from .balansis_adapter import (
    compensated_axis_sum,
    compensated_complex_matmul,
    compensated_elementwise,
    compensated_elementwise_add,
    compensated_elementwise_divide,
    compensated_elementwise_multiply,
    compensated_matmul,
    compensated_sum,
)
from .config import UWTConfig
from .universe import RelationalUniverse


def _abs2(values: np.ndarray) -> np.ndarray:
    """|z|² поэлементно через компенсированные умножения и сложения."""
    real_sq = compensated_elementwise_multiply(values.real, values.real)
    imag_sq = compensated_elementwise_multiply(values.imag, values.imag)
    return compensated_elementwise_add(real_sq, imag_sq)


def _history_sum(history: list[dict], key: str) -> tuple[np.ndarray, np.ndarray]:
    """Компенсированная сумма матриц по шагам истории; возвращает (суммы, компенсации)."""
    stacked = np.moveaxis(np.stack([h[key] for h in history]), 0, -1)
    return compensated_axis_sum(stacked)


def _scalar_divide(numerator: float, denominator: float) -> float:
    return float(compensated_elementwise_divide(np.array([numerator]), np.array([denominator]))[0])


def _unitary_dft_matrix(n_sites: int) -> np.ndarray:
    """Унитарная ДПФ-матрица F[u,k] = exp(-2πi·u·k/N)/√N с точным приведением аргумента."""
    index = np.arange(n_sites)
    reduced = ((index[:, None] * index[None, :]) % n_sites).astype(float)
    step = -_scalar_divide(2.0 * np.pi, float(n_sites))
    angles = compensated_elementwise_multiply(reduced, np.full_like(reduced, step))
    scale = _scalar_divide(1.0, float(compensated_elementwise("sqrt", np.array([float(n_sites)]))[0]))
    real = compensated_elementwise_multiply(compensated_elementwise("cos", angles), np.full_like(angles, scale))
    imag = compensated_elementwise_multiply(compensated_elementwise("sin", angles), np.full_like(angles, scale))
    return real + 1j * imag


def circular_spread(prob: np.ndarray) -> np.ndarray:
    """Круговое стандартное отклонение распределения на решётке Z_N (в узлах решётки)."""
    n_sites = prob.shape[-1]
    step = _scalar_divide(2.0 * np.pi, float(n_sites))
    angles = compensated_elementwise_multiply(np.arange(n_sites, dtype=float), np.full(n_sites, step))
    cos_part = compensated_elementwise_multiply(prob, np.broadcast_to(compensated_elementwise("cos", angles), prob.shape))
    sin_part = compensated_elementwise_multiply(prob, np.broadcast_to(compensated_elementwise("sin", angles), prob.shape))
    resultant_re, _ = compensated_axis_sum(cos_part)
    resultant_im, _ = compensated_axis_sum(sin_part)
    resultant_sq = compensated_elementwise_add(
        compensated_elementwise_multiply(resultant_re, resultant_re),
        compensated_elementwise_multiply(resultant_im, resultant_im),
    )
    resultant = np.clip(compensated_elementwise("sqrt", resultant_sq), 1e-12, 1.0)
    log_resultant = compensated_elementwise("log", resultant)
    spread = compensated_elementwise("sqrt", compensated_elementwise_multiply(log_resultant, np.full_like(log_resultant, -2.0)))
    factor = _scalar_divide(float(n_sites), 2.0 * np.pi)
    return compensated_elementwise_multiply(spread, np.full_like(spread, factor))


def relational_wavefunction(universe: RelationalUniverse) -> dict:
    """Строит ψ_i(u) для каждой части i и каждой оси из истории отношений вселенной."""
    cfg = universe.cfg
    if not universe.history:
        universe.run()
    n = cfg.n_parts
    offdiag = ~np.eye(n, dtype=bool)
    action_totals, action_comp = _history_sum(universe.history, "lagrangian_matrix")
    action = compensated_elementwise_multiply(action_totals, np.full_like(action_totals, cfg.dt))
    delta_totals, delta_comp = _history_sum(universe.history, "delta_distance")
    stability = compensated_elementwise_divide(
        np.ones_like(delta_totals),
        compensated_elementwise_add(np.ones_like(delta_totals), delta_totals),
    )
    weights = np.where(offdiag, stability, 0.0)
    row_totals, weight_comp = compensated_axis_sum(weights)
    weights = compensated_elementwise_divide(weights, np.broadcast_to(row_totals[:, None], weights.shape))
    phase_angles = compensated_elementwise_divide(action, np.full_like(action, cfg.hbar_eff))
    amplitude_magnitude = compensated_elementwise("sqrt", weights)
    amplitude = (
        compensated_elementwise_multiply(amplitude_magnitude, compensated_elementwise("cos", phase_angles))
        + 1j * compensated_elementwise_multiply(amplitude_magnitude, compensated_elementwise("sin", phase_angles))
    )
    ell0_sq = compensated_elementwise_multiply(np.array([cfg.ell0]), np.array([cfg.ell0]))[0]
    sigma_sq = compensated_elementwise_multiply(np.array([cfg.wave_sigma]), np.array([cfg.wave_sigma]))[0]
    kernel_scale = -_scalar_divide(float(ell0_sq), 4.0 * float(sigma_sq))
    lattice = np.arange(cfg.modulus)
    psi = np.zeros((n, cfg.dim, cfg.modulus), dtype=complex)
    classical = np.zeros((n, cfg.dim, cfg.modulus))
    superposition_comp = 1.0
    classical_comp = 1.0
    for axis in range(cfg.dim):
        displacement = universe.space.shortest((lattice[None, :] - universe.x[:, axis][:, None]) % cfg.modulus)
        displacement_sq = (displacement * displacement).astype(float)
        kernel = compensated_elementwise("exp", compensated_elementwise_multiply(displacement_sq, np.full_like(displacement_sq, kernel_scale)))
        axis_psi, axis_comp = compensated_complex_matmul(amplitude, kernel)
        psi[:, axis, :] = axis_psi
        superposition_comp = max(superposition_comp, axis_comp)
        axis_classical, axis_classical_comp = compensated_matmul(weights, compensated_elementwise_multiply(kernel, kernel))
        classical[:, axis, :] = axis_classical
        classical_comp = max(classical_comp, axis_classical_comp)
    norm_totals, norm_comp = compensated_axis_sum(_abs2(psi))
    norms = np.broadcast_to(np.maximum(compensated_elementwise("sqrt", norm_totals), 1e-30)[..., None], psi.shape)
    psi = compensated_elementwise_divide(psi.real, norms) + 1j * compensated_elementwise_divide(psi.imag, norms)
    classical_totals, _ = compensated_axis_sum(classical)
    classical = compensated_elementwise_divide(classical, np.broadcast_to(classical_totals[..., None], classical.shape))
    momentum_psi, dft_comp = compensated_complex_matmul(psi.reshape(-1, cfg.modulus), _unitary_dft_matrix(cfg.modulus))
    momentum_psi = momentum_psi.reshape(psi.shape)
    return {
        "psi": psi,
        "probability": _abs2(psi),
        "classical_mixture": classical,
        "momentum_psi": momentum_psi,
        "momentum_probability": _abs2(momentum_psi),
        "action": action,
        "relation_stability": stability,
        "positions": universe.x.copy(),
        "compensations": {
            "history_action": float(action_comp.max()),
            "history_stability": float(delta_comp.max()),
            "weight_normalization": float(weight_comp.max()),
            "superposition_gemm": float(superposition_comp),
            "classical_gemm": float(classical_comp),
            "wave_normalization": float(norm_comp.max()),
            "dft_gemm": float(dft_comp),
        },
    }


def wavefunction_checks(result: dict, cfg: UWTConfig) -> dict:
    """Проверки квантовоподобных свойств ψ: правило Борна, унитарность ДПФ, интерференция, неопределённость."""
    probability = result["probability"]
    momentum_probability = result["momentum_probability"]
    norm_totals, norm_comps = compensated_axis_sum(probability)
    parseval_totals, parseval_comps = compensated_axis_sum(momentum_probability)
    norm_error = np.abs(norm_totals - 1.0)
    parseval_error = np.abs(parseval_totals - 1.0)
    tv_totals, tv_comps = compensated_axis_sum(np.abs(compensated_elementwise_add(probability, -result["classical_mixture"])))
    interference = 0.5 * tv_totals
    position_spread = compensated_elementwise_multiply(circular_spread(probability), np.full(probability.shape[:-1], cfg.ell0))
    momentum_scale = compensated_elementwise_multiply(
        np.array([cfg.hbar_eff]),
        np.array([_scalar_divide(2.0 * np.pi, float(cfg.modulus) * cfg.ell0)]),
    )[0]
    momentum_spread = compensated_elementwise_multiply(
        circular_spread(momentum_probability),
        np.full(momentum_probability.shape[:-1], float(momentum_scale)),
    )
    uncertainty = compensated_elementwise_multiply(position_spread, momentum_spread)
    heisenberg_bound = 0.5 * cfg.hbar_eff
    return {
        "born_rule": {
            "max_normalization_error": float(norm_error.max()),
            "min_probability": float(probability.min()),
            "compensation_max": float(norm_comps.max()),
            "is_valid": bool(norm_error.max() < 1e-9 and probability.min() >= -1e-12),
        },
        "momentum": {
            "max_parseval_error": float(parseval_error.max()),
            "compensation_max": float(parseval_comps.max()),
            "unitary_transform": bool(parseval_error.max() < 1e-9),
        },
        "interference": {
            "mean_strength": float(compensated_sum(interference.ravel())[0]) / interference.size,
            "max_strength": float(interference.max()),
            "compensation_max": float(tv_comps.max()),
            "detected": bool(interference.max() > 1e-6),
        },
        "uncertainty": {
            "min_product": float(uncertainty.min()),
            "mean_product": float(compensated_sum(uncertainty.ravel())[0]) / uncertainty.size,
            "heisenberg_like_bound": float(heisenberg_bound),
            "bound_respected_ratio": float(np.count_nonzero(uncertainty >= heisenberg_bound - 1e-9)) / uncertainty.size,
        },
        "numerics": {
            "backend": "balansis-act",
            "raw_float64_reductions": False,
            "compensations": dict(result.get("compensations", {})),
        },
    }
