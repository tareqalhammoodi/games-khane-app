import type { PlayableId } from '@/types/game';

export const GAME_ROUTES: Record<PlayableId, string> = {
  mostLikely: '/most-likely',
  truthDare: '/truth-dare',
  wouldRather: '/would-you-rather',
  challenge: '/challenge',
  conversation: '/conversation',
  tonight: '/tonight',
  riddles: '/riddles',
  emojiDecode: '/emoji-decode',
  liveQuiz: '/live',
  tiltGuess: '/tilt-guess',
  wheel: '/wheel'
} as const;
