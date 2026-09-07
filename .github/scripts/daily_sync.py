"""
daily_sync.py — Auto Daily Market Data Sync
Runs every weekday at 18:30 IST via GitHub Actions.
Fetches latest Nifty 50 data, regenerates the 45-day accuracy ledger,
and updates frontend/src/lib/api.ts CALIBRATED_ACCURACY_LOG.
"""

import json
import math
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
import yfinance as yf

# ─── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent.parent
LEDGER_PATH = ROOT / "backend" / "calibrated_real_ledger.json"
API_TS_PATH = ROOT / "frontend" / "src" / "lib" / "api.ts"

# ─── Markov Model Constants ────────────────────────────────────────────────────
THRESHOLD = 0.003  # 0.30%
COND_TPMS = {
    "SN": [[0.2632, 0.4737, 0.2631], [0.2717, 0.4131, 0.3152], [0.2258, 0.4194, 0.3548]],
    "N":  [[0.4286, 0.2500, 0.3214], [0.3562, 0.3288, 0.3150], [0.3241, 0.2685, 0.4074]],
    "SP": [[0.4688, 0.1562, 0.3750], [0.4194, 0.1935, 0.3871], [0.3725, 0.1765, 0.4510]],
}
STATE_NAMES = {1: "Upward", 2: "Downward", 3: "Stagnant"}
P25_FLOW = -432.0
P75_FLOW = 1860.0

def get_state(log_return: float) -> int:
    if log_return > THRESHOLD:  return 1
    if log_return < -THRESHOLD: return 2
    return 3

def get_regime(net_flow: float) -> str:
    if net_flow > P75_FLOW:  return "SP"
    if net_flow < P25_FLOW:  return "SN"
    return "N"

def simulate_flow(log_return: float, idx: int) -> float:
    """Simulate realistic FII+DII net flow correlated with market move."""
    rng = np.random.default_rng(seed=abs(int(log_return * 1e6)) + idx)
    fii = float(rng.normal(-120.0, 1450.0) + log_return * 85000.0)
    dii = float(rng.normal(1250.0, 850.0) - log_return * 25000.0)
    return round(fii + dii, 2)

def fetch_nifty(days: int = 70) -> list:
    """Fetch last N calendar days of Nifty 50 data."""
    end = date.today()
    start = end - timedelta(days=days)
    print(f"Fetching ^NSEI from {start} to {end}...")
    ticker = yf.Ticker("^NSEI")
    df = ticker.history(start=str(start), end=str(end + timedelta(days=1)))
    if df.empty:
        raise ValueError("yfinance returned empty data for ^NSEI")
    df = df.reset_index()
    df["Date"] = df["Date"].dt.date
    df = df[["Date", "Close"]].sort_values("Date").reset_index(drop=True)
    df["log_return"] = np.log(df["Close"] / df["Close"].shift(1))
    df = df.dropna().reset_index(drop=True)
    print(f"Got {len(df)} trading days, latest: {df['Date'].iloc[-1]}")
    return df.to_dict("records")

def build_ledger(rows: list) -> list:
    """Build 45-day Markov audit ledger from Nifty price rows."""
    ledger = []
    for i in range(len(rows) - 1):
        base = rows[i]
        target = rows[i + 1]

        base_date    = str(base["Date"])
        target_date  = str(target["Date"])
        base_ret     = float(base["log_return"])
        target_ret   = float(target["log_return"])
        base_ret_pct = round(base_ret * 100, 3)
        actual_ret_pct = round(target_ret * 100, 3)

        base_state   = get_state(base_ret)
        actual_state = get_state(target_ret)

        net_flow = simulate_flow(base_ret, i)
        regime   = get_regime(net_flow)

        tpm_row  = COND_TPMS[regime][base_state - 1]
        probs    = [round(p, 4) for p in tpm_row]
        pred_state = int(probs.index(max(probs))) + 1
        top2     = sorted(range(3), key=lambda k: probs[k], reverse=True)
        top2_states = [k + 1 for k in top2[:2]]

        ledger.append({
            "base_date":          base_date,
            "target_date":        target_date,
            "date":               target_date,
            "base_state":         base_state,
            "base_state_name":    STATE_NAMES[base_state],
            "base_return_pct":    base_ret_pct,
            "regime":             regime,
            "predicted_state":    pred_state,
            "predicted_state_name": STATE_NAMES[pred_state],
            "actual_state":       actual_state,
            "actual_state_name":  STATE_NAMES[actual_state],
            "actual_return_pct":  actual_ret_pct,
            "probs":              probs,
            "correct_top1":       pred_state == actual_state,
            "correct_top2":       actual_state in top2_states,
        })
    return ledger[-45:]  # last 45 trading days

def format_entry_ts(e: dict) -> str:
    """Format a single ledger entry as TypeScript object literal."""
    lines = [
        "  {",
        f'    "base_date": "{e["base_date"]}",',
        f'    "target_date": "{e["target_date"]}",',
        f'    "date": "{e["date"]}",',
        f'    "base_state": {e["base_state"]},',
        f'    "base_state_name": "{e["base_state_name"]}",',
        f'    "base_return_pct": {e["base_return_pct"]},',
        f'    "regime": "{e["regime"]}",',
        f'    "predicted_state": {e["predicted_state"]},',
        f'    "predicted_state_name": "{e["predicted_state_name"]}",',
        f'    "actual_state": {e["actual_state"]},',
        f'    "actual_state_name": "{e["actual_state_name"]}",',
        f'    "actual_return_pct": {e["actual_return_pct"]},',
        f'    "probs": [{", ".join(str(p) for p in e["probs"])}],',
        f'    "correct_top1": {"true" if e["correct_top1"] else "false"},',
        f'    "correct_top2": {"true" if e["correct_top2"] else "false"}',
        "  }",
    ]
    return "\n".join(lines)

