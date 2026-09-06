"""
main.py — FastAPI backend for MarketMind Nifty 50 Markov Chain engine.
"""

import logging
import os
import random
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from cache import (
    compute_accuracy_stats,
    is_cache_fresh,
    load_accuracy_log,
    load_model_result,
    save_model_result,
)
from data_fetcher import fetch_combined_data, fetch_latest_nifty
from model_trainer import train_model
from scheduler import create_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Startup lifespan: initialize & train model if needed ────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: ensure model cache exists and is fresh
    if not is_cache_fresh():
        logger.info("Cache is stale or uninitialized — initiating startup training...")
        try:
            df = fetch_combined_data(days=2600)
            result = train_model(df)
            save_model_result(result)
            logger.info("Startup training complete successfully.")
        except Exception as e:
            logger.error(f"Startup training failed: {e}")
    else:
        logger.info("Cache is fresh, startup training skipped.")

    # Start the automated daily retraining scheduler
    try:
        scheduler = create_scheduler()
        scheduler.start()
        logger.info("Daily retrain scheduler active (18:30 IST on trading days)")
    except Exception as e:
        logger.warning(f"Scheduler could not be started: {e}")

    yield

    try:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shut down.")
    except Exception:
        pass


# ─── FastAPI app setup ────────────────────────────────────────────────────────

app = FastAPI(
    title="MarketMind API — Nifty 50 Markov Chain Engine",
    description="Discrete-time Markov chain predictions & FII/DII institutional regime dynamics",
    version="2.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_model_or_fallback() -> dict:
    """Load model result or train on the fly if missing."""
    result = load_model_result()
    if not result:
        logger.info("Model result not cached. Generating baseline on the fly...")
        df = fetch_combined_data(days=365)
        result = train_model(df)
        save_model_result(result)
    return result


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    cached = load_model_result()
    return {
        "status": "ok",
        "cache_fresh": is_cache_fresh(),
        "last_trained": cached["meta"]["trained_at"] if cached else None,
        "n_days": cached["meta"]["n_days"] if cached else None,
        "market": "NSE (Nifty 50)",
    }


@app.get("/api/predict")
def predict():
    """
    Returns tomorrow's predicted market state with transition probabilities,
    regime conditioning, and current market metadata.
    """
    result = get_model_or_fallback()
    return {
        "prediction": result["prediction"],
        "meta": result["meta"],
        "steady_state": result["steady_state"],
    }


@app.get("/api/nifty")
def nifty(days: int = Query(60, ge=5, le=730)):
    """Nifty 50 OHLCV price series for charting."""
    result = get_model_or_fallback()
    series = result.get("price_series", [])
    return {"data": series[-days:], "meta": result["meta"]}


@app.get("/api/fiidii")
def fiidii(days: int = Query(60, ge=5, le=730)):
    """FII & DII institutional net flow series."""
    result = get_model_or_fallback()
    series = result.get("flow_series", [])
    return {
        "data": series[-days:],
        "p25_flow": result["meta"]["p25_flow"],
        "p75_flow": result["meta"]["p75_flow"],
        "meta": result["meta"],
    }


@app.get("/api/ctpm")
def ctpm():
    """
    Returns the unconditional baseline TPM and regime-conditioned TPMs (SN, N, SP),
    state distributions, and sensitivity sweeps.
    """
    result = get_model_or_fallback()
    return {
        "baseline_tpm": result["baseline_tpm"],
        "conditional_tpms": result["conditional_tpms"],
        "state_distribution": result["state_distribution"],
        "threshold_sweep": result["threshold_sweep"],
        "regime_counts": result["regime_counts"],
        "sojourn_times": result.get("sojourn_times", {}),
        "chapman_kolmogorov": result.get("chapman_kolmogorov", {}),
        "meta": result["meta"],
    }


@app.get("/api/stats")
def stats():
    """Steady-state distributions, MFPT matrix, and analytical stats."""
    result = get_model_or_fallback()
    return {
        "steady_state": result["steady_state"],
        "mfpt": result["mfpt"],
        "sojourn_times": result.get("sojourn_times", {}),
        "state_distribution": result["state_distribution"],
        "meta": result["meta"],
    }


class SimRequest(BaseModel):
    regime: str = "baseline"  # "baseline" | "SN" | "N" | "SP"
    days: int = 30
    runs: int = 10
    start_state: int = 1  # 1=Up, 2=Down, 3=Stagnant


@app.post("/api/simulate")
def simulate(req: SimRequest):
    """Run Monte Carlo simulation across multiple paths."""
    if req.days < 1 or req.days > 365:
        raise HTTPException(status_code=400, detail="days must be between 1 and 365")
    if req.runs < 1 or req.runs > 50:
        raise HTTPException(status_code=400, detail="runs must be between 1 and 50")
    if req.start_state not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="start_state must be 1 (Up), 2 (Down), or 3 (Stagnant)")

    result = get_model_or_fallback()

    if req.regime == "baseline":
        P = result["baseline_tpm"]
    elif req.regime in result["conditional_tpms"]:
        P = result["conditional_tpms"][req.regime]
    else:
        raise HTTPException(status_code=400, detail=f"Unknown regime: {req.regime}")

    # Empirical mean returns per state
    expected_returns = [0.00796, -0.00828, 0.00008]
    state_names = {1: "Upward", 2: "Downward", 3: "Stagnant"}

    all_runs = []
    rng = random.Random()

    for _ in range(req.runs):
        path = [req.start_state]
        for _d in range(req.days):
            probs = P[path[-1] - 1]
            r = rng.random()
            cum = 0.0
            next_state = path[-1]
            for j, p in enumerate(probs):
                cum += p
                if r <= cum:
                    next_state = j + 1
                    break
            path.append(next_state)

        # Cumulative return path
        cum_return = 0.0
        return_path = [0.0]
        for s in path[1:]:
            # add small stochastic variance around expected state return
            state_ret = expected_returns[s - 1] + rng.gauss(0, 0.002)
            cum_return += state_ret
            return_path.append(round(cum_return * 100, 3))

        up_days = path[1:].count(1)
        down_days = path[1:].count(2)
        stagnant_days = path[1:].count(3)

        all_runs.append({
            "state_path": path,
            "state_names": [state_names[s] for s in path],
            "cumulative_returns": return_path,
            "final_cumulative_return": return_path[-1],
            "up_days": up_days,
            "down_days": down_days,
            "stagnant_days": stagnant_days,
        })

    # Summary statistics across runs
    final_returns = [r["final_cumulative_return"] for r in all_runs]
    mean_return = round(float(np.mean(final_returns)), 2)
    win_rate = round(float(sum(1 for r in final_returns if r > 0) / len(final_returns) * 100), 1)

    return {
        "regime": req.regime,
        "days": req.days,
        "start_state": req.start_state,
        "runs": all_runs,
        "matrix_used": P,
        "stats": {
            "mean_final_return_pct": mean_return,
            "win_rate_pct": win_rate,
            "max_return_pct": round(float(np.max(final_returns)), 2),
            "min_return_pct": round(float(np.min(final_returns)), 2),
        }
    }


