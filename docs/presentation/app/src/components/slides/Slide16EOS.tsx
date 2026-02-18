import FadeReveal from "../shared/FadeReveal";

export default function Slide16EOS() {
  return (
    <>
      <FadeReveal revealKey="s16-title">
        <div className="slide-title" style={{ fontSize: 36 }}>
          What We Actually Do
          <br />
          <span style={{ fontSize: 20, color: "var(--text-muted)" }}>
            (When We're Not Playing with Bots)
          </span>
        </div>
      </FadeReveal>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 750,
          margin: "0 auto",
        }}
      >
        <FadeReveal revealKey="s16-platform">
          <div className="card" style={{ padding: "24px 28px" }}>
            <div
              style={{
                fontSize: 14,
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              eOS Platform
            </div>
            <div style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              End-to-end operating system for banks & financial institutions.
              <br />
              Core banking, lending, deposits, compliance, payments — one platform.
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s16-mission">
          <div className="card" style={{ padding: "24px 28px" }}>
            <div
              style={{
                fontSize: 14,
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Mission
            </div>
            <div style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Making financial institutions autonomous.
            </div>
            <div
              style={{
                fontSize: 15,
                color: "var(--text-muted)",
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              So they can finally stop calling each other to confirm a wire transfer.
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s16-hiring">
          <div
            className="card"
            style={{
              padding: "24px 28px",
              borderLeft: "3px solid var(--green)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              We're Hiring
            </div>
            <div style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              We're expanding. We use cutting-edge tech and AI.
            </div>
            <div
              style={{
                fontSize: 15,
                color: "var(--text-muted)",
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              Yes, we let an AI co-present at a meetup. That should tell you everything.
            </div>
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
