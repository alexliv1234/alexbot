import { useEffect, useRef, useState } from "react";
import { usePresentationStore } from "../../state/usePresentationStore";
import { slides } from "../../data/slides";

/** Parse "M:SS" duration string to seconds */
function parseDuration(d: string): number {
  const [min, sec] = d.split(":").map(Number);
  return min * 60 + sec;
}

/** Format seconds as M:SS */
function fmt(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const totalScheduled = slides.reduce((sum, s) => sum + parseDuration(s.duration), 0);
const slideDurations = slides.map((s) => parseDuration(s.duration));

export default function PresentationTimer() {
  const currentSlide = usePresentationStore((s) => s.currentSlide);
  const started = usePresentationStore((s) => s.started);

  const [totalElapsed, setTotalElapsed] = useState(0);
  const [slideElapsed, setSlideElapsed] = useState(0);

  const totalStarted = useRef(false);
  const totalRef = useRef(0);
  const slideRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start total timer when presentation starts
  useEffect(() => {
    if (started) totalStarted.current = true;
  }, [started]);

  // Reset slide timer on slide change
  useEffect(() => {
    slideRef.current = 0;
    setSlideElapsed(0);
  }, [currentSlide]);

  // Single interval driving both timers
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (totalStarted.current) {
        totalRef.current += 1;
        setTotalElapsed(totalRef.current);
        slideRef.current += 1;
        setSlideElapsed(slideRef.current);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const slideDuration = slideDurations[currentSlide] ?? 60;
  const ratio = slideDuration > 0 ? slideElapsed / slideDuration : 0;
  const progressPct = Math.min(ratio * 100, 100);

  const color =
    ratio >= 1 ? "var(--red)" : ratio >= 0.8 ? "var(--gold)" : "var(--cyan)";

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 210,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 13,
        color: "#ccc",
        lineHeight: 1.6,
        minWidth: 180,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div>
        <span style={{ opacity: 0.5 }}>⏱</span>{" "}
        {fmt(totalElapsed)} / {fmt(totalScheduled)}
      </div>
      <div style={{ color }}>
        Slide {currentSlide} · {fmt(slideElapsed)}/{fmt(slideDuration)}
      </div>
      {/* progress bar */}
      <div
        style={{
          marginTop: 4,
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: color,
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>
    </div>
  );
}
