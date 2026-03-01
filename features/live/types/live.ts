export type LiveStatus = 'lobby' | 'question' | 'results' | 'finished';

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

export type Room = {
  code: string;
  hostId: string;
  players: Record<string, Player>;
  currentQuestionIndex: number;
  questions: Question[];
  votes: Record<string, number>;
  status: LiveStatus;
  questionStartTime: number | null;
};

export type GameFinishedReason = 'completed' | 'host_ended' | 'host_disconnected';

export type ClientToServerEvents = {
  create_room: (payload?: { questions?: Question[] }) => void;
  start_game: (payload: { roomCode: string }) => void;
  next_question: (payload: { roomCode: string }) => void;
  end_game: (payload: { roomCode: string }) => void;
  join_room: (payload: { roomCode: string; nickname: string }) => void;
  submit_answer: (payload: { roomCode: string; optionIndex: number }) => void;
};

export type ServerToClientEvents = {
  room_created: (payload: {
    roomCode: string;
    hostId: string;
    players: Player[];
    status: LiveStatus;
    totalQuestions: number;
  }) => void;
  player_joined: (payload: { roomCode: string; players: Player[] }) => void;
  game_started: (payload: { roomCode: string; questionIndex: number; totalQuestions: number }) => void;
  question_started: (payload: {
    roomCode: string;
    questionIndex: number;
    totalQuestions: number;
    question: Question;
    startedAt: number;
    endsAt: number;
  }) => void;
  vote_update: (payload: {
    roomCode: string;
    questionIndex: number;
    voteCounts: number[];
    answeredCount: number;
    totalPlayers: number;
  }) => void;
  question_results: (payload: {
    roomCode: string;
    questionIndex: number;
    correctOptionIndex: number;
    voteCounts: number[];
  }) => void;
  leaderboard_update: (payload: { roomCode: string; leaderboard: Player[] }) => void;
  game_finished: (payload: {
    roomCode: string;
    leaderboard: Player[];
    reason: GameFinishedReason;
  }) => void;
  error: (payload: { message: string }) => void;
};

export type LiveRole = 'host' | 'player';

export const LIVE_QUESTION_DURATION_MS = 15_000;
export const LIVE_QUESTION_COUNTDOWN_SECONDS = LIVE_QUESTION_DURATION_MS / 1000;