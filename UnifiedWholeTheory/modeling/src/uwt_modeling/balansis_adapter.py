"""Адаптер Balansis (АКТ — теория абсолютной компенсации).

Все накопительные операции моделирования идут через этот модуль:
скалярные и осевые суммы — через Kahan `Operations.sequence_sum`,
матричные произведения — через ACT-GEMM с компенсацией Неймайера,
поэлементные функции — через `Operations.compensated_*`.
"""
from __future__ import annotations

from collections.abc import Iterable

import numpy as np

from balansis import AbsoluteValue, Operations
from balansis.linalg.gemm import matmul as _act_matmul


def bv(value: float) -> AbsoluteValue:
    return AbsoluteValue.from_float(float(value))


def compensated_sum(values: Iterable[float]) -> tuple[float, float]:
    items = [bv(v) for v in values]
    if not items:
        return 0.0, 0.0
    result, compensation = Operations.sequence_sum(items)
    return float(result.to_float()), float(compensation)


def compensated_axis_sum(values: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Компенсированные суммы по последней оси; возвращает (суммы, компенсации)."""
    arr = np.asarray(values, dtype=float)
    flat = arr.reshape(-1, arr.shape[-1])
    totals = np.empty(flat.shape[0])
    comps = np.empty(flat.shape[0])
    for i, row in enumerate(flat):
        totals[i], comps[i] = compensated_sum(row)
    return totals.reshape(arr.shape[:-1]), comps.reshape(arr.shape[:-1])


def _to_matrix(arr: np.ndarray) -> list[list[AbsoluteValue]]:
    return [[bv(v) for v in row] for row in arr]


def _from_matrix(mat: list[list[AbsoluteValue]]) -> np.ndarray:
    return np.array([[cell.to_float() for cell in row] for row in mat], dtype=float)


def compensated_matmul(a: np.ndarray, b: np.ndarray) -> tuple[np.ndarray, float]:
    """Вещественное матричное произведение через ACT-GEMM Balansis."""
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    if not a.any() or not b.any():
        return np.zeros((a.shape[0], b.shape[1])), 1.0
    result, compensation = _act_matmul(_to_matrix(a), _to_matrix(b))
    return _from_matrix(result), float(compensation)


def compensated_complex_matmul(a: np.ndarray, b: np.ndarray) -> tuple[np.ndarray, float]:
    """Комплексное матричное произведение как четыре вещественных ACT-GEMM."""
    a = np.asarray(a)
    b = np.asarray(b)
    real_real, c1 = compensated_matmul(a.real, b.real)
    imag_imag, c2 = compensated_matmul(a.imag, b.imag)
    real_imag, c3 = compensated_matmul(a.real, b.imag)
    imag_real, c4 = compensated_matmul(a.imag, b.real)
    real = compensated_elementwise_add(real_real, -imag_imag)
    imag = compensated_elementwise_add(real_imag, imag_real)
    return real + 1j * imag, max(c1, c2, c3, c4)


def compensated_elementwise_add(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a, b = np.broadcast_arrays(np.asarray(a, dtype=float), np.asarray(b, dtype=float))
    flat_a, flat_b = a.ravel(), b.ravel()
    out = np.empty(a.size)
    for i in range(a.size):
        out[i] = Operations.compensated_add(bv(flat_a[i]), bv(flat_b[i]))[0].to_float()
    return out.reshape(a.shape)


def compensated_elementwise_multiply(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a, b = np.broadcast_arrays(np.asarray(a, dtype=float), np.asarray(b, dtype=float))
    flat_a, flat_b = a.ravel(), b.ravel()
    out = np.empty(a.size)
    for i in range(a.size):
        out[i] = Operations.compensated_multiply(bv(flat_a[i]), bv(flat_b[i]))[0].to_float()
    return out.reshape(a.shape)


def compensated_elementwise_divide(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a, b = np.broadcast_arrays(np.asarray(a, dtype=float), np.asarray(b, dtype=float))
    flat_a, flat_b = a.ravel(), b.ravel()
    out = np.empty(a.size)
    for i in range(a.size):
        ratio, _ = Operations.compensated_divide(bv(flat_a[i]), bv(flat_b[i]))
        out[i] = float(ratio.numerical_value())
    return out.reshape(a.shape)


def compensated_elementwise(op: str, values: np.ndarray) -> np.ndarray:
    """Поэлементные exp/cos/sin/sqrt/log через компенсированные операции Balansis."""
    func = getattr(Operations, f"compensated_{op}")
    arr = np.asarray(values, dtype=float)
    flat = arr.ravel()
    out = np.empty(arr.size)
    for i in range(arr.size):
        out[i] = func(bv(flat[i]))[0].to_float()
    return out.reshape(arr.shape)
