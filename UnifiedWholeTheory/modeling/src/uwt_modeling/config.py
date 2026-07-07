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
    seed: int = 42
    steps: int = 200
    forecast_horizon: int = 25
