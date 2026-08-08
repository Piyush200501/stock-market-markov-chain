"""
Algorithm 2 -- Percentile-Based Institutional Flow Classification (eCDF)
=========================================================================

Classifies daily FII/DII net institutional flows into three regimes using
the empirical 25th and 75th percentiles, rather than fixed rupee-value
thresholds. This avoids the chronological bias that fixed thresholds
introduce as market size grows over a multi-year window.

Reference: Section 3.6.2 and Appendix B, Algorithm 2 of the dissertation.

Regimes
-------
SP : Strongly Positive  (flow above the 75th percentile)
N  : Neutral            (flow between the 25th and 75th percentile)
SN : Strongly Negative  (flow below the 25th percentile)
"""

from typing import List, Sequence

import numpy as np

REGIME_SP, REGIME_N, REGIME_SN = "SP", "N", "SN"


def classify_institutional_regimes(net_flows: Sequence[float]) -> List[str]:
    """Classify daily institutional net flows into SP / N / SN regimes.

    Parameters
    ----------
    net_flows : sequence of float
        Daily net institutional flow (FII or DII, in Rs. crore or similar).

    Returns
    -------
    list of str
        Regime label for each day: 'SP', 'N', or 'SN'.
    """
    p25 = np.percentile(net_flows, 25)
    p75 = np.percentile(net_flows, 75)

    regimes = []
    for flow in net_flows:
        if flow > p75:
            regimes.append(REGIME_SP)
        elif flow < p25:
            regimes.append(REGIME_SN)
        else:
            regimes.append(REGIME_N)
    return regimes


if __name__ == "__main__":
    sample_flows = [120, -300, 50, 900, -1200, 30, 400, -50]
    print(classify_institutional_regimes(sample_flows))
