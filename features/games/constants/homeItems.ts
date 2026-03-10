import type { PlayableId } from '@/types/game';

export interface HomeItem {
  id: PlayableId;
  icon: string;
  title: string;
  subtitle: string;
  accent?: string;
}

export const HOME_ITEMS: HomeItem[] = [
  {
    id: 'mostLikely',
    icon: '😂',
    title: "Who’s Most Likely To?",
    subtitle: 'Call out your friends.',
    accent: '#ff7a59'
  },
  {
    id: 'truthDare',
    icon: '🃏',
    title: 'Truth or Dare Game!',
    subtitle: 'Classic party chaos.',
    accent: '#ff4f8b'
  },
  {
    id: 'wouldRather',
    icon: '🤔',
    title: 'Would You Rather?',
    subtitle: 'Impossible choices.',
    accent: '#00b8ff'
  },
  {
    id: 'challenge',
    icon: '🎲',
    title: 'Random Challenges!',
    subtitle: 'Fast fun rounds.',
    accent: '#06d6a0'
  },
  {
    id: 'conversation',
    icon: '🧠',
    title: 'Chit-Chat Topics to Talk About!',
    subtitle: 'Break the ice.',
    accent: '#a78bfa'
  },
  {
    id: 'tonight',
    icon: '🎯',
    title: 'What Are We Doing Tonight?',
    subtitle: 'Decide your plan.',
    accent: '#f59e0b'
  },
  {
    id: 'riddles',
    icon: '🧩',
    title: 'Quick Brain Teaser Riddles!',
    subtitle: 'Think fast.',
    accent: '#c3d334ff'
  },
  {
    id: 'emojiDecode',
    icon: '🎬',
    title: 'Decode the Emoji Game!',
    subtitle: 'Guess the meaning.',
    accent: '#72b7f4ff'
  },
  {
    id: 'liveQuiz',
    icon: '🍬',
    title: 'GameKhane Live',
    subtitle: 'Host. Join. Compete. Test your knowledge together!',
  },
  {
    id: 'tiltGuess',
    icon: '📱',
    title: 'Tilt & Guess',
    subtitle: 'Hold the phone to your forehead while friends give clues.',
  },
  {
    id: 'wheel',
    icon: '☸️',
    title: 'Spin The Wheel',
    subtitle: 'Let luck decide what to play and who goes next.',
  }
];
