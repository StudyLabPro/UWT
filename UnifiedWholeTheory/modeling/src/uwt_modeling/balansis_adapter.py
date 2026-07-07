from __future__ import annotations

from collections.abc import Iterable

from balansis import AbsoluteValue, Operations


def bv(value: float) -> AbsoluteValue:
    return AbsoluteValue.from_float(float(value))


def compensated_sum(values: Iterable[float]) -> tuple[float, float]:
    items = [bv(v) for v in values]
    if not items:
        return 0.0, 0.0
    result, compensation = Operations.sequence_sum(items)
    return float(result.to_float()), float(compensation)