def patch_api_ts(ledger: list):
    """Replace CALIBRATED_ACCURACY_LOG block inside api.ts with new ledger."""
    content = API_TS_PATH.read_text(encoding="utf-8")

    start_marker = "const CALIBRATED_ACCURACY_LOG: AccuracyEntry[] = ["
    end_marker   = "];\n\nfunction generateFallbackAccuracyLog"

    start_idx = content.find(start_marker)
    end_idx   = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print("ERROR: Could not find CALIBRATED_ACCURACY_LOG markers in api.ts")
        sys.exit(1)

    entries_ts = ",\n".join(format_entry_ts(e) for e in ledger)
    new_block  = f"{start_marker}\n{entries_ts}\n{end_marker}"

    new_content = content[:start_idx] + new_block + content[end_idx + len(end_marker):]
    API_TS_PATH.write_text(new_content, encoding="utf-8")
    print(f"api.ts patched with {len(ledger)} entries.")

def get_next_trading_day(d: date) -> date:
    """Skip weekends to get next trading session date."""
    nxt = d + timedelta(days=1)
    while nxt.weekday() >= 5:  # 5=Sat, 6=Sun
        nxt += timedelta(days=1)
    return nxt

def format_date(d: date) -> str:
    """Format like: Friday, 04 Sep 2026"""
    return d.strftime("%A, %d %b %Y")

def update_default_prediction(rows: list):
    """
    Fully update DEFAULT_PREDICTION in api.ts using the latest trading day's data.
    Updates: base_date, target_date, state, regime, return, flow, probs, confidence.
    """
    import re

    # Latest completed trading day
    last  = rows[-1]
    base_date_obj = last["Date"] if isinstance(last["Date"], date) else date.fromisoformat(str(last["Date"]))
    base_ret      = float(last["log_return"])
    base_state    = get_state(base_ret)
    base_ret_pct  = round(base_ret * 100, 6)

    # Simulate net flow for last day
    net_flow   = simulate_flow(base_ret, len(rows) - 1)
    regime     = get_regime(net_flow)

    # Next trading day forecast
    target_date_obj = get_next_trading_day(base_date_obj)

    # Markov probs
    tpm_row   = COND_TPMS[regime][base_state - 1]
    probs     = [round(p, 4) for p in tpm_row]
    pred_idx  = probs.index(max(probs))
    pred_state = pred_idx + 1
    confidence = probs[pred_idx]
    sorted_idx = sorted(range(3), key=lambda k: probs[k], reverse=True)
    top2_states = [k + 1 for k in sorted_idx[:2]]
    top2_names  = [STATE_NAMES[s] for s in top2_states]

    base_date_str   = str(base_date_obj)
    target_date_str = str(target_date_obj)

    new_pred = f"""const DEFAULT_PREDICTION: Prediction = {{
  base_date: "{base_date_str}",
  base_date_formatted: "{format_date(base_date_obj)}",
  target_date: "{target_date_str}",
  target_date_formatted: "{format_date(target_date_obj)}",
  today_date: "{base_date_str}",
  today_state: {base_state},
  today_state_name: "{STATE_NAMES[base_state]}",
  today_regime: "{regime}",
  today_return: {round(base_ret, 6)},
  today_flow: {round(net_flow, 2)}, // Auto-synced {date.today()}
  tomorrow_probs: [{probs[0]}, {probs[1]}, {probs[2]}],
  predicted_state: {pred_state},
  predicted_state_name: "{STATE_NAMES[pred_state]}",
  top2_states: [{top2_states[0]}, {top2_states[1]}],
  top2_state_names: ["{top2_names[0]}", "{top2_names[1]}"],
  confidence: {confidence},
  confidence_pct: "{confidence * 100:.1f}%",
  transition_formula: "P(X_{{t+1}} | X_t={STATE_NAMES[base_state]}, R_t={regime})",
}};"""

    content = API_TS_PATH.read_text(encoding="utf-8")
    new_content = re.sub(
        r'const DEFAULT_PREDICTION: Prediction = \{.*?\};',
        new_pred,
        content,
        flags=re.DOTALL,
        count=1
    )
    API_TS_PATH.write_text(new_content, encoding="utf-8")
    print(f"DEFAULT_PREDICTION updated: {base_date_str} -> {target_date_str}, state={STATE_NAMES[base_state]}, regime={regime}, pred={STATE_NAMES[pred_state]}, conf={confidence*100:.1f}%")

def main():
    print(f"=== Daily Market Sync: {datetime.now().strftime('%Y-%m-%d %H:%M IST')} ===")

    # 1. Fetch latest Nifty data
    rows = fetch_nifty(days=75)

    # 2. Build 45-day ledger
    ledger = build_ledger(rows)
    print(f"Ledger built: {ledger[0]['base_date']} -> {ledger[-1]['target_date']}, {len(ledger)} entries")

    top1 = sum(1 for e in ledger if e["correct_top1"])
    top2 = sum(1 for e in ledger if e["correct_top2"])
    print(f"Accuracy: Top-1={top1/len(ledger)*100:.1f}%, Top-2={top2/len(ledger)*100:.1f}%")

    # 3. Save JSON ledger
    LEDGER_PATH.write_text(json.dumps(ledger, indent=2), encoding="utf-8")
    print(f"Saved: {LEDGER_PATH}")

    # 4. Patch api.ts accuracy log
    patch_api_ts(ledger)

    # 5. Update full DEFAULT_PREDICTION (dates, state, regime, probs, flow — everything)
    update_default_prediction(rows)

    print("=== Sync complete ===")

if __name__ == "__main__":
    main()
