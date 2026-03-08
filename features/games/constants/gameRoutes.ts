import type { PlayableId } from '@/types/game';

export const GAME_ROUTES: Record<PlayableId, string> = {
  mostLikely: '/most-likely',
  truthDare: '/truth-dare',
  wouldRather: '/would-you-rather',
  challenge: '/challenge',
  conversation: '/conversation',
  tonight: '/tonight',
  liveQuiz: '/live',
  tiltGuess: '/tilt-guess',
  wheel: '/wheel'
} as const;
