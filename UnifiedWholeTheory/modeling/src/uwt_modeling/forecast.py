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


def forecast_observables(cfg: UWTConfig) -> dict:
    universe = RelationalUniverse(cfg)
    universe.run(cfg.steps)
    return {
        "horizon": cfg.forecast_horizon,
        "energy": linear_forecast([h["total_energy"] for h in universe.history], cfg.forecast_horizon),
        "entropy": linear_forecast([h["entropy"] for h in universe.history], cfg.forecast_horizon),
        "mean_mass": linear_forecast([float(h["mass"].mean()) for h in universe.history], cfg.forecast_horizon),
        "max_velocity": linear_forecast([float(h["velocity"].max()) for h in universe.history], cfg.forecast_horizon),
    }


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
