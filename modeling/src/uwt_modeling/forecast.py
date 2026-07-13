from __future__ import annotations

from dataclasses import replace
import numpy as np

from .config import UWTConfig
from .universe import RelationalUniverse


def linear_forecast(values: list[float] | np.ndarray, horizon: int) -> list[float]:
    y = np.asarray(values, dtype=float)
    if len(y) == 0:
        return []
    if len(y) == 1:
        return [float(y[0])] * horizon
    x = np.arange(len(y), dtype=float)
    slope, intercept = np.polyfit(x, y, deg=1)
    future_x = np.arange(len(y), len(y) + horizon, dtype=float)
    return [float(v) for v in slope * future_x + intercept]


def _fit_exp_relaxation(y: np.ndarray) -> dict | None:
    """Подбор x(t) = x_inf + A·exp(−t/τ) (A = x0 − x_inf).

    Перебор кандидатов x_inf по сетке вокруг диапазона ряда; для каждого —
    линейный МНК по log|y − x_inf| (numpy-only, без scipy). Возвращает лучший
    по SSE словарь параметров или None, если релаксационная модель неприменима
    (короткий ряд, смена знака остатков, рост вместо затухания).
    """
    y = np.asarray(y, dtype=float)
    n = len(y)
    if n < 4:
        return None
    span = float(y.max() - y.min())
    if span == 0.0:
        return {"x_inf": float(y[0]), "amplitude": 0.0, "tau": None, "sse": 0.0}
    t = np.arange(n, dtype=float)

    def evaluate(candidates: np.ndarray) -> dict | None:
        best: dict | None = None
        for x_inf in candidates:
            r = y - x_inf
            if np.any(r == 0.0) or not (np.sign(r) == np.sign(r[0])).all():
                continue
            # Веса |r| компенсируют перекос log-МНК точками у асимптоты
            # (приближение линейного МНК: d(linear)/d(log) = r).
            slope, intercept = np.polyfit(t, np.log(np.abs(r)), deg=1, w=np.abs(r))
            if slope >= 0.0:
                continue
            fit = x_inf + np.sign(r[0]) * np.exp(intercept + slope * t)
            sse = float(np.sum((fit - y) ** 2))
            if best is None or sse < best["sse"]:
                best = {
                    "x_inf": float(x_inf),
                    "amplitude": float(np.sign(r[0]) * np.exp(intercept)),
                    "tau": float(-1.0 / slope),
                    "sse": sse,
                }
        return best

    # Грубая сетка по x_inf, затем два уточняющих прохода вокруг лидера:
    # log-остатки очень чувствительны к смещению асимптоты, и без уточнения
    # оценка tau систематически смещается.
    step = span / 60.0
    best = evaluate(np.linspace(y.min() - 0.5 * span, y.max() + 0.5 * span, 61))
    for _ in range(2):
        if best is None:
            return None
        refined = evaluate(np.linspace(best["x_inf"] - step, best["x_inf"] + step, 41))
        if refined is not None and refined["sse"] < best["sse"]:
            best = refined
        step /= 20.0
    return best


def model_forecast(values: list[float] | np.ndarray, horizon: int) -> dict:
    """Прогноз с выбором модели по SSE на наблюдаемом ряде (in-sample).

    Кандидаты: линейный тренд и экспоненциальная релаксация
    x(t) = x_inf + (x0 − x_inf)·exp(−t/τ). При равном качестве или
    неприменимости релаксации выбирается линейная модель. Диагностика обеих
    моделей возвращается всегда.
    """
    y = np.asarray(values, dtype=float)
    horizon = int(horizon)
    linear_pred = linear_forecast(y, horizon)
    result: dict = {"selected": "linear", "forecast": linear_pred, "linear": {"sse": 0.0}, "exp_relaxation": None}
    if len(y) < 2:
        return result
    t = np.arange(len(y), dtype=float)
    slope, intercept = np.polyfit(t, y, deg=1)
    result["linear"]["sse"] = float(np.sum((slope * t + intercept - y) ** 2))
    exp_fit = _fit_exp_relaxation(y)
    if exp_fit is not None:
        result["exp_relaxation"] = exp_fit
        if exp_fit["tau"] is not None and exp_fit["sse"] < result["linear"]["sse"]:
            future_t = np.arange(len(y), len(y) + horizon, dtype=float)
            pred = exp_fit["x_inf"] + exp_fit["amplitude"] * np.exp(-future_t / exp_fit["tau"])
            result["selected"] = "exp_relaxation"
            result["forecast"] = [float(v) for v in pred]
    return result


def forecast_observables(cfg: UWTConfig) -> dict:
    universe = RelationalUniverse(cfg)
    universe.run(cfg.steps)
    series = {
        "energy": [h["total_energy"] for h in universe.history],
        "entropy": [h["entropy"] for h in universe.history],
        "mean_mass": [float(h["mass"].mean()) for h in universe.history],
        "max_velocity": [float(h["velocity"].max()) for h in universe.history],
    }
    out: dict = {"horizon": cfg.forecast_horizon}
    # Обратная совместимость: старые ключи — по-прежнему линейный прогноз.
    for name, values in series.items():
        out[name] = linear_forecast(values, cfg.forecast_horizon)
    out["models"] = {name: model_forecast(values, cfg.forecast_horizon) for name, values in series.items()}
    return out


def parameter_scan(base: UWTConfig, seeds: int = 5) -> list[dict]:
    rows = []
    for max_step in [1, 2, 3]:
        for seed in range(base.seed, base.seed + seeds):
            cfg = replace(base, max_step=max_step, seed=seed)
            universe = RelationalUniverse(cfg)
            universe.run(cfg.steps)
            checks = universe.theory_checks()
            rows.append({
                "seed": seed,
                "max_step": max_step,
                "max_observed_velocity": checks["dynamics"]["max_observed_velocity"],
                "speed_bound": checks["dynamics"]["local_speed_bound"],
                "speed_bound_respected": checks["dynamics"]["local_speed_bound_respected"],
                "final_entropy": checks["time"]["final_entropy"],
                "mean_total_energy": checks["energy"]["mean_total_energy"],
            })
    return rows
