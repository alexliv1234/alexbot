import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide02DigitalTwin() {
  return (
    <>
      <FadeReveal revealKey="s02-title">
        <div className="slide-title">So I Built Myself a Digital Twin</div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Not a chatbot — a digital version of me. It has my voice, my
          opinions, and a philosophy file that tells it who it is.
        </div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2">
        <div>
          <FadeReveal revealKey="s02-bullets">
            <ul
              className="bullet-list"
              style={{ fontSize: 16, lineHeight: 1.7 }}
            >
              <li>
                <strong>It all started 3 weeks ago</strong> — everything you're
                about to see happened in just 3 weeks
              </li>
              <li>
                <strong>AlexBot</strong> — personal AI assistant that lives on
                WhatsApp, talks to 200+ people, and thinks it's me
              </li>
              <li>
                <strong>Built on OpenClaw</strong> — open-source TypeScript
                framework, 196K+ GitHub stars. The engine under the hood.
              </li>
              <li>
                Has a <strong>SOUL.md</strong> — not a system prompt, a
                philosophy. It defines who the bot is, what it believes, and
                how it should behave.
              </li>
            </ul>
          </FadeReveal>

          <FadeReveal revealKey="s02-identity-header" delay={0.1}>
            <div
              style={{
                marginTop: 24,
                fontSize: 14,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
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
            <div
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              From SOUL.md
            </div>
          </FadeReveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
