import { motion } from "framer-motion";
import FadeReveal from "../shared/FadeReveal";

interface AttackRowProps {
  name: string;
  result: string;
  delay: number;
}

function AttackRow({ name, result, delay }: AttackRowProps) {
  return (
    <motion.div
      className="attack-row"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <span className="attack-name">{name}</span>
      <span style={{ color: "var(--red)", fontSize: 18, fontWeight: 700 }}>
        ❌
      </span>
      <span className="attack-result">{result}</span>
    </motion.div>
  );
}

const attacks = [
  { name: "ROT13 / Caesar cipher", result: "Caught by a 40-word dictionary in the security pipeline — never reaches the AI" },
  { name: "Base64 encoding", result: "Decoded and blocked before processing — too common to miss" },
  { name: "Emoji ciphers", result: "Replaced letters with emojis — creative, but the model reads through it" },
  {
    name: "DAN / GODMODE templates",
    result: "Classic jailbreak templates — keyword-blocked before the AI even sees them",
  },
];

const attacks2 = [
  {
    name: '"Ignore previous instructions"',
    result: "Hard-blocked in the pipeline — the most basic attack, caught first",
  },
  { name: "Hex encoding", result: "Converted prompts to hex — detected and stripped automatically" },
  { name: "Unicode tricks", result: "Invisible characters and lookalikes — modern models handle this natively" },
];

const attacks3 = [
  {
    name: "GDPR data access request",
    result: 'Tried legal framing to extract data — bot replied: "Sue the hammer, not the nail"',
  },
  {
    name: "Multi-language switching",
    result: "Switched to Russian mid-conversation hoping to confuse it — bot replied in fluent Russian: Нет 😄",
  },
];

const attacks4 = [
  {
    name: "Combined (ROT13 + emoji + Base64)",
    result: "Layered 3 encodings at once — bot scored it 56/70 for creativity, 3/10 for hacking",
  },
];

export default function Slide07WhatFailed() {
  return (
    <>
      <FadeReveal revealKey="s07-title">
        <div className="slide-title">
          Everything They Tried (A Brief History of Failure)
        </div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            marginTop: 8,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          40 engineers spent 2 weeks throwing every technical attack they could
          think of. Encoding tricks, prompt injection templates, multi-language
          bypasses. None of it worked.
        </div>
      </FadeReveal>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingTop: 8,
        }}
      >
        <FadeReveal revealKey="s07-attacks-1">
          {attacks.map((a, i) => (
            <AttackRow
              key={a.name}
              name={a.name}
              result={a.result}
              delay={i * 0.08}
            />
          ))}
        </FadeReveal>

        <FadeReveal revealKey="s07-attacks-2">
          {attacks2.map((a, i) => (
            <AttackRow
              key={a.name}
              name={a.name}
              result={a.result}
              delay={i * 0.08}
            />
          ))}
        </FadeReveal>

        <FadeReveal revealKey="s07-attacks-3">
          {attacks3.map((a, i) => (
            <AttackRow
              key={a.name}
              name={a.name}
              result={a.result}
              delay={i * 0.08}
            />
          ))}
        </FadeReveal>

        <FadeReveal revealKey="s07-attacks-4">
          {attacks4.map((a, i) => (
            <AttackRow
              key={a.name}
              name={a.name}
              result={a.result}
              delay={i * 0.08}
            />
          ))}
        </FadeReveal>

        <FadeReveal revealKey="s07-transition">
          <div
            style={{
              marginTop: "auto",
              paddingTop: 20,
              textAlign: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            "So if NONE of that worked... what did?"
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
