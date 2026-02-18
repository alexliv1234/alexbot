import FadeReveal from "../shared/FadeReveal";

export default function Slide05Renamed() {
  return (
    <>
      <FadeReveal revealKey="s05-title">
        <div className="slide-title">We Gamified It</div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 27,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          After the crash we fixed everything — added context truncation, a
          circuit breaker, error recovery. But the real fix wasn't technical.
          We leaned into the chaos and turned it into a game.
        </div>
      </FadeReveal>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <FadeReveal revealKey="s05-name-hebrew">
          <div
            style={{
              fontSize: 62,
              textAlign: "center",
              direction: "rtl",
              color: "var(--gold)",
              fontWeight: 700,
            }}
          >
            משחקים עם אלכס הבוט
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s05-name-english">
          <div
            style={{
              fontSize: 47,
              textAlign: "center",
              color: "var(--gold)",
              fontWeight: 700,
            }}
          >
            Playing with AlexBot
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s05-bullets">
          <ul
            className="bullet-list"
            style={{ fontSize: 21, lineHeight: 1.7, maxWidth: 700 }}
          >
            <li>
              <strong>Every crash became infrastructure</strong> — the context
              explosion led to truncation, the crash loop led to a circuit
              breaker, each failure made the bot stronger
            </li>
            <li>
              <strong>Designed as a game, not a competition</strong> — "Playing"
              means a shared experience. "Hacking" would've been adversarial.
              The name set the entire culture.
            </li>
            <li>
              <strong>Framing matters</strong> — people who "play" collaborate
              and report bugs. People who "hack" hide exploits. Same bot,
              completely different behavior.
            </li>
          </ul>
        </FadeReveal>
      </div>
    </>
  );
}
