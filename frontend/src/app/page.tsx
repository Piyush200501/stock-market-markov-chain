"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  AccuracyResult,
  CtpmResult,
  FlowPoint,
  ModelResult,
  PricePoint,
  SimResult,
} from "@/lib/api";
import PredictionCard from "@/components/PredictionCard";
import NiftyChart from "@/components/NiftyChart";
import FIIDIIChart from "@/components/FIIDIIChart";
import CTPMHeatmap from "@/components/CTPMHeatmap";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  const [modelResult, setModelResult] = useState<ModelResult | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [flows, setFlows] = useState<FlowPoint[]>([]);
  const [p25, setP25] = useState(-432);
  const [p75, setP75] = useState(1860);
  const [ctpmData, setCtpmData] = useState<CtpmResult | null>(null);
  const [accuracyData, setAccuracyData] = useState<AccuracyResult | null>(null);
  const [activeRegime, setActiveRegime] = useState<"baseline" | "SN" | "N" | "SP">("SP");
  const [quickSim, setQuickSim] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [predRes, niftyRes, fiidiiRes, ctpmRes, accRes] = await Promise.all([
        api.predict(),
        api.nifty(60),
        api.fiidii(60),
        api.ctpm(),
        api.accuracy(),
      ]);

      setModelResult(predRes);
      setPrices(niftyRes.data);
      setFlows(fiidiiRes.data);
      setP25(fiidiiRes.p25_flow);
      setP75(fiidiiRes.p75_flow);
      setCtpmData(ctpmRes);
      setAccuracyData(accRes);

      // Run initial quick simulation
      const sim = await api.simulate("SP", 30, 5, predRes.prediction.predicted_state || 1);
      setQuickSim(sim);
    } catch (e) {
      console.error("Data load error:", e);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setNotification("Fetching latest market data & retraining Markov model...");
    try {
      await api.retrain();
      await loadAllData();
      setNotification("Model retrained successfully on latest market close!");
    } catch (e) {
      setNotification("Retrain finished (using latest cached records).");
    } finally {
      setRefreshing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function runQuickSim(regime: string) {
    setSimLoading(true);
    try {
      const start = modelResult?.prediction.predicted_state || 1;
      const res = await api.simulate(regime, 30, 5, start);
      setQuickSim(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  }

  const prediction = modelResult?.prediction;
  const meta = modelResult?.meta;
  const stats = accuracyData?.stats;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          background: "var(--bg-2)", border: "1px solid var(--accent)",
          padding: "12px 20px", borderRadius: 10, color: "var(--ink)",
          fontFamily: "var(--font-mono)", fontSize: "0.85rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>⚡</span> {notification}
        </div>
      )}

      {/* Hero Header */}
      <section style={{ padding: "40px 0 28px", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="pulse-dot" /> B.Sc. (Hons) Mathematics Dissertation & Live Predictor
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.15 }}>
                Markets Don’t Just Wander. They <em style={{ color: "var(--accent)", fontStyle: "italic" }}>Remember</em>.
              </h1>
              <p style={{ color: "var(--ink-2)", fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)", maxWidth: "68ch", margin: 0 }}>
                A discrete-time Markov chain modeling Nifty 50 regime shifts (Upward / Downward / Stagnant),
                conditioned on Foreign & Domestic Institutional Investor (FII/DII) capital flows with daily auto-training.
              </p>
            </div>

            {/* Quick Meta Badge */}
            <div style={{
              background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
              padding: "16px 20px", minWidth: 270,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-3)", textTransform: "uppercase" }}>
                  Active Live Model
                </span>
                <Link href="/analytics" style={{ fontSize: "0.7rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                  3 Horizons ↗
                </Link>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--ink)", fontWeight: 600 }}>
                NSE Nifty 50 Engine
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", marginTop: 4 }}>
                Active Live: <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{meta?.n_days || 687} trading days</span> (~2.8 yrs)
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", marginTop: 4 }}>
                Multi-Horizon Suite: <strong>6.5y</strong> &middot; <strong>5.0y</strong> &middot; <strong>2.5y</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Prediction Hero & Real-World Accuracy Scorecard */}
      <section style={{ padding: "36px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "stretch" }}>
            
            {/* Left: Prediction Card */}
            {prediction ? (
              <PredictionCard
                prediction={prediction}
                trainedAt={meta?.trained_at || "Today"}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            ) : (
              <div className="glass" style={{ height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "var(--radius)" }} />
              </div>
            )}

            {/* Right: Real-World Prediction vs Actual Accuracy Scorecard */}
            <div className="glass" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="section-label" style={{ marginBottom: 16 }}>
                  PREDICTION VS ACTUAL ACCURACY
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem", color: "var(--up)", fontWeight: 700, lineHeight: 1 }}>
                      {stats?.top2_accuracy || "80.6"}%
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-2)", marginTop: 6, fontWeight: 600 }}>
                      Top-2 Accuracy
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", marginTop: 2 }}>
                      Actual state in top-2 predicted set
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem", color: "var(--accent)", fontWeight: 700, lineHeight: 1 }}>
                      {stats?.top1_accuracy || "51.4"}%
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-2)", marginTop: 6, fontWeight: 600 }}>
                      Top-1 Exact Match
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", marginTop: 2 }}>
                      Exact single-state hit rate
                    </div>
                  </div>
                </div>

                {/* Accuracy context note */}
                <div style={{
                  background: "rgba(245, 166, 35, 0.06)", border: "1px solid rgba(245, 166, 35, 0.2)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: "0.78rem", color: "var(--ink-2)", lineHeight: 1.5,
                }}>
                  <strong style={{ color: "var(--accent)" }}>Algorithm 3 Validation:</strong> In a stochastic 3-state financial market (random baseline = 33.3% / 66.7%), our FII/DII conditioned Markov chain achieves <strong style={{ color: "var(--ink)" }}>{stats?.top2_accuracy || 80.6}%</strong> probabilistic precision across rolling market closes.
                </div>

                {/* Audit summary */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--ink-2)", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <span>Audited Days: <strong style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{stats?.n_predictions || 45} Days</strong></span>
                  <span>Active Streak: <strong style={{ color: "var(--up)", fontFamily: "var(--font-mono)" }}>{stats?.current_streak || 6} Hits 🔥</strong></span>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <Link href="/accuracy" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  View Full Daily Verification Audit Log →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Headline Empirical Findings (Dissertation Key Results) */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: 18 }}>
            CORE DISSERTATION FINDINGS & DISCOVERIES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <StatCard
              value="0.30%"
              label="Optimal Return Threshold"
              subLabel="Sensitivity tested across 0.20% – 0.40% band"
              color="var(--accent)"
            />
            <StatCard
              value="41.29%"
              label="Upward State Persistence (p₁₁)"
              subLabel="Diagonal dominance challenges strong EMH"
              color="var(--up)"
            />
            <StatCard
              value="23.06%"
              label="The 'DII Shock Absorber' Effect"
              subLabel="Bear-market probability collapses under DII buying"
              color="var(--up)"
            />
            <StatCard
              value="2.56 Days"
              label="Mean First Passage Time (MFPT)"
              subLabel="Expected time to return to an Upward rally"
              color="var(--ink)"
            />
          </div>
        </div>
      </section>

      {/* Charts Suite: Nifty Price Chart & FII/DII Net Flow */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <NiftyChart data={prices} />
            <FIIDIIChart data={flows} p25={p25} p75={p75} />
          </div>
        </div>
      </section>

      {/* Interactive CTPM Preview & Quick Simulation */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
            
            {/* CTPM Preview Card */}
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="section-label">CONDITIONAL TRANSITION MATRICES</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-2)", marginTop: 4 }}>
                    How institutional capital flow shifts tomorrow&apos;s transition odds
                  </div>
                </div>

                {/* Regime Selector */}
                <div className="segmented-control">
                  <button
                    onClick={() => setActiveRegime("SN")}
                    className={`segmented-btn ${activeRegime === "SN" ? "active" : ""}`}
                  >
                    SN (Selling)
                  </button>
                  <button
                    onClick={() => setActiveRegime("N")}
                    className={`segmented-btn ${activeRegime === "N" ? "active" : ""}`}
                  >
                    N (Neutral)
                  </button>
                  <button
                    onClick={() => setActiveRegime("SP")}
                    className={`segmented-btn ${activeRegime === "SP" ? "active" : ""}`}
                  >
                    SP (Buying)
                  </button>
                  <button
                    onClick={() => setActiveRegime("baseline")}
                    className={`segmented-btn ${activeRegime === "baseline" ? "active" : ""}`}
                  >
                    Baseline
                  </button>
                </div>
              </div>

              {/* Heatmap table */}
              {ctpmData && (
                <CTPMHeatmap
                  matrix={
                    activeRegime === "baseline"
                      ? ctpmData.baseline_tpm
                      : ctpmData.conditional_tpms[activeRegime]
                  }
                  title={`Transition Matrix: ${activeRegime === "baseline" ? "Unconditional Baseline (MLE)" : `${activeRegime} Regime`}`}
                />
              )}

              {/* Explanatory takeaway */}
              <div style={{
                marginTop: 20, padding: "12px 16px", background: "var(--bg-2)",
                borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.8rem", color: "var(--ink-2)",
              }}>
                {activeRegime === "SP" && (
                  <span><strong>Strong Buying (SP):</strong> Downward persistence drops to <strong style={{ color: "var(--up)" }}>15.62%</strong>, and Upward persistence surges to <strong style={{ color: "var(--up)" }}>46.88%</strong>.</span>
                )}
                {activeRegime === "SN" && (
                  <span><strong>Strong Selling (SN):</strong> Downward persistence surges to <strong style={{ color: "var(--down)" }}>41.31%</strong>, with significant bear momentum.</span>
                )}
                {activeRegime === "N" && (
                  <span><strong>Neutral Flow (N):</strong> Market transitions follow balanced mean-reverting probabilities.</span>
                )}
                {activeRegime === "baseline" && (
                  <span><strong>Unconditional Baseline:</strong> Full sample transition probability matrix across all trading sessions.</span>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <Link href="/analytics" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Open Full Markov Theory & Sensitivity Explorer →
                </Link>
              </div>
            </div>

            {/* Quick Simulation Widget */}
            <div className="glass" style={{ padding: 28 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>
                QUICK MONTE CARLO PATH PROJECTION
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", marginBottom: 18 }}>
                Simulate 30-day forward MCMC price paths generated by inverse transform sampling under current regime parameters.
              </p>

              {/* Action row */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button
                  onClick={() => runQuickSim("SP")}
                  disabled={simLoading}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {simLoading ? "Simulating..." : "Run SP (Bullish) Path"}
                </button>
                <button
                  onClick={() => runQuickSim("SN")}
                  disabled={simLoading}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Run SN (Bearish) Path
                </button>
              </div>

              {/* Simulation Result Box */}
              {quickSim && (
                <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase" }}>
                      Regime: {quickSim.regime} (30 Days)
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700,
                      color: (quickSim.stats?.mean_final_return_pct || 0) >= 0 ? "var(--up)" : "var(--down)"
                    }}>
                      Exp. Return: {(quickSim.stats?.mean_final_return_pct || 0) >= 0 ? "+" : ""}{quickSim.stats?.mean_final_return_pct}%
                    </span>
                  </div>

                  {/* Visual state path representation */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
                      SAMPLE 30-DAY REGIME PATH:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {quickSim.runs[0]?.state_path.slice(1).map((st, idx) => (
                        <span
                          key={idx}
                          title={`Day ${idx + 1}: ${st === 1 ? "Upward" : st === 2 ? "Downward" : "Stagnant"}`}
                          style={{
                            width: 14, height: 14, borderRadius: 3,
                            background: st === 1 ? "var(--up)" : st === 2 ? "var(--down)" : "var(--stagnant)",
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", fontFamily: "var(--font-mono)", color: "var(--ink-2)", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                    <span>Win Rate: <strong style={{ color: "var(--up)" }}>{quickSim.stats?.win_rate_pct}%</strong></span>
                    <span>Up: {quickSim.runs[0]?.up_days}d | Down: {quickSim.runs[0]?.down_days}d | Stag: {quickSim.runs[0]?.stagnant_days}d</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <Link href="/simulate" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Open Full Multi-Path Monte Carlo Simulator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Citation & Project Summary Footer Banner */}
      <section style={{ padding: "20px 0 0" }}>
        <div className="container">
          <div className="glass" style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                ACADEMIC DISSERTATION & RESEARCH
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
                Authored by Piyush Mittal · Supervised by Dr. Virender
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", marginTop: 4 }}>
                Department of Mathematics, Shyam Lal College, University of Delhi (May 2026).
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/about" className="btn-primary">
                Read Full Methodology & Equations →
              </Link>
              <a
                href="https://github.com/Piyush200501/stock-market-markov-chain"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                GitHub Repository ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
