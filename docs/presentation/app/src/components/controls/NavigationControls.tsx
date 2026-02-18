import { usePresentationStore } from "../../state/usePresentationStore";
import { slides } from "../../data/slides";

export default function NavigationControls() {
  const currentSlide = usePresentationStore((s) => s.currentSlide);
  const currentStep = usePresentationStore((s) => s.currentStep);
  const nextStep = usePresentationStore((s) => s.nextStep);
  const prevStep = usePresentationStore((s) => s.prevStep);
  const totalSteps = slides[currentSlide].steps.length;

  return (
    <div className="nav-controls">
      <button className="nav-btn" onClick={prevStep} title="Previous (←)">
        ◀
      </button>
      <span className="slide-counter">
        {currentSlide + 1}{' '}
        <span style={{ fontSize: '0.8em' }}>
          - {currentStep + 1}/{totalSteps}
        </span>{' '}
        / {slides.length}
      </span>
      <button className="nav-btn" onClick={nextStep} title="Next (→)">
        ▶
      </button>
    </div>
  );
}
