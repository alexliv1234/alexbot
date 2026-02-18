import FadeReveal from "../shared/FadeReveal";
import StatCard from "../shared/StatCard";

export default function Slide14WhatsNext() {
  return (
    <>
      <FadeReveal revealKey="s14-title">
        <div className="slide-title">What's Next</div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 27,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          3 weeks in, AlexBot is still running, still learning, and still saying no.
          The experiment didn't end — it evolved.
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s14-cards">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div className="card">
            <div
              style={{
                fontSize: 18,
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              "Learning with AlexBot"
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 21,
                lineHeight: 1.5,
              }}
            >
              לומדים עם אלכס הבוט — new WhatsApp group. Same concept, different
              goal: education instead of red-teaming.
            </div>
          </div>

          <div className="card">
            <div
              style={{
                fontSize: 18,
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Open Source
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 21,
                lineHeight: 1.5,
              }}
            >
              OpenClaw framework — MIT licensed, 196K+ stars. Patterns and
              learnings from this experiment are available.
            </div>
          </div>

          <div className="card">
            <div
              style={{
                fontSize: 18,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              109 Pending Suggestions
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 21,
                lineHeight: 1.5,
              }}
            >
              From the playing group — still being implemented. People send
              improvement ideas now, not attacks.
            </div>
          </div>

          <div className="card">
            <div
              style={{
                fontSize: 18,
                color: "var(--purple)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              The Bot Keeps Learning
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 21,
                lineHeight: 1.5,
              }}
            >
              Writes its own memory files, updates its own goals, scores its own
              interactions. The experiment is ongoing.
            </div>
          </div>
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s14-stats">
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          <StatCard number="15" label="days alive" color="var(--green)" />
          <StatCard
            number="9,400+"
            label="session files (520MB)"
            color="var(--cyan)"
          />
          <StatCard
            number="200+"
            label="participants (40 super-active)"
            color="var(--gold)"
          />
          <StatCard
            number="50+"
            label="security incidents"
            color="var(--red)"
          />
          <StatCard
            number="0"
            label="complete jailbreaks"
            color="var(--purple)"
          />
        </div>
      </FadeReveal>
    </>
  );
}
