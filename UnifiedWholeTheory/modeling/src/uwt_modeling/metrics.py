from __future__ import annotations

import numpy as np


def check_metric_axioms(d: np.ndarray, tol: float = 1e-9) -> dict:
    n = d.shape[0]
    offdiag = ~np.eye(n, dtype=bool)
    nonnegative = bool(np.all(d >= -tol))
    identity = bool(np.allclose(np.diag(d), 0.0, atol=tol) and np.all(d[offdiag] > tol))
    symmetry = bool(np.allclose(d, d.T, atol=tol))

    max_violation = 0.0
    triangle = True
    for i in range(n):
        lhs = d[i][None, :]
        rhs = d[i][:, None] + d
        violation = float(np.max(lhs - rhs))
        max_violation = max(max_violation, violation)
        if violation > tol:
            triangle = False

    positive = d[d > tol]
    return {
        "nonnegative": nonnegative,
        "identity_of_indiscernibles": identity,
        "symmetry": symmetry,
        "triangle": triangle,
        "is_metric": bool(nonnegative and identity and symmetry and triangle),
        "max_triangle_violation": max_violation,
        "sample_min_nonzero_distance": float(positive.min()) if positive.size else None,
        "sample_max_distance": float(d.max()),
    }
