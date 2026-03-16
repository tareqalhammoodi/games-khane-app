export type GameId =
  | 'mostLikely'
  | 'truthDare'
  | 'wouldRather'
  | 'challenge'
  | 'conversation'
  | 'tonight'
  | 'riddles'
  | 'emojiDecode';

export type AppScreen = 'home' | 'game' | 'wheel';
export type PlayableId = GameId | 'wheel' | 'tiltGuess' | 'liveQuiz' | 'spotlight';

export type GameApiEndpoint =
  | '/api/truth-dare'
  | '/api/would-you-rather'
  | '/api/most-likely'
  | '/api/challenge'
  | '/api/conversation'
  | '/api/tonight'
  | '/api/riddles'
  | '/api/emoji-decode';

export interface GamePromptRecord {
  id: string;
  type: string;
  content: string;
  answer?: string | null;
  createdAt: string;
}

export interface GamePromptApiResponse {
  data: GamePromptRecord;
}

export interface GameDefinition {
  title: string;
  buttonText: string;
  endpoint: GameApiEndpoint;
  supportsSpicy?: boolean;
}
