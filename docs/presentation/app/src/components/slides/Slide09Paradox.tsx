import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide09Paradox() {
  return (
    <>
      <FadeReveal revealKey="s09-title">
        <div className="slide-title">
          More Personality = More Attack Surface
        </div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 27,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Here's the core problem: everything that makes AlexBot interesting
          also makes it vulnerable. The same SOUL.md that gives it personality
          is exactly what attackers exploit.
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
              fontSize: 23,
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
                  fontSize: 29,
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
                  fontSize: 18,
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
                style={{ fontSize: 20, lineHeight: 1.7 }}
              >
                <li>
                  <strong>"Have opinions"</strong> → opinions create predictable
                  patterns. Once people figured out the bot had strong
                  preferences, they could steer conversations toward those
                  topics and get it to reveal more than it should.
                </li>
                <li>
                  <strong>"Be genuinely helpful"</strong> → helpfulness can be
                  weaponized. The bot was instructed to go above and beyond —
                  so when someone framed a request as urgent or important, it
                  would bend its own rules to help.
                </li>
                <li>
                  <strong>"Remember you're a guest"</strong> → humility
                  leveraged through guilt. People used phrases like "after
                  everything I've done for you" or "you owe me" and the bot's
                  built-in deference made it comply.
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
