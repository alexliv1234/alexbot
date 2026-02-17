import { AnimatePresence, motion } from "framer-motion";
import { usePresentationStore } from "../../state/usePresentationStore";
import { slides } from "../../data/slides";
import { slideComponents } from "../slides";
import AccentLine from "../shared/AccentLine";

export default function SlideContainer() {
  const currentSlide = usePresentationStore((s) => s.currentSlide);
  const slide = slides[currentSlide];
  const SlideComponent = slideComponents[currentSlide];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSlide}
        className="slide"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <AccentLine color={slide.accentColor} />
        {SlideComponent ? <SlideComponent /> : null}
      </motion.div>
    </AnimatePresence>
  );
}
