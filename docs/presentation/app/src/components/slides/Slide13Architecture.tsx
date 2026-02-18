import { Fragment } from "react";
import FadeReveal from "../shared/FadeReveal";

const cyan = "var(--cyan)";
const muted = "var(--text-muted)";

const sectionLabel: React.CSSProperties = {
  fontSize: 17,
  color: cyan,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  marginBottom: 10,
  fontWeight: 700,
};

const agentRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "100px 1fr",
  gap: 6,
  fontSize: 20,
  padding: "6px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const pipeBox: React.CSSProperties = {
  padding: "7px 12px",
  background: "rgba(0,188,212,0.12)",
  borderRadius: 6,
  fontSize: 18,
  textAlign: "center",
};

const arrow: React.CSSProperties = {
  color: cyan,
  fontSize: 21,
  textAlign: "center",
};

const loopStep: React.CSSProperties = {
  padding: "6px 14px",
  background: "rgba(0,188,212,0.10)",
  borderRadius: 6,
  fontSize: 18,
  fontWeight: 600,
};

const loopArrow: React.CSSProperties = {
  color: cyan,
  fontSize: 23,
};

function Agent({
  name,
  model,
  purpose,
}: {
  name: string;
  model: string;
  purpose: string;
}) {
  return (
    <div style={agentRow}>
      <strong style={{ color: cyan }}>{name}</strong>
      <span>
        <span style={{ color: muted }}>{model}</span> — {purpose}
      </span>
    </div>
  );
}

