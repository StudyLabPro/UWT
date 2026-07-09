from pathlib import Path
import sys


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from uwt_modeling import UWTConfig, run_experiment


if __name__ == "__main__":
    result = run_experiment(UWTConfig(steps=100, forecast_horizon=10))
    print(result["summary"])
