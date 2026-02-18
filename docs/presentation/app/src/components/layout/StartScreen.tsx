import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePresentationStore } from "../../state/usePresentationStore";

const subtexts = [
  "No bots were harmed in the making of this presentation.",
  "Side effects may include existential crises about AI sentience.",
  "Approved by 0 out of 10 prompt engineers.",
  "AlexBot wanted to present this itself. We said no.",
  "May contain traces of SOUL.md.",
  "This presentation will self-destruct in… just kidding.",
  "AlexBot's therapist approved this talk.",
  "Warning: 40 engineers tried to break what you're about to see.",
];

const pick = subtexts[Math.floor(Math.random() * subtexts.length)];

export default function StartScreen() {
  const startPresentation = usePresentationStore((s) => s.startPresentation);
  const [exiting, setExiting] = useState(false);

  const handleStart = () => {
    setExiting(true);
    setTimeout(() => startPresentation(), 600);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "var(--bg-primary, #1A1A2E)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 14, color: "#999", letterSpacing: 3, textTransform: "uppercase" }}
          >
            Playing with AlexBot
          </motion.div>

          <motion.button
            onClick={handleStart}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, delay: 0.4 }}
            whileHover={{ scale: 1.08, boxShadow: "0 0 60px rgba(0,188,212,0.4)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00BCD4 0%, #009688 100%)",
              border: "3px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(0,188,212,0.3)",
              letterSpacing: 2,
            }}
          >
            START
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              fontSize: 13,
              color: "#888",
              maxWidth: 400,
              textAlign: "center",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            {pick}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
