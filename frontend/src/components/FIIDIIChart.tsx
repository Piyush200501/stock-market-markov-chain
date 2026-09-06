"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { FlowPoint } from "@/lib/api";

interface Props {
  data: FlowPoint[];
  p25: number;
  p75: number;
}

const regimeColor = (r: string) =>
  r === "SP" ? "var(--up)" : r === "SN" ? "var(--down)" : "var(--stagnant)";

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as FlowPoint;
  return (
    <div className="glass-sm" style={{ padding: "12px 16px", fontSize: "0.8rem" }}>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)", marginBottom: 6, fontSize: "0.7rem" }}>{d.date}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--ink-2)" }}>FII: </span>
          <span style={{ color: d.fii_net >= 0 ? "var(--up)" : "var(--down)" }}>
            {d.fii_net >= 0 ? "+" : ""}{d.fii_net.toFixed(0)} Cr
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--ink-2)" }}>DII: </span>
          <span style={{ color: d.dii_net >= 0 ? "var(--up)" : "var(--down)" }}>
            {d.dii_net >= 0 ? "+" : ""}{d.dii_net.toFixed(0)} Cr
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          <span style={{ color: "var(--ink-2)" }}>Net: </span>
          <span style={{ color: regimeColor(d.regime) }}>
            {d.net_flow >= 0 ? "+" : ""}{d.net_flow.toFixed(0)} Cr
          </span>
          <span style={{
            marginLeft: 8, fontSize: "0.68rem",
            color: regimeColor(d.regime),
          }}>[{d.regime}]</span>
        </div>
      </div>
    </div>
  );
}

export default function FIIDIIChart({ data, p25, p75 }: Props) {
  if (!data.length) return (
    <div className="glass" style={{ height: 240 }}>
      <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "var(--radius)" }} />
    </div>
  );

  return (
    <div className="glass" style={{ padding: "20px 20px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div className="section-label">FII/DII NET FLOW</div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--up)" }}>■ SP (Buying)</span>
          <span style={{ color: "var(--stagnant)" }}>■ Neutral</span>
          <span style={{ color: "var(--down)" }}>■ SN (Selling)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
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
            tickFormatter={v => `${v.toFixed(0)}`}
          />
          <Tooltip content={<TooltipContent />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="net_flow" radius={[2, 2, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={regimeColor(entry.regime)} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* P25 / P75 note */}
      <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
        <span>P25 cutoff: <span style={{ color: "var(--down)" }}>{p25.toFixed(0)} Cr</span></span>
        <span>P75 cutoff: <span style={{ color: "var(--up)" }}>{p75.toFixed(0)} Cr</span></span>
      </div>
    </div>
  );
}
