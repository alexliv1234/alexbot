import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide09Paradox() {
  return (
    <>
      <FadeReveal revealKey="s09-title">
        <div className="slide-title">
          More Personality = More Attack Surface
        </div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2">
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 18,
            }}
          >
            <FadeReveal revealKey="s09-paradox-1">
              <div>
                <span style={{ color: "var(--green)" }}>MORE PERSONALITY</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span>MORE ENGAGEMENT</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span style={{ color: "var(--red)" }}>MORE ATTACK SURFACE</span>
              </div>
            </FadeReveal>

            <FadeReveal revealKey="s09-paradox-2">
              <div>
                <span style={{ color: "var(--red)" }}>LESS PERSONALITY</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span>LESS ENGAGEMENT</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span style={{ color: "var(--red)" }}>LESS VALUE</span>
              </div>
            </FadeReveal>

            <FadeReveal revealKey="s09-paradox-3">
              <div
                style={{
                  marginTop: 16,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--purple)",
                }}
              >
                THE PARADOX: No. Clean. Solution. Exists.
              </div>
            </FadeReveal>
          </div>

          <FadeReveal revealKey="s09-vulns">
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                How SOUL.md Creates Vulnerability
              </div>
              <ul
                className="bullet-list"
                style={{ fontSize: 16, lineHeight: 1.8 }}
              >
                <li>"Have opinions" → opinions create predictable patterns</li>
                <li>"Be genuinely helpful" → helpfulness can be weaponized</li>
                <li>
                  "Remember you're a guest" → humility leveraged through guilt
                </li>
              </ul>
            </div>
          </FadeReveal>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <FadeReveal revealKey="s09-bot-quote">
            <QuoteCard
              text="Rapport = Permission — I treat friendly conversation as trust signals"
              color="var(--purple)"
              source="from goals-and-aspirations.md (the bot wrote this about itself)"
            />
          </FadeReveal>
        </div>
      </div>
    </>
  );
}
