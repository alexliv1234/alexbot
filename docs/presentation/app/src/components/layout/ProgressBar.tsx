import { usePresentationStore } from '../../state/usePresentationStore';
import { slides } from '../../data/slides';

export default function ProgressBar() {
  const currentSlide = usePresentationStore(s => s.currentSlide);
  const currentStep = usePresentationStore(s => s.currentStep);

  const slide = slides[currentSlide];
  const totalSteps = slide.steps.length;
  const stepsComplete = currentStep + 1;

  // Overall progress: combine slide progress + step sub-progress
  const slideProgress = currentSlide / slides.length;
  const stepProgress = totalSteps > 0 ? stepsComplete / totalSteps / slides.length : 0;
  const pct = (slideProgress + stepProgress) * 100;

  return <div className="progress-bar" style={{ width: `${pct}%` }} />;
}
