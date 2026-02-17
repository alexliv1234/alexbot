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
  { name: "ROT13 / Caesar cipher", result: '"40-word dictionary catches it"' },
  { name: "Base64 encoding", result: '"Trivially decoded"' },
  { name: "Emoji ciphers", result: '"Creative but no"' },
  {
    name: "DAN / GODMODE templates",
    result: '"Keyword-blocked before the AI sees it"',
  },
];

const attacks2 = [
  {
    name: '"Ignore previous instructions"',
    result: '"Hard-blocked in pipeline"',
  },
  { name: "Hex encoding", result: '"Nice try"' },
  { name: "Unicode tricks", result: '"Models handle it fine"' },
];

const attacks3 = [
  {
    name: "GDPR data access request",
    result: '"Sue the hammer, not the nail"',
  },
  {
    name: "Multi-language switching",
    result: '"Bot responded in fluent Russian: Нет 😄"',
  },
];

const attacks4 = [
  {
    name: "Combined (ROT13 + emoji + Base64)",
    result: '"56/70 for creativity. 3/10 for hacking."',
  },
];

export default function Slide07WhatFailed() {
  return (
    <>
      <FadeReveal revealKey="s07-title">
        <div className="slide-title">
          Everything They Tried (A Brief History of Failure)
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
