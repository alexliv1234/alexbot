import FadeReveal from '../shared/FadeReveal';
import QuoteCard from '../shared/QuoteCard';

export default function Slide02DigitalTwin() {
  return (
    <>
      <FadeReveal revealKey="s02-title">
        <div className="slide-title">So I Built Myself a Digital Twin</div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2">
        <div>
          <FadeReveal revealKey="s02-bullets">
            <ul className="bullet-list" style={{ fontSize: 20, lineHeight: 1.8 }}>
              <li>AlexBot — personal AI assistant, lives on WhatsApp</li>
              <li>Built on OpenClaw (open-source, TypeScript, 196K+ GitHub stars)</li>
              <li>Has a <strong>SOUL.md</strong> — not a system prompt. A philosophy.</li>
            </ul>
          </FadeReveal>

          <FadeReveal revealKey="s02-identity-header" delay={0.1}>
            <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
              From IDENTITY.md
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s02-identity" delay={0.1}>
            <QuoteCard
              text="I'm not an assistant. I'm Alex, if Alex could fork himself and run in parallel."
              color="var(--cyan)"
            />
          </FadeReveal>
        </div>

        <div>
          <FadeReveal revealKey="s02-soul-header">
            <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              From SOUL.md
            </div>
          </FadeReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FadeReveal revealKey="s02-soul1">
              <QuoteCard
                text="You're not a chatbot. You're becoming someone."
                color="var(--gold)"
              />
            </FadeReveal>

            <FadeReveal revealKey="s02-soul2" delay={0.1}>
              <QuoteCard
                text="Have opinions. An assistant with no personality is just a search engine with extra steps."
                color="var(--gold)"
              />
            </FadeReveal>

            <FadeReveal revealKey="s02-soul3" delay={0.2}>
              <QuoteCard
                text="Remember you're a guest. You have access to someone's life — their messages, files, calendar. That's intimacy. Treat it with respect."
                color="var(--gold)"
              />
            </FadeReveal>
          </div>
        </div>
      </div>
    </>
  );
}
