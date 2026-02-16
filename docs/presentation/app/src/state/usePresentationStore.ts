import { create } from 'zustand';
import { Speaker, StepAction } from '../types';
import { slides } from '../data/slides';

interface PresentationState {
  currentSlide: number;
  currentStep: number;
  activeSpeaker: Speaker;
  isPlaying: boolean;
  currentClipId: number | null;
  presenterMode: boolean;
  showSubtitles: boolean;
  revealedKeys: Set<string>;

  nextStep: () => void;
  prevStep: () => void;
  goToSlide: (n: number) => void;
  setSpeaker: (s: Speaker) => void;
  setPlaying: (playing: boolean, clipId?: number | null) => void;
  onClipEnd: () => void;
  togglePresenterMode: () => void;
  toggleSubtitles: () => void;
  isRevealed: (key: string) => boolean;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  currentSlide: 0,
  currentStep: 0,
  activeSpeaker: Speaker.ALEX,
  isPlaying: false,
  currentClipId: null,
  presenterMode: false,
  showSubtitles: false,
  revealedKeys: new Set<string>(['s01-title']),

  nextStep: () => {
    const state = get();
    const slide = slides[state.currentSlide];
    if (!slide) return;

    const nextStepIdx = state.currentStep + 1;

    if (nextStepIdx < slide.steps.length) {
      // Execute next step within this slide
      const step = slide.steps[nextStepIdx];
      const newRevealed = new Set(state.revealedKeys);

      let newSpeaker = state.activeSpeaker;
      let newPlaying = state.isPlaying;
      let newClipId = state.currentClipId;

      // Always process revealIds regardless of action type
      if (step.revealIds) {
        step.revealIds.forEach(k => newRevealed.add(k));
      }

      // Handle speaker changes
      if (step.speaker) {
        newSpeaker = step.speaker;
      }

      // Handle audio playback
      if (step.action === StepAction.PLAY_AUDIO && step.audioClipId) {
        newSpeaker = Speaker.BOT;
        newPlaying = true;
        newClipId = step.audioClipId;
        // Audio engine hook will handle actual playback
        window.dispatchEvent(new CustomEvent('play-clip', { detail: step.audioClipId }));
      }

      set({
        currentStep: nextStepIdx,
        activeSpeaker: newSpeaker,
        revealedKeys: newRevealed,
        isPlaying: newPlaying,
        currentClipId: newClipId,
      });
    } else {
      // Move to next slide
      if (state.currentSlide < slides.length - 1) {
        const nextSlideIdx = state.currentSlide + 1;
        const nextSlide = slides[nextSlideIdx];

        // Auto-execute first step of new slide
        const firstStep = nextSlide.steps[0];
        const newRevealed = new Set<string>();
        if (firstStep?.revealIds) {
          firstStep.revealIds.forEach(k => newRevealed.add(k));
        }

        let speaker = nextSlide.primarySpeaker;
        if (firstStep?.speaker) {
          speaker = firstStep.speaker;
        }

        set({
          currentSlide: nextSlideIdx,
          currentStep: 0,
          activeSpeaker: speaker,
          revealedKeys: newRevealed,
          isPlaying: false,
          currentClipId: null,
        });
      }
    }
  },

  prevStep: () => {
    const state = get();
    if (state.currentStep > 0) {
      // Go back one step (we rebuild reveals from scratch)
      const slide = slides[state.currentSlide];
      const targetStep = state.currentStep - 1;
      const newRevealed = new Set<string>();

      // Replay all reveals up to targetStep
      for (let i = 0; i <= targetStep; i++) {
        const s = slide.steps[i];
        if (s.revealIds) s.revealIds.forEach(k => newRevealed.add(k));
      }

      // Find the last speaker assignment up to targetStep
      let speaker = slide.primarySpeaker;
      for (let i = 0; i <= targetStep; i++) {
        const s = slide.steps[i];
        if (s.speaker) speaker = s.speaker;
        if (s.action === StepAction.PLAY_AUDIO) speaker = Speaker.BOT;
      }

      set({
        currentStep: targetStep,
        revealedKeys: newRevealed,
        activeSpeaker: speaker,
        isPlaying: false,
        currentClipId: null,
      });
    } else if (state.currentSlide > 0) {
      // Go to previous slide, at its last step
      const prevSlideIdx = state.currentSlide - 1;
      const prevSlide = slides[prevSlideIdx];
      const lastStep = prevSlide.steps.length - 1;
      const newRevealed = new Set<string>();

      // Replay all reveals
      for (let i = 0; i <= lastStep; i++) {
        const s = prevSlide.steps[i];
        if (s.revealIds) s.revealIds.forEach(k => newRevealed.add(k));
      }

      let speaker = prevSlide.primarySpeaker;
      for (let i = 0; i <= lastStep; i++) {
        const s = prevSlide.steps[i];
        if (s.speaker) speaker = s.speaker;
      }

      set({
        currentSlide: prevSlideIdx,
        currentStep: lastStep,
        revealedKeys: newRevealed,
        activeSpeaker: speaker,
        isPlaying: false,
        currentClipId: null,
      });
    }
  },

  goToSlide: (n: number) => {
    if (n >= 0 && n < slides.length) {
      const targetSlide = slides[n];

      // Auto-execute first step
      const firstStep = targetSlide.steps[0];
      const newRevealed = new Set<string>();
      if (firstStep?.revealIds) {
        firstStep.revealIds.forEach(k => newRevealed.add(k));
      }

      let speaker = targetSlide.primarySpeaker;
      if (firstStep?.speaker) {
        speaker = firstStep.speaker;
      }

      set({
        currentSlide: n,
        currentStep: 0,
        activeSpeaker: speaker,
        revealedKeys: newRevealed,
        isPlaying: false,
        currentClipId: null,
      });
    }
  },

  setSpeaker: (s: Speaker) => set({ activeSpeaker: s }),

  setPlaying: (playing: boolean, clipId?: number | null) =>
    set({ isPlaying: playing, currentClipId: clipId ?? null }),

  onClipEnd: () => set({ isPlaying: false, currentClipId: null }),

  togglePresenterMode: () => set(s => ({ presenterMode: !s.presenterMode })),

  toggleSubtitles: () => set(s => ({ showSubtitles: !s.showSubtitles })),

  isRevealed: (key: string) => get().revealedKeys.has(key),
}));
