import { useEffect } from 'react';
import { usePresentationStore } from './usePresentationStore';

export function useKeyboardNav() {
  const { nextStep, prevStep, goToSlide, togglePresenterMode, toggleSubtitles } =
    usePresentationStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevStep();
          break;
        case 'p':
        case 'P':
          togglePresenterMode();
          break;
        case 's':
        case 'S':
          toggleSubtitles();
          break;
        case 'Escape':
          window.dispatchEvent(new CustomEvent('stop-audio'));
          break;
        default:
          // Number keys 1-9 for quick slide jump (0 = slide 10)
          if (e.key >= '1' && e.key <= '9') {
            goToSlide(parseInt(e.key) - 1);
          } else if (e.key === '0') {
            goToSlide(9);
          }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextStep, prevStep, goToSlide, togglePresenterMode, toggleSubtitles]);
}
