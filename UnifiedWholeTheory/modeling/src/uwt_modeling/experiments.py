from __future__ import annotations

from .config import UWTConfig
from .forecast import forecast_observables, parameter_scan
from .universe import RelationalUniverse
from .wavefunction import relational_wavefunction, wavefunction_checks


def run_experiment(cfg: UWTConfig) -> dict:
    universe = RelationalUniverse(cfg)
    universe.run(cfg.steps)
    checks = universe.theory_checks()
    wave_checks = wavefunction_checks(relational_wavefunction(universe), cfg)
    forecast = forecast_observables(cfg)
    scan = parameter_scan(cfg, seeds=3)
    summary = {
        "metric_is_valid": checks["metric"]["is_metric"],
        "speed_bound_respected": checks["dynamics"]["local_speed_bound_respected"],
        "final_entropy": checks["time"]["final_entropy"],
        "mean_total_energy": checks["energy"]["mean_total_energy"],
        "wavefunction_born_rule": wave_checks["born_rule"]["is_valid"],
        "wavefunction_interference_detected": wave_checks["interference"]["detected"],
    }
    return {
        "summary": summary,
        "checks": checks,
        "wavefunction": wave_checks,
        "forecast": forecast,
        "parameter_scan": scan,
    }
