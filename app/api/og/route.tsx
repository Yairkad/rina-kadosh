import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 86400; // cache 24h

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Heebo:wght@700&display=block",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } }
    ).then((r) => r.text());
    const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
    if (!url) return null;
    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name");       // product name (optional)
  const price = searchParams.get("price");     // price per unit (optional)
  const category = searchParams.get("category"); // event type (optional)
  const img = searchParams.get("img");         // product image URL (optional)

  const fontData = await loadFont();
  const fonts = fontData
    ? [{ name: "Heebo", data: fontData, weight: 700 as const, style: "normal" as const }]
    : [];

  /* ── Product OG ──────────────────────────────────────────────── */
  if (name) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#FAF8F5",
            direction: "rtl",
            fontFamily: "Heebo, sans-serif",
          }}
        >
          {/* Product image */}
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt=""
              style={{ width: 420, height: 630, objectFit: "cover", flexShrink: 0 }}
            />
          )}

          {/* Info panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: img ? "56px 48px" : "80px 80px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {category && (
                <span style={{ fontSize: 20, color: "#C9A96E", fontWeight: 700 }}>
                  {category}
                </span>
              )}
              <h1
                style={{
                  fontSize: img ? 50 : 72,
                  fontWeight: 700,
                  color: "#1C1C1E",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {name}
              </h1>
              {price && (
                <p style={{ fontSize: 38, fontWeight: 700, color: "#C9A96E", margin: 0 }}>
                  ₪{price} ליחידה
                </p>
              )}
            </div>

            {/* Brand bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 4, height: 44, background: "#C9A96E", borderRadius: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E" }}>רינה קדוש</span>
                <span style={{ fontSize: 15, color: "#6B6B6B" }}>מוצרים מודפסים לאירועים</span>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  }

  /* ── Generic / Homepage OG ───────────────────────────────────── */
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#FAF8F5",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          fontFamily: "Heebo, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", right: -40, top: -60, width: 340, height: 340, borderRadius: "50%", background: "rgba(201,169,110,0.13)" }} />
        <div style={{ position: "absolute", left: -60, bottom: -80, width: 420, height: 420, borderRadius: "50%", background: "rgba(201,169,110,0.08)" }} />
        <div style={{ position: "absolute", right: 220, bottom: 60, width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(201,169,110,0.25)", background: "transparent" }} />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Gold top line */}
          <div style={{ width: 64, height: 3, background: "#C9A96E", borderRadius: 2, marginBottom: 32 }} />

          <h1
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: "#1C1C1E",
              margin: 0,
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            רינה קדוש
          </h1>

          <p
            style={{
              fontSize: 28,
              color: "#6B6B6B",
              margin: "28px 0 0",
              fontWeight: 400,
            }}
          >
            מוצרים מודפסים למיתוג ושדרוג אווירה באירועים
          </p>

          {/* Gold bottom line */}
          <div style={{ width: 64, height: 3, background: "#C9A96E", borderRadius: 2, marginTop: 32 }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
