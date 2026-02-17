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
              fontSize: 56,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Playing with AlexBot
          </div>
          <div
            style={{
              fontSize: 22,
              color: "var(--text-secondary)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.6,
            }}
          >
            "We invited 40 people to hack our AI."
            <br />
            "They ended up naming a dog after it."
          </div>
          <div
            style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 16 }}
          >
            Alex Liverant
          </div>
        </div>
      </FadeReveal>

      <FadeReveal revealKey="s01-bot-intro">
        <div
          style={{
            textAlign: "center",
            color: "var(--gold)",
            fontSize: 18,
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
