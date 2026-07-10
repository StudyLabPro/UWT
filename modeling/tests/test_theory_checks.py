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
