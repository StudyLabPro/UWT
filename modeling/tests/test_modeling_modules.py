import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest

from uwt_modeling.balansis_adapter import compensated_sum
from uwt_modeling.config import UWTConfig
from uwt_modeling.forecast import forecast_observables, linear_forecast, parameter_scan
from uwt_modeling.serialization import to_builtin, write_json


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("n_parts", 1, "n_parts must be greater than 1"),
        ("dim", 0, "dim must be greater than 0"),
        ("modulus", 0, "modulus must be greater than 0"),
        ("ell0", 0, "ell0 must be greater than 0"),
        ("dt", 0, "dt must be greater than 0"),
        ("max_step", -1, "max_step must be non-negative"),
        ("steps", -1, "steps must be non-negative"),
        ("forecast_horizon", -1, "forecast_horizon must be non-negative"),
    ],
)
def test_config_rejects_invalid_boundaries(field, value, message):
    with pytest.raises(ValueError, match=message):
        UWTConfig(**{field: value})


def test_config_accepts_zero_step_run_parameters():
    cfg = UWTConfig(steps=0, forecast_horizon=0, max_step=0)
    assert cfg.steps == 0
    assert cfg.forecast_horizon == 0
    assert cfg.max_step == 0


def test_linear_forecast_empty_and_single_value():
    assert linear_forecast([], horizon=3) == []
    assert linear_forecast([2.5], horizon=3) == [2.5, 2.5, 2.5]


def test_linear_forecast_continues_linear_trend():
    assert linear_forecast([1, 3, 5], horizon=2) == [7.0, 9.0]


def test_forecast_observables_shape():
    cfg = UWTConfig(n_parts=8, steps=8, forecast_horizon=4, seed=4)
    forecast = forecast_observables(cfg)
    assert forecast["horizon"] == 4
    assert set(forecast) == {"horizon", "energy", "entropy", "mean_mass", "max_velocity"}
    assert all(len(forecast[key]) == 4 for key in ["energy", "entropy", "mean_mass", "max_velocity"])


def test_parameter_scan_rows_and_speed_bound():
    rows = parameter_scan(UWTConfig(n_parts=8, steps=5, seed=3), seeds=2)
    assert len(rows) == 6
    assert {row["max_step"] for row in rows} == {1, 2, 3}
    assert all(row["speed_bound_respected"] for row in rows)


def test_compensated_sum_empty_and_values():
    assert compensated_sum([]) == (0.0, 0.0)
    total, compensation = compensated_sum([0.1, 0.2, 0.3])
    assert abs(total - 0.6) < 1e-9
    assert isinstance(compensation, float)


def test_to_builtin_converts_numpy_values():
    data = {
        "scalar": np.float64(1.25),
        "items": [np.int64(2), (np.float64(3.5),)],
    }
    assert to_builtin(data) == {"scalar": 1.25, "items": [2, [3.5]]}


def test_write_json_creates_parent_directories(tmp_path):
    target = tmp_path / "nested" / "result.json"
    write_json(target, {"value": np.float64(1.5)})
    assert json.loads(target.read_text(encoding="utf-8")) == {"value": 1.5}


def test_cli_writes_result_file(tmp_path):
    target = tmp_path / "cli-result.json"
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path(__file__).resolve().parents[1] / "src")
    completed = subprocess.run(
        [
            sys.executable,
            "-m",
            "uwt_modeling.cli",
            "--parts",
            "8",
            "--steps",
            "4",
            "--forecast-horizon",
            "2",
            "--out",
            str(target),
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )
    assert "Saved UWT experiment result" in completed.stdout
    payload = json.loads(target.read_text(encoding="utf-8"))
    assert payload["summary"]["metric_is_valid"] is True
    assert len(payload["forecast"]["energy"]) == 2
