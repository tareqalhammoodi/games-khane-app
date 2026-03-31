import type { GameFinishedReason, LiveMode, LiveStatus } from '@/features/live/types/core';
import type { Player, Question } from '@/features/live/types/quiz';
import type {
  SpotlightChoice,
  SpotlightPlayer,
  SpotlightRoundResults
} from '@/features/live/types/spotlight';
import type { ThrowbackConfig } from '@/features/live/types/throwback';

export type ClientToServerEvents = {
  create_room: (payload?: { questions?: Question[]; mode?: LiveMode; throwbackConfig?: ThrowbackConfig }) => void;
  inspect_room: (payload: { roomCode: string }) => void;
  start_game: (payload: { roomCode: string }) => void;
  next_question: (payload: { roomCode: string }) => void;
  next_spotlight_round: (payload: { roomCode: string }) => void;
  end_game: (payload: { roomCode: string }) => void;
  join_room: (payload: { roomCode: string; nickname: string; throwbackImageDataUrl?: string }) => void;
  submit_answer: (payload: { roomCode: string; optionIndex: number }) => void;
  submit_throwback_image: (payload: { roomCode: string; imageDataUrl: string }) => void;
  submit_spotlight_question: (payload: { roomCode: string; text: string }) => void;
  select_spotlight_question: (payload: { roomCode: string; questionId: string }) => void;
  open_spotlight_votes: (payload: { roomCode: string }) => void;
  submit_spotlight_reaction: (payload: { roomCode: string; reactionIndex: number }) => void;
  submit_spotlight_guess: (payload: { roomCode: string; playerId: string }) => void;
};

export type ServerToClientEvents = {
  room_inspected: (payload: {
    roomCode: string;
    mode: LiveMode;
    status: LiveStatus;
    throwbackConfig: ThrowbackConfig | null;
  }) => void;
  room_created: (payload: {
    roomCode: string;
    hostId: string;
    players: Player[];
    status: LiveStatus;
    totalQuestions: number;
    mode: LiveMode;
    throwbackConfig: ThrowbackConfig | null;
    uploadedCount: number;
  }) => void;
  player_joined: (payload: {
    roomCode: string;
    players: Player[];
    status: LiveStatus;
    totalQuestions: number;
    mode: LiveMode;
    throwbackConfig: ThrowbackConfig | null;
    uploadedCount: number;
  }) => void;
  game_started: (payload: { roomCode: string; questionIndex: number; totalQuestions: number }) => void;
  throwback_lobby_updated: (payload: {
    roomCode: string;
    players: Player[];
    uploadedCount: number;
    totalPlayers: number;
    throwbackConfig: ThrowbackConfig;
  }) => void;
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
  spotlight_round_started: (payload: {
    roomCode: string;
    roundIndex: number;
    spotlight: SpotlightPlayer;
    submittedCount: number;
    totalWriters: number;
  }) => void;
  spotlight_writing_update: (payload: {
    roomCode: string;
    submittedCount: number;
    totalWriters: number;
  }) => void;
  spotlight_choice_started: (payload: {
    roomCode: string;
    spotlight: SpotlightPlayer;
    choices: SpotlightChoice[];
  }) => void;
  spotlight_question_revealed: (payload: {
    roomCode: string;
    spotlight: SpotlightPlayer;
    questionId: string;
    questionText: string;
  }) => void;
  spotlight_reaction_update: (payload: {
    roomCode: string;
    reactionCounts: [number, number, number, number];
    answeredCount: number;
    totalReactors: number;
  }) => void;
  spotlight_guess_started: (payload: {
    roomCode: string;
    choices: SpotlightPlayer[];
    totalGuessers: number;
  }) => void;
  spotlight_guess_update: (payload: {
    roomCode: string;
    answeredCount: number;
    totalGuessers: number;
  }) => void;
  spotlight_round_results: (payload: { roomCode: string; results: SpotlightRoundResults }) => void;
  spotlight_round_skipped: (payload: { roomCode: string; reason: string }) => void;
  error: (payload: { message: string }) => void;
};
