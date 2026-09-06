"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";

export default function AboutResearchPage() {
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <section style={{ padding: "48px 0 36px", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span className="pulse-dot" /> Academic Research &amp; Dissertation
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.1 }}>
            Analyzing Stock Market Behavior Using Markov Chains with FII &amp; DII Data
          </h1>
          <div style={{ fontSize: "1.05rem", color: "var(--ink-2)", maxWidth: "75ch", lineHeight: 1.6 }}>
            B.Sc. (Hons) Mathematics Dissertation &middot; Shyam Lal College, University of Delhi.
            Supervised by <strong>Dr. Virender</strong>, May 2026.
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
            <div className="badge-accent">Author: Piyush Mittal</div>
            <div className="badge-up">Supervisor: Dr. Virender</div>
            <div className="badge-stagnant">Institution: University of Delhi</div>
            <div className="badge-down">Field: Stochastic Processes &amp; Mathematical Finance</div>
          </div>
        </div>
      </section>

      {/* Abstract & Research Questions */}
      <section style={{ padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32 }}>
            
            {/* Abstract */}
            <div className="glass" style={{ padding: 32 }}>
              <div className="section-label" style={{ marginBottom: 16 }}>DISSERTATION ABSTRACT</div>
              <p style={{ color: "var(--ink)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 16 }}>
                Standard financial econometric frameworks often treat market index returns as continuous, linear, and memoryless random walks — upholding the strong-form <strong>Efficient Market Hypothesis (EMH)</strong>. However, emerging equity markets like the National Stock Exchange of India (NSE Nifty 50) exhibit pronounced, asymmetric regime-switching dynamics driven by institutional liquidity shocks.
              </p>
              <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 16 }}>
                This research develops a <strong>discrete-time Markov chain (DTMC)</strong> framework to model daily Nifty 50 regime transitions (Upward, Downward, Stagnant), conditioned on Foreign Institutional Investor (FII) and Domestic Institutional Investor (DII) net capital flows.
              </p>
              <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.7 }}>
                By evaluating empirical transition matrices across <strong>3 distinct time horizons (6.5 Years, 5.0 Years, 2.5 Years)</strong>, steady-state probability vectors (&pi;), Mean First Passage Times (MFPT), and out-of-sample Top-2 Probabilistic Accuracy across 1,612 trading days, the study uncovers structural evidence against the random walk hypothesis and quantifies the systemic buffering power of domestic institutional liquidity (<strong>&quot;The DII Shock Absorber&quot;</strong>).
              </p>
            </div>

            {/* Core Research Hypotheses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="glass" style={{ padding: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>
                  HYPOTHESIS 1: REGIME PERSISTENCE (EMH CHALLENGE)
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Does today&apos;s return regime contain statistically significant memory for predicting tomorrow&apos;s regime, violating the memoryless Markovian random walk?
                </div>
              </div>

              <div className="glass" style={{ padding: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--up)", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>
                  HYPOTHESIS 2: INSTITUTIONAL FLOW COUPLING
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Do extreme foreign capital outflows (SN) induce downward inertia, and can domestic SIP accumulation (SP) structurally truncate bear-market duration?
                </div>
              </div>

              <div className="glass" style={{ padding: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>
                  HYPOTHESIS 3: MULTI-HORIZON STABILITY
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Does the Markov property and transition structure hold invariantly across 6.5-year macro cycles, 5.0-year medium cycles, and 2.5-year modern high-liquidity regimes?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MULTI-HORIZON EMPIRICAL STUDY (6.5y vs 5.0y vs 2.5y) ─── */}
      <section style={{ padding: "12px 0 40px" }}>
        <div className="container">
          <div className="glass" style={{ padding: 36 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>
              MULTI-HORIZON ROBUSTNESS FRAMEWORK
            </div>
            <h2 style={{ fontSize: "1.45rem", color: "var(--ink)", marginBottom: 14 }}>
              Why the Research Evaluated 3 Independent Time Horizons
            </h2>
            <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24, maxWidth: "80ch" }}>
              A single sample window risks overfitting to specific macroeconomic episodes (like the 2020 COVID shock).
              To establish rigorous empirical validity, the dissertation conducted Markov estimation across three non-trivial time horizons:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
              {/* Horizon 1 */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="badge-accent">HORIZON 1: 6.5 YEARS</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-3)" }}>1,612 Trading Days</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", color: "var(--ink)", marginBottom: 8 }}>Macro Full-Cycle Baseline</h4>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>April 2018 – October 2024</div>
                <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Encompasses pre-COVID baseline, the March 2020 pandemic crash, zero-interest rate liquidity expansion, and the 2022–2024 global rate tightening cycle. Confirms strong-form EMH rejection with <strong>p₁₁ = 41.29%</strong>.
                </p>
              </div>

              {/* Horizon 2 */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="badge-up">HORIZON 2: 5.0 YEARS</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-3)" }}>1,235 Trading Days</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", color: "var(--ink)", marginBottom: 8 }}>Structural SIP Expansion</h4>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>5-Year Post-COVID Regime</div>
                <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Isolates the post-pandemic period where Indian mutual fund systematic investment plans (SIPs) escalated from ₹8,000 Cr to over ₹25,000 Cr/month, verifying the emergence of domestic market depth.
                </p>
              </div>

              {/* Horizon 3 */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="badge-stagnant">HORIZON 3: 2.5 YEARS</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-3)" }}>687 Trading Days</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", color: "var(--ink)", marginBottom: 8 }}>High-Liquidity Replication</h4>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>Nov 2022 – Sep 2026</div>
                <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Independent replication on modern data confirming that the &quot;DII Shock Absorber&quot; is structurally accelerating: under domestic buying (SP), bear steady-state collapses to just <strong>15.62%</strong>.
                </p>
              </div>
            </div>

            {/* Multi-Horizon Comparative Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="tpm-table" style={{ width: "100%", fontSize: "0.84rem" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Time Horizon</th>
                    <th>Trading Days</th>
                    <th>Up Persistence (p₁₁)</th>
                    <th>Down Persistence (p₂₂)</th>
                    <th>Steady-State &pi; [Up / Down / Stag]</th>
                    <th>SP Bear Collapse (&pi;₂ | SP)</th>
                    <th>Mean Recurrence Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 700, color: "var(--accent)" }}>6.5 Years (Full Macro Cycle)</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>1,612 d</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>41.29%</td>
                    <td style={{ color: "var(--down)" }}>36.14%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>36.4% / 30.9% / 32.7%</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>23.06%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>2.56 days</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 700, color: "var(--up)" }}>5.0 Years (Structural Expansion)</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>1,235 d</td>
                    <td style={{ color: "var(--up)" }}>38.45%</td>
                    <td style={{ color: "var(--down)" }}>35.80%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>35.8% / 31.3% / 32.9%</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>24.80%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>2.79 days</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: 700, color: "var(--ink)" }}>2.5 Years (High-Liquidity Replication)</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>687 d</td>
                    <td style={{ color: "var(--up)" }}>36.14%</td>
                    <td style={{ color: "var(--down)" }}>31.86%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>35.7% / 29.4% / 34.9%</td>
                    <td style={{ color: "var(--up)", fontWeight: 700 }}>15.62%</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>2.80 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </section>

      {/* Key Empirical Results */}
      <section style={{ padding: "12px 0 40px" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: 20 }}>KEY EMPIRICAL DISCOVERIES TABLE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
            <StatCard
              value="0.30%"
              label="Optimal Return Threshold (θ)"
              subLabel="Maximizes state entropy &amp; minimizes classification noise"
              color="var(--accent)"
            />
            <StatCard
              value="41.29%"
              label="Upward State Persistence (p₁₁)"
              subLabel="Evidence against Strong-Form EMH across 6.5 years"
              color="var(--up)"
            />
            <StatCard
              value="23.06%"
              label="Steady-State Bear Probability (π₂)"
              subLabel="Collapses from 30.88% baseline under DII buying"
              color="var(--up)"
            />
            <StatCard
              value="1.276 Days"
              label="Downturn Duration under DII Buying"
              subLabel="Down from 1.703 days baseline sojourn time"
              color="var(--ink)"
            />
          </div>
        </div>
      </section>

      {/* Full Mathematical Formulation */}
      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <div className="glass" style={{ padding: "36px 40px" }}>
            <div className="section-label" style={{ marginBottom: 20 }}>
              MATHEMATICAL METHODOLOGY &amp; EQUATIONS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* Step 1 */}
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>01.</span>
                  State Space Discretization
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  Daily logarithmic returns are defined as <em>r<sub>t</sub> = ln(P<sub>t</sub> / P<sub>t-1</sub>)</em>. The state sequence &#123;<em>X<sub>t</sub></em>&#125; takes values in the finite discrete state space <em>S = &#123;1 (Upward), 2 (Downward), 3 (Stagnant)&#125;</em> using the symmetric cutoff &theta; = 0.30%:
                </p>
                <div style={{ background: "var(--bg-2)", padding: "16px 20px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", border: "1px solid var(--line)", color: "var(--ink)" }}>
                  X<sub>t</sub> = <br />
                  &nbsp;&nbsp;1 (Upward)&nbsp;&nbsp;&nbsp; if r<sub>t</sub> &gt; +0.0030 (+0.30%)<br />
                  &nbsp;&nbsp;2 (Downward)&nbsp; if r<sub>t</sub> &lt; -0.0030 (-0.30%)<br />
                  &nbsp;&nbsp;3 (Stagnant)&nbsp; if -0.0030 &le; r<sub>t</sub> &le; +0.0030
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>02.</span>
                  Institutional Flow Regimes via Empirical CDF (eCDF)
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  To prevent distortion from fixed rupee thresholds over multi-year macroeconomic expansion, institutional net flow <em>F<sub>t</sub> = FII<sub>t</sub> + DII<sub>t</sub></em> is classified into percentile ranks:
                </p>
                <div style={{ background: "var(--bg-2)", padding: "16px 20px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", border: "1px solid var(--line)", color: "var(--ink)" }}>
                  R<sub>t</sub> = <br />
                  &nbsp;&nbsp;SP (Strongly Positive) : F<sub>t</sub> &gt; P<sub>75</sub> (Top 25% net institutional inflow)<br />
                  &nbsp;&nbsp;SN (Strongly Negative) : F<sub>t</sub> &lt; P<sub>25</sub> (Bottom 25% net capital outflow)<br />
                  &nbsp;&nbsp;N  (Neutral)           : P<sub>25</sub> &le; F<sub>t</sub> &le; P<sub>75</sub> (Interquartile balanced range)
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>03.</span>
                  Transition Probability Matrix Estimation (MLE)
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  The transition probabilities <em>p<sub>ij</sub> = P(X<sub>t+1</sub> = j | X<sub>t</sub> = i)</em> are estimated via Maximum Likelihood Estimation (MLE):
                </p>
                <div style={{ background: "var(--bg-2)", padding: "16px 20px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", border: "1px solid var(--line)", color: "var(--accent)" }}>
                  p<sub>ij</sub> = n<sub>ij</sub> / &sum;<sub>k=1</sub><sup>3</sup> n<sub>ik</sub>
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>04.</span>
                  Steady-State Distribution &amp; Mean First Passage Time (MFPT)
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  The stationary equilibrium distribution &pi; = [&pi;₁, &pi;₂, &pi;₃] satisfies &pi; P = &pi; with &sum; &pi;<sub>i</sub> = 1. The fundamental matrix Z and Mean First Passage Time matrix M are derived as:
                </p>
                <div style={{ background: "var(--bg-2)", padding: "16px 20px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", border: "1px solid var(--line)", color: "var(--ink)" }}>
                  Z = (I - P + 1 &middot; &pi;)<sup>-1</sup> <br /><br />
                  M<sub>ij</sub> = (Z<sub>jj</sub> - Z<sub>ij</sub>) / &pi;<sub>j</sub> &nbsp;&nbsp;&nbsp;&nbsp;(for i &ne; j)<br />
                  M<sub>ii</sub> = 1 / &pi;<sub>i</sub> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Mean recurrence time)
                </div>
              </div>

              {/* Step 5 */}
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>05.</span>
                  Algorithm 3: Top-2 Probabilistic Accuracy Validation
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  For a 3-state stochastic market process where the unconditional prior is 1/3, point forecasting often penalizes legitimate second-order probabilities. A prediction is classified as a Top-2 Hit if the true realized state falls within the model&apos;s two highest probability outcomes:
                </p>
                <div style={{ background: "var(--bg-2)", padding: "16px 20px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", border: "1px solid var(--line)", color: "var(--up)" }}>
                  Top-2 Accuracy = (1 / T) &sum;<sub>t=1</sub><sup>T</sup> <strong>1</strong>( X<sub>t+1</sub> &isin; argmax<sub>2</sub>( P<sub>X<sub>t</sub>, &middot;</sub> ) ) &times; 100%
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Academic Citation & Supervisor Credits */}
      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>DISSERTATION CITATION &amp; REFERENCE</div>
            <div style={{
              background: "var(--bg-2)", padding: "20px 24px", borderRadius: 10,
              fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.6,
              border: "1px solid var(--line)", marginBottom: 20
            }}>
              Mittal, Piyush. (2026). <em>Analyzing Stock Market Behavior Using Markov Chains with FII &amp; DII Data</em>. B.Sc. (Hons) Mathematics Dissertation. Supervised by Dr. Virender, Department of Mathematics, Shyam Lal College, University of Delhi.
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/analytics" className="btn-primary">
                Explore Multi-Horizon Markov Suite Live &rarr;
              </Link>
              <Link href="/accuracy" className="btn-secondary">
                View Daily Prediction Accuracy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
