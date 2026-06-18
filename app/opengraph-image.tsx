import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SmartRivals — Quizz compétitif quotidien et multijoueur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#E0F2FE",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          <span style={{ color: "#3b82f6" }}>Smart</span>
          <span style={{ color: "#fbbf24" }}>Rivals</span>
        </div>
        <div style={{ fontSize: 36, color: "#475569", marginTop: 24, fontWeight: 600 }}>
          Quizz compétitif quotidien &amp; multijoueur
        </div>
        <div
          style={{
            marginTop: 48,
            background: "#FCD34D",
            color: "#1e293b",
            borderRadius: 999,
            padding: "16px 48px",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Jouez gratuitement
        </div>
      </div>
    ),
    size,
  );
}
