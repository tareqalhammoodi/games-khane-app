import type { GameDefinition, GameId } from '@/types/game';

export const gameConfig: Record<GameId, GameDefinition> = {
  mostLikely: {
    title: '😂 Most Likely To',
    buttonText: 'Next',
    endpoint: '/api/most-likely'
  },
  truthDare: {
    title: '🃏 Truth or Dare',
    buttonText: 'Another',
    endpoint: '/api/truth-dare'
  },
  wouldRather: {
    title: '🤔 Would You Rather',
    buttonText: 'Next',
    endpoint: '/api/would-you-rather'
  },
  challenge: {
    title: '🎲 Challenge',
    buttonText: 'New Challenge',
    endpoint: '/api/challenge'
  },
  conversation: {
    title: '💭 Chit-Chat',
    buttonText: 'Next',
    endpoint: '/api/conversation'
  },
  tonight: {
    title: '🎯 What Are We Doing Tonight?',
    buttonText: 'Decide',
    endpoint: '/api/tonight'
  }
};
