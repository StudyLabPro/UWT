from __future__ import annotations

import argparse
from dataclasses import replace
from pathlib import Path

from .config import UWTConfig
from .experiments import run_experiment
from .serialization import write_json


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="UWT relational modeling and forecasting toolkit")
    parser.add_argument("--parts", type=int, default=UWTConfig.n_parts)
    parser.add_argument("--dim", type=int, default=UWTConfig.dim)
    parser.add_argument("--modulus", type=int, default=UWTConfig.modulus)
    parser.add_argument("--steps", type=int, default=UWTConfig.steps)
    parser.add_argument("--forecast-horizon", type=int, default=UWTConfig.forecast_horizon)
    parser.add_argument("--seed", type=int, default=UWTConfig.seed)
    parser.add_argument("--max-step", type=int, default=UWTConfig.max_step)
    parser.add_argument("--out", default="results/uwt_experiment_result.json")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    cfg = replace(UWTConfig(), n_parts=args.parts, dim=args.dim, modulus=args.modulus, steps=args.steps, forecast_horizon=args.forecast_horizon, seed=args.seed, max_step=args.max_step)
    result = run_experiment(cfg)
    out = Path(args.out)
    write_json(out, result)
    print(f"Saved UWT experiment result to {out}")
    print(result["summary"])


if __name__ == "__main__":
    main()
