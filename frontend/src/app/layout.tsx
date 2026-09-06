import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MarketMind — Live Nifty 50 Markov Chain Predictor",
  description:
    "A live Markov Chain model predicting tomorrow's Nifty 50 market state (Up/Down/Stagnant) using real FII/DII institutional flow data and daily auto-training.",
  keywords: ["Nifty 50", "stock market prediction", "Markov chain", "FII DII", "Indian stock market"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${playfair.variable}`}>
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
