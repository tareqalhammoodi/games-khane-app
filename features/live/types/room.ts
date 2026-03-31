import type { LiveMode, LiveStatus } from '@/features/live/types/core';
import type { Player, Question } from '@/features/live/types/quiz';
import type { SpotlightQuestion } from '@/features/live/types/spotlight';
import type { ThrowbackConfig } from '@/features/live/types/throwback';

export type Room = {
  code: string;
  hostId: string;
  players: Record<string, Player>;
  mode: LiveMode;
  currentQuestionIndex: number;
  questions: Question[];
  votes: Record<string, number>;
  status: LiveStatus;
  questionStartTime: number | null;
  spotlightId: string | null;
  spotlightHistory: string[];
  spotlightRoundIndex: number;
  spotlightSubmissions: SpotlightQuestion[];
  spotlightChoices: SpotlightQuestion[];
  spotlightSelectedQuestion: SpotlightQuestion | null;
  spotlightReactions: Record<string, number>;
  spotlightGuesses: Record<string, string>;
  throwbackConfig: ThrowbackConfig | null;
  throwbackUploads: Record<string, string>;
  throwbackRoundPlayerIds: string[];
};