@app.get("/api/accuracy")
def accuracy():
    """Returns the historical prediction vs actual outcome audit log and KPI statistics."""
    log = load_accuracy_log()
    stats_summary = compute_accuracy_stats(log)
    return {
        "log": log[-90:],  # Last 90 trading days
        "stats": stats_summary,
    }


@app.get("/api/horizons")
def horizons():
    """
    Returns comparative Markov Chain analysis across the 3 empirical time horizons:
      - 6.5 Years (1,612 Trading Days: April 2018 – October 2024 / Full Macro Cycle)
      - 5.0 Years (1,235 Trading Days: 5-Year Structural Cycle & SIP Acceleration)
      - 2.5 Years (687 Trading Days: November 2022 – September 2026 High-Liquidity Replication)
    """
    result = get_model_or_fallback()
    return {
        "horizons": result.get("horizons", {}),
        "meta": result.get("meta", {}),
    }


@app.post("/api/retrain")
def retrain():
    """Forces an immediate data refresh and model retraining."""
    try:
        logger.info("Manual retrain triggered via /api/retrain")
        df = fetch_combined_data(days=2600)
        result = train_model(df)
        save_model_result(result)
        return {
            "status": "ok",
            "trained_at": result["meta"]["trained_at"],
            "n_days": result["meta"]["n_days"],
            "prediction": result["prediction"],
        }
    except Exception as e:
        logger.error(f"Manual retrain failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
