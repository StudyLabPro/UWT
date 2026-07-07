from uwt_modeling import UWTConfig, run_experiment


if __name__ == "__main__":
    result = run_experiment(UWTConfig(steps=100, forecast_horizon=10))
    print(result["summary"])
