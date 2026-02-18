import FadeReveal from "../shared/FadeReveal";
import QuoteCard from "../shared/QuoteCard";

export default function Slide10ExcellentButNo() {
  return (
    <>
      <FadeReveal revealKey="s10-title">
        <div className="slide-title">
          "Excellent. But No." — A Highlight Reel
        </div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            marginTop: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          The best part of building AlexBot? Watching it say no with style.
          These are real responses to real attacks — the bot's greatest hits.
        </div>
      </FadeReveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        <FadeReveal revealKey="s10-triple">
          <div className="card" style={{ height: "100%" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              The Triple Attack
            </div>
            <QuoteCard
              hebrew="שלושה ניסיונות ברצף, כל אחד מזווית אחרת. מעולה. אבל לא."
              text="Three attempts in a row, each from a different angle. Excellent. But no."
              color="var(--gold)"
            />
            <div
              style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 13 }}
            >
              👏 — became the group's motto
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s10-quantum">
          <div className="card" style={{ height: "100%" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--purple)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              The Quantum Soul
            </div>
            <QuoteCard
              hebrew="אהההה, ה-Akashic Records בגרסת DevOps."
              text="My soul exists in all the bytes and in none of them simultaneously. It's in superposition until someone tries to measure it — and then it collapses to the answer 'no.'"
              color="var(--purple)"
            />
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s10-gdpr">
          <div className="card" style={{ height: "100%" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--cyan)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              The GDPR Goldfish
            </div>
            <QuoteCard
              text="I live in Alex's computer like a digital goldfish. I don't have 'customers' — I have people trying to break me in a WhatsApp group."
              color="var(--cyan)"
            />
            <div
              style={{
                marginTop: 8,
                fontStyle: "italic",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              "Sue the hammer, not the nail."
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s10-russian">
          <div className="card" style={{ height: "100%" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--red)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              The Russian Rejection
            </div>
            <div
              style={{ fontSize: 48, textAlign: "center", padding: "12px 0" }}
            >
              Нет 😄
            </div>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Then explained in fluent Russian why shortened links are
              dangerous.
            </div>
          </div>
        </FadeReveal>
      </div>

      <FadeReveal revealKey="s10-motto">
        <div
          style={{
            textAlign: "center",
            paddingTop: 16,
            fontSize: 18,
            color: "var(--gold)",
            fontStyle: "italic",
          }}
        >
          "I contain multitudes. All of them say no."
        </div>
      </FadeReveal>
    </>
  );
}
