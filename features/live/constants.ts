export const LIVE_QUESTION_DURATION_MS = 15_000;
export const LIVE_QUESTION_COUNTDOWN_SECONDS = LIVE_QUESTION_DURATION_MS / 1000;

export const SPOTLIGHT_REACTIONS = [
  { emoji: '🔥', label: 'Savage' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😳', label: 'Shocking' },
  { emoji: '❤️', label: 'Honest' }
] as const;
