"""
Algorithm 4 -- Monte Carlo Markov Chain (MCMC) Path Simulation
==================================================================

Simulates future market state trajectories over an N-day horizon from a
given Transition Probability Matrix, using Inverse Transform Sampling.

Reference: Section 4.15 and Appendix B, Algorithm 4 of the dissertation.
"""

import random
from typing import List, Sequence, Tuple


def run_mcmc_simulation(
    start_state: int,
    P_matrix: Sequence[Sequence[float]],
    expected_returns: Sequence[float],
    days: int = 30,
) -> Tuple[List[int], List[float]]:
    """Simulate a single state/return trajectory via inverse transform sampling.

    Parameters
    ----------
    start_state : int
        Starting market state (1=Upward, 2=Downward, 3=Stagnant).
    P_matrix : sequence of sequence of float
        Transition Probability Matrix to sample from.
    expected_returns : sequence of float
        Expected log return associated with each state, used to translate
        the simulated state path into a simulated return path.
    days : int, default 30
        Simulation horizon.

    Returns
    -------
    (list of int, list of float)
        The simulated state path (length days+1, including the start
        state) and the simulated return path (length days).
    """
    simulated_states = [start_state]
    simulated_returns: List[float] = []

    for _ in range(days):
        current_idx = simulated_states[-1] - 1
        probs = P_matrix[current_idx]

        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        next_state = simulated_states[-1]  # fallback if probs don't sum to 1
        for j, p in enumerate(probs):
            cumulative_prob += p
            if r <= cumulative_prob:
                next_state = j + 1
                break

        simulated_states.append(next_state)
        simulated_returns.append(expected_returns[next_state - 1])

    return simulated_states, simulated_returns
