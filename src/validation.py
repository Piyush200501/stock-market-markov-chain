"""
Algorithm 3 -- Top-2 Probabilistic Accuracy Validation
=========================================================

A validation metric proposed in this dissertation (Section 3.11) to score
predictions of an inherently stochastic 3-state process. A prediction
counts as a "hit" if the actual next-day state falls within the model's
two most likely predicted states, rather than requiring an exact match to
the single most probable state -- which is an unreasonably strict bar for
a genuinely stochastic system.

Reference: Section 3.11 and Appendix B, Algorithm 3 of the dissertation.
"""

from typing import Dict, List, Sequence

import numpy as np


def calculate_top2_accuracy(
    test_states: Sequence[int],
    test_regimes: Sequence[str],
    conditional_matrices: Dict[str, List[List[float]]],
) -> float:
    """Compute Top-2 Probabilistic Accuracy on a held-out test sequence.

    Parameters
    ----------
    test_states : sequence of int
        Held-out market state sequence.
    test_regimes : sequence of str
        Institutional regime label for each day in the test sequence.
    conditional_matrices : dict
        Regime-conditioned TPMs, as produced by
        `conditional_matrices.build_conditional_tpms` (typically fit on
        a separate training window).

    Returns
    -------
    float
        Top-2 accuracy as a percentage.
    """
    hits = 0
    n = len(test_states) - 1

    for t in range(n):
        current_state = test_states[t]
        current_regime = test_regimes[t]
        actual_next_state = test_states[t + 1]

        P_cond = conditional_matrices[current_regime]
        predicted_probs = P_cond[current_state - 1]

        top_2_indices = np.argsort(predicted_probs)[-2:]
        top_2_states = [idx + 1 for idx in top_2_indices]

        if actual_next_state in top_2_states:
            hits += 1

    return (hits / n) * 100 if n > 0 else 0.0
