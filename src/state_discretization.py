"""
Algorithm 1 -- State Discretization & Maximum Likelihood Transition Matrix
============================================================================

Classifies daily log returns into one of three market regimes (Upward,
Downward, Stagnant) using a symmetric return threshold, then estimates the
unconditional Transition Probability Matrix (TPM) via Maximum Likelihood
Estimation (MLE).

Reference: Section 3.7-3.8 and Appendix B, Algorithm 1 of "Analyzing Stock
Market Behavior Using Markov Chain with FII and DII Data" (Piyush Mittal,
B.Sc. Hons Mathematics, Shyam Lal College, University of Delhi, 2026).

States
------
1 : Upward    (log return  >  +threshold)
2 : Downward  (log return  <  -threshold)
3 : Stagnant  (otherwise)
"""

from typing import List

STATE_UP, STATE_DOWN, STATE_STABLE = 1, 2, 3
N_STATES = 3


def discretize_returns(returns: List[float], threshold: float = 0.003) -> List[int]:
    """Classify a sequence of log returns into discrete market states.

    Parameters
    ----------
    returns : list of float
        Daily logarithmic returns of the index.
    threshold : float, default 0.003 (0.30%)
        Symmetric return boundary. 0.30% was found to be the statistically
        optimal threshold via the sensitivity analysis in Section 4.4-4.5.

    Returns
    -------
    list of int
        Sequence of states (1=Upward, 2=Downward, 3=Stagnant).
    """
    states = []
    for r in returns:
        if r > threshold:
            states.append(STATE_UP)
        elif r < -threshold:
            states.append(STATE_DOWN)
        else:
            states.append(STATE_STABLE)
    return states


def estimate_tpm_from_states(states: List[int], n_states: int = N_STATES) -> List[List[float]]:
    """Estimate a Transition Probability Matrix via MLE from a state sequence.

    P[i][j] = (# transitions i -> j) / (# transitions out of i)
    """
    counts = [[0] * n_states for _ in range(n_states)]
    for t in range(len(states) - 1):
        i, j = states[t] - 1, states[t + 1] - 1
        counts[i][j] += 1

    P = [[0.0] * n_states for _ in range(n_states)]
    for i in range(n_states):
        row_sum = sum(counts[i])
        if row_sum > 0:
            for j in range(n_states):
                P[i][j] = counts[i][j] / row_sum
    return P


def calculate_baseline_tpm(returns: List[float], threshold: float = 0.003) -> List[List[float]]:
    """Full pipeline: discretize returns, then estimate the baseline TPM.

    This mirrors Algorithm 1 in Appendix B of the dissertation.
    """
    states = discretize_returns(returns, threshold)
    return estimate_tpm_from_states(states)


if __name__ == "__main__":
    sample_returns = [0.004, -0.001, 0.0002, -0.005, 0.006, 0.001, -0.004]
    tpm = calculate_baseline_tpm(sample_returns)
    print("Baseline TPM:")
    for row in tpm:
        print(row)
