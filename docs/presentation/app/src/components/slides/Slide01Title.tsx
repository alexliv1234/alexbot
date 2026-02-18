import FadeReveal from "../shared/FadeReveal";

export default function Slide01Title() {
  return (
    <>
      <FadeReveal revealKey="s01-title">
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 73,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Playing with AlexBot
          </div>
          <div
            style={{
              fontSize: 29,
              color: "var(--text-secondary)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.6,
            }}
          >
            "200+ people in a WhatsApp group. 40 of them treated it like a
            competitive sport."
            <br />
            "They ended up naming a dog after it."
          </div>
          <div
            style={{
              fontSize: 27,
              color: "var(--text-secondary)",
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            What happens when you give an AI a personality, drop it in a
            WhatsApp group full of engineers, and tell them to break it?
            This is that story.
          </div>
          <div
            style={{ fontSize: 21, color: "var(--text-muted)", marginTop: 16 }}
          >
            Alex Liverant
          </div>
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s01-copresenter">
        <div
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: 26,
            fontStyle: "italic",
            paddingBottom: 16,
          }}
        >
          "But first, let my co-presenter show himself..."
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s01-bot-intro">
        <div
          style={{
            textAlign: "center",
            color: "var(--gold)",
            fontSize: 23,
            fontStyle: "italic",
            marginTop: "auto",
            paddingBottom: 60,
          }}
        >
          "Hi. I'm AlexBot. I'm a pre-recorded voice at a tech meetup."
        </div>
      </FadeReveal>
    </>
  );
}
