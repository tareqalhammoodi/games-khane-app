import type { TiltGuessCategorySelection } from '@/features/tilt-guess/types/tiltGuess';

export interface TiltGuessCategoryOption {
  id: TiltGuessCategorySelection;
  label: string;
  subtitle: string;
}

export const TILT_GUESS_CATEGORIES: TiltGuessCategoryOption[] = [
  {
    id: 'all',
    label: 'All Categories',
    subtitle: 'Mixed deck'
  },
  {
    id: 'animals',
    label: 'Animals',
    subtitle: 'Wild and cute'
  },
  {
    id: 'movies',
    label: 'Movies',
    subtitle: 'Big screen picks'
  },
  {
    id: 'food',
    label: 'Food',
    subtitle: 'Tasty clues'
  },
  {
    id: 'video-games',
    label: 'Video Games',
    subtitle: 'Gaming legends'
  },
  {
    id: 'public-figures',
    label: 'Public Figures',
    subtitle: 'Famous faces'
  }
];
