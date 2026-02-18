import FadeReveal from "../shared/FadeReveal";

const violet = "#6356E5";

export default function Slide16EOS() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        maxWidth: 800,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* Step 1: Logo + Headline */}
      <FadeReveal revealKey="s16-logo">
        <div style={{ textAlign: "center" }}>
          <img
            src="/images/logo-transparent.png"
            alt="eOS logo"
            style={{ height: 80, marginBottom: 16 }}
          />
          <div
            className="slide-title"
            style={{ fontSize: 32, lineHeight: 1.3 }}
          >
            Building the Operating System
            <br />
            for Financial Institutions
          </div>
        </div>
      </FadeReveal>

      {/* Step 2: The Connection */}
      <FadeReveal revealKey="s16-connection">
        <div
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 650,
            borderLeft: `3px solid ${violet}`,
            paddingLeft: 20,
          }}
        >
          AlexBot isn't a side project — it's how we think. We bring this
          AI-native mindset to modernizing financial infrastructure.
        </div>
      </FadeReveal>

      {/* Step 3: What eOS Does */}
      <FadeReveal revealKey="s16-what">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              color: violet,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            What We Do
          </div>
          <div
            style={{
              fontSize: 17,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 600,
            }}
          >
            End-to-end SaaS platform for autonomous financial operations.
            <br />
            Core banking, lending, deposits, compliance, payments — one system.
            <br />
            <span style={{ color: "var(--text-muted)", fontSize: 15 }}>
              Launched in Israel · Expanding to the US
            </span>
          </div>
        </div>
      </FadeReveal>

      {/* Step 4: Positions + QR + CTA */}
      <FadeReveal revealKey="s16-hiring">
        <div style={{ textAlign: "center" }}>
          <img
            src="/images/hiring.png"
            alt="We're Hiring at eOS"
            style={{
              width: 174,
              borderRadius: 12,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: violet,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Open Positions
          </div>
          <div
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              lineHeight: 2,
            }}
          >
            Product Security Architect · Senior Frontend · Senior DevOps ·
            Product Manager
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginTop: 24,
            }}
          >
            <img
              src="/images/qrcode.png"
              alt="QR code to careers page"
              style={{
                width: 130,
                height: 130,
                borderRadius: 8,
              }}
            />
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: 16,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Scan to see open positions
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                comeet.com/jobs/esh/87.003
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 16,
              color: "var(--text-muted)",
              fontStyle: "italic",
              marginTop: 28,
            }}
          >
            If you let an AI co-present at a meetup, imagine what we'll let you
            build.
          </div>
        </div>
      </FadeReveal>
    </div>
  );
}
