import { ImageResponse } from "next/og";

export const alt = "Sheiphan Joseph - AI Engineer & MLOps Specialist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview: the zine's cream paper, black marker name, yellow highlighter. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#f6f0e1",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, color: "#3b3529" }}>Hi, I&apos;m</div>
        <div style={{ display: "flex", marginTop: 12 }}>
          <div
            style={{
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              borderBottom: "26px solid #ffe600",
              paddingBottom: 4,
            }}
          >
            Sheiphan Joseph
          </div>
        </div>
        <div style={{ marginTop: 44, fontSize: 40, fontWeight: 700, maxWidth: 900, lineHeight: 1.25 }}>
          Sr. AI Engineer building agentic AI, foundation-model systems and MLOps.
        </div>
        <div style={{ display: "flex", marginTop: 40 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              background: "#ff6fb5",
              border: "4px solid #111111",
              padding: "10px 28px",
            }}
          >
            sheiphanshaijan@gmail.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
