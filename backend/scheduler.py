"""
scheduler.py — APScheduler daily retrain job.
Runs at 18:30 IST (13:00 UTC) on weekdays — 30 min after NSE market close.
"""

import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from cache import append_accuracy_entry, load_model_result, save_model_result
from data_fetcher import fetch_combined_data
from model_trainer import OPTIMAL_THRESHOLD, discretize_returns, train_model

logger = logging.getLogger(__name__)


def retrain_job():
    """
    Full daily retrain job:
      1. Audit previous prediction vs today's actual close and update accuracy log
      2. Fetch fresh market price & flow data
      3. Retrain Markov Chain model
      4. Save fresh model result and tomorrow's prediction to cache
    """
    logger.info(f"[Scheduler] Starting daily market sync & retrain at {datetime.now().isoformat()} IST")
    try:
        # 1. Update prediction vs actual evaluation ledger
        _update_accuracy_log()

        # 2. Fetch fresh market dataset
        df = fetch_combined_data(days=2600)

        # 3. Train Markov Chain model
        result = train_model(df)

        # 4. Save to persistent cache
        save_model_result(result)

        logger.info(
            f"[Scheduler] Retrain complete successfully. "
            f"Tomorrow's Predicted State: {result['prediction']['predicted_state_name']} "
            f"({result['prediction']['confidence']*100:.1f}% confidence)"
        )
    except Exception as e:
        logger.error(f"[Scheduler] Retrain job error: {e}", exc_info=True)


def _update_accuracy_log():
    """
    Evaluates the actual outcome of yesterday's prediction once today's data is available.
    """
    try:
        old_result = load_model_result()
        if not old_result:
            return

        pred = old_result.get("prediction", {})
        predicted_state = pred.get("predicted_state")
        prediction_date = pred.get("today_date")
        probs = pred.get("tomorrow_probs", [])

        if not predicted_state or not prediction_date:
            return

        # Fetch latest data
        df = fetch_combined_data(days=10)
        if df.empty:
            return

        states_series = df.sort_values("date")
        dates = [str(d) for d in states_series["date"].tolist()]

        if prediction_date not in dates:
            return

        pred_idx = dates.index(prediction_date)
        if pred_idx + 1 >= len(dates):
            return  # Market hasn't closed for next trading day yet

        actual_return = float(states_series["log_return"].iloc[pred_idx + 1])
        actual_states = discretize_returns([actual_return], OPTIMAL_THRESHOLD)
        actual_state = actual_states[0]
        actual_date = dates[pred_idx + 1]

        state_names = {1: "Upward", 2: "Downward", 3: "Stagnant"}
        correct_top1 = (predicted_state == actual_state)
        sorted_by_prob = sorted(range(3), key=lambda i: probs[i], reverse=True)
        top2_states = [s + 1 for s in sorted_by_prob[:2]]
        correct_top2 = (actual_state in top2_states)

        entry = {
            "base_date": prediction_date,
            "target_date": actual_date,
            "date": actual_date,
            "base_state": pred.get("today_state"),
            "base_state_name": pred.get("today_state_name", "Observed"),
            "predicted_state": predicted_state,
            "predicted_state_name": state_names.get(predicted_state, "Unknown"),
            "actual_state": actual_state,
            "actual_state_name": state_names.get(actual_state, "Unknown"),
            "actual_return_pct": round(actual_return * 100, 3),
            "probs": probs,
            "regime": pred.get("today_regime", "N"),
            "correct_top1": correct_top1,
            "correct_top2": correct_top2,
        }
        append_accuracy_entry(entry)
        logger.info(
            f"[Scheduler] Prediction audited for {actual_date}: "
            f"predicted={predicted_state}, actual={actual_state}, "
            f"top1={'✓' if correct_top1 else '✗'}, top2={'✓' if correct_top2 else '✗'}"
        )
    except Exception as e:
        logger.error(f"[Scheduler] Accuracy log update failed: {e}")


def create_scheduler() -> BackgroundScheduler:
    """Create and configure the APScheduler background runner."""
    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(
        retrain_job,
        trigger=CronTrigger(
            day_of_week="mon-fri",
            hour=18,
            minute=30,
            timezone="Asia/Kolkata",
        ),
        id="daily_retrain",
        name="Daily Markov Chain Retrain",
        replace_existing=True,
    )
    return scheduler
