"use client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PricePoint } from "@/lib/api";

interface Props { data: PricePoint[] }

const stateColor = (s: number) => s === 1 ? "var(--up)" : s === 2 ? "var(--down)" : "var(--stagnant)";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as PricePoint;
  return (
    <div className="glass-sm" style={{ padding: "12px 16px", minWidth: 160, fontSize: "0.8rem" }}>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)", marginBottom: 6, fontSize: "0.7rem" }}>{d.date}</div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>
        ₹{d.close.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ color: "var(--ink-2)" }}>H: <span style={{ color: "var(--up)" }}>{d.high.toFixed(0)}</span></span>
        <span style={{ color: "var(--ink-2)" }}>L: <span style={{ color: "var(--down)" }}>{d.low.toFixed(0)}</span></span>
      </div>
      <div style={{ marginTop: 6 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.72rem",
          color: d.log_return >= 0 ? "var(--up)" : "var(--down)",
        }}>
          {d.log_return >= 0 ? "+" : ""}{(d.log_return * 100).toFixed(3)}%
        </span>
        <span style={{
          marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: "0.72rem",
          color: stateColor(d.state),
        }}>
          {d.state === 1 ? "↑ Up" : d.state === 2 ? "↓ Down" : "→ Stagnant"}
        </span>
      </div>
    </div>
  );
}

export default function NiftyChart({ data }: Props) {
  if (!data.length) return (
    <div className="glass" style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "var(--radius)" }} />
    </div>
  );

  return (
    <div className="glass" style={{ padding: "20px 20px 12px" }}>
      <div className="section-label" style={{ marginBottom: 16 }}>NIFTY 50 — LAST 60 DAYS</div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
            tickLine={false} axisLine={false}
            tickFormatter={v => v.slice(5)}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone" dataKey="close"
            stroke="var(--accent)" strokeWidth={2}
            fill="url(#niftyGrad)"
            dot={false} activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--bg)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
