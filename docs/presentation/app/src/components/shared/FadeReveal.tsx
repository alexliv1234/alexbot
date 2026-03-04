import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePresentationStore, isCaptureMode } from "../../state/usePresentationStore";

interface Props {
  revealKey: string;
  children: ReactNode;
  delay?: number;
}

export default function FadeReveal({ revealKey, children, delay = 0 }: Props) {
  const revealed = usePresentationStore((s) => s.revealedKeys.has(revealKey));

  // In capture mode, render immediately without animation
  if (isCaptureMode()) {
    return (
      <div style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{ pointerEvents: revealed ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}
