"use client";

import React, { useEffect } from "react";

export interface DerivationData {
  base_date: string;
  base_date_formatted?: string;
  target_date: string;
  target_date_formatted?: string;
  base_state: number;
  base_state_name: string;
  base_return_pct?: number;
  base_flow?: number;
  regime: string;
  probs: number[];
  predicted_state: number;
  predicted_state_name: string;
  top2_states?: number[];
  top2_state_names?: string[];
  actual_state?: number;
  actual_state_name?: string;
  actual_return_pct?: number;
  correct_top1?: boolean;
  correct_top2?: boolean;
  is_live_forward?: boolean;
}

const STATE_NAMES: Record<number, string> = { 1: "Upward", 2: "Downward", 3: "Stagnant" };
const STATE_COLORS: Record<number, string> = {
  1: "var(--up)",
  2: "var(--down)",
  3: "var(--stagnant)",
};
const STATE_ICONS: Record<number, string> = { 1: "↑", 2: "↓", 3: "→" };

const REGIME_DESCRIPTIONS: Record<string, { label: string; desc: string; color: string }> = {
  SP: {
    label: "Strong Buying (SP)",
    desc: "Net institutional inflow exceeds the 75th percentile (+1,860 Cr). High liquidity compresses bear persistence and elevates next-day continuation.",
    color: "var(--up)",
  },
  N: {
    label: "Neutral Flow (N)",
    desc: "Net institutional flow is in balanced range [-432 Cr to +1,860 Cr]. Dynamics are governed by mean-reverting baseline transitions.",
    color: "var(--ink-2)",
  },
  SN: {
    label: "Strong Selling (SN)",
    desc: "Net institutional outflow exceeds the 25th percentile (-432 Cr). Heightened selling pressure inflates downward persistence.",
    color: "var(--down)",
  },
};

interface Props {
  data: DerivationData | null;
  onClose: () => void;
}

