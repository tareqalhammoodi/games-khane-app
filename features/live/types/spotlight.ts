export type SpotlightChoice = {
  id: string;
  text: string;
};

export type SpotlightQuestion = SpotlightChoice & {
  authorId: string;
  authorNickname: string;
};

export type SpotlightPlayer = {
  id: string;
  nickname: string;
};

export type SpotlightGuessResult = {
  playerId: string;
  nickname: string;
  count: number;
  isAuthor: boolean;
};

export type SpotlightRoundResults = {
  questionId: string;
  questionText: string;
  author: SpotlightPlayer | null;
  reactionCounts: [number, number, number, number];
  guessResults: SpotlightGuessResult[];
  correctGuessCount: number;
};
