"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/",           label: "Dashboard" },
  { href: "/analytics",  label: "Markov Analytics" },
  { href: "/simulate",   label: "Path Simulator" },
  { href: "/flows",      label: "FII/DII Flows" },
  { href: "/accuracy",   label: "Accuracy Tracker" },
  { href: "/about",      label: "Research Hub" },
];

export default function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8, 11, 18, 0.90)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
        
        {/* Brand */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), #E8920A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
            boxShadow: "0 0 16px var(--accent-glow)",
          }}>
            📈
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Market<span style={{ color: "var(--accent)" }}>Mind</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              NIFTY 50 MARKOV PREDICTOR
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="desktop-nav">
          {LINKS.map(l => {
            const isActive = path === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                padding: "8px 14px",
                borderRadius: 8,
                color: isActive ? "var(--accent)" : "var(--ink-2)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                border: isActive ? "1px solid rgba(245, 166, 35, 0.25)" : "1px solid transparent",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s ease",
              }}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Live Market Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }} className="desktop-nav">
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-2)", border: "1px solid var(--line)",
            padding: "5px 12px", borderRadius: 20, fontSize: "0.72rem",
            fontFamily: "var(--font-mono)", color: "var(--ink-2)"
          }}>
            <span className="pulse-dot" />
            <span>AUTO-SYNC 18:30 IST</span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle Navigation Menu"
          style={{
            display: "none", background: "none", border: "none",
            color: "var(--ink-2)", cursor: "pointer", fontSize: 24,
            padding: 4,
          }}
          className="mobile-menu-btn"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div style={{
          borderTop: "1px solid var(--line)",
          background: "var(--bg-1)",
          padding: "16px 24px 24px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              padding: "11px 16px",
              borderRadius: 8,
              color: path === l.href ? "var(--accent)" : "var(--ink-2)",
              background: path === l.href ? "var(--accent-dim)" : "transparent",
              border: path === l.href ? "1px solid rgba(245, 166, 35, 0.2)" : "none",
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{
            marginTop: 10, display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", fontSize: "0.75rem", fontFamily: "var(--font-mono)",
            color: "var(--ink-3)", borderTop: "1px solid var(--line)"
          }}>
            <span className="pulse-dot" /> Auto Daily Scrape: 18:30 IST
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
