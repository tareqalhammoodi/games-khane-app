'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIVE_QUESTION_COUNTDOWN_SECONDS } from '@/features/live/constants';
import { getLiveSocket } from '@/features/live/services/liveSocket';
import {
  type LiveMode,
  type LiveRole,
  type LiveStatus,
  type Player,
  type Question,
  type SpotlightChoice,
  type SpotlightPlayer,
  type SpotlightRoundResults
} from '@/features/live/types';

type HookStatus = LiveStatus | 'idle';

interface UseLiveGameOptions {
  initialRoomCode?: string;
}

interface UseLiveGameResult {
  isConnected: boolean;
  errorMessage: string | null;
  roomCode: string;
  role: LiveRole | null;
  status: HookStatus;
  mode: LiveMode | null;
  socketId: string | null;
  players: Player[];
  leaderboard: Player[];
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  voteCounts: number[];
  correctOptionIndex: number | null;
  answeredCount: number;
  totalPlayers: number;
  hasAnswered: boolean;
  selectedOptionIndex: number | null;
  secondsLeft: number;
  timerTotalSeconds: number;
  spotlightId: string | null;
  spotlightNickname: string | null;
  spotlightRoundIndex: number;
  spotlightChoices: SpotlightChoice[];
  spotlightQuestionText: string | null;
  spotlightSubmittedCount: number;
  spotlightTotalWriters: number;
  spotlightReactionCounts: [number, number, number, number];
  spotlightReactionAnswered: number;
  spotlightTotalReactors: number;
  spotlightGuessOptions: SpotlightPlayer[];
  spotlightGuessAnswered: number;
  spotlightTotalGuessers: number;
  spotlightResults: SpotlightRoundResults | null;
  spotlightSkipReason: string | null;
  hasSubmittedQuestion: boolean;
  hasReacted: boolean;
  selectedReactionIndex: number | null;
  hasGuessed: boolean;
  selectedGuessId: string | null;
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  setRoomCode: (value: string) => void;
  createRoom: (options?: { mode?: LiveMode; questions?: Question[] }) => void;
  joinRoom: (nickname: string) => void;
  startGame: () => void;
  nextQuestion: () => void;
  endGame: () => void;
  submitAnswer: (optionIndex: number) => void;
  submitSpotlightQuestion: (text: string) => void;
  selectSpotlightQuestion: (questionId: string) => void;
  openSpotlightVotes: () => void;
  submitSpotlightReaction: (reactionIndex: number) => void;
  submitSpotlightGuess: (playerId: string) => void;
  nextSpotlightRound: () => void;
  clearError: () => void;
}

function sortLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));
}

function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().slice(0, 6);
}

