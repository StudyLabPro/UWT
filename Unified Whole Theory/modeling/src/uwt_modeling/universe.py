from __future__ import annotations

from dataclasses import asdict
import numpy as np

from .balansis_adapter import compensated_sum
from .config import UWTConfig
from .metrics import check_metric_axioms
from .structures import RelationSpace


class RelationalUniverse:
    def __init__(self, cfg: UWTConfig):
        self.cfg = cfg
        self.space = RelationSpace(cfg.modulus, cfg.dim, cfg.ell0)
        self.rng = np.random.default_rng(cfg.seed)
        self.x = self.rng.integers(0, cfg.modulus, size=(cfg.n_parts, cfg.dim), endpoint=False)
        self.history: list[dict] = []

    def relations(self) -> np.ndarray:
        return (self.x[None, :, :] - self.x[:, None, :]) % self.cfg.modulus

    def distances(self, relations: np.ndarray | None = None) -> np.ndarray:
        return self.space.metric_projection(self.relations() if relations is None else relations)

    def metric_report(self) -> dict:
        return check_metric_axioms(self.distances())

    def entropy(self, d: np.ndarray) -> float:
        vals = d[~np.eye(self.cfg.n_parts, dtype=bool)]
        bins = min(32, max(4, int(np.sqrt(vals.size))))
        hist, _ = np.histogram(vals, bins=bins, density=False)
        probs = hist[hist > 0] / hist.sum()
        return float(-(probs * np.log(probs)).sum() * self.cfg.entropy_weight)

    def potential(self, d: np.ndarray) -> np.ndarray:
        return self.cfg.potential_alpha * d**2

    def step(self) -> dict:
        old_r = self.relations()
        old_d = self.distances(old_r)
        dx = self.rng.integers(-self.cfg.max_step, self.cfg.max_step + 1, size=self.x.shape)
        self.x = (self.x + dx) % self.cfg.modulus
        new_r = self.relations()
        new_d = self.distances(new_r)
        delta_r = (new_r - old_r) % self.cfg.modulus
        delta_d = np.abs(new_d - old_d)
        velocity = delta_d / self.cfg.dt
        n = self.cfg.n_parts
        offdiag = ~np.eye(n, dtype=bool)
        variation = (self.space.rho(delta_r) * offdiag).sum(axis=1)
        stability = 1.0 / (1.0 + variation)
        mass = self.cfg.m0 + self.cfg.mscale * stability
        kinetic = 0.5 * mass[:, None] * velocity**2
        potential = self.potential(new_d)
        energy_matrix = kinetic + potential
        lagrangian_matrix = kinetic - potential
        total_energy, energy_comp = compensated_sum(energy_matrix[offdiag].ravel())
        total_lagrangian, lagrangian_comp = compensated_sum(lagrangian_matrix[offdiag].ravel())
        prev_velocity = self.history[-1]["velocity"] if self.history else np.zeros_like(velocity)
        acceleration = (velocity - prev_velocity) / self.cfg.dt
        momentum = mass[:, None] * velocity
        prev_momentum = self.history[-1]["momentum"] if self.history else np.zeros_like(momentum)
        force = (momentum - prev_momentum) / self.cfg.dt
        snapshot = {
            "relations": new_r,
            "distance": new_d,
            "delta_distance": delta_d,
            "velocity": velocity,
            "acceleration": acceleration,
            "stability": stability,
            "mass": mass,
            "momentum": momentum,
            "force": force,
            "kinetic": kinetic,
            "potential": potential,
            "energy_matrix": energy_matrix,
            "lagrangian_matrix": lagrangian_matrix,
            "total_energy": total_energy,
            "total_energy_compensation": energy_comp,
            "total_lagrangian": total_lagrangian,
            "total_lagrangian_compensation": lagrangian_comp,
            "entropy": self.entropy(new_d),
        }
        self.history.append(snapshot)
        return snapshot

    def run(self, steps: int | None = None) -> list[dict]:
        for _ in range(self.cfg.steps if steps is None else steps):
            self.step()
        return self.history

    def theory_checks(self) -> dict:
        metric = self.metric_report()
        if not self.history:
            self.run()
        velocities = np.concatenate([h["velocity"].ravel() for h in self.history])
        entropies = np.array([h["entropy"] for h in self.history])
        energies = np.array([h["total_energy"] for h in self.history])
        masses = np.concatenate([h["mass"].ravel() for h in self.history])
        local_speed_bound = self.cfg.ell0 * np.sqrt(self.cfg.dim) * 2.0 * self.cfg.max_step / self.cfg.dt
        entropy_deltas = np.diff(entropies)
        return {
            "config": asdict(self.cfg),
            "metric": metric,
            "dynamics": {
                "max_observed_velocity": float(velocities.max()),
                "local_speed_bound": float(local_speed_bound),
                "local_speed_bound_respected": bool(velocities.max() <= local_speed_bound + 1e-9),
                "mean_mass": float(masses.mean()),
                "min_mass": float(masses.min()),
                "max_mass": float(masses.max()),
            },
            "time": {
                "initial_entropy": float(entropies[0]),
                "final_entropy": float(entropies[-1]),
                "mean_entropy_delta": float(entropy_deltas.mean()) if entropy_deltas.size else 0.0,
                "entropy_non_decrease_ratio": float((entropy_deltas >= -1e-9).mean()) if entropy_deltas.size else 1.0,
            },
            "energy": {
                "initial_total_energy": float(energies[0]),
                "final_total_energy": float(energies[-1]),
                "mean_total_energy": float(energies.mean()),
                "energy_compensation_mean": float(np.mean([h["total_energy_compensation"] for h in self.history])),
            },
        }
