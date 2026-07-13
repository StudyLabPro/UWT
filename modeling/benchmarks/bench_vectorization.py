#!/usr/bin/env python3
"""Бенчмарк векторизации ACT: balansis.numpy_integration vs наивный Python-цикл.

Наивный путь — последовательные операции над объектами ``AbsoluteValue``
(семантика АКТ без векторизации): суммы через ``acc + v``, матричное
произведение через тройной цикл. Векторизованный путь — адаптер
``uwt_modeling.balansis_adapter`` (EFT-суммы, ACT-GEMM).

Конвертация float → AbsoluteValue вынесена за пределы замера (консервативно
для наивного пути). Время — минимум по повторам. Расхождение — |naive − vec|
на одинаковых входных данных.

Запуск (из modeling/):
    python3 benchmarks/bench_vectorization.py            # быстрый профиль
    python3 benchmarks/bench_vectorization.py --full     # + n=10^6, matmul 256
    python3 benchmarks/bench_vectorization.py --out benchmarks/RESULTS.md
"""
from __future__ import annotations

import argparse
import platform
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import balansis  # noqa: E402
from balansis import AbsoluteValue, Operations  # noqa: E402

from uwt_modeling.balansis_adapter import compensated_matmul, compensated_sum  # noqa: E402


def _to_av(values: np.ndarray) -> list[AbsoluteValue]:
    return [AbsoluteValue(magnitude=abs(float(v)), direction=1 if v >= 0 else -1) for v in values.ravel()]


def _av_float(av: AbsoluteValue) -> float:
    return float(av.magnitude) * (1.0 if av.direction >= 0 else -1.0)


def _timeit(fn, repeats: int) -> tuple[float, object]:
    best, result = float("inf"), None
    for _ in range(repeats):
        start = time.perf_counter()
        result = fn()
        best = min(best, time.perf_counter() - start)
    return best, result


def bench_sum(n: int, repeats_naive: int, repeats_vec: int, rng: np.random.Generator) -> dict:
    values = rng.normal(size=n)
    avs = _to_av(values)

    def naive() -> float:
        acc = avs[0]
        for v in avs[1:]:
            acc = acc + v
        return _av_float(acc)

    def vectorized() -> float:
        total, _ = compensated_sum(values)
        return total

    t_naive, r_naive = _timeit(naive, repeats_naive)
    t_vec, r_vec = _timeit(vectorized, repeats_vec)
    return {"op": f"sum n=10^{int(np.log10(n))}", "naive_s": t_naive, "vec_s": t_vec,
            "speedup": t_naive / t_vec, "diff": abs(r_naive - r_vec)}


def bench_matmul(size: int, repeats_naive: int, repeats_vec: int, rng: np.random.Generator) -> dict:
    a = rng.normal(size=(size, size))
    b = rng.normal(size=(size, size))
    a_av = [[AbsoluteValue(magnitude=abs(float(v)), direction=1 if v >= 0 else -1) for v in row] for row in a]
    b_av = [[AbsoluteValue(magnitude=abs(float(v)), direction=1 if v >= 0 else -1) for v in row] for row in b]

    def naive() -> float:
        # тройной цикл над AbsoluteValue — референсная АКТ-семантика без векторизации
        multiply = Operations.compensated_multiply
        out = 0.0
        for i in range(size):
            row = a_av[i]
            for j in range(size):
                acc, _ = multiply(row[0], b_av[0][j])
                for k in range(1, size):
                    product, _ = multiply(row[k], b_av[k][j])
                    acc = acc + product
                out += _av_float(acc)
        return out

    def vectorized() -> float:
        result, _ = compensated_matmul(a, b)
        return float(result.sum())

    t_naive, r_naive = _timeit(naive, repeats_naive)
    t_vec, r_vec = _timeit(vectorized, repeats_vec)
    return {"op": f"matmul {size}x{size}", "naive_s": t_naive, "vec_s": t_vec,
            "speedup": t_naive / t_vec, "diff": abs(r_naive - r_vec)}


def _fmt_seconds(s: float) -> str:
    if s >= 1.0:
        return f"{s:.3f} s"
    if s >= 1e-3:
        return f"{s * 1e3:.3f} ms"
    return f"{s * 1e6:.1f} µs"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--full", action="store_true", help="включить тяжёлые размеры (sum 10^6, matmul 256)")
    parser.add_argument("--out", default=None, help="записать markdown-отчёт в файл")
    args = parser.parse_args()

    rng = np.random.default_rng(42)
    rows = [
        bench_sum(10_000, repeats_naive=3, repeats_vec=10, rng=rng),
        bench_sum(100_000, repeats_naive=3, repeats_vec=10, rng=rng),
    ]
    if args.full:
        rows.append(bench_sum(1_000_000, repeats_naive=1, repeats_vec=5, rng=rng))
    rows.append(bench_matmul(64, repeats_naive=2, repeats_vec=10, rng=rng))
    rows.append(bench_matmul(128, repeats_naive=1, repeats_vec=10, rng=rng))
    if args.full:
        rows.append(bench_matmul(256, repeats_naive=1, repeats_vec=5, rng=rng))

    cpu = platform.processor() or "unknown"
    try:
        for line in Path("/proc/cpuinfo").read_text().splitlines():
            if line.startswith("model name"):
                cpu = line.split(":", 1)[1].strip()
                break
    except OSError:
        pass

    lines = [
        "# Бенчмарк векторизации ACT (измерено, VERIFIED)",
        "",
        f"- Дата: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}",
        f"- CPU: {cpu}",
        f"- Python {platform.python_version()}, numpy {np.__version__}, "
        f"balansis {getattr(balansis, '__version__', 'unknown')}",
        "- Наивный путь: Python-цикл над `AbsoluteValue` (конвертация вне замера); "
        "время — минимум по повторам.",
        "",
        "| Операция | Наивный | Векторизованный | Ускорение | Расхождение |",
        "|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| {r['op']} | {_fmt_seconds(r['naive_s'])} | {_fmt_seconds(r['vec_s'])} "
            f"| **{r['speedup']:,.0f}x** | {r['diff']:.1e} |"
        )
    lines += [
        "",
        "Вывод: единого коэффициента ускорения не существует — оно зависит от операции",
        "и размера; ссылаться следует на таблицу измерений, а не на одно число.",
    ]
    report = "\n".join(lines)
    print(report)
    if args.out:
        Path(args.out).write_text(report + "\n", encoding="utf-8")
        print(f"\nСохранено: {args.out}")


if __name__ == "__main__":
    main()
