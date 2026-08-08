"""
Conditional Transition Probability Matrices
=============================================

Extends the MLE estimator from Algorithm 1 to build one Transition
Probability Matrix per institutional flow regime (SP / N / SN), by
counting only the transitions that occur on days tagged with that regime.

This implements the conditional TPM methodology described in Section 3.9
of the dissertation. (The appendix pseudocode covers the unconditional
case; this module is the natural regime-filtered extension of the same
counting logic, used to produce the Section 4.9 results.)
"""

from typing import Dict, List, Sequence

N_STATES = 3


def build_conditional_tpms(
    states: Sequence[int], regimes: Sequence[str], n_states: int = N_STATES
) -> Dict[str, List[List[float]]]:
    """Build one TPM per institutional regime.

    A transition t -> t+1 is attributed to whichever regime day t was
    tagged with (i.e. "given today's institutional flow regime, what's
    the probability of tomorrow's state?").

    Parameters
    ----------
    states : sequence of int
        Market state sequence (1=Upward, 2=Downward, 3=Stagnant).
    regimes : sequence of str
        Institutional regime label for each day ('SP', 'N', 'SN'),
        same length as `states`.

    Returns
    -------
    dict
        Maps regime label -> TPM (list of lists).
    """
    if len(states) != len(regimes):
        raise ValueError("states and regimes must be the same length")

    labels = sorted(set(regimes))
    counts = {label: [[0] * n_states for _ in range(n_states)] for label in labels}

    for t in range(len(states) - 1):
        label = regimes[t]
        i, j = states[t] - 1, states[t + 1] - 1
        counts[label][i][j] += 1

    matrices: Dict[str, List[List[float]]] = {}
    for label in labels:
        P = [[0.0] * n_states for _ in range(n_states)]
        for i in range(n_states):
            row_sum = sum(counts[label][i])
            if row_sum > 0:
                for j in range(n_states):
                    P[i][j] = counts[label][i][j] / row_sum
        matrices[label] = P
    return matrices
