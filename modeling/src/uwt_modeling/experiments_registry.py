"""Реестр именованных экспериментов UWT (вычислительная программа теории).

Каждый эксперимент — воспроизводимый сценарий с маркером достоверности по
конвенции проекта:

- ``MODEL`` — свойство дискретной реляционной модели, воспроизводимое численно;
- ``HYPOTHESIS`` — поисковая оценка, интерпретация которой требует
  дополнительной теоретической проработки.

Диагностические метрики (participation ratio, оценки размерности и т.п.)
считаются обычным numpy: это не физические накопления модели — те идут через
компенсированную арифметику АКТ внутри ``universe``/``wavefunction``.

Запуск: ``uwt-model --experiment <name>`` или
``run_named_experiment(name, cfg)``; список — ``uwt-model --list-experiments``.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Callable

import numpy as np

from .config import UWTConfig
from .forecast import parameter_scan
from .universe import RelationalUniverse
from .wavefunction import circular_spread, relational_wavefunction


def _participation_ratio(prob: np.ndarray) -> float:
    """PR = 1/Σp² по последней оси (1 — дельта-пик, N — равномерное), среднее."""
    pr = 1.0 / np.maximum((prob**2).sum(axis=-1), 1e-30)
    return float(pr.mean())


def _psi_metrics(universe: RelationalUniverse) -> dict:
    wave = relational_wavefunction(universe)
    prob = wave["probability"]
    return {
        "mean_position_spread": float(np.asarray(circular_spread(prob)).mean()),
        "mean_participation_ratio": _participation_ratio(prob),
    }


def psi_evolution(cfg: UWTConfig, n_snapshots: int = 6) -> dict:
    """MODEL: эволюция ψ во времени — снимки по мере накопления истории.

    ψ в текущей модели строится из всей истории отношений; «эволюция» здесь —
    последовательность снимков ψ после каждого блока шагов (растущий префикс
    истории), а не унитарная динамика Шрёдингера. Метрики: круговой разброс
    |ψ|² и participation ratio.
    """
    universe = RelationalUniverse(cfg)
    chunk = max(1, cfg.steps // n_snapshots)
    series = []
    for k in range(n_snapshots):
        universe.run(chunk)
        series.append({"step": (k + 1) * chunk, **_psi_metrics(universe)})
    return {
        "marker": "MODEL",
        "series": series,
        "spread_drift": series[-1]["mean_position_spread"] - series[0]["mean_position_spread"],
        "note": "снимки ψ по растущему префиксу истории; унитарная динамика ψ — открытая задача",
    }


def condensation(cfg: UWTConfig) -> dict:
    """MODEL: конденсация — отжиг спускает энергию, ψ реагирует через ширину пакета.

    Сравнение annealed (T=0.2) против random при stability_width_gamma=-0.5
    (теоретическая связка «ширина ∝ устойчивость^(-1/2)»). Ожидание: у отжига
    финальная потенциальная энергия ниже; сдвиг локализации ψ фиксируется в
    отчёте (localization_delta_spread < 0 означает сужение пакетов).
    """
    base = replace(cfg, stability_width_gamma=-0.5)
    variants = {
        "annealed": replace(base, dynamics="annealed", temperature=0.2),
        "random": replace(base, dynamics="random"),
    }
    results = {}
    for name, variant_cfg in variants.items():
        universe = RelationalUniverse(variant_cfg)
        universe.run(variant_cfg.steps)
        results[name] = {
            "final_potential_energy": universe._potential_energy(universe.distances()),
            **_psi_metrics(universe),
        }
    return {
        "marker": "MODEL",
        "annealed": results["annealed"],
        "random": results["random"],
        "energy_descent_confirmed": bool(
            results["annealed"]["final_potential_energy"] < results["random"]["final_potential_energy"]
        ),
        "localization_delta_spread": results["annealed"]["mean_position_spread"]
        - results["random"]["mean_position_spread"],
    }


def quantized_distance(cfg: UWTConfig) -> dict:
    """MODEL: спектр расстояний дискретен — количественная фиксация квантования.

    Дискретность заложена решёткой Z_N^d, эксперимент не «открывает» её, а
    измеряет: минимальный квант расстояния, минимальный зазор спектра, число
    различимых значений (различающее предсказание монографии: квантование
    расстояния и длительности).
    """
    universe = RelationalUniverse(cfg)
    d = universe.distances()
    values = np.unique(np.round(d[~np.eye(cfg.n_parts, dtype=bool)], 12))
    positive = values[values > 0]
    gaps = np.diff(positive)
    return {
        "marker": "MODEL",
        "distinct_distances": int(values.size),
        "min_positive_distance": float(positive.min()),
        "min_spectrum_gap": float(gaps.min()) if gaps.size else None,
        "duration_quantum_dt": cfg.dt,
    }


def speed_bound_invariance(cfg: UWTConfig) -> dict:
    """MODEL: максимальная скорость ограничена инвариантом конфигурации.

    Скан по max_step × seed: наблюдаемая скорость всюду ≤ границы
    ell0·√dim·2·max_step/dt, зависящей только от конфигурации (не от
    состояния) — модельный аналог инвариантной максимальной скорости.
    """
    rows = parameter_scan(cfg, seeds=3)
    return {
        "marker": "MODEL",
        "all_respected": bool(all(r["speed_bound_respected"] for r in rows)),
        "bounds_by_config": sorted({r["speed_bound"] for r in rows}),
        "max_observed_velocity": max(r["max_observed_velocity"] for r in rows),
        "rows": rows,
    }


def dimensional_reduction(cfg: UWTConfig) -> dict:
    """HYPOTHESIS: эффективная размерность по скейлингу N(<r) ~ r^D.

    Оценка наклона log N(<r) / log r на малых и больших масштабах из
    распределения попарных расстояний. Интерпретация как «размерной редукции»
    требует теоретической проработки — публикуется как поисковая метрика.
    """
    universe = RelationalUniverse(cfg)
    d = universe.distances()[~np.eye(cfg.n_parts, dtype=bool)]
    d = d[d > 0]
    r_grid = np.unique(np.quantile(d, np.linspace(0.05, 0.95, 19)))
    counts = np.array([(d <= r).sum() for r in r_grid], dtype=float)
    log_r, log_n = np.log(r_grid), np.log(counts)
    half = r_grid.size // 2
    dim_small = float(np.polyfit(log_r[:half], log_n[:half], 1)[0]) if half >= 2 else None
    dim_large = float(np.polyfit(log_r[half:], log_n[half:], 1)[0]) if r_grid.size - half >= 2 else None
    return {
        "marker": "HYPOTHESIS",
        "lattice_dim": cfg.dim,
        "effective_dim_small_scale": dim_small,
        "effective_dim_large_scale": dim_large,
        "n_radii": int(r_grid.size),
    }


@dataclass(frozen=True)
class ExperimentSpec:
    description: str
    marker: str
    runner: Callable[[UWTConfig], dict]


EXPERIMENTS: dict[str, ExperimentSpec] = {
    "psi_evolution": ExperimentSpec(
        "Эволюция ψ: снимки по растущему префиксу истории", "MODEL", psi_evolution
    ),
    "condensation": ExperimentSpec(
        "Конденсация: отжиг спускает энергию, ψ сужается через gamma=-0.5", "MODEL", condensation
    ),
    "quantized_distance": ExperimentSpec(
        "Квантование расстояния/длительности: спектр и минимальный квант", "MODEL", quantized_distance
    ),
    "speed_bound_invariance": ExperimentSpec(
        "Инвариантная максимальная скорость: скан max_step × seed", "MODEL", speed_bound_invariance
    ),
    "dimensional_reduction": ExperimentSpec(
        "Эффективная размерность по скейлингу N(<r) ~ r^D", "HYPOTHESIS", dimensional_reduction
    ),
}


def run_named_experiment(name: str, cfg: UWTConfig | None = None) -> dict:
    """Запуск эксперимента из реестра; результат снабжается описанием и маркером."""
    spec = EXPERIMENTS.get(name)
    if spec is None:
        raise ValueError(f"unknown experiment {name!r}; available: {sorted(EXPERIMENTS)}")
    result = spec.runner(cfg if cfg is not None else UWTConfig())
    return {"experiment": name, "description": spec.description, **result}