export default function Slide13Architecture() {
  return (
    <>
      <FadeReveal revealKey="s13-title">
        <div className="slide-title">Under the Hood</div>
        <div
          style={{
            fontSize: 21,
            color: muted,
            marginTop: -4,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          How AlexBot learns, defends, and optimizes itself
        </div>
      </FadeReveal>

      {/* Two-column: Agents + Security */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Left: Agents */}
        <FadeReveal revealKey="s13-agents">
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={sectionLabel}>Multi-Agent Architecture</div>
            <div style={{ fontSize: 17, color: muted, marginBottom: 8, fontStyle: "italic" }}>
              Different conversations need different brains — each channel routes to a specialized agent with its own model and personality.
            </div>
            <Agent
              name="Main"
              model="Claude Opus 4.5"
              purpose="Personal assistant, complex tasks"
            />
            <Agent
              name="Fast"
              model="Claude Sonnet 4.5"
              purpose="Playing group, scoring, games"
            />
            <Agent
              name="Learning"
              model="Sonnet → Gemini Flash"
              purpose="Education group"
            />
            <Agent
              name="Bot Handler"
              model="Sonnet → Local LLM"
              purpose="Bot-to-bot DMs"
            />
          </div>
        </FadeReveal>

        {/* Right: Security Pipeline */}
        <FadeReveal revealKey="s13-pipeline">
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={sectionLabel}>Security Pipeline</div>
            <div style={{ fontSize: 17, color: muted, marginBottom: 8, fontStyle: "italic" }}>
              Every message passes through 3 layers before reaching an agent — rate limiting, prompt injection detection, and a circuit breaker that auto-recovers.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "stretch",
              }}
            >
              <div style={pipeBox}>
                Incoming Message
              </div>
              <div style={arrow}>↓</div>
              <div style={pipeBox}>
                <strong>Group Guardian</strong>
                <span style={{ color: muted, fontSize: 16 }}>
                  {" "}
                  — rate limit, heat scores
                </span>
              </div>
              <div style={arrow}>↓</div>
              <div style={pipeBox}>
                <strong>Prompt Protection</strong>
                <span style={{ color: muted, fontSize: 16 }}>
                  {" "}
                  — encoding detection, tool blocking
                </span>
              </div>
              <div style={arrow}>↓</div>
              <div style={pipeBox}>
                <strong>Circuit Breaker</strong>
                <span style={{ color: muted, fontSize: 16 }}>
                  {" "}
                  — error humor, auto-reset, owner alerts
                </span>
              </div>
              <div style={arrow}>↓</div>
              <div style={pipeBox}>Agent</div>
            </div>
          </div>
        </FadeReveal>
      </div>

      {/* Self-Improvement Loop */}
      <FadeReveal revealKey="s13-loop">
        <div
          className="card"
          style={{
            padding: "14px 16px",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          <div style={sectionLabel}>Self-Improvement Loop</div>
          <div style={{ fontSize: 17, color: muted, marginBottom: 8, fontStyle: "italic" }}>
            Every failure becomes infrastructure. When the same attack works twice, it stops being a prompt rule and becomes a script.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={loopStep}>Action</span>
            <span style={loopArrow}>→</span>
            <span style={loopStep}>Observe</span>
            <span style={loopArrow}>→</span>
            <span style={loopStep}>Reflect</span>
            <span style={loopArrow}>→</span>
            <span style={loopStep}>Document</span>
            <span style={loopArrow}>→</span>
            <span style={loopStep}>Improve</span>
            <span style={loopArrow}>↩</span>
          </div>
          <div
            style={{
              fontSize: 17,
              color: muted,
              marginTop: 10,
              fontStyle: "italic",
            }}
          >
            Infrastructure enforcement &gt; prompt enforcement — every repeated
            failure becomes a script, not just a rule
          </div>
        </div>
      </FadeReveal>

      {/* Model Optimization */}
      <FadeReveal revealKey="s13-models">
        <div
          className="card"
          style={{ padding: "14px 16px", marginTop: 12 }}
        >
          <div style={sectionLabel}>Cost-Aware Model Routing</div>
          <div style={{ fontSize: 17, color: muted, marginBottom: 8, fontStyle: "italic" }}>
            Not every message needs the most expensive model. Alex's DMs get Opus, group chat gets Sonnet, and background tasks run on free local models.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 60px",
              gap: "4px 16px",
              fontSize: 18,
            }}
          >
            {/* Header */}
            <div style={{ fontWeight: 700, color: muted, fontSize: 16 }}>
              TASK
            </div>
            <div style={{ fontWeight: 700, color: muted, fontSize: 16 }}>
              MODEL
            </div>
            <div
              style={{
                fontWeight: 700,
                color: muted,
                fontSize: 16,
                textAlign: "right",
              }}
            >
              COST
            </div>
            {/* Rows */}
            {[
              ["Alex DMs", "Opus 4.5", "$$$"],
              ["Group chat", "Sonnet 4.5", "$$"],
              ["Voice → Text", "Whisper (local)", "Free"],
              ["Text → Speech", "ElevenLabs v3", "$"],
              ["Memory search", "EmbeddingGemma 300M (local)", "Free"],
              ["Background", "Qwen 32B via Ollama (local)", "Free"],
            ].map(([task, model, cost]) => (
              <Fragment key={task}>
                <div>{task}</div>
                <div style={{ color: muted }}>{model}</div>
                <div
                  style={{
                    textAlign: "right",
                    color: cost === "Free" ? "var(--green, #4caf50)" : cyan,
                    fontWeight: 600,
                  }}
                >
                  {cost}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </FadeReveal>

      {/* Stats */}
      <FadeReveal revealKey="s13-stats">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginTop: 12,
          }}
        >
          {[
            ["9,400+", "sessions"],
            ["52+", "scripts"],
            ["15+", "cron jobs"],
            ["18", "skills"],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: cyan }}>
                {num}
              </div>
              <div style={{ fontSize: 16, color: muted }}>{label}</div>
            </div>
          ))}
        </div>
      </FadeReveal>

      {/* Closing insight */}
      <FadeReveal revealKey="s13-insight">
        <div
          style={{
            textAlign: "center",
            fontStyle: "italic",
            color: muted,
            fontSize: 20,
            marginTop: 12,
            padding: "0 40px",
          }}
        >
          "The bot that crashed on day 5 now monitors its own sessions,
          validates its own cron jobs, and documents its own failures."
        </div>
      </FadeReveal>
    </>
  );
}
