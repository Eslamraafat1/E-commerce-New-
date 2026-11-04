import { ImageResponse } from "next/og";
import { locales, store } from "@/config/store";

/**
 * Branded social share image (1200×630) used by every page that doesn't set its own
 * (product pages override it with the product photo). Latin-only text keeps it renderable
 * with the built-in font, so both locales share the same artwork.
 */
export const alt = `${store.name} — ${store.tagline.en}: a bilingual (English / Arabic) concept storefront`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image() {
  const { accent, accent2 } = store.brandColors;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "72px 80px", background: "#0a0a0c", color: "#f3f0e8", fontFamily: "sans-serif",
          backgroundImage: `radial-gradient(circle at 85% 20%, ${accent}33 0%, transparent 45%), radial-gradient(circle at 70% 95%, ${accent2}33 0%, transparent 40%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <path d="M3 5 L16 28" stroke="#f3f0e8" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            <path d="M29 5 L16 28" stroke="#f3f0e8" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            <circle cx="16" cy="5.5" r="3" fill={accent} />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.04em" }}>{store.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em" }}>{`${store.tagline.en}.`}</div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#b9b6ad", maxWidth: 900 }}>
            A cinematic, multi-category concept store in English and Arabic (RTL).
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26 }}>
          {["Fashion", "Electronics", "Home", "Beauty", "EN / AR"].map((x, i) => (
            <div key={x} style={{ display: "flex", padding: "10px 24px", borderRadius: 999, border: "2px solid #3a3a40", color: i === 4 ? "#0a0a0c" : "#f3f0e8", background: i === 4 ? accent : "transparent" }}>{x}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
