export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  imageDataUrl?: string | null;
};

export type Player = {
  id: string;
  nickname: string;
  score: number;
  hasAnswered: boolean;
  hasUploadedImage: boolean;
};
