"""Прямые тесты balansis_adapter и metrics.

Закрепляют «честную карту компенсации» из docstring адаптера: суммы, осевые
суммы, GEMM, поэлементные add/mul — компенсированы; поэлементное деление и
трансцендентные функции — побитово равны сырому numpy (компенсации нет).
"""
from __future__ import annotations

import math

import numpy as np
import pytest

from uwt_modeling import balansis_adapter as ba
from uwt_modeling.metrics import check_metric_axioms


def test_compensated_sum_matches_fsum_on_ill_conditioned_series():
    rng = np.random.default_rng(0)
    values = np.concatenate([rng.normal(0.0, 1.0, 1000) * 1e12, rng.normal(0.0, 1.0, 1000)])
    total, compensation = ba.compensated_sum(values)
    assert math.isclose(total, math.fsum(values), rel_tol=0.0, abs_tol=1e-3)
    assert isinstance(compensation, float)


def test_compensated_axis_sum_matches_fsum_rowwise():
    rng = np.random.default_rng(1)
    matrix = rng.normal(size=(8, 512)) * np.logspace(0, 10, 512)
    sums, compensations = ba.compensated_axis_sum(matrix)
    expected = np.array([math.fsum(row) for row in matrix])
    assert np.allclose(sums, expected, atol=1e-4)
    assert sums.shape == (8,)
    assert compensations.shape == (8,)


def test_compensated_matmul_matches_numpy():
    rng = np.random.default_rng(2)
    a, b = rng.normal(size=(16, 16)), rng.normal(size=(16, 16))
    result, _ = ba.compensated_matmul(a, b)
    assert np.allclose(result, a @ b, atol=1e-10)


def test_compensated_complex_matmul_matches_numpy():
    rng = np.random.default_rng(3)
    a = rng.normal(size=(8, 8)) + 1j * rng.normal(size=(8, 8))
    b = rng.normal(size=(8, 8)) + 1j * rng.normal(size=(8, 8))
    result, _ = ba.compensated_complex_matmul(a, b)
    assert np.allclose(result, a @ b, atol=1e-10)


def test_elementwise_add_and_multiply_match_numpy_on_benign_input():
    rng = np.random.default_rng(4)
    a, b = rng.normal(size=64), rng.normal(size=64)
    assert np.allclose(ba.compensated_elementwise_add(a, b), a + b)
    assert np.allclose(ba.compensated_elementwise_multiply(a, b), a * b)


def test_divide_is_honestly_raw_numpy():
    rng = np.random.default_rng(5)
    a, b = rng.normal(size=64), rng.normal(size=64) + 10.0
    assert np.array_equal(ba.compensated_elementwise_divide(a, b), a / b)


def test_elementwise_transcendentals_are_honestly_raw_numpy():
    rng = np.random.default_rng(6)
    values = np.abs(rng.normal(size=64)) + 0.1
    raw = {"exp": np.exp, "cos": np.cos, "sin": np.sin, "sqrt": np.sqrt, "log": np.log}
    for op, func in raw.items():
        assert np.array_equal(ba.compensated_elementwise(op, values), func(values))
    with pytest.raises(ValueError):
        ba.compensated_elementwise("tan", values)


def _distance_matrix(points: np.ndarray) -> np.ndarray:
    diff = points[None, :, :] - points[:, None, :]
    return np.linalg.norm(diff, axis=-1)


def test_metric_axioms_hold_for_euclidean_points():
    rng = np.random.default_rng(7)
    report = check_metric_axioms(_distance_matrix(rng.normal(size=(12, 3))))
    assert report["is_metric"]
    assert report["symmetry"] and report["triangle"] and report["nonnegative"]


def test_metric_detects_symmetry_violation():
    d = _distance_matrix(np.random.default_rng(8).normal(size=(6, 2)))
    d[0, 1] += 1.0
    report = check_metric_axioms(d)
    assert not report["symmetry"]
    assert not report["is_metric"]


def test_metric_detects_triangle_violation():
    d = np.array([[0.0, 1.0, 5.0], [1.0, 0.0, 1.0], [5.0, 1.0, 0.0]])
    report = check_metric_axioms(d)
    assert not report["triangle"]
    assert report["max_triangle_violation"] > 0.0
    assert not report["is_metric"]
