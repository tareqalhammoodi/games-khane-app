export type TiltGuessCategory = 'animals' | 'movies' | 'food' | 'video-games' | 'public-figures';

export type TiltGuessCategorySelection = TiltGuessCategory | 'all';

export type TiltGuessResult = 'correct' | 'skip';

export type TiltGuessGameStatus = 'idle' | 'playing' | 'finished';

export type MotionPermissionState = 'unknown' | 'required' | 'granted' | 'denied';

export interface TiltGuessWordRecord {
  id: string;
  type: 'tilt_guess' | string;
  content: string;
  createdAt: string;
}

export interface TiltGuessWordApiResponse {
  data: TiltGuessWordRecord | TiltGuessWordRecord[];
}

export interface TiltGuessWordHistoryItem {
  word: string;
  result: TiltGuessResult;
}
