import { usePresentationStore } from "../../state/usePresentationStore";
import { slides } from "../../data/slides";

export default function PresenterOverlay() {
  const currentSlide = usePresentationStore((s) => s.currentSlide);
  const currentStep = usePresentationStore((s) => s.currentStep);
  const isPlaying = usePresentationStore((s) => s.isPlaying);

  const slide = slides[currentSlide];
  const totalSteps = slide.steps.length;
  const step =
    currentStep >= 0 && currentStep < totalSteps
      ? slide.steps[currentStep]
      : null;
  const nextStepData =
    currentStep + 1 < totalSteps ? slide.steps[currentStep + 1] : null;

  return (
    <div className="presenter-overlay">
      <h3>
        Slide {slide.number} / {slides.length}
      </h3>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {slide.title}
      </div>
      <div className="step-counter">
        Step {currentStep + 1} / {totalSteps}
        {isPlaying && (
          <span style={{ color: "var(--gold)", marginLeft: 8 }}>♫ PLAYING</span>
        )}
      </div>

      {step && (
        <>
          <h3>Current Step</h3>
          <div className="cue">{step.label || step.action}</div>
        </>
      )}

      {nextStepData && (
        <>
          <h3>Next</h3>
          <div className="cue" style={{ opacity: 0.6 }}>
            {nextStepData.label || nextStepData.action}
          </div>
        </>
      )}

      <h3>Presenter Notes</h3>
      <div className="notes">{slide.presenterNotes}</div>

      <h3>Controls</h3>
      <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
        <div>→ / Space — Next step</div>
        <div>← — Previous step</div>
        <div>P — Toggle this overlay</div>
        <div>S — Toggle subtitles</div>
        <div>Esc — Stop audio</div>
        <div>1-9, 0 — Jump to slide</div>
      </div>
    </div>
  );
}
