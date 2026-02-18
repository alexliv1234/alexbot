import { motion, AnimatePresence } from "framer-motion";
import { usePresentationStore } from "../../state/usePresentationStore";
import { Speaker } from "../../types";
import { useState, useRef, useEffect, useCallback } from "react";

type BotVideoState = "walk-in" | "idle" | "talk" | "walk-out";

const VIDEO_SRCS: Record<BotVideoState, string> = {
  "walk-in": "/videos/entering.mp4",
  idle: "/videos/idle_loop.mp4",
  talk: "/videos/talking_loop.mp4",
  "walk-out": "/videos/exitting.mp4",
};

// Chroma-key green removal parameters
const CHROMA_TOLERANCE = 120;     // inner radius: fully transparent
const CHROMA_SOFT_EDGE = 40;      // soft falloff width for smooth edges
const CHROMA_R = 0;
const CHROMA_G = 255;
const CHROMA_B = 0;

/**
 * Plays AlexBot character videos with real-time green-screen removal.
 * Videos are loaded as <video> elements, drawn to an offscreen canvas,
 * and green pixels are made transparent via pixel manipulation.
 *
 * State machine: walk-in → idle ↔ talk → walk-out → unmount
 */
export default function SpeakerIndicator() {
  const botOnStage = usePresentationStore((s) => s.botOnStage);
  const activeSpeaker = usePresentationStore((s) => s.activeSpeaker);
  const isPlaying = usePresentationStore((s) => s.isPlaying);

  const botSpeaking =
    (activeSpeaker === Speaker.BOT || activeSpeaker === Speaker.BOTH) &&
    isPlaying;

  // showBot stays true during walk-out so the video keeps rendering until it ends
  const [showBot, setShowBot] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const currentStateRef = useRef<BotVideoState>("idle");
  const botSpeakingRef = useRef(botSpeaking);
  botSpeakingRef.current = botSpeaking;

  const loadVideo = useCallback((state: BotVideoState) => {
    const video = videoRef.current;
    if (!video) return;
    currentStateRef.current = state;
    video.src = VIDEO_SRCS[state];
    video.loop = state === "idle" || state === "talk";
    video.load();
    video.play().catch(() => {});
  }, []);

  // Walk-in when botOnStage becomes true
  useEffect(() => {
    if (botOnStage) {
      setShowBot(true);
    }
  }, [botOnStage]);

  // Once showBot is true, start walk-in or walk-out
  useEffect(() => {
    if (!showBot) return;
    const video = videoRef.current;
    if (!video) return;

    if (botOnStage) {
      loadVideo("walk-in");

      const onWalkInEnd = () => {
        video.removeEventListener("ended", onWalkInEnd);
        if (currentStateRef.current !== "walk-in") return;
        loadVideo(botSpeakingRef.current ? "talk" : "idle");
      };
      video.addEventListener("ended", onWalkInEnd);

      return () => {
        video.removeEventListener("ended", onWalkInEnd);
      };
    }

    // botOnStage went false while showBot is still true → walk-out
    loadVideo("walk-out");

    const onWalkOutEnd = () => {
      video.removeEventListener("ended", onWalkOutEnd);
      setShowBot(false);
    };
    video.addEventListener("ended", onWalkOutEnd);

    return () => {
      video.removeEventListener("ended", onWalkOutEnd);
    };
  }, [showBot, botOnStage, loadVideo]);

  // Handle idle ↔ talk transitions (only when on stage and in idle or talk state)
  useEffect(() => {
    if (!botOnStage) return;
    const state = currentStateRef.current;
    if (state !== "idle" && state !== "talk") return;

    const target = botSpeaking ? "talk" : "idle";
    if (state !== target) {
      loadVideo(target);
    }
  }, [botSpeaking, botOnStage, loadVideo]);

  // Chroma-key render loop: video → canvas with green removed
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) {
      rafRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Match canvas to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
    }

    ctx.drawImage(video, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - CHROMA_R;
      const dg = data[i + 1] - CHROMA_G;
      const db = data[i + 2] - CHROMA_B;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < CHROMA_TOLERANCE) {
        data[i + 3] = 0; // fully transparent
      } else if (dist < CHROMA_TOLERANCE + CHROMA_SOFT_EDGE) {
        // Soft edge: partial transparency for smooth borders
        const alpha = ((dist - CHROMA_TOLERANCE) / CHROMA_SOFT_EDGE) * 255;
        data[i + 3] = Math.min(data[i + 3], alpha);
        // Green spill suppression: clamp green to max of red and blue
        data[i + 1] = Math.min(data[i + 1], Math.max(data[i], data[i + 2]));
      }
    }

    ctx.putImageData(frame, 0, 0);
    rafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // Start/stop render loop
  useEffect(() => {
    if (showBot) {
      rafRef.current = requestAnimationFrame(renderFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showBot, renderFrame]);

  return (
    <AnimatePresence mode="wait">
      {showBot && (
        <motion.div
          key="bot-video"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            pointerEvents: "none",
            filter: botSpeaking ? "drop-shadow(0 0 30px #FFD700)" : "none",
          }}
        >
          {/* Hidden video element — source for canvas */}
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ display: "none" }}
          />

          {/* Visible canvas with chroma-keyed output */}
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              imageRendering: "auto",
            }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
}