export default function DerivationModal({ data, onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!data) return null;

  const bState = data.base_state || (data.base_state_name === "Upward" ? 1 : data.base_state_name === "Downward" ? 2 : 3);
  const pState = data.predicted_state;
  const probs = data.probs && data.probs.length === 3 ? data.probs : [0.33, 0.33, 0.34];
  const regimeInfo = REGIME_DESCRIPTIONS[data.regime] || REGIME_DESCRIPTIONS["N"];

  // Sort probability indices
  const sortedIndices = [0, 1, 2].sort((a, b) => probs[b] - probs[a]);
  const top1Idx = sortedIndices[0];
  const top2Idx = sortedIndices[1];
  const top2ProbSum = ((probs[top1Idx] + probs[top2Idx]) * 100).toFixed(1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(6, 10, 18, 0.82)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 780,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 16,
          border: "1px solid var(--line-bright)",
          background: "linear-gradient(180deg, #111a2e 0%, #0a0f1d 100%)",
          padding: "28px 32px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 212, 170, 0.1)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span className="section-label">
                {data.is_live_forward ? "LIVE MARKOV DERIVATION BREAKDOWN" : "HISTORICAL AUDIT DERIVATION"}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: data.is_live_forward ? "rgba(0, 212, 170, 0.15)" : "rgba(245, 166, 35, 0.15)",
                  color: data.is_live_forward ? "var(--up)" : "var(--accent)",
                  border: `1px solid ${data.is_live_forward ? "var(--up)" : "var(--accent)"}`,
                }}
              >
                {data.is_live_forward ? "Forward Forecast (t+1)" : "Backtested Verification"}
              </span>
            </div>
            <h2 style={{ fontSize: "1.4rem", color: "var(--ink)", margin: 0 }}>
              How This Prediction Was Derived
            </h2>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-2)", marginTop: 4 }}>
              Transition: <strong style={{ color: "var(--ink)" }}>{data.base_date_formatted || data.base_date}</strong> &rarr;{" "}
              <strong style={{ color: "var(--accent)" }}>{data.target_date_formatted || data.target_date}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              width: 34,
              height: 34,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              transition: "all 0.15s",
            }}
            title="Close (Esc)"
          >
            &times;
          </button>
        </div>

        {/* Step-by-Step Mathematical Flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* STEP 1: Observation & Discretization */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                background: "var(--accent)", color: "#000", fontWeight: 800,
                width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
              }}>1</span>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>
                Observation Day <em>t</em> &amp; State Discretization (θ = &plusmn;0.30%)
              </h4>
            </div>

            <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", margin: "0 0 12px", lineHeight: 1.5 }}>
              The model observes the close-to-close log return on Day <em>t</em>:{" "}
              <code style={{ background: "var(--bg-3)", padding: "2px 6px", borderRadius: 4, color: "var(--accent)" }}>
                r_t = ln(P_t / P_{"{t-1}"})
              </code>
            </p>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12, marginBottom: 12, background: "var(--bg-3)", padding: 12, borderRadius: 8
            }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>OBSERVED RETURN (r_t)</div>
                <div style={{
                  fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)",
                  color: (data.base_return_pct ?? 0) >= 0 ? "var(--up)" : "var(--down)"
                }}>
                  {(data.base_return_pct ?? 0) >= 0 ? "+" : ""}{(data.base_return_pct ?? 0.102).toFixed(3)}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>OPTIMAL THRESHOLD (θ)</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                  &plusmn;0.300%
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>CLASSIFIED BASE STATE (X_t)</div>
                <div style={{
                  fontSize: "1.1rem", fontWeight: 700,
                  color: STATE_COLORS[bState], display: "flex", alignItems: "center", gap: 6
                }}>
                  <span>{STATE_ICONS[bState]}</span>
                  <span>{STATE_NAMES[bState]} (State {bState})</span>
                </div>
              </div>
            </div>

            {/* Threshold Discretization Ruler */}
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: 8, fontSize: "0.78rem", color: "var(--ink-2)" }}>
              <strong>Mathematical Partition Rule:</strong>
              <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ color: bState === 1 ? "var(--up)" : "var(--ink-3)", fontWeight: bState === 1 ? 700 : 400 }}>
                  &bull; State 1 (Upward) &nbsp; : r_t &gt; +0.30% {bState === 1 && "← MATCHED"}
                </span>
                <span style={{ color: bState === 2 ? "var(--down)" : "var(--ink-3)", fontWeight: bState === 2 ? 700 : 400 }}>
                  &bull; State 2 (Downward) : r_t &lt; -0.30% {bState === 2 && "← MATCHED"}
                </span>
                <span style={{ color: bState === 3 ? "var(--stagnant)" : "var(--ink-3)", fontWeight: bState === 3 ? 700 : 400 }}>
                  &bull; State 3 (Stagnant) : -0.30% &le; r_t &le; +0.30% {bState === 3 && "← MATCHED"}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: Institutional Flow Regime */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                background: "var(--accent)", color: "#000", fontWeight: 800,
                width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
              }}>2</span>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>
                Institutional Flow Regime Conditioning (R_t)
              </h4>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{
                padding: "4px 12px", borderRadius: 6, fontWeight: 700, fontFamily: "var(--font-mono)",
                background: "var(--bg-3)", color: regimeInfo.color, border: `1px solid ${regimeInfo.color}60`
              }}>
                Regime: {data.regime} &mdash; {regimeInfo.label}
              </span>
              {data.base_flow !== undefined && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--ink-2)" }}>
                  Net Flow: <strong>{data.base_flow >= 0 ? "+" : ""}{data.base_flow.toLocaleString()} Cr</strong>
                </span>
              )}
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
              {regimeInfo.desc}
            </p>
          </div>

          {/* STEP 3: Transition Probability Matrix Row Lookup */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                background: "var(--accent)", color: "#000", fontWeight: 800,
                width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
              }}>3</span>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>
                Markov Transition Vector: P(X_{"{t+1}"} | X_t = {STATE_NAMES[bState]}, R_t = {data.regime})
              </h4>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", margin: "0 0 12px", lineHeight: 1.5 }}>
              From the empirical {data.regime}-conditioned transition probability matrix, we extract row <strong>State {bState} ({STATE_NAMES[bState]})</strong>:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map((idx) => {
                const sId = idx + 1;
                const p = probs[idx];
                const pct = (p * 100).toFixed(1);
                const isTop1 = sId === pState;
                const isTop2 = sId === sortedIndices[0] + 1 || sId === sortedIndices[1] + 1;

                return (
                  <div
                    key={sId}
                    style={{
                      background: isTop1 ? "rgba(0, 212, 170, 0.08)" : "var(--bg-3)",
                      border: isTop1 ? `1px solid ${STATE_COLORS[sId]}` : "1px solid var(--line)",
                      borderRadius: 8, padding: "8px 14px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        color: STATE_COLORS[sId], fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.88rem"
                      }}>
                        {STATE_ICONS[sId]} P(X_{"{t+1}"} = {STATE_NAMES[sId]})
                      </span>
                      {isTop1 && (
                        <span style={{
                          fontSize: "0.68rem", background: "var(--accent)", color: "#000",
                          fontWeight: 700, padding: "1px 6px", borderRadius: 4
                        }}>
                          ★ TOP-1 PREDICTION
                        </span>
                      )}
                      {isTop2 && !isTop1 && (
                        <span style={{
                          fontSize: "0.68rem", background: "var(--bg-1)", color: "var(--ink-2)",
                          border: "1px solid var(--line)", padding: "1px 6px", borderRadius: 4
                        }}>
                          TOP-2 SET MEMBER
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 120, height: 6, background: "var(--bg-1)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: STATE_COLORS[sId] }} />
                      </div>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.92rem", fontWeight: 700,
                        color: isTop1 ? STATE_COLORS[sId] : "var(--ink)", minWidth: 50, textAlign: "right"
                      }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Decision Formulation & Probabilistic Set */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                background: "var(--accent)", color: "#000", fontWeight: 800,
                width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
              }}>4</span>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>
                Forecasting Decision Rule
              </h4>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12, marginBottom: 8
            }}>
              <div style={{ background: "var(--bg-3)", padding: "12px 16px", borderRadius: 8, borderLeft: `3px solid ${STATE_COLORS[pState]}` }}>
                <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Primary (Argmax) Forecast
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: STATE_COLORS[pState], margin: "2px 0" }}>
                  {STATE_NAMES[pState]} State
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-2)" }}>
                  Single highest transition probability: <strong>{((probs[pState - 1] || 0) * 100).toFixed(1)}%</strong>
                </div>
              </div>

              <div style={{ background: "var(--bg-3)", padding: "12px 16px", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  High-Confidence Top-2 Set
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent)", margin: "2px 0" }}>
                  &#123; {STATE_NAMES[sortedIndices[0] + 1]}, {STATE_NAMES[sortedIndices[1] + 1]} &#125;
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-2)" }}>
                  Combined coverage: <strong>{top2ProbSum}% Probability</strong>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: Realized Outcome & Validation (Only if historical audit) */}
          {!data.is_live_forward && data.actual_state && (
            <div style={{
              background: data.correct_top2 ? "rgba(0, 212, 170, 0.07)" : "rgba(255, 77, 109, 0.07)",
              border: `1px solid ${data.correct_top2 ? "var(--up)" : "var(--down)"}`,
              borderRadius: 12, padding: "16px 20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: data.correct_top2 ? "var(--up)" : "var(--down)", color: "#000", fontWeight: 800,
                    width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
                  }}>5</span>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>
                    Empirical Market Outcome on Day <em>t+1</em> ({data.target_date})
                  </h4>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: data.correct_top1 ? "rgba(0, 212, 170, 0.2)" : "rgba(255,255,255,0.06)",
                    color: data.correct_top1 ? "var(--up)" : "var(--ink-3)",
                    border: `1px solid ${data.correct_top1 ? "var(--up)" : "var(--line)"}`,
                  }}>
                    Top-1 Match: {data.correct_top1 ? "✓ EXACT" : "— DIFFERED"}
                  </span>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: data.correct_top2 ? "rgba(0, 212, 170, 0.2)" : "rgba(255, 77, 109, 0.2)",
                    color: data.correct_top2 ? "var(--up)" : "var(--down)",
                    border: `1px solid ${data.correct_top2 ? "var(--up)" : "var(--down)"}`,
                  }}>
                    Top-2 Hit: {data.correct_top2 ? "✓ VALID SET" : "✗ MISS"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "0.85rem", color: "var(--ink-2)" }}>
                <div>
                  Actual Realized Return: <strong style={{
                    fontFamily: "var(--font-mono)",
                    color: (data.actual_return_pct ?? 0) >= 0 ? "var(--up)" : "var(--down)"
                  }}>
                    {(data.actual_return_pct ?? 0) >= 0 ? "+" : ""}{(data.actual_return_pct ?? 0).toFixed(3)}%
                  </strong>
                </div>
                <div>
                  Actual State: <strong style={{ color: STATE_COLORS[data.actual_state] }}>
                    {STATE_ICONS[data.actual_state]} {data.actual_state_name || STATE_NAMES[data.actual_state]} (State {data.actual_state})
                  </strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: "8px 24px", fontSize: "0.85rem" }}
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
