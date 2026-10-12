import { ImageResponse } from "next/og";

export const alt = "FITFLOW AI: turn followers into paying clients";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "radial-gradient(ellipse at 70% 110%, rgba(200,240,74,.28), #0a0b0d 60%)", color: "#f2f3ee", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#c8f04a", color: "#0c0e06", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>»</div>
          FITFLOW AI
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>Turn followers into</div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.1, color: "#c8f04a" }}>paying clients.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#abafa8" }}>The business OS for fitness coaches · interactive product prototype</div>
        </div>
      </div>
    ),
    size,
  );
}