export function useLiveGame({ initialRoomCode }: UseLiveGameOptions = {}): UseLiveGameResult {
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomCode, setRoomCodeState] = useState(() => normalizeRoomCode(initialRoomCode ?? ''));
  const [role, setRole] = useState<LiveRole | null>(null);
  const [status, setStatus] = useState<HookStatus>('idle');
  const [mode, setMode] = useState<LiveMode | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [voteCounts, setVoteCounts] = useState([0, 0, 0, 0]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [phaseEndsAt, setPhaseEndsAt] = useState<number | null>(null);
  const [phaseDurationMs, setPhaseDurationMs] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [spotlightNickname, setSpotlightNickname] = useState<string | null>(null);
  const [spotlightRoundIndex, setSpotlightRoundIndex] = useState(0);
  const [spotlightChoices, setSpotlightChoices] = useState<SpotlightChoice[]>([]);
  const [spotlightQuestionText, setSpotlightQuestionText] = useState<string | null>(null);
  const [spotlightSubmittedCount, setSpotlightSubmittedCount] = useState(0);
  const [spotlightTotalWriters, setSpotlightTotalWriters] = useState(0);
  const [spotlightReactionCounts, setSpotlightReactionCounts] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [spotlightReactionAnswered, setSpotlightReactionAnswered] = useState(0);
  const [spotlightTotalReactors, setSpotlightTotalReactors] = useState(0);
  const [spotlightGuessOptions, setSpotlightGuessOptions] = useState<SpotlightPlayer[]>([]);
  const [spotlightGuessAnswered, setSpotlightGuessAnswered] = useState(0);
  const [spotlightTotalGuessers, setSpotlightTotalGuessers] = useState(0);
  const [spotlightResults, setSpotlightResults] = useState<SpotlightRoundResults | null>(null);
  const [spotlightSkipReason, setSpotlightSkipReason] = useState<string | null>(null);
  const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [selectedReactionIndex, setSelectedReactionIndex] = useState<number | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);

  const socketRef = useRef<Awaited<ReturnType<typeof getLiveSocket>> | null>(null);
  const roomCodeRef = useRef(roomCode);
  const roleRef = useRef<LiveRole | null>(role);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    const attachSocket = async () => {
      try {
        const socket = await getLiveSocket();

        if (!isMounted) {
          return;
        }

        socketRef.current = socket;

        const resetTimer = () => {
          setPhaseEndsAt(null);
          setPhaseDurationMs(null);
        };

        const resetQuizRoundState = () => {
          setHasAnswered(false);
          setSelectedOptionIndex(null);
          setVoteCounts([0, 0, 0, 0]);
          setCorrectOptionIndex(null);
          setAnsweredCount(0);
        };

        const resetSpotlightRoundState = () => {
          setSpotlightChoices([]);
          setSpotlightQuestionText(null);
          setSpotlightSubmittedCount(0);
          setSpotlightTotalWriters(0);
          setSpotlightReactionCounts([0, 0, 0, 0]);
          setSpotlightReactionAnswered(0);
          setSpotlightTotalReactors(0);
          setSpotlightGuessOptions([]);
          setSpotlightGuessAnswered(0);
          setSpotlightTotalGuessers(0);
          setSpotlightResults(null);
          setSpotlightSkipReason(null);
        };

        const resetSpotlightInteractions = () => {
          setHasSubmittedQuestion(false);
          setHasReacted(false);
          setSelectedReactionIndex(null);
          setHasGuessed(false);
          setSelectedGuessId(null);
        };

        const isRoomMismatch = (incomingRoomCode: string) => {
          const currentRoomCode = roomCodeRef.current;
          return currentRoomCode ? incomingRoomCode !== currentRoomCode : false;
        };

        const onConnect = () => {
          setIsConnected(true);
          setErrorMessage(null);
          setSocketId(socket.id ?? null);
        };

        const onDisconnect = () => {
          setIsConnected(false);
          setSocketId(null);
        };

        const onRoomCreated = (payload: {
          roomCode: string;
          players: Player[];
          status: LiveStatus;
          totalQuestions: number;
          mode: LiveMode;
        }) => {
          setRole('host');
          setRoomCodeState(payload.roomCode);
          setStatus(payload.status);
          setMode(payload.mode);
          setPlayers(payload.players);
          setLeaderboard(sortLeaderboard(payload.players));
          setTotalQuestions(payload.totalQuestions);
          setQuestionIndex(-1);
          setCurrentQuestion(null);
          resetQuizRoundState();
          setTotalPlayers(payload.players.length);
          resetTimer();
          setSpotlightId(null);
          setSpotlightNickname(null);
          setSpotlightRoundIndex(0);
          resetSpotlightRoundState();
          resetSpotlightInteractions();
          setIsCreatingRoom(false);
          setErrorMessage(null);
        };

        const onPlayerJoined = (payload: { roomCode: string; players: Player[] }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setPlayers(payload.players);
          setTotalPlayers(payload.players.length);

          if (roleRef.current === 'host') {
            setLeaderboard(sortLeaderboard(payload.players));
          }

          const socketId = socketRef.current?.id;
          if (socketId && payload.players.some((player) => player.id === socketId)) {
            if (roleRef.current !== 'host') {
              setRole('player');
            }

            setStatus((previousStatus) => (previousStatus === 'idle' ? 'lobby' : previousStatus));
            setIsJoiningRoom(false);
            setErrorMessage(null);
          }
        };

        const onGameStarted = (payload: {
          roomCode: string;
          questionIndex: number;
          totalQuestions: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('quiz');
          setStatus('question');
          setQuestionIndex(payload.questionIndex);
          setTotalQuestions(payload.totalQuestions);
          resetQuizRoundState();
          setErrorMessage(null);
          setSpotlightSkipReason(null);
        };

        const onQuestionStarted = (payload: {
          roomCode: string;
          questionIndex: number;
          totalQuestions: number;
          question: Question;
          endsAt: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('quiz');
          setStatus('question');
          setCurrentQuestion(payload.question);
          setQuestionIndex(payload.questionIndex);
          setTotalQuestions(payload.totalQuestions);
          resetQuizRoundState();
          setPhaseEndsAt(payload.endsAt);
          setPhaseDurationMs(LIVE_QUESTION_COUNTDOWN_SECONDS * 1000);
          setClockNow(Date.now());
          setErrorMessage(null);
          setSpotlightSkipReason(null);
        };

        const onVoteUpdate = (payload: {
          roomCode: string;
          questionIndex: number;
          voteCounts: number[];
          answeredCount: number;
          totalPlayers: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setVoteCounts(payload.voteCounts);
          setAnsweredCount(payload.answeredCount);
          setTotalPlayers(payload.totalPlayers);
          setQuestionIndex(payload.questionIndex);
        };

        const onQuestionResults = (payload: {
          roomCode: string;
          voteCounts: number[];
          questionIndex: number;
          correctOptionIndex: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setStatus('results');
          setVoteCounts(payload.voteCounts);
          setQuestionIndex(payload.questionIndex);
          setCorrectOptionIndex(payload.correctOptionIndex);
          resetTimer();
        };

        const onSpotlightRoundStarted = (payload: {
          roomCode: string;
          roundIndex: number;
          spotlight: SpotlightPlayer;
          submittedCount: number;
          totalWriters: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('writing');
          setSpotlightId(payload.spotlight.id);
          setSpotlightNickname(payload.spotlight.nickname);
          setSpotlightRoundIndex(payload.roundIndex);
          resetSpotlightRoundState();
          setSpotlightSubmittedCount(payload.submittedCount);
          setSpotlightTotalWriters(payload.totalWriters);
          setSpotlightTotalReactors(payload.totalWriters);
          resetSpotlightInteractions();
          resetTimer();
          setErrorMessage(null);
        };

        const onSpotlightWritingUpdate = (payload: {
          roomCode: string;
          submittedCount: number;
          totalWriters: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setSpotlightSubmittedCount(payload.submittedCount);
          setSpotlightTotalWriters(payload.totalWriters);
        };

        const onSpotlightChoiceStarted = (payload: {
          roomCode: string;
          spotlight: SpotlightPlayer;
          choices: SpotlightChoice[];
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('choice');
          setSpotlightId(payload.spotlight.id);
          setSpotlightNickname(payload.spotlight.nickname);
          setSpotlightChoices(payload.choices);
          setSpotlightQuestionText(null);
          setSpotlightResults(null);
          setSpotlightSkipReason(null);
          resetTimer();
        };

        const onSpotlightQuestionRevealed = (payload: {
          roomCode: string;
          spotlight: SpotlightPlayer;
          questionId: string;
          questionText: string;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('reveal');
          setSpotlightId(payload.spotlight.id);
          setSpotlightNickname(payload.spotlight.nickname);
          setSpotlightQuestionText(payload.questionText);
          setSpotlightResults(null);
          setSpotlightSkipReason(null);
          setSpotlightReactionCounts([0, 0, 0, 0]);
          setSpotlightReactionAnswered(0);
          setHasReacted(false);
          setSelectedReactionIndex(null);
          resetTimer();
        };

        const onSpotlightReactionUpdate = (payload: {
          roomCode: string;
          reactionCounts: [number, number, number, number];
          answeredCount: number;
          totalReactors: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setSpotlightReactionCounts(payload.reactionCounts);
          setSpotlightReactionAnswered(payload.answeredCount);
          setSpotlightTotalReactors(payload.totalReactors);
        };

        const onSpotlightGuessStarted = (payload: {
          roomCode: string;
          choices: SpotlightPlayer[];
          totalGuessers: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('guess');
          setSpotlightGuessOptions(payload.choices);
          setSpotlightGuessAnswered(0);
          setSpotlightTotalGuessers(payload.totalGuessers);
          setHasGuessed(false);
          setSelectedGuessId(null);
          resetTimer();
        };

        const onSpotlightGuessUpdate = (payload: {
          roomCode: string;
          answeredCount: number;
          totalGuessers: number;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setSpotlightGuessAnswered(payload.answeredCount);
          setSpotlightTotalGuessers(payload.totalGuessers);
        };

        const onSpotlightRoundResults = (payload: {
          roomCode: string;
          results: SpotlightRoundResults;
        }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('results');
          setSpotlightResults(payload.results);
          setSpotlightQuestionText(payload.results.questionText);
          setSpotlightSkipReason(null);
          resetTimer();
        };

        const onSpotlightRoundSkipped = (payload: { roomCode: string; reason: string }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setMode('spotlight');
          setStatus('results');
          setSpotlightSkipReason(payload.reason);
          setSpotlightResults(null);
          setSpotlightQuestionText(null);
          resetTimer();
        };

        const onLeaderboardUpdate = (payload: { roomCode: string; leaderboard: Player[] }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setLeaderboard(sortLeaderboard(payload.leaderboard));
        };

        const onGameFinished = (payload: { roomCode: string; leaderboard: Player[] }) => {
          if (isRoomMismatch(payload.roomCode)) {
            return;
          }

          setStatus('finished');
          resetTimer();
          setCurrentQuestion(null);
          setCorrectOptionIndex(null);
          setLeaderboard(sortLeaderboard(payload.leaderboard));
        };

        const onError = (payload: { message: string }) => {
          setIsCreatingRoom(false);
          setIsJoiningRoom(false);
          setErrorMessage(payload.message);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('room_created', onRoomCreated);
        socket.on('player_joined', onPlayerJoined);
        socket.on('game_started', onGameStarted);
        socket.on('question_started', onQuestionStarted);
        socket.on('vote_update', onVoteUpdate);
        socket.on('question_results', onQuestionResults);
        socket.on('spotlight_round_started', onSpotlightRoundStarted);
        socket.on('spotlight_writing_update', onSpotlightWritingUpdate);
        socket.on('spotlight_choice_started', onSpotlightChoiceStarted);
        socket.on('spotlight_question_revealed', onSpotlightQuestionRevealed);
        socket.on('spotlight_reaction_update', onSpotlightReactionUpdate);
        socket.on('spotlight_guess_started', onSpotlightGuessStarted);
        socket.on('spotlight_guess_update', onSpotlightGuessUpdate);
        socket.on('spotlight_round_results', onSpotlightRoundResults);
        socket.on('spotlight_round_skipped', onSpotlightRoundSkipped);
        socket.on('leaderboard_update', onLeaderboardUpdate);
        socket.on('game_finished', onGameFinished);
        socket.on('error', onError);

        setIsConnected(socket.connected);

        if (!socket.connected) {
          socket.connect();
        }

        return () => {
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('room_created', onRoomCreated);
          socket.off('player_joined', onPlayerJoined);
          socket.off('game_started', onGameStarted);
          socket.off('question_started', onQuestionStarted);
          socket.off('vote_update', onVoteUpdate);
          socket.off('question_results', onQuestionResults);
          socket.off('spotlight_round_started', onSpotlightRoundStarted);
          socket.off('spotlight_writing_update', onSpotlightWritingUpdate);
          socket.off('spotlight_choice_started', onSpotlightChoiceStarted);
          socket.off('spotlight_question_revealed', onSpotlightQuestionRevealed);
          socket.off('spotlight_reaction_update', onSpotlightReactionUpdate);
          socket.off('spotlight_guess_started', onSpotlightGuessStarted);
          socket.off('spotlight_guess_update', onSpotlightGuessUpdate);
          socket.off('spotlight_round_results', onSpotlightRoundResults);
          socket.off('spotlight_round_skipped', onSpotlightRoundSkipped);
          socket.off('leaderboard_update', onLeaderboardUpdate);
          socket.off('game_finished', onGameFinished);
          socket.off('error', onError);
        };
      } catch {
        if (isMounted) {
          setErrorMessage('Could not connect to live server.');
        }
      }

      return undefined;
    };

    let detachListeners: (() => void) | undefined;

    void attachSocket().then((cleanup) => {
      if (!isMounted && cleanup) {
        cleanup();
        return;
      }

      detachListeners = cleanup;
    });

    return () => {
      isMounted = false;
      if (detachListeners) {
        detachListeners();
      }
    };
  }, []);

  useEffect(() => {
    if (!phaseEndsAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [phaseEndsAt]);

  const secondsLeft = useMemo(() => {
    if (!phaseEndsAt) {
      return LIVE_QUESTION_COUNTDOWN_SECONDS;
    }

    return Math.max(0, Math.ceil((phaseEndsAt - clockNow) / 1000));
  }, [phaseEndsAt, clockNow]);

  const timerTotalSeconds = useMemo(() => {
    if (!phaseDurationMs) {
      return LIVE_QUESTION_COUNTDOWN_SECONDS;
    }

    return Math.max(1, Math.ceil(phaseDurationMs / 1000));
  }, [phaseDurationMs]);

  const setRoomCode = useCallback((value: string) => {
    setRoomCodeState(normalizeRoomCode(value));
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const createRoom = useCallback((options?: { mode?: LiveMode; questions?: Question[] }) => {
    const socket = socketRef.current;
    if (!socket) {
      setErrorMessage('Live server is not ready yet.');
      return;
    }

    setErrorMessage(null);
    setRole('host');
    setIsCreatingRoom(true);
    const questions = options?.questions ?? [];
    const mode = options?.mode;

    if (questions.length > 0 || mode) {
      socket.emit('create_room', { questions: questions.length > 0 ? questions : undefined, mode });
      return;
    }

    socket.emit('create_room');
  }, []);

  const joinRoom = useCallback((nickname: string) => {
    const socket = socketRef.current;
    if (!socket) {
      setErrorMessage('Live server is not ready yet.');
      return;
    }

    const trimmedNickname = nickname.trim();
    const normalizedCode = normalizeRoomCode(roomCodeRef.current);

    if (!trimmedNickname) {
      setErrorMessage('Enter a nickname to join.');
      return;
    }

    if (!normalizedCode || normalizedCode.length !== 6) {
      setErrorMessage('Enter a valid 6-character room code.');
      return;
    }

    setErrorMessage(null);
    setRole('player');
    setIsJoiningRoom(true);
    socket.emit('join_room', {
      roomCode: normalizedCode,
      nickname: trimmedNickname.slice(0, 24)
    });
  }, []);

  const startGame = useCallback(() => {
    if (roleRef.current !== 'host') {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('start_game', { roomCode: roomCodeRef.current });
  }, []);

  const nextQuestion = useCallback(() => {
    if (roleRef.current !== 'host') {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('next_question', { roomCode: roomCodeRef.current });
  }, []);

  const endGame = useCallback(() => {
    if (roleRef.current !== 'host') {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('end_game', { roomCode: roomCodeRef.current });
  }, []);

  const submitAnswer = useCallback((optionIndex: number) => {
    if (roleRef.current !== 'player' || hasAnswered) {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    setHasAnswered(true);
    setSelectedOptionIndex(optionIndex);

    socket.emit('submit_answer', {
      roomCode: roomCodeRef.current,
      optionIndex
    });
  }, [hasAnswered]);

  const submitSpotlightQuestion = useCallback((text: string) => {
    if (roleRef.current !== 'player' || hasSubmittedQuestion) {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setHasSubmittedQuestion(true);
    socket.emit('submit_spotlight_question', {
      roomCode: roomCodeRef.current,
      text: trimmed
    });
  }, [hasSubmittedQuestion]);

  const selectSpotlightQuestion = useCallback((questionId: string) => {
    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('select_spotlight_question', {
      roomCode: roomCodeRef.current,
      questionId
    });
  }, []);

  const openSpotlightVotes = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('open_spotlight_votes', { roomCode: roomCodeRef.current });
  }, []);

  const submitSpotlightReaction = useCallback((reactionIndex: number) => {
    if (roleRef.current !== 'player' || hasReacted) {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    setHasReacted(true);
    setSelectedReactionIndex(reactionIndex);

    socket.emit('submit_spotlight_reaction', {
      roomCode: roomCodeRef.current,
      reactionIndex
    });
  }, [hasReacted]);

  const submitSpotlightGuess = useCallback((playerId: string) => {
    if (roleRef.current !== 'player' || hasGuessed) {
      return;
    }

    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    setHasGuessed(true);
    setSelectedGuessId(playerId);

    socket.emit('submit_spotlight_guess', {
      roomCode: roomCodeRef.current,
      playerId
    });
  }, [hasGuessed]);

  const nextSpotlightRound = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !roomCodeRef.current) {
      return;
    }

    socket.emit('next_spotlight_round', { roomCode: roomCodeRef.current });
  }, []);

  return {
    isConnected,
    errorMessage,
    roomCode,
    role,
    status,
    mode,
    socketId,
    players,
    leaderboard,
    currentQuestion,
    questionIndex,
    totalQuestions,
    voteCounts,
    correctOptionIndex,
    answeredCount,
    totalPlayers,
    hasAnswered,
    selectedOptionIndex,
    secondsLeft,
    timerTotalSeconds,
    spotlightId,
    spotlightNickname,
    spotlightRoundIndex,
    spotlightChoices,
    spotlightQuestionText,
    spotlightSubmittedCount,
    spotlightTotalWriters,
    spotlightReactionCounts,
    spotlightReactionAnswered,
    spotlightTotalReactors,
    spotlightGuessOptions,
    spotlightGuessAnswered,
    spotlightTotalGuessers,
    spotlightResults,
    spotlightSkipReason,
    hasSubmittedQuestion,
    hasReacted,
    selectedReactionIndex,
    hasGuessed,
    selectedGuessId,
    isCreatingRoom,
    isJoiningRoom,
    setRoomCode,
    createRoom,
    joinRoom,
    startGame,
    nextQuestion,
    endGame,
    submitAnswer,
    submitSpotlightQuestion,
    selectSpotlightQuestion,
    openSpotlightVotes,
    submitSpotlightReaction,
    submitSpotlightGuess,
    nextSpotlightRound,
    clearError
  };
}
