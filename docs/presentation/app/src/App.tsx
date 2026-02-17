import { usePresentationStore } from "./state/usePresentationStore";
import { useKeyboardNav } from "./state/useKeyboardNav";
import { useAudioEngine } from "./state/useAudioEngine";
import PresentationShell from "./components/layout/PresentationShell";
import SlideContainer from "./components/layout/SlideContainer";
import SpeakerIndicator from "./components/speakers/SpeakerIndicator";
import NavigationControls from "./components/controls/NavigationControls";
import ProgressBar from "./components/layout/ProgressBar";
import PresenterOverlay from "./components/layout/PresenterOverlay";
import { audioClips } from "./data/audioClips";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  useKeyboardNav();
  useAudioEngine();

  const currentClipId = usePresentationStore((s) => s.currentClipId);
  const showSubtitles = usePresentationStore((s) => s.showSubtitles);
  const isPlaying = usePresentationStore((s) => s.isPlaying);
  const presenterMode = usePresentationStore((s) => s.presenterMode);

  const subtitleText = currentClipId
    ? audioClips.find((c) => c.id === currentClipId)?.text
    : null;

  return (
    <>
      <PresentationShell>
        <SlideContainer />
        <NavigationControls />
        <ProgressBar />

        {/* Subtitles */}
        <AnimatePresence>
          {showSubtitles && isPlaying && subtitleText && (
            <motion.div
              className="subtitle-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {subtitleText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Presenter overlay */}
        <AnimatePresence>
          {presenterMode && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <PresenterOverlay />
            </motion.div>
          )}
        </AnimatePresence>
      </PresentationShell>

      {/* Speaker indicator outside shell for proper fixed positioning */}
      <SpeakerIndicator />
    </>
  );
}
