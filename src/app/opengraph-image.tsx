import { ImageResponse } from "next/og";

export const alt = "FITFLOW AI: every lead followed up, every client kept";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "radial-gradient(ellipse at 70% 110%, rgba(200,240,74,.28), #0a0b0d 60%)", color: "#f2f3ee", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <svg width="56" height="56" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#c8f04a" /><path d="M15 7.3C15 6.6 14.4 6.1 13.7 6.2L9.9 6.9C8.9 7.1 8.2 7.9 8.2 8.9V9.7C8.2 10.6 8.9 11.4 9.8 11.4H13.8C14.5 11.4 15 10.9 15 10.2Z" fill="#0c0e06" /><path d="M15 14.2C15 13.5 14.5 13 13.8 13H9.9C8.9 13 8.3 13.8 8.4 14.8L8.6 16.3C8.7 17.3 9.4 18 10.3 18H13.8C14.5 18 15 17.5 15 16.8Z" fill="#0c0e06" /><path d="M15 20.8C15 20.1 14.5 19.6 13.8 19.6H10.4C9.4 19.6 8.8 20.4 9 21.4L9.5 23.2C9.9 24.8 11.2 25.9 12.9 26.1L13.7 26.2C14.4 26.3 15 25.7 15 25Z" fill="#0c0e06" /><g transform="matrix(-1 0 0 1 32 0)"><path d="M15 7.3C15 6.6 14.4 6.1 13.7 6.2L9.9 6.9C8.9 7.1 8.2 7.9 8.2 8.9V9.7C8.2 10.6 8.9 11.4 9.8 11.4H13.8C14.5 11.4 15 10.9 15 10.2Z" fill="#0c0e06" /><path d="M15 14.2C15 13.5 14.5 13 13.8 13H9.9C8.9 13 8.3 13.8 8.4 14.8L8.6 16.3C8.7 17.3 9.4 18 10.3 18H13.8C14.5 18 15 17.5 15 16.8Z" fill="#0c0e06" /><path d="M15 20.8C15 20.1 14.5 19.6 13.8 19.6H10.4C9.4 19.6 8.8 20.4 9 21.4L9.5 23.2C9.9 24.8 11.2 25.9 12.9 26.1L13.7 26.2C14.4 26.3 15 25.7 15 25Z" fill="#0c0e06" /></g></svg>
          FITFLOW AI
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>Every lead followed up.</div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.1, color: "#c8f04a" }}>Every client kept.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#abafa8" }}>The follow-up engine for fitness creators · interactive product prototype</div>
        </div>
      </div>
    ),
    size,
  );
}
