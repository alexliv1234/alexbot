export const Speaker = {
  ALEX: "ALEX",
  BOT: "BOT",
  BOTH: "BOTH",
  NONE: "NONE",
} as const;

export type Speaker = (typeof Speaker)[keyof typeof Speaker];

export const StepAction = {
  REVEAL: "REVEAL",
  PLAY_AUDIO: "PLAY_AUDIO",
  SET_SPEAKER: "SET_SPEAKER",
  BOT_ENTER: "BOT_ENTER",
  BOT_EXIT: "BOT_EXIT",
} as const;

export type StepAction = (typeof StepAction)[keyof typeof StepAction];

export interface SlideStep {
  id: string;
  action: StepAction;
  speaker?: Speaker;
  audioClipId?: number;
  revealIds?: string[];
  label?: string;
}

export interface AudioClip {
  id: number;
  slideNumber: number;
  text: string;
  filePath: string;
}

export interface SlideDefinition {
  number: number;
  title: string;
  accentColor: string;
  primarySpeaker: Speaker;
  duration: string;
  steps: SlideStep[];
  presenterNotes: string;
}
