import FadeReveal from '../shared/FadeReveal';
import StatCard from '../shared/StatCard';

export default function Slide04Crash() {
  return (
    <>
      <FadeReveal revealKey="s04-title">
        <div className="slide-title" style={{ color: 'var(--red)' }}>
          February 6: The Day AlexBot Died
        </div>
      </FadeReveal>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ display: 'flex', gap: 40 }}>
          <FadeReveal revealKey="s04-tokens">
            <StatCard number="162,000" label="tokens consumed" color="var(--red)" />
          </FadeReveal>

          <FadeReveal revealKey="s04-offline" delay={0.2}>
            <StatCard number="4+" label="hours offline" color="var(--red)" />
          </FadeReveal>
        </div>

        <FadeReveal revealKey="s04-context">
          <div style={{ maxWidth: 600, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1.6 }}>
            Someone sent a message so massive it consumed the entire context window.
            Maximum capacity: 100,000 tokens. They sent 162,000.
            The bot didn't just crash — it couldn't recover.
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s04-changed">
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 16 }}>
            "We had a choice: shut it down, or do something stupid.
            <span style={{ color: 'var(--gold)' }}> We chose stupid.</span>"
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
