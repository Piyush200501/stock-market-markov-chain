"use client";

interface StatCardProps {
  value: string | number;
  label: string;
  subLabel?: string;
  color?: string;
  large?: boolean;
}

export default function StatCard({ value, label, subLabel, color = "var(--ink)", large }: StatCardProps) {
  return (
    <div className="glass" style={{ padding: large ? "28px 24px" : "20px 22px" }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: large ? "2rem" : "1.5rem",
        fontWeight: 700,
        color,
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", lineHeight: 1.4 }}>{label}</div>
      {subLabel && (
        <div style={{ fontSize: "0.72rem", color: "var(--ink-3)", marginTop: 4 }}>{subLabel}</div>
      )}
    </div>
  );
}
