import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PresentationShell({ children }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);

  const rescale = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = "top left";
    // Center horizontally when letterboxed
    const scaledW = 1920 * scale;
    el.style.left = `${Math.max(0, (window.innerWidth - scaledW) / 2)}px`;
  }, []);

  useEffect(() => {
    rescale();
    window.addEventListener("resize", rescale);
    return () => window.removeEventListener("resize", rescale);
  }, [rescale]);

  return (
    <div ref={shellRef} className="presentation-shell">
      {children}
    </div>
  );
}
