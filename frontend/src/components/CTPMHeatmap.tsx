"use client";
import { TPM } from "@/lib/api";

interface Props {
  matrix: TPM;
  title?: string;
  colorize?: boolean;
}

const STATE_LABELS = ["Up", "Down", "Stagnant"];

function cellColor(p: number): string {
  const alpha = 0.08 + p * 0.65;
  return `rgba(245, 166, 35, ${alpha.toFixed(2)})`;
}

export default function CTPMHeatmap({ matrix, title, colorize = true }: Props) {
  if (!matrix?.length) return null;

  return (
    <div>
      {title && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.72rem",
          color: "var(--ink-2)", marginBottom: 10, fontWeight: 600,
        }}>
          {title}
        </div>
      )}
      <table className="tpm-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 10px", fontSize: "0.68rem", color: "var(--ink-3)" }}>From → To</th>
            {STATE_LABELS.map(l => (
              <th key={l} style={{ fontSize: "0.68rem", color: "var(--ink-3)", padding: "8px 10px" }}>→ {l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th style={{
                textAlign: "left", padding: "9px 10px", fontSize: "0.75rem",
                color: i === 0 ? "var(--up)" : i === 1 ? "var(--down)" : "var(--stagnant)",
                fontWeight: 600, background: "var(--bg-2)",
              }}>
                {STATE_LABELS[i]} →
              </th>
              {row.map((p, j) => {
                const isMax = p === Math.max(...row);
                return (
                  <td key={j} style={{
                    background: colorize ? cellColor(p) : "transparent",
                    color: isMax ? "var(--ink)" : "var(--ink-2)",
                    fontWeight: isMax ? 700 : 400,
                    fontSize: "0.82rem",
                    padding: "9px 10px",
                    textAlign: "center",
                    border: "1px solid var(--line)",
                    transition: "background 0.3s",
                  }}>
                    {(p * 100).toFixed(1)}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
