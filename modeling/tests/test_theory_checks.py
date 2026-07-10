from uwt_modeling import UWTConfig, RelationalUniverse, run_experiment


def test_metric_and_speed_bound():
    cfg = UWTConfig(n_parts=12, steps=20, seed=1)
    universe = RelationalUniverse(cfg)
    universe.run()
    checks = universe.theory_checks()
    assert checks["metric"]["is_metric"]
    assert checks["dynamics"]["local_speed_bound_respected"]


def test_experiment_summary():
    result = run_experiment(UWTConfig(n_parts=10, steps=10, forecast_horizon=3, seed=2))
    assert result["summary"]["metric_is_valid"] is True
    assert len(result["forecast"]["energy"]) == 3


def test_arrow_of_time_requires_low_entropy_start():
    """Стрела времени наблюдаема только из упорядоченного (низкоэнтропийного) старта.

    Равновесный старт (равномерно на торе) стационарен: чистое производство
    энтропии ~0. Упорядоченный старт релаксирует к равновесию с явным
    положительным производством энтропии.
    """
    shared = {"n_parts": 64, "dim": 3, "modulus": 48, "steps": 200, "seed": 3}
    ordered = RelationalUniverse(UWTConfig(init="ordered", ordered_extent=2, **shared))
    equilibrium = RelationalUniverse(UWTConfig(init="equilibrium", **shared))
    ordered.run()
    equilibrium.run()
    o_time = ordered.theory_checks()["time"]
    e_time = equilibrium.theory_checks()["time"]

    # Упорядоченный старт: явная стрела времени.
    assert o_time["net_entropy_production"] > 0.3
    assert o_time["arrow_of_time_detected"] is True
    # Равновесный старт: стационарен, стрела не детектируется.
    assert e_time["arrow_of_time_detected"] is False
    assert abs(e_time["net_entropy_production"]) < 0.1
    # Упорядоченный старт действительно начинает с более низкой энтропии.
    assert o_time["initial_entropy"] < e_time["initial_entropy"] - 0.3
    # Пошаговая монотонность остаётся плохим индикатором даже при явной стреле.
    assert o_time["entropy_non_decrease_ratio"] < 0.7


def test_annealed_dynamics_descends_its_own_energy():
    """Шов 1: при dynamics='annealed' Метрополис по конфигурационной энергии
    заставляет L0 спускаться по энергии, которую он и так измеряет; случайная
    динамика лишь диффундирует."""
    shared = dict(n_parts=40, dim=3, modulus=48, steps=300, seed=1)
    rnd = RelationalUniverse(UWTConfig(dynamics="random", **shared))
    ann = RelationalUniverse(UWTConfig(dynamics="annealed", temperature=0.5, **shared))
    u0 = rnd._potential_energy(rnd.distances())  # same seed ⇒ same start for both
    rnd.run()
    ann.run()
    rnd_final = rnd._potential_energy(rnd.distances())
    ann_final = ann._potential_energy(ann.distances())
    assert ann_final < u0 * 0.8      # annealed relaxes into the energy basin
    assert ann_final < rnd_final     # far below the diffusive run
    assert rnd_final >= u0 * 0.9     # random dynamics does not descend
