export type GameId =
  | 'mostLikely'
  | 'truthDare'
  | 'wouldRather'
  | 'challenge'
  | 'conversation'
  | 'tonight';

export type AppScreen = 'home' | 'game' | 'wheel';
export type PlayableId = GameId | 'wheel' | 'tiltGuess' | 'liveQuiz';

export type GameApiEndpoint =
  | '/api/truth-dare'
  | '/api/would-you-rather'
  | '/api/most-likely'
  | '/api/challenge'
  | '/api/conversation'
  | '/api/tonight';

export interface GamePromptRecord {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface GamePromptApiResponse {
  data: GamePromptRecord;
}

export interface GameDefinition {
  title: string;
  buttonText: string;
  endpoint: GameApiEndpoint;
}
