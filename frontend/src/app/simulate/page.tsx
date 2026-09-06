"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from "recharts";
import { api, SimResult } from "@/lib/api";
import StatCard from "@/components/StatCard";

export default function SimulatePage() {
  const [regime, setRegime] = useState<"baseline" | "SP" | "N" | "SN">("SP");
  const [days, setDays] = useState(30);
  const [runs, setRuns] = useState(15);
  const [startState, setStartState] = useState(1);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRunSimulation() {
    setLoading(true);
    try {
      const res = await api.simulate(regime, days, runs, startState);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Transform runs into recharts series format
  const chartData = [];
  if (simResult?.runs?.length) {
    for (let d = 0; d <= simResult.days; d++) {
      const point: any = { day: `Day ${d}` };
      simResult.runs.forEach((r, idx) => {
        point[`run_${idx}`] = r.cumulative_returns[d] || 0;
      });
      // Calculate mean trajectory
      const vals = simResult.runs.map(r => r.cumulative_returns[d] || 0);
      point.mean = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
      chartData.push(point);
    }
  }

  const avgUp = simResult ? Math.round(simResult.runs.reduce((a, b) => a + b.up_days, 0) / simResult.runs.length) : 0;
  const avgDown = simResult ? Math.round(simResult.runs.reduce((a, b) => a + b.down_days, 0) / simResult.runs.length) : 0;
  const avgStag = simResult ? Math.round(simResult.runs.reduce((a, b) => a + b.stagnant_days, 0) / simResult.runs.length) : 0;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <section style={{ padding: "40px 0 28px", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: 8 }}>
            MCMC PATH ENGINE (ALGORITHM 4)
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, margin: "0 0 10px" }}>
            Monte Carlo Multi-Path Simulator
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1rem", maxWidth: "72ch", margin: 0 }}>
            Simulate forward Nifty 50 market trajectories using inverse transform sampling across arbitrary time horizons,
            stress-tested under regime-conditioned transition probability matrices.
          </p>
        </div>
      </section>

      {/* Control Lab & Chart */}
      <section style={{ padding: "36px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
            
            {/* Left: Configuration Panel */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="section-label" style={{ marginBottom: 16 }}>SIMULATION PARAMETERS</div>

              {/* Driving Regime */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)", marginBottom: 8 }}>
                  DRIVING REGIME MATRIX
                </label>
                <div className="segmented-control" style={{ width: "100%", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setRegime("SP")}
                    className={`segmented-btn ${regime === "SP" ? "active" : ""}`}
                    style={{ flex: 1 }}
                  >
                    SP (Buy)
                  </button>
                  <button
                    onClick={() => setRegime("N")}
                    className={`segmented-btn ${regime === "N" ? "active" : ""}`}
                    style={{ flex: 1 }}
                  >
                    Neutral
                  </button>
                  <button
                    onClick={() => setRegime("SN")}
                    className={`segmented-btn ${regime === "SN" ? "active" : ""}`}
                    style={{ flex: 1 }}
                  >
                    SN (Sell)
                  </button>
                  <button
                    onClick={() => setRegime("baseline")}
                    className={`segmented-btn ${regime === "baseline" ? "active" : ""}`}
                    style={{ flex: 1 }}
                  >
                    Baseline
                  </button>
                </div>
              </div>

              {/* Starting State */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)", marginBottom: 8 }}>
                  INITIAL STATE (DAY 0)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setStartState(1)}
                    className={startState === 1 ? "badge-up" : "btn-secondary"}
                    style={{ flex: 1, padding: "8px 0", justifyContent: "center", cursor: "pointer" }}
                  >
                    ↑ Upward
                  </button>
                  <button
                    onClick={() => setStartState(2)}
                    className={startState === 2 ? "badge-down" : "btn-secondary"}
                    style={{ flex: 1, padding: "8px 0", justifyContent: "center", cursor: "pointer" }}
                  >
                    ↓ Downward
                  </button>
                  <button
                    onClick={() => setStartState(3)}
                    className={startState === 3 ? "badge-stagnant" : "btn-secondary"}
                    style={{ flex: 1, padding: "8px 0", justifyContent: "center", cursor: "pointer" }}
                  >
                    → Stagnant
                  </button>
                </div>
              </div>

              {/* Horizon Slider */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>FORECAST HORIZON</span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>{days} Days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                />
              </div>

              {/* Number of Paths Slider */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>MONTE CARLO PATHS</span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>{runs} Runs</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={runs}
                  onChange={e => setRuns(Number(e.target.value))}
                />
              </div>

              {/* Run button */}
              <button
                onClick={handleRunSimulation}
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px 0" }}
              >
                {loading ? "Generating Paths..." : "Run MCMC Simulation 🚀"}
              </button>
            </div>

            {/* Right: Path Chart & Summary Stats */}
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div className="section-label">PROJECTED CUMULATIVE RETURN TRAJECTORIES</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", marginTop: 4 }}>
                    Stochastic returns generated via inverse transform sampling (<em>X<sub>t+1</sub> &sim; P<sub>X<sub>t</sub>, &middot;</sub></em>)
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, fontSize: "0.74rem", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--accent)" }}>― Mean Expected Path</span>
                  <span style={{ color: "var(--ink-3)" }}>― Individual Stochastic Paths</span>
                </div>
              </div>

              {/* Recharts Multi-line Trajectory */}
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                      tickLine={false} axisLine={false}
                      interval={Math.floor(days / 6)}
                    />
                    <YAxis
                      tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                      tickLine={false} axisLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-2)", borderColor: "var(--line)", borderRadius: 8, fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
                      formatter={(val: any, name: any) => [`${val}%`, name === "mean" ? "Mean Expected" : name]}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    {/* Render individual path lines */}
                    {simResult?.runs.map((_, idx) => (
                      <Line
                        key={idx}
                        type="monotone"
                        dataKey={`run_${idx}`}
                        stroke="rgba(124, 138, 160, 0.25)"
                        strokeWidth={1}
                        dot={false}
                      />
                    ))}
                    {/* Render bold mean trajectory */}
                    <Line
                      type="monotone"
                      dataKey="mean"
                      stroke="var(--accent)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", borderRadius: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎲</div>
                    <div style={{ color: "var(--ink-2)", fontSize: "0.9rem" }}>Click &quot;Run MCMC Simulation&quot; to generate forward paths.</div>
                  </div>
                </div>
              )}

              {/* Statistics Strip */}
              {simResult && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                  <div style={{ background: "var(--bg-2)", padding: 14, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>MEAN RETURN</div>
                    <div style={{
                      fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)",
                      color: (simResult.stats?.mean_final_return_pct || 0) >= 0 ? "var(--up)" : "var(--down)"
                    }}>
                      {(simResult.stats?.mean_final_return_pct || 0) >= 0 ? "+" : ""}{simResult.stats?.mean_final_return_pct}%
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-2)", padding: 14, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>WIN RATE</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--up)" }}>
                      {simResult.stats?.win_rate_pct}%
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-2)", padding: 14, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>MAX GAIN</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--up)" }}>
                      +{simResult.stats?.max_return_pct}%
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-2)", padding: 14, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>MAX DRAWDOWN</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--down)" }}>
                      {simResult.stats?.min_return_pct}%
                    </div>
                  </div>
                </div>
              )}

              {/* State Composition Breakdown */}
              {simResult && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", background: "var(--bg-2)", padding: "10px 16px", borderRadius: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>
                  <span>Avg Composition: <span style={{ color: "var(--up)" }}>{avgUp} Up days</span> | <span style={{ color: "var(--down)" }}>{avgDown} Down days</span> | <span style={{ color: "var(--stagnant)" }}>{avgStag} Stagnant days</span></span>
                  <span style={{ color: "var(--accent)" }}>Horizon: {days} Trading Sessions</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
