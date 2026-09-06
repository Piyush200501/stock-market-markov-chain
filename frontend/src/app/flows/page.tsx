"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, AreaChart, Area
} from "recharts";
import { api, FlowPoint } from "@/lib/api";
import StatCard from "@/components/StatCard";

export default function FlowsPage() {
  const [flows, setFlows] = useState<FlowPoint[]>([]);
  const [p25, setP25] = useState(-432);
  const [p75, setP75] = useState(1860);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "SP" | "N" | "SN">("ALL");

  useEffect(() => {
    loadFlows();
  }, []);

  async function loadFlows() {
    try {
      const res = await api.fiidii(90);
      setFlows(res.data);
      setP25(res.p25_flow);
      setP75(res.p75_flow);
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate cumulative FII vs DII
  let cumFii = 0;
  let cumDii = 0;
  const cumulativeData = flows.map(f => {
    cumFii += f.fii_net;
    cumDii += f.dii_net;
    return {
      date: f.date,
      cum_fii: Math.round(cumFii),
      cum_dii: Math.round(cumDii),
      cum_net: Math.round(cumFii + cumDii),
    };
  });

  const filteredFlows = activeFilter === "ALL" ? flows : flows.filter(f => f.regime === activeFilter);

  const spCount = flows.filter(f => f.regime === "SP").length;
  const nCount = flows.filter(f => f.regime === "N").length;
  const snCount = flows.filter(f => f.regime === "SN").length;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <section style={{ padding: "40px 0 28px", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: 8 }}>
            INSTITUTIONAL LIQUIDITY DYNAMICS (SECTION 3.8)
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, margin: "0 0 10px" }}>
            Foreign & Domestic Institutional Investor Flows
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1rem", maxWidth: "75ch", margin: 0 }}>
            Analyzing the tug-of-war between Foreign Institutional Investors (FIIs) and Domestic Institutional Investors (DIIs),
            and how empirical flow percentiles define market regime transitions.
          </p>
        </div>
      </section>

      {/* Overview Metric Cards */}
      <section style={{ padding: "36px 0 12px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <StatCard
              value="+₹1,860 Cr"
              label="75th Percentile (SP Cutoff)"
              subLabel="Strong Buying threshold (Top 25% inflow sessions)"
              color="var(--up)"
            />
            <StatCard
              value="-₹432 Cr"
              label="25th Percentile (SN Cutoff)"
              subLabel="Strong Selling threshold (Bottom 25% outflow sessions)"
              color="var(--down)"
            />
            <StatCard
              value="₹2,292 Cr"
              label="Interquartile Spread (IQR)"
              subLabel="Neutral regime (N) bounds capturing 50% of sessions"
              color="var(--stagnant)"
            />
            <StatCard
              value="eCDF Method"
              label="Percentile Discretization"
              subLabel="Eliminates inflation/rupee bias across multi-year data"
              color="var(--accent)"
            />
          </div>
        </div>
      </section>

      {/* Cumulative Divergence Chart (The DII Shock Absorber Proof) */}
      <section style={{ padding: "24px 0" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="section-label">THE STRUCTURAL SHIFT</div>
                <h3 style={{ fontSize: "1.3rem", color: "var(--ink)", marginTop: 4 }}>
                  Cumulative Flow Divergence: FII Volatility vs DII SIP Accumulation
                </h3>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "var(--up)" }}>■ Cumulative DII Net Inflow (₹ Cr)</span>
                <span style={{ color: "var(--down)" }}>■ Cumulative FII Net Inflow (₹ Cr)</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cumulativeData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--up)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--up)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)}
                  interval={Math.floor(cumulativeData.length / 8)}
                />
                <YAxis
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: "var(--bg-2)", borderColor: "var(--line)", borderRadius: 8, fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
                  formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString("en-IN")} Cr`, name === "cum_dii" ? "DII Cumulative" : "FII Cumulative"]}
                />
                <Area type="monotone" dataKey="cum_dii" stroke="var(--up)" strokeWidth={2.5} fill="url(#diiGrad)" dot={false} />
                <Area type="monotone" dataKey="cum_fii" stroke="var(--down)" strokeWidth={2} fill="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 20, padding: "14px 18px", background: "var(--bg-2)",
              borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.6
            }}>
              <strong style={{ color: "var(--accent)" }}>Empirical Thesis Insight:</strong> In earlier market epochs, heavy foreign institutional selling reliably dragged the Nifty into prolonged bear regimes. In recent years, systematic SIP-driven domestic mutual fund inflows have created a persistent, counter-cyclical liquidity cushion that absorbs FII selloffs, truncating bear persistence from 41.31% to 15.62%.
            </div>
          </div>
        </div>
      </section>

      {/* Daily Net Flow Bar Chart with Regime Filter */}
      <section style={{ padding: "12px 0 36px" }}>
        <div className="container">
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
              <div>
                <div className="section-label">DAILY COMBINED NET FLOWS (FII + DII)</div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginTop: 4 }}>
                  Regime-Categorized Daily Flow Series
                </h3>
              </div>

              {/* Regime Filter Segmented Control */}
              <div className="segmented-control">
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`segmented-btn ${activeFilter === "ALL" ? "active" : ""}`}
                >
                  All ({flows.length})
                </button>
                <button
                  onClick={() => setActiveFilter("SP")}
                  className={`segmented-btn ${activeFilter === "SP" ? "active" : ""}`}
                >
                  SP ({spCount})
                </button>
                <button
                  onClick={() => setActiveFilter("N")}
                  className={`segmented-btn ${activeFilter === "N" ? "active" : ""}`}
                >
                  Neutral ({nCount})
                </button>
                <button
                  onClick={() => setActiveFilter("SN")}
                  className={`segmented-btn ${activeFilter === "SN" ? "active" : ""}`}
                >
                  SN ({snCount})
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filteredFlows} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)}
                  interval={Math.floor(filteredFlows.length / 8)}
                />
                <YAxis
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip
                  contentStyle={{ background: "var(--bg-2)", borderColor: "var(--line)", borderRadius: 8, fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
                  formatter={(val: any, name: any, item: any) => [
                    `₹${val} Cr (FII: ${item.payload.fii_net} Cr, DII: ${item.payload.dii_net} Cr) [${item.payload.regime}]`,
                    "Net Flow"
                  ]}
                />
                <Bar dataKey="net_flow" radius={[2, 2, 0, 0]}>
                  {filteredFlows.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.regime === "SP" ? "var(--up)" : entry.regime === "SN" ? "var(--down)" : "var(--stagnant)"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
              <span>P25 Outflow Cutoff: <strong style={{ color: "var(--down)" }}>{p25.toFixed(0)} Cr</strong></span>
              <span>P75 Inflow Cutoff: <strong style={{ color: "var(--up)" }}>+{p75.toFixed(0)} Cr</strong></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
