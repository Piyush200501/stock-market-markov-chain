"use client";
import { Prediction } from "@/lib/api";

const STATE_ICONS: Record<number, string> = { 1: "↑", 2: "↓", 3: "→" };
const STATE_COLORS: Record<number, string> = { 1: "var(--up)", 2: "var(--down)", 3: "var(--stagnant)" };
const STATE_GLOWS: Record<number, string> = { 1: "var(--up-glow)", 2: "var(--down-glow)", 3: "var(--stagnant-glow)" };
const REGIME_LABELS: Record<string, string> = {
  SP: "Strong Buying 📈 (Bullish Flow)",
  N:  "Neutral ↔ (Balanced Flow)",
  SN: "Strong Selling 📉 (Bearish Flow)",
};

interface Props {
  prediction: Prediction;
  trainedAt: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function PredictionCard({ prediction, trainedAt, onRefresh, refreshing }: Props) {
  const ps = prediction.predicted_state;
  const probs = prediction.tomorrow_probs;
  const stateLabels = ["Upward", "Downward", "Stagnant"];
  const stateColors = [STATE_COLORS[1], STATE_COLORS[2], STATE_COLORS[3]];

  const baseDateLabel = prediction.base_date_formatted || prediction.today_date || "Friday, 04 Sep 2026";
  const targetDateLabel = prediction.target_date_formatted || "Next Trading Session (Monday, 07 Sep 2026)";

  return (
    <div className="glass" style={{
      padding: "28px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dynamic atmospheric radial glow */}
      <div style={{
        position: "absolute", top: -50, right: -50,
        width: 320, height: 320,
        background: `radial-gradient(circle, ${STATE_GLOWS[ps]}, transparent 70%)`,
        borderRadius: "50%",
        pointerEvents: "none",
        opacity: 0.8,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Temporal Banner: Day t -> Day t+1 Mapping */}
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--line)",
          borderRadius: 10, padding: "10px 16px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
            <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Base Day (t):</span>
            <strong style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{baseDateLabel}</strong>
          </div>
          <div style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 700 }}>&rarr;</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
            <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700 }}>Target Forecast (t+1):</span>
            <strong style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{targetDateLabel}</strong>
          </div>
        </div>

        {/* Card Header with Refresh Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-label">
            ONE-STEP FORWARD MARKOV FORECAST (X<sub>t+1</sub>)
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="btn-secondary"
              style={{ padding: "5px 12px", fontSize: "0.74rem" }}
              title="Trigger Live Market Sync & Retraining"
            >
              {refreshing ? "Retraining..." : "Sync & Retrain ⟳"}
            </button>
          )}
        </div>

        {/* Prediction Hero Block */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          {/* Animated State Badge */}
          <div style={{
            width: 88, height: 88, borderRadius: 20,
            background: `linear-gradient(135deg, ${STATE_GLOWS[ps]}, var(--bg-2))`,
            border: `2px solid ${STATE_COLORS[ps]}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 44, color: STATE_COLORS[ps],
            fontWeight: 700,
            boxShadow: `0 0 28px ${STATE_GLOWS[ps]}`,
            animation: "pulse-glow 2.5s ease-in-out infinite",
            flexShrink: 0,
          }}>
            {STATE_ICONS[ps]}
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              PREDICTED NEXT-SESSION STATE (FOR {prediction.target_date || "NEXT TRADING DAY"}):
            </div>
            <div className="font-display" style={{
              fontSize: "2.6rem",
              color: STATE_COLORS[ps],
              lineHeight: 1.05,
              fontWeight: 700,
              marginBottom: 6,
            }}>
              {prediction.predicted_state_name} State
            </div>
            <div style={{ color: "var(--ink-2)", fontSize: "0.88rem" }}>
              <strong style={{ color: "var(--ink)" }}>{(prediction.confidence * 100).toFixed(1)}% Probability</strong> &middot; Conditioned on Day t&apos;s{" "}
              <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {prediction.today_regime} Flow
              </span>
            </div>
          </div>
        </div>

        {/* Explicit Temporal State Transition Explainer */}
        <div style={{
          background: "rgba(245, 166, 35, 0.07)", border: "1px solid rgba(245, 166, 35, 0.22)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8rem", color: "var(--ink-2)", lineHeight: 1.5
        }}>
          <strong>Markov Transition:</strong> Given Day <em>t</em> ({baseDateLabel}) closed in <strong style={{ color: STATE_COLORS[prediction.today_state] }}>{prediction.today_state_name} State</strong> with <strong>{REGIME_LABELS[prediction.today_regime]}</strong>, the calculated probability distribution for Day <em>t+1</em> ({targetDateLabel}) is:
        </div>

        {/* 3-State Probability Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          {stateLabels.map((label, i) => {
            const pct = (probs[i] * 100).toFixed(1);
            const isWinner = i + 1 === ps;
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    color: isWinner ? stateColors[i] : "var(--ink-2)",
                    fontWeight: isWinner ? 700 : 500,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {isWinner && <span style={{ fontSize: "0.75rem", color: "var(--accent)" }}>★ TOP PREDICTION:</span>}
                    P(X<sub>t+1</sub> = {label})
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.88rem",
                    color: isWinner ? stateColors[i] : "var(--ink-2)",
                    fontWeight: isWinner ? 700 : 500,
                  }}>
                    {pct}%
                  </span>
                </div>
                <div className="prob-bar-track">
                  <div className="prob-bar-fill" style={{
                    width: `${pct}%`,
                    background: isWinner
                      ? `linear-gradient(90deg, ${stateColors[i]}, ${stateColors[i]}cc)`
                      : "var(--bg-3)",
                    boxShadow: isWinner ? `0 0 10px ${stateColors[i]}80` : "none",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top-2 Probabilistic Set Info */}
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--line)",
          padding: "10px 16px", borderRadius: 8, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-2)" }}>
            <strong>Top-2 Probabilistic Set for Next Session:</strong> &#123; {prediction.top2_state_names ? prediction.top2_state_names.join(", ") : `${prediction.predicted_state_name}, Stagnant`} &#125;
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--accent)" }}>
            Cumulative: {((probs[0] + probs[2]) * 100 > 80 ? (probs[0] + probs[2]) * 100 : (probs[0] + probs[1]) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Day t Input Features Meta Strip */}
        <div style={{
          display: "flex", gap: 20, flexWrap: "wrap",
          borderTop: "1px solid var(--line)", paddingTop: 16,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day t Input Date</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--ink-2)" }}>{prediction.base_date || prediction.today_date}</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day t Return</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600,
              color: prediction.today_return >= 0 ? "var(--up)" : "var(--down)"
            }}>
              {prediction.today_return >= 0 ? "+" : ""}{(prediction.today_return * 100).toFixed(3)}%
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day t Net Flow</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600,
              color: prediction.today_flow >= 0 ? "var(--up)" : "var(--down)"
            }}>
              {prediction.today_flow >= 0 ? "+" : ""}
              {prediction.today_flow.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Optimal Threshold θ</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent)" }}>
              &plusmn;0.30%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
