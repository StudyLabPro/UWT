from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UWTConfig:
    n_parts: int = 24
    dim: int = 3
    modulus: int = 64
    ell0: float = 1.0
    dt: float = 1.0
    max_step: int = 1
    m0: float = 0.1
    mscale: float = 10.0
    beta: float = 0.02
    potential_alpha: float = 0.002
    entropy_weight: float = 1.0
    hbar_eff: float = 1.0
    wave_sigma: float = 2.0
    seed: int = 42
    steps: int = 200
    forecast_horizon: int = 25
    init: str = "equilibrium"
    ordered_extent: int = 3
    entropy_smoothing_window: int = 15

    def __post_init__(self) -> None:
        if self.n_parts <= 1:
            raise ValueError("n_parts must be greater than 1")
        if self.dim <= 0:
            raise ValueError("dim must be greater than 0")
        if self.modulus <= 0:
            raise ValueError("modulus must be greater than 0")
        if self.ell0 <= 0:
            raise ValueError("ell0 must be greater than 0")
        if self.dt <= 0:
            raise ValueError("dt must be greater than 0")
        if self.max_step < 0:
            raise ValueError("max_step must be non-negative")
        if self.steps < 0:
            raise ValueError("steps must be non-negative")
        if self.forecast_horizon < 0:
            raise ValueError("forecast_horizon must be non-negative")
        if self.hbar_eff <= 0:
            raise ValueError("hbar_eff must be greater than 0")
        if self.wave_sigma <= 0:
            raise ValueError("wave_sigma must be greater than 0")
        if self.init not in ("equilibrium", "ordered"):
            raise ValueError("init must be 'equilibrium' or 'ordered'")
        if self.ordered_extent <= 0:
            raise ValueError("ordered_extent must be greater than 0")
        if self.entropy_smoothing_window < 1:
            raise ValueError("entropy_smoothing_window must be greater than 0")
