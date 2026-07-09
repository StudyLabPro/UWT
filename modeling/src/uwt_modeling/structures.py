from __future__ import annotations

from dataclasses import dataclass
import numpy as np


@dataclass(frozen=True)
class RelationSpace:
    modulus: int
    dim: int
    ell0: float = 1.0

    def compose(self, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return (a + b) % self.modulus

    def shortest(self, a: np.ndarray) -> np.ndarray:
        return ((a + self.modulus // 2) % self.modulus) - self.modulus // 2

    def rho(self, a: np.ndarray) -> np.ndarray:
        return self.ell0 * np.linalg.norm(self.shortest(a), axis=-1)

    def metric_projection(self, relations: np.ndarray) -> np.ndarray:
        return self.rho(relations)
