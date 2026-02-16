import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePresentationStore } from './usePresentationStore';
import { audioClips } from '../data/audioClips';

export function useAudioEngine() {
  const clips = useRef<Map<number, Howl>>(new Map());
  const onClipEnd = usePresentationStore(s => s.onClipEnd);
  const setPlaying = usePresentationStore(s => s.setPlaying);

  // Preload all clips on mount (50 clips is manageable)
  useEffect(() => {
    audioClips.forEach(clip => {
      const howl = new Howl({
        src: [clip.filePath],
        preload: true,
        onend: () => {
          onClipEnd();
        },
        onloaderror: () => {
          // Clip file not found — that's fine, user will add them later
        },
      });
      clips.current.set(clip.id, howl);
    });

    return () => {
      clips.current.forEach(h => h.unload());
      clips.current.clear();
    };
  }, [onClipEnd]);

  // Listen for play-clip events from the store
  useEffect(() => {
    const handlePlay = (e: Event) => {
      const clipId = (e as CustomEvent).detail as number;
      // Stop anything currently playing
      clips.current.forEach(h => h.stop());

      const howl = clips.current.get(clipId);
      if (howl) {
        howl.play();
        setPlaying(true, clipId);
      }
    };

    const handleStop = () => {
      clips.current.forEach(h => h.stop());
      onClipEnd();
    };

    window.addEventListener('play-clip', handlePlay);
    window.addEventListener('stop-audio', handleStop);
    return () => {
      window.removeEventListener('play-clip', handlePlay);
      window.removeEventListener('stop-audio', handleStop);
    };
  }, [setPlaying, onClipEnd]);
}
