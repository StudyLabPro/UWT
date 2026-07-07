from __future__ import annotations

from .config import UWTConfig
from .forecast import forecast_observables, parameter_scan
from .universe import RelationalUniverse


def run_experiment(cfg: UWTConfig) -> dict:
    universe = RelationalUniverse(cfg)
    universe.run(cfg.steps)
    checks = universe.theory_checks()
    forecast = forecast_observables(cfg)
    scan = parameter_scan(cfg, seeds=3)
    summary = {
        "metric_is_valid": checks["metric"]["is_metric"],
        "speed_bound_respected": checks["dynamics"]["local_speed_bound_respected"],
        "final_entropy": checks["time"]["final_entropy"],
        "mean_total_energy": checks["energy"]["mean_total_energy"],
    }
    return {"summary": summary, "checks": checks, "forecast": forecast, "parameter_scan": scan}
