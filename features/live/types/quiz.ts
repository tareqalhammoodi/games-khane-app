export type Question = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
};

export type Player = {
  id: string;
  nickname: string;
  score: number;
  hasAnswered: boolean;
};
