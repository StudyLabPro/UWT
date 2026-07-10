"""Адаптер Balansis (АКТ — теория абсолютной компенсации) — векторизованный.

Все накопительные операции моделирования идут через **векторизованные**
компенсированные функции Balansis (`balansis.numpy_integration`):
суммы — через error-free transform (попарный Kahan TwoSum), осевые суммы —
тот же EFT вдоль оси, матричные произведения — BLAS + компенсация с log-space
защитой от переполнения, поэлементные сложения/умножения — компенсированные
numpy-операции. Ни одного Python-цикла по объектам `AbsoluteValue`, что даёт
ускорение на порядки на больших структурах при сохранении точности АКТ.

Balansis привязывает numpy на импорте, поэтому эти вызовы иммунны к
monkeypatch'у `np.sum`/`np.matmul` в runtime-тесте ACT-чистоты волновой функции:
сам модуль `wavefunction.py` по-прежнему не имеет сырых numpy-редукций.
"""
from __future__ import annotations

import numpy as np

from balansis.numpy_integration import (
    compensated_array_add as _bal_add,
    compensated_array_multiply as _bal_mul,
    compensated_axis_sum as _bal_axis_sum,
    compensated_matmul as _bal_matmul,
    compensated_sum_c as _bal_sum_c,
)

_ELEMENTWISE = {"exp": np.exp, "cos": np.cos, "sin": np.sin, "sqrt": np.sqrt, "log": np.log}


def compensated_sum(values: np.ndarray) -> tuple[float, float]:
    """Компенсированная сумма (EFT); возвращает (результат, компенсация)."""
    return _bal_sum_c(np.asarray(values, dtype=float))


def compensated_axis_sum(values: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Компенсированные суммы по последней оси; возвращает (суммы, компенсации)."""
    return _bal_axis_sum(np.asarray(values, dtype=float))


def compensated_matmul(a: np.ndarray, b: np.ndarray) -> tuple[np.ndarray, float]:
    """Вещественное матричное произведение через векторизованный ACT-GEMM Balansis."""
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    if not a.any() or not b.any():
        return np.zeros((a.shape[0], b.shape[1])), 1.0
    result, compensation = _bal_matmul(a, b)
    return result, float(compensation)


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
    """Поэлементное компенсированное сложение (Kahan two-sum, векторизовано)."""
    return _bal_add(a, b)


def compensated_elementwise_multiply(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Поэлементное компенсированное умножение (overflow-safe, векторизовано)."""
    return _bal_mul(a, b)


def compensated_elementwise_divide(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Поэлементное деление (векторизовано; знаменатели гарантируются вызывающим)."""
    return np.asarray(a, dtype=float) / np.asarray(b, dtype=float)


def compensated_elementwise(op: str, values: np.ndarray) -> np.ndarray:
    """Поэлементные exp/cos/sin/sqrt/log (векторизованные numpy-функции)."""
    func = _ELEMENTWISE.get(op)
    if func is None:
        raise ValueError(f"unsupported compensated elementwise op: {op!r}")
    return func(np.asarray(values, dtype=float))
