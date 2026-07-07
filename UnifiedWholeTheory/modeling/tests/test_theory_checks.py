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
