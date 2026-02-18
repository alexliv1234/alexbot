import FadeReveal from "../shared/FadeReveal";

export default function Slide00Intro() {
  return (
    <>
      <FadeReveal revealKey="s00-title">
        <div
          style={{
            fontSize: 18,
            color: "var(--cyan)",
            textTransform: "uppercase",
            letterSpacing: 2,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Before We Begin…
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s00-name">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2 }}>
            Alex Liverant
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 20,
              color: "var(--text-secondary)",
              marginTop: 8,
            }}
          >
            Co-Founder & CTO ·{" "}
            <img
              src="/images/logo-transparent.png"
              alt="eOS"
              style={{ height: 22, verticalAlign: "middle" }}
            />{" "}
            (esh group)
          </div>
        </div>
      </FadeReveal>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <FadeReveal revealKey="s00-experience">
          <div className="card" style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                30+ years
              </span>{" "}
              in tech & startups — mostly figuring out what not to build
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s00-startups">
          <div className="card" style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                Shopping.com
              </span>{" "}
              (acquired) ·{" "}
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                DoubleVerify
              </span>{" "}
              (IPO, NASDAQ: DV)
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s00-tagline">
          <div
            style={{
              textAlign: "center",
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--gold)",
              marginTop: 20,
            }}
          >
            "rewriting the financial institutions operating playbook"
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
