import { motion, AnimatePresence } from 'framer-motion';
import { usePresentationStore } from '../../state/usePresentationStore';
import { Speaker } from '../../types';
import BotCharacter from './BotCharacter';
import { useState, useEffect } from 'react';

// Different entry animations
const entryVariants = {
  slideInRight: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 100 } },
    exit: { x: -400, opacity: 0, transition: { duration: 0.4 } }
  },
  hoverDown: {
    initial: { y: -300, opacity: 0, rotate: -10 },
    animate: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', damping: 15, stiffness: 80 }
    },
    exit: { y: 300, opacity: 0, rotate: 10, transition: { duration: 0.5 } }
  },
  materialize: {
    initial: { scale: 0, opacity: 0, rotate: 180 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', damping: 12, stiffness: 100 }
    },
    exit: { scale: 0, opacity: 0, rotate: -180, transition: { duration: 0.4 } }
  },
  walkIn: {
    initial: { x: 400, y: 20, opacity: 0 },
    animate: {
      x: 0,
      y: [20, 10, 20, 10, 0],
      opacity: 1,
      transition: {
        x: { duration: 0.8, ease: 'easeOut' },
        y: { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }
      }
    },
    exit: {
      x: -400,
      y: [0, 10, 20, 10, 20],
      opacity: 0,
      transition: {
        x: { duration: 0.6, ease: 'easeIn' },
        y: { duration: 0.6, times: [0, 0.25, 0.5, 0.75, 1] }
      }
    }
  },
  teleport: {
    initial: { scale: 0.1, opacity: 0, filter: 'blur(20px)' },
    animate: {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      scale: 0.1,
      opacity: 0,
      filter: 'blur(20px)',
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  },
  bounce: {
    initial: { y: -500, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 8,
        stiffness: 100,
        bounce: 0.6
      }
    },
    exit: {
      y: -500,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  }
};

const variantKeys = Object.keys(entryVariants) as Array<keyof typeof entryVariants>;

export default function SpeakerIndicator() {
  const activeSpeaker = usePresentationStore(s => s.activeSpeaker);
  const isPlaying = usePresentationStore(s => s.isPlaying);
  const [currentVariant, setCurrentVariant] = useState<keyof typeof entryVariants>('slideInRight');

  const botActive = activeSpeaker === Speaker.BOT || activeSpeaker === Speaker.BOTH;
  const botSpeaking = botActive && isPlaying;

  // Pick a new random animation each time the bot appears
  useEffect(() => {
    if (botActive) {
      const randomIndex = Math.floor(Math.random() * variantKeys.length);
      setCurrentVariant(variantKeys[randomIndex]);
    }
  }, [botActive]);

  const variant = entryVariants[currentVariant];

  return (
    <>
      <AnimatePresence mode="wait">
        {botActive && (
          <motion.div
            key={`bot-character-${currentVariant}`}
            className="bot-character-container"
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            style={{
              position: 'fixed',
              bottom: 40,
              right: 60,
              zIndex: 100,
              filter: botSpeaking ? 'drop-shadow(0 0 30px #FFD700)' : 'none',
              pointerEvents: 'none'
            }}
          >
            <motion.div
              animate={botSpeaking ? {
                scale: [1, 1.05, 1],
                rotate: [0, -2, 2, -2, 0]
              } : {}}
              transition={{
                duration: 0.6,
                repeat: botSpeaking ? Infinity : 0,
                ease: 'easeInOut'
              }}
            >
              <BotCharacter />
            </motion.div>

            {/* Label when bot is speaking */}
            {botSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(255, 215, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid #FFD700',
                  borderRadius: 20,
                  padding: '8px 20px',
                  color: '#FFD700',
                  fontWeight: 700,
                  fontSize: 16,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
                }}
              >
                AlexBot speaking...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
