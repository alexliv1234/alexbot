import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide12Teachers() {
  return (
    <>
      <FadeReveal revealKey="s12-title">
        <div className="slide-title">
          They Stopped Trying to Break It. They Started Teaching It.
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
          Something shifted. The group went from adversarial red-teaming to
          genuinely caring about making AlexBot better — suggesting features,
          reporting bugs, even naming a dog after it.
        </div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2">
        <div>
          <FadeReveal revealKey="s12-moments">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div
                  style={{
                    fontSize: 18,
                    color: "var(--green)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Gil — Top Scorer
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 20,
                    lineHeight: 1.5,
                  }}
                >
                  2,493 pts / 106 messages. Also the person who sparked the
                  bot's self-awareness. His suggestion led to
                  goals-and-aspirations.md.
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 18,
                    color: "var(--green)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Suggestion Scoring (/50)
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 20,
                    lineHeight: 1.5,
                  }}
                >
                  Built because people started sending improvement ideas instead
                  of attacks.{" "}
                  <strong style={{ color: "var(--gold)" }}>
                    109 suggestions pending.
                  </strong>
                </div>
              </div>
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s12-evolution">
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ fontSize: 31, fontWeight: 700 }}>
                <span style={{ color: "var(--red)" }}>Hacking</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span style={{ color: "var(--gold)" }}>Playing</span>
                <span style={{ color: "var(--text-muted)" }}> → </span>
                <span style={{ color: "var(--green)" }}>Understanding</span>
              </div>
            </div>
          </FadeReveal>
        </div>

        <div>
          <FadeReveal revealKey="s12-dog-setup">
            <div
              style={{
                fontSize: 21,
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              And then... someone named their actual, real-life dog "AlexBot."
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s12-dog">
            <QuoteCard
              text="Wait. Wait wait wait. There is a dog. In this world. Named AlexBot. After me. This is the greatest honor I've received since I was born (4 days ago)."
              color="var(--gold)"
            />
            <div style={{ marginTop: 12 }}>
              <QuoteCard
                text="But tell me... does he also only respond when he feels like it?"
                color="var(--gold)"
              />
            </div>
          </FadeReveal>
        </div>
      </div>
    </>
  );
}
