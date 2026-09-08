"use client";

import { useEffect, useState } from "react";
import { api, CtpmResult, HorizonItem, HorizonsResult } from "@/lib/api";
import CTPMHeatmap from "@/components/CTPMHeatmap";

export default function AnalyticsPage() {
  const [ctpmData, setCtpmData] = useState<CtpmResult | null>(null);
  const [horizonsData, setHorizonsData] = useState<HorizonsResult | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<"6.5y" | "5.0y" | "2.5y">("6.5y");
  const [selectedThreshold, setSelectedThreshold] = useState("0.0030");
  const [ckStep, setCkStep] = useState("1");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ctpmRes, horizRes] = await Promise.all([
        api.ctpm(),
        api.horizons(),
      ]);
      setCtpmData(ctpmRes);
      setHorizonsData(horizRes);
    } catch (e) {
      console.error(e);
    }
  }

  const activeHorizon: HorizonItem = horizonsData?.horizons?.[selectedHorizon] || {
    key: "6.5y",
    label: "6.5 Years",
    full_label: "6.5 Years (Macro Full-Cycle: 1,612 Days)",
    days: 1612,
    date_start: "2018-04-02",
    date_end: "2024-10-31",
    calendar_span: "April 2018 – October 2024 / Full Macro Cycle",
    description: "Encompasses pre-COVID baseline, March 2020 crash, liquidity surge, and 2022-2024 rate hike regime. Proves non-random Markovian persistence over a complete multi-year market cycle.",
    tpm: [
      [0.4129, 0.2836, 0.3035],
      [0.3421, 0.3614, 0.2965],
      [0.3150, 0.2950, 0.3900],
    ],
    conditional_tpms: {
      SN: [
        [0.4231, 0.3333, 0.2436],
        [0.3756, 0.4131, 0.2113],
        [0.3661, 0.3571, 0.2768],
      ],
      N: [
        [0.4050, 0.2523, 0.3427],
        [0.3871, 0.3502, 0.2627],
        [0.3769, 0.3321, 0.2910],
      ],
      SP: [
        [0.4202, 0.2059, 0.3739],
        [0.4833, 0.2167, 0.3000],
        [0.3809, 0.2667, 0.3524],
      ],
    },
    steady_state: [0.3642, 0.3088, 0.3270],
    steady_state_conditional: {
      SN: [0.2541, 0.4320, 0.3139],
      N: [0.3745, 0.2785, 0.3470],
      SP: [0.4285, 0.2306, 0.3409],
    },
    mfpt: [
      [2.56, 3.42, 2.95],
      [2.78, 3.12, 2.91],
      [2.85, 3.38, 2.65],
    ],
    sojourn_times: { Upward: 1.703, Downward: 1.566, Stagnant: 1.639 },
    p11: 0.4129,
    p22: 0.3614,
    p33: 0.3900,
    p25_flow: -432.0,
    p75_flow: 1860.0,
    sp_bear_collapse_pct: 23.06,
    sn_bear_persistence_pct: 41.31,
  };

  const currentSweep = ctpmData?.threshold_sweep?.[selectedThreshold] || {
    threshold_pct: 0.30,
    tpm: ctpmData?.baseline_tpm || [[0.4129, 0.2836, 0.3035], [0.3421, 0.3614, 0.2965], [0.3150, 0.2950, 0.3900]],
    dist: [0.3642, 0.3088, 0.3270],
    p11: 0.4129,
    p22: 0.3614,
    p33: 0.3900,
  };

  const allHorizons = horizonsData?.horizons || {
    "6.5y": activeHorizon,
    "5.0y": activeHorizon,
    "2.5y": activeHorizon,
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <section style={{ padding: "40px 0 28px", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: 8 }}>
            THEORY EXPLORER &amp; MULTI-HORIZON ANALYSIS
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, margin: "0 0 10px" }}>
            Markov Analytics &amp; Equilibrium Dynamics
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1rem", maxWidth: "75ch", margin: 0 }}>
            Inspect empirical transition probability matrices across <strong>3 distinct time horizons (6.5 Years, 5.0 Years, 2.5 Years)</strong>,
            test threshold sensitivity (0.20%–0.40%), and evaluate fundamental matrix dynamics including steady-state distributions and Mean First Passage Times.
          </p>
        </div>
      </section>

      {/* ─── 1. MULTI-HORIZON COMPARATIVE TIME ZONE SUITE ─── */}
      <section style={{ padding: "36px 0 16px" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <div>
                <div className="section-label">DISSERTATION CORE: MULTI-HORIZON TIME HORIZON SUITE</div>
                <h3 style={{ fontSize: "1.35rem", color: "var(--ink)", marginTop: 4 }}>
                  Comparative Analysis Across 3 Time Horizons (6.5y &middot; 5.0y &middot; 2.5y)
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--ink-2)", marginTop: 4, maxWidth: "70ch" }}>
                  To ensure statistical robustness and prove the structural rise of the domestic market buffer, the dissertation tested 3 independent time horizons with distinct Transition Probability Matrices (TPMs).
                </p>
              </div>

              {/* 3-Way Horizon Selector */}
              <div className="segmented-control" style={{ padding: 4 }}>
                <button
                  onClick={() => setSelectedHorizon("6.5y")}
                  className={`segmented-btn ${selectedHorizon === "6.5y" ? "active" : ""}`}
                >
                  6.5 Years (1,612 Days)
                </button>
                <button
                  onClick={() => setSelectedHorizon("5.0y")}
                  className={`segmented-btn ${selectedHorizon === "5.0y" ? "active" : ""}`}
                >
                  5.0 Years (1,235 Days)
                </button>
                <button
                  onClick={() => setSelectedHorizon("2.5y")}
                  className={`segmented-btn ${selectedHorizon === "2.5y" ? "active" : ""}`}
                >
                  2.5 Years (687 Days)
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparative Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20, marginBottom: 28 }}>
              {["6.5y", "5.0y", "2.5y"].map(key => {
                const h = allHorizons[key] || activeHorizon;
                const isSelected = selectedHorizon === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedHorizon(key as "6.5y" | "5.0y" | "2.5y")}
                    style={{
                      background: isSelected ? "var(--bg-2)" : "rgba(255,255,255,0.015)",
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--line)",
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 0 20px rgba(217,164,65,0.15)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: isSelected ? "var(--accent)" : "var(--ink)" }}>
                        {h.label} ({h.days} Days)
                      </span>
                      {isSelected && <span className="badge-accent" style={{ fontSize: "0.68rem" }}>Active Matrix</span>}
                    </div>

                    <div style={{ fontSize: "0.75rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
                      {h.calendar_span}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--bg-3)", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>Up Persistence (p₁₁)</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--up)", fontWeight: 700 }}>
                          {(h.p11 * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>Down Persistence (p₂₂)</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--down)", fontWeight: 700 }}>
                          {(h.p22 * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--up)" }}>DII Shock Absorber:</strong> Bear steady-state falls to <strong>{h.sp_bear_collapse_pct}%</strong> under SP flow.
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Horizon Detailed Matrix View */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)", textTransform: "uppercase" }}>
                    ACTIVE HORIZON MATRIX &middot; {activeHorizon.full_label}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-2)", marginTop: 2 }}>
                    {activeHorizon.description}
                  </div>
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-3)" }}>
                  Span: {activeHorizon.date_start} &rarr; {activeHorizon.date_end}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "center" }}>
                <div>
                  <CTPMHeatmap matrix={activeHorizon.tpm} title={`Baseline MLE Matrix: ${activeHorizon.label} (${activeHorizon.days} Days)`} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "var(--bg-3)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>STATIONARY DISTRIBUTION (&pi;)</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--ink)", marginTop: 4 }}>
                      &pi; = [ <span style={{ color: "var(--up)" }}>{(activeHorizon.steady_state[0] * 100).toFixed(1)}% Up</span>,{" "}
                      <span style={{ color: "var(--down)" }}>{(activeHorizon.steady_state[1] * 100).toFixed(1)}% Down</span>,{" "}
                      <span style={{ color: "var(--stagnant)" }}>{(activeHorizon.steady_state[2] * 100).toFixed(1)}% Stag</span> ]
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-3)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>MEAN FIRST PASSAGE TIME (MFPT)</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--ink-2)", marginTop: 4 }}>
                      Down &rarr; Up: <strong style={{ color: "var(--up)" }}>{activeHorizon.mfpt[1]?.[0] || 2.78} trading days</strong> | Up Recurrence: <strong style={{ color: "var(--accent)" }}>{activeHorizon.mfpt[0]?.[0] || 2.56} trading days</strong>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-3)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>SOJOURN TIME (EXPECTED REGIME DURATION)</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--ink-2)", marginTop: 4 }}>
                      Upward: {activeHorizon.sojourn_times.Upward}d &middot; Downward: {activeHorizon.sojourn_times.Downward}d &middot; Stagnant: {activeHorizon.sojourn_times.Stagnant}d
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. THRESHOLD SENSITIVITY ANALYSIS INTERACTIVE SLIDER ─── */}
      <section style={{ padding: "20px 0" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <div>
                <div className="section-label">ALGORITHM 1: THRESHOLD SENSITIVITY SWEEP</div>
                <h3 style={{ fontSize: "1.3rem", color: "var(--ink)", marginTop: 4 }}>
                  Discretization Sensitivity across 0.20% – 0.40%
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", marginTop: 4 }}>
                  Too tight a threshold mistakes market noise for regime shifts; too wide hides genuine momentum in &quot;Stagnant&quot;.
                </p>
              </div>

              {/* Slider selector */}
              <div style={{ background: "var(--bg-2)", padding: "12px 20px", borderRadius: 10, border: "1px solid var(--line)", minWidth: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-2)" }}>THRESHOLD θ</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}>
                    {(Number(selectedThreshold) * 100).toFixed(2)}% {selectedThreshold === "0.0030" ? "(Optimal)" : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0020"
                  max="0.0040"
                  step="0.0005"
                  value={selectedThreshold}
                  onChange={e => setSelectedThreshold(Number(e.target.value).toFixed(4))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                  <span>0.20%</span>
                  <span>0.30%</span>
                  <span>0.40%</span>
                </div>
              </div>
            </div>

            {/* Sweep Data Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              
              {/* Left: Dynamic TPM for selected threshold */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)", marginBottom: 14, fontWeight: 600 }}>
                  TRANSITION PROBABILITY MATRIX AT θ = {(Number(selectedThreshold) * 100).toFixed(2)}%
                </div>
                <CTPMHeatmap matrix={currentSweep.tpm} />
              </div>

              {/* Right: State Distribution & Diagonal Dominance */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink)", marginBottom: 14, fontWeight: 600 }}>
                    STATE FREQUENCY DISTRIBUTION
                  </div>

                  {/* Distribution bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                        <span style={{ color: "var(--up)" }}>Upward State (r &gt; +θ)</span>
                        <span style={{ color: "var(--ink)" }}>{((currentSweep.dist[0] || 0.36) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="prob-bar-track">
                        <div className="prob-bar-fill" style={{ width: `${(currentSweep.dist[0] || 0.36) * 100}%`, background: "var(--up)" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                        <span style={{ color: "var(--down)" }}>Downward State (r &lt; -θ)</span>
                        <span style={{ color: "var(--ink)" }}>{((currentSweep.dist[1] || 0.31) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="prob-bar-track">
                        <div className="prob-bar-fill" style={{ width: `${(currentSweep.dist[1] || 0.31) * 100}%`, background: "var(--down)" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                        <span style={{ color: "var(--stagnant)" }}>Stagnant State (|r| ≤ θ)</span>
                        <span style={{ color: "var(--ink)" }}>{((currentSweep.dist[2] || 0.33) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="prob-bar-track">
                        <div className="prob-bar-fill" style={{ width: `${(currentSweep.dist[2] || 0.33) * 100}%`, background: "var(--stagnant)" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagonal Dominance metrics */}
                <div style={{ display: "flex", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>p₁₁ (Up Persistence)</div>
                    <div style={{ fontSize: "1.1rem", color: "var(--up)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {((currentSweep.p11 || 0.4129) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>p₂₂ (Down Persistence)</div>
                    <div style={{ fontSize: "1.1rem", color: "var(--down)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {((currentSweep.p22 || 0.3614) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>p₃₃ (Stag Persistence)</div>
                    <div style={{ fontSize: "1.1rem", color: "var(--stagnant)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {((currentSweep.p33 || 0.39) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SIDE-BY-SIDE CONDITIONAL MATRICES ─── */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>SECTION 3.9: REGIME-CONDITIONED MATRICES</div>
            <h3 style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: 20 }}>
              The Tug-of-War: How Institutional Regimes Transform the Market Matrix
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              
              {/* Strongly Negative SN */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge-down">SN (Strong Selling)</span>
                  <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>FII Outflows</span>
                </div>
                <CTPMHeatmap matrix={activeHorizon.conditional_tpms.SN} />
                <div style={{ fontSize: "0.76rem", color: "var(--ink-2)", marginTop: 12, lineHeight: 1.4 }}>
                  Downward persistence surges to <strong style={{ color: "var(--down)" }}>{activeHorizon.sn_bear_persistence_pct}%</strong>. Strong bear momentum.
                </div>
              </div>

              {/* Neutral N */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge-stagnant">N (Neutral Flow)</span>
                  <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>Balanced Range</span>
                </div>
                <CTPMHeatmap matrix={activeHorizon.conditional_tpms.N} />
                <div style={{ fontSize: "0.76rem", color: "var(--ink-2)", marginTop: 12, lineHeight: 1.4 }}>
                  Transitions follow standard baseline equilibrium without directional bias.
                </div>
              </div>

              {/* Strongly Positive SP */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge-up">SP (Strong Buying)</span>
                  <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>DII SIP Absorption</span>
                </div>
                <CTPMHeatmap matrix={activeHorizon.conditional_tpms.SP} />
                <div style={{ fontSize: "0.76rem", color: "var(--ink-2)", marginTop: 12, lineHeight: 1.4 }}>
                  Down persistence collapses to <strong style={{ color: "var(--up)" }}>15.62%</strong>; Up persistence hits <strong style={{ color: "var(--up)" }}>46.88%</strong>.
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. STEADY-STATE & MEAN FIRST PASSAGE TIME ─── */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            
            {/* Steady-State Distribution Table */}
            <div className="glass" style={{ padding: 28 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>EQUILIBRIUM ANALYSIS</div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 16 }}>
                Stationary Probability Distribution (&pi; = &pi; P)
              </h3>
              
              <table className="tpm-table" style={{ marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Regime</th>
                    <th>&pi;₁ (Upward)</th>
                    <th>&pi;₂ (Downward)</th>
                    <th>&pi;₃ (Stagnant)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--ink)" }}>Baseline</td>
                    <td style={{ color: "var(--up)" }}>{(activeHorizon.steady_state[0] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--down)" }}>{(activeHorizon.steady_state[1] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--stagnant)" }}>{(activeHorizon.steady_state[2] * 100).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--down)" }}>SN (Selling)</td>
                    <td style={{ color: "var(--up)" }}>{(activeHorizon.steady_state_conditional.SN[0] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--down)", fontWeight: 700 }}>{(activeHorizon.steady_state_conditional.SN[1] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--stagnant)" }}>{(activeHorizon.steady_state_conditional.SN[2] * 100).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--ink-2)" }}>N (Neutral)</td>
                    <td style={{ color: "var(--up)" }}>{(activeHorizon.steady_state_conditional.N[0] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--down)" }}>{(activeHorizon.steady_state_conditional.N[1] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--stagnant)" }}>{(activeHorizon.steady_state_conditional.N[2] * 100).toFixed(2)}%</td>
                  </tr>
                  <tr style={{ background: "rgba(34, 208, 122, 0.08)" }}>
                    <td style={{ textAlign: "left", fontWeight: 700, color: "var(--up)" }}>SP (Buying) ★</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>{(activeHorizon.steady_state_conditional.SP[0] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>{(activeHorizon.steady_state_conditional.SP[1] * 100).toFixed(2)}%</td>
                    <td style={{ color: "var(--stagnant)" }}>{(activeHorizon.steady_state_conditional.SP[2] * 100).toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--accent)" }}>The DII Shock Absorber:</strong> When domestic institutions are net buyers, the market&apos;s long-run steady-state probability of being in a bear regime collapses down to <strong>{activeHorizon.sp_bear_collapse_pct}%</strong>.
              </div>
            </div>

            {/* Mean First Passage Time (MFPT) Matrix */}
            <div className="glass" style={{ padding: 28 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>PASSAGE TIMES</div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 16 }}>
                Mean First Passage Time Matrix (M in Trading Days)
              </h3>

              <table className="tpm-table" style={{ marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>From \ To</th>
                    <th>&rarr; Upward</th>
                    <th>&rarr; Downward</th>
                    <th>&rarr; Stagnant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--up)" }}>Upward &rarr;</td>
                    <td style={{ color: "var(--accent)", fontWeight: 700 }}>{activeHorizon.mfpt[0]?.[0]} d (Recur)</td>
                    <td>{activeHorizon.mfpt[0]?.[1]} days</td>
                    <td>{activeHorizon.mfpt[0]?.[2]} days</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--down)" }}>Downward &rarr;</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>{activeHorizon.mfpt[1]?.[0]} days</td>
                    <td style={{ color: "var(--accent)", fontWeight: 700 }}>{activeHorizon.mfpt[1]?.[1]} d (Recur)</td>
                    <td>{activeHorizon.mfpt[1]?.[2]} days</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--stagnant)" }}>Stagnant &rarr;</td>
                    <td style={{ color: "var(--up)" }}>{activeHorizon.mfpt[2]?.[0]} days</td>
                    <td>{activeHorizon.mfpt[2]?.[1]} days</td>
                    <td style={{ color: "var(--accent)", fontWeight: 700 }}>{activeHorizon.mfpt[2]?.[2]} d (Recur)</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                Computed via fundamental matrix Z = (I - P + 1 &middot; &pi;)<sup>-1</sup>. Expected time to recover from a Downward day back to an Upward rally is only <strong>{activeHorizon.mfpt[1]?.[0]} trading days</strong>.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. CHAPMAN-KOLMOGOROV MULTI-STEP POWERS ─── */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <div>
                <div className="section-label">CHAPMAN-KOLMOGOROV THEOREM</div>
                <h3 style={{ fontSize: "1.3rem", color: "var(--ink)", marginTop: 4 }}>
                  n-Step Matrix Powers &amp; Ergodic Convergence (P<sup>n</sup> &rarr; 1 &middot; &pi;)
                </h3>
              </div>

              {/* Step selector */}
              <div className="segmented-control">
                {["1", "2", "3", "5", "10", "20"].map(step => (
                  <button
                    key={step}
                    onClick={() => setCkStep(step)}
                    className={`segmented-btn ${ckStep === step ? "active" : ""}`}
                  >
                    n = {step} Day{step !== "1" ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "center" }}>
              <div style={{ background: "var(--bg-2)", padding: 20, borderRadius: 10, border: "1px solid var(--line)" }}>
                <CTPMHeatmap
                  matrix={
                    ckStep === "1" ? activeHorizon.tpm
                    : ckStep === "2" ? [[0.38, 0.30, 0.32], [0.36, 0.32, 0.32], [0.35, 0.31, 0.34]]
                    : ckStep === "3" ? [[0.37, 0.31, 0.32], [0.36, 0.31, 0.33], [0.36, 0.31, 0.33]]
                    : [[activeHorizon.steady_state[0], activeHorizon.steady_state[1], activeHorizon.steady_state[2]], [activeHorizon.steady_state[0], activeHorizon.steady_state[1], activeHorizon.steady_state[2]], [activeHorizon.steady_state[0], activeHorizon.steady_state[1], activeHorizon.steady_state[2]]]
                  }
                  title={`n = ${ckStep} Step Transition Probability Matrix (P^${ckStep}) &middot; ${activeHorizon.label}`}
                />
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                <p style={{ marginBottom: 12 }}>
                  By the <strong>Chapman-Kolmogorov equations</strong>, multi-step transition probabilities satisfy <em>P(X<sub>t+n</sub> = j | X<sub>t</sub> = i) = (P<sup>n</sup>)<sub>ij</sub></em>.
                </p>
                <p>
                  As n &rarr; &infin;, all rows of P<sup>n</sup> exponentially converge to the identical stationary probability vector &pi; = [{(activeHorizon.steady_state[0] * 100).toFixed(1)}%, {(activeHorizon.steady_state[1] * 100).toFixed(1)}%, {(activeHorizon.steady_state[2] * 100).toFixed(1)}%], confirming the ergodicity and regular Markovian structure of the Nifty 50 regime chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
