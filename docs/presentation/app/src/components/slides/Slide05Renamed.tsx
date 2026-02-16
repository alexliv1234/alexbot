import FadeReveal from '../shared/FadeReveal';

export default function Slide05Renamed() {
  return (
    <>
      <FadeReveal revealKey="s05-title">
        <div className="slide-title">We Gamified It</div>
      </FadeReveal>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <FadeReveal revealKey="s05-name-hebrew">
          <div style={{ fontSize: 48, textAlign: 'center', direction: 'rtl', color: 'var(--gold)', fontWeight: 700 }}>
            משחקים עם אלכס הבוט
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s05-name-english">
          <div style={{ fontSize: 36, textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>
            Playing with AlexBot
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s05-bullets">
          <ul className="bullet-list" style={{ fontSize: 20, lineHeight: 2, maxWidth: 700 }}>
            <li>From day one — designed as a game, not a competition</li>
            <li>"Playing" = shared experience. "Hacking" would've been adversarial.</li>
            <li>Framing matters. The name set the tone from the start.</li>
          </ul>
        </FadeReveal>
      </div>
    </>
  );
}
