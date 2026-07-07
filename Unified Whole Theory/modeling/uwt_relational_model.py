"""
UWT Relational Model MVP
========================

Минимальная вычислимая модель для Unified Whole Theory (UWT).
На русском: ТЕЦ — Теория Единого Целого.

Идея:
- части A_i не считаются "точками пространства" как первичное понятие;
- первично хранится состояние частей в дискретной группе значений V = Z_N^d;
- отношение R(A_i, A_j) = x_j - x_i mod N;
- реляционное расстояние d(A_i, A_j) = rho(R(A_i, A_j));
- движение = изменение отношения между двумя состояниями;
- скорость = rho(delta_ij) / dt;
- масса = монотонная функция устойчивости;
- энергия = 1/2*m*v^2 + beta*v^4.

Запуск:
    python uwt_relational_model.py

Результат:
- проверка аксиом метрики;
- проверка квантования минимального ненулевого изменения;
- проверка предельной скорости в заданной динамике;
- восстановление коэффициента beta при v^4-поправке.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
import json
import numpy as np


@dataclass
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
    seed: int = 42
    steps: int = 200


class RelationalUniverse:
    """
    V = Z_N^d с групповой операцией сложения по модулю N.
    rho = геодезическая евклидова длина на дискретном торе.
    """

    def __init__(self, cfg: UWTConfig):
        self.cfg = cfg
        self.rng = np.random.default_rng(cfg.seed)
        self.x = self.rng.integers(
            low=0,
            high=cfg.modulus,
            size=(cfg.n_parts, cfg.dim),
            endpoint=False,
        )
        self.history = []

    def shortest(self, a: np.ndarray) -> np.ndarray:
        """Кратчайший представитель класса по модулю N."""
        n = self.cfg.modulus
        return ((a + n // 2) % n) - n // 2

    def rho(self, a: np.ndarray) -> np.ndarray:
        """Нормировка rho: V -> R>=0."""
        v = self.shortest(a)
        return self.cfg.ell0 * np.linalg.norm(v, axis=-1)

    def relations(self) -> np.ndarray:
        """
        R_ij = x_j - x_i mod N.
        Это внутреннее значение отношения, а не координатное расстояние как первичное понятие.
        """
        return (self.x[None, :, :] - self.x[:, None, :]) % self.cfg.modulus

    def distance_matrix(self, relations: np.ndarray | None = None) -> np.ndarray:
        if relations is None:
            relations = self.relations()
        return self.rho(relations)

    def check_metric_axioms(self) -> dict:
        d = self.distance_matrix()
        n = self.cfg.n_parts
        offdiag = ~np.eye(n, dtype=bool)

        nonnegative = bool(np.all(d >= -1e-12))
        identity = bool(np.allclose(np.diag(d), 0.0) and np.all(d[offdiag] > 0.0))
        symmetry = bool(np.allclose(d, d.T))

        max_violation = 0.0
        triangle = True
        for i in range(n):
            lhs = d[i][None, :]
            rhs = d[i][:, None] + d
            violation = float(np.max(lhs - rhs))
            max_violation = max(max_violation, violation)
            if violation > 1e-9:
                triangle = False

        return {
            "nonnegative": nonnegative,
            "identity_of_indiscernibles": identity,
            "symmetry": symmetry,
            "triangle": triangle,
            "max_triangle_violation": max_violation,
            "sample_min_nonzero_distance": float(d[d > 0].min()),
            "sample_max_distance": float(d.max()),
        }

    def step(self) -> dict:
        old_r = self.relations()

        dx = self.rng.integers(
            low=-self.cfg.max_step,
            high=self.cfg.max_step + 1,
            size=self.x.shape,
        )
        self.x = (self.x + dx) % self.cfg.modulus

        new_r = self.relations()
        delta = (new_r - old_r) % self.cfg.modulus

        delta_d = self.rho(delta)
        velocity = delta_d / self.cfg.dt

        n = self.cfg.n_parts
        offdiag = ~np.eye(n, dtype=bool)

        variation = (delta_d * offdiag).sum(axis=1)
        stability = 1.0 / (1.0 + variation)

        mass = self.cfg.m0 + self.cfg.mscale * stability

        kinetic_newton = 0.5 * mass[:, None] * velocity**2
        cost = kinetic_newton + self.cfg.beta * velocity**4

        snapshot = {
            "velocity": velocity,
            "mass": mass,
            "cost": cost,
            "kinetic_newton": kinetic_newton,
            "delta_d": delta_d,
        }
        self.history.append(snapshot)
        return snapshot

    def run(self) -> dict:
        metric_check = self.check_metric_axioms()

        for _ in range(self.cfg.steps):
            self.step()

        velocities = np.concatenate([h["velocity"].ravel() for h in self.history])
        costs = np.concatenate([h["cost"].ravel() for h in self.history])
        kinetic_newton = np.concatenate([h["kinetic_newton"].ravel() for h in self.history])
        masses = np.concatenate([h["mass"].ravel() for h in self.history])

        nonzero_v = velocities[velocities > 0.0]
        mask = velocities > 0.0

        x = velocities[mask] ** 4
        y = costs[mask] - kinetic_newton[mask]
        beta_hat = float((x @ y) / (x @ x)) if len(x) else 0.0

        local_speed_bound = (
            self.cfg.ell0
            * np.sqrt(self.cfg.dim)
            * 2.0
            * self.cfg.max_step
            / self.cfg.dt
        )

        global_speed_bound = (
            self.cfg.ell0
            * np.sqrt(self.cfg.dim)
            * (self.cfg.modulus // 2)
            / self.cfg.dt
        )

        return {
            "config": asdict(self.cfg),
            "metric_check": metric_check,
            "dynamics_check": {
                "min_nonzero_velocity_quantum": float(nonzero_v.min()) if len(nonzero_v) else None,
                "max_observed_velocity": float(velocities.max()),
                "local_speed_bound": float(local_speed_bound),
                "global_structural_speed_bound": float(global_speed_bound),
                "local_speed_bound_respected": bool(velocities.max() <= local_speed_bound + 1e-12),
                "mean_mass": float(masses.mean()),
                "min_mass": float(masses.min()),
                "max_mass": float(masses.max()),
            },
            "energy_check": {
                "true_beta": float(self.cfg.beta),
                "estimated_beta": beta_hat,
                "absolute_error": abs(beta_hat - self.cfg.beta),
            },
        }


def main():
    cfg = UWTConfig()
    universe = RelationalUniverse(cfg)
    result = universe.run()

    print(json.dumps(result, ensure_ascii=False, indent=2))

    out_path = "uwt_relational_model_result.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nSaved result to {out_path}")


if __name__ == "__main__":
    main()
