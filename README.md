# Analyzing Stock Market Behavior Using Markov Chains with FII & DII Data

A discrete-time Markov chain model of Nifty 50 regime transitions (Upward /
Downward / Stagnant), conditioned on Foreign and Domestic Institutional
Investor (FII/DII) net flows — built to test whether institutional capital
flows carry predictive information about short-term market regime shifts,
and to challenge the strong-form Efficient Market Hypothesis (EMH).

This repository implements the core methodology from my B.Sc. (Hons)
Mathematics dissertation at Shyam Lal College, University of Delhi
(supervised by Dr. Virender, May 2026). The full dissertation PDF is
available on request / linked below.

## Key Findings

| Result | Value |
|---|---|
| Optimal return threshold (sensitivity-tested at 0.20–0.40%) | **0.30%** |
| Diagonal dominance of Upward state (`p₁₁`) — evidence against EMH | **41.29%** |
| Mean First Passage Time (MFPT) back to Upward state | **2.56 days** |
| Downward persistence under Strongly Negative (FII outflow) regime | **41.31%** |
| Bear-market steady-state probability under DII buying (`π_SP`) | **23.06%** |
| Expected bear-market duration: baseline → DII buying regime | 1.703 → **1.276 days** |
| Model validation (Top-2 Probabilistic Accuracy) | see `examples/demo.py` output |

**Headline result — "the DII shock absorber":** when domestic institutions
are net buyers, the market's long-run probability of being in a bear
regime collapses from the baseline to 23.06%, and the expected duration
of a downturn shortens substantially. This is read as evidence that
sustained SIP-driven domestic liquidity has structurally decoupled Indian
equity markets from pure foreign-flow dependence — with the important
caveat that this is one methodology on one market over one time window,
not a settled claim (see Limitations).

## Methodology

1. **State space discretization** — daily Nifty 50 log returns are
   classified into Upward / Downward / Stagnant using a symmetric
   threshold, optimized via sensitivity analysis across 0.20–0.40%.
2. **Institutional regime classification** — FII/DII net flows are
   classified into Strongly Positive (SP) / Neutral (N) / Strongly
   Negative (SN) using empirical 25th/75th percentiles (eCDF-based, to
   avoid bias from fixed rupee thresholds over a multi-year window).
3. **Transition Probability Matrices (TPM)** — both an unconditional
   baseline TPM and regime-conditioned TPMs are estimated via Maximum
   Likelihood Estimation.
4. **Steady-state & temporal analysis** — eigenvector-based steady-state
   equilibrium, Mean First Passage Time, expected sojourn times, and
   Chapman-Kolmogorov n-step convergence.
5. **Model validation** — a custom **Top-2 Probabilistic Accuracy**
   metric (a prediction counts as correct if the actual next state falls
   within the model's two most likely predicted states — appropriate for
   an inherently stochastic 3-state system).
6. **Monte Carlo simulation** — 30-day forward path simulation via
   inverse transform sampling.

Full mathematical derivation (MLE proofs, eigenvector decomposition,
Chapman-Kolmogorov equations, TVD, Shannon entropy analysis) is in the
dissertation itself — this repo implements the computational core.

## Repository Structure

```
stock-market-markov-chain/
├── src/
│   ├── state_discretization.py   # Algorithm 1: state discretization + baseline TPM (MLE)
│   ├── institutional_regimes.py  # Algorithm 2: percentile-based FII/DII regime classification
│   ├── conditional_matrices.py   # Regime-conditioned TPM construction (Section 3.9)
│   ├── validation.py             # Algorithm 3: Top-2 Probabilistic Accuracy
│   └── monte_carlo_simulation.py # Algorithm 4: MCMC path simulation
├── examples/
│   └── demo.py                   # End-to-end pipeline on synthetic data — runs out of the box
├── requirements.txt
└── README.md
```

## Getting Started

```bash
git clone https://github.com/<your-username>/stock-market-markov-chain.git
cd stock-market-markov-chain
pip install -r requirements.txt
python examples/demo.py
```

The demo runs the full pipeline on synthetic data so it works with zero
setup. You'll see the baseline TPM, conditional TPMs by institutional
regime, Top-2 accuracy on a held-out split, and a simulated 30-day path.

### Reproducing with real data

Swap `generate_synthetic_data()` in `examples/demo.py` for a loader that
returns:
- `returns`: daily log returns of the Nifty 50 close price
- `flows`: daily net FII or DII flow (Rs. crore)

Original data sources: NSE (National Stock Exchange of India) and SEBI
(Securities and Exchange Board of India), April 2018 – October 2024
(1,612 trading days). Redistribution terms depend on how you source this
data — check before publishing raw data files publicly.

## Tech Stack

- Python 3
- NumPy (percentile calculations, argsort for Top-2 accuracy)

## Limitations

- A first-order Markov assumption (state transitions depend only on the
  current state) is a simplification — see the dissertation's Limitations
  section (6.5) for discussion of ergodicity assumptions and threshold
  sensitivity.
- Findings are specific to the Nifty 50 index over the studied window and
  are not a trading recommendation.

## Future Work

- Continuous-Time Markov Chains (CTMC)
- Hidden Markov Models (HMM) for latent regime detection
- Second/third-order Markov processes
- Multi-dimensional state space with ML-based classification

## Author

**Piyush Mittal** — B.Sc. (Hons) Mathematics, Shyam Lal College, University
of Delhi. Supervised by Dr. Virender, Department of Mathematics.

## License

MIT — see [LICENSE](LICENSE).
