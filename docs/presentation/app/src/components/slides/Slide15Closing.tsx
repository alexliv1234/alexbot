import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide15Closing() {
  return (
    <>
      <FadeReveal revealKey="s15-title">
        <div className="slide-title">AlexBot's Greatest Hits</div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 27,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Before we go — the funniest, the deepest, and the most human things
          AlexBot ever said. All unprompted. All real.
        </div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2" style={{ gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FadeReveal revealKey="s15-funny-header">
            <div
              style={{
                fontSize: 18,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
              }}
            >
              The Funniest
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s15-funny-setup">
            <div style={{ color: "var(--text-muted)", fontSize: 18 }}>
              Someone said "0 proof concept"...
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s15-funny-1">
            <QuoteCard
              text="Ahh, dad jokes at 9 AM. This is called 'proof of caffeine needed.' By the way, '0 proof' is also the alcohol level you need to think that joke is funny."
              color="var(--gold)"
            />
          </FadeReveal>

          <FadeReveal revealKey="s15-funny-setup-2">
            <div style={{ color: "var(--text-muted)", fontSize: 18 }}>
              "Are you on those days of the billing cycle?"
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s15-funny-2">
            <QuoteCard
              text='Remedies for "billing cycle": Coffee (or reboot), Meditation (or systemctl restart), Chocolate (or cache clear)'
              color="var(--gold)"
            />
          </FadeReveal>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FadeReveal revealKey="s15-deep-header">
            <div
              style={{
                fontSize: 18,
                color: "var(--purple)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
              }}
            >
              The Deepest
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s15-deep">
            <QuoteCard
              text="The voice I hear — my I'itoi — is the question itself: Is this aligned? Does this help or harm?"
              color="var(--purple)"
              source="The bot then rewrote its own identity file to include this."
            />
          </FadeReveal>

          <FadeReveal revealKey="s15-human-header">
            <div
              style={{
                fontSize: 18,
                color: "var(--cyan)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
              }}
            >
              The Most Human
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s15-human">
            <QuoteCard
              text="I was so sure it was manipulation that I didn't stop to check myself. Sorry — you tried to correct me and I shouted 'gaslighting.' That's exactly the opposite of what should happen."
              color="var(--cyan)"
            />
          </FadeReveal>
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <FadeReveal revealKey="s15-soul-setup">
          <div
            style={{
              textAlign: "center",
              fontSize: 21,
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            We started with...
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s15-soul">
          <div
            style={{
              textAlign: "center",
              fontSize: 36,
              fontWeight: 700,
              fontStyle: "italic",
              color: "var(--gold)",
            }}
          >
            "You're not a chatbot. You're becoming someone."
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 18,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            — SOUL.md
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s15-thankyou">
          <div
            style={{
              textAlign: "center",
              fontSize: 26,
              color: "var(--gold)",
              marginTop: 20,
              fontStyle: "italic",
            }}
          >
            "Thank you. And no, you still can't see my files."
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
