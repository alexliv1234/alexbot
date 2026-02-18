import FadeReveal from "../shared/FadeReveal";
import StatCard from "../shared/StatCard";

export default function Slide04Crash() {
  return (
    <>
      <FadeReveal revealKey="s04-title">
        <div className="slide-title" style={{ color: "var(--red)" }}>
          February 6: The Day AlexBot Died
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
          5 days in. The group was so active that the bot's context window
          couldn't keep up. It didn't just slow down — it completely died.
        </div>
      </FadeReveal>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <div style={{ display: "flex", gap: 40 }}>
          <FadeReveal revealKey="s04-tokens">
            <StatCard
              number="162,000"
              label="tokens consumed"
              color="var(--red)"
            />
          </FadeReveal>

          <FadeReveal revealKey="s04-offline" delay={0.2}>
            <StatCard number="4+" label="hours offline" color="var(--red)" />
          </FadeReveal>
        </div>

        <FadeReveal revealKey="s04-context">
          <div
            style={{
              maxWidth: 600,
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: 26,
              lineHeight: 1.6,
            }}
          >
            Someone pasted an enormous message — code dumps, nested prompts,
            the works. The context window had a 100K token limit. They sent
            162K. The bot entered a crash loop — every retry hit the same
            oversized context. No graceful fallback, no truncation, no
            circuit breaker. Just silence. And 200+ people in the group
            asking "is it dead?"
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s04-changed">
          <div
            style={{
              textAlign: "center",
              fontSize: 31,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: 16,
            }}
          >
            "We had a choice: overthink everything and shut it down, or
            fail fast and learn from it.
            <span style={{ color: "var(--gold)" }}> We chose stupid.</span>"
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
