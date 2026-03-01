'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLiveSocket } from '@/features/live/services/liveSocket';
import {
  LIVE_QUESTION_COUNTDOWN_SECONDS,
  type LiveRole,
  type LiveStatus,
  type Player,
  type Question
} from '@/features/live/types/live';

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
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  setRoomCode: (value: string) => void;
  createRoom: (questions?: Question[]) => void;
  joinRoom: (nickname: string) => void;
  startGame: () => void;
  nextQuestion: () => void;
  endGame: () => void;
  submitAnswer: (optionIndex: number) => void;
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
  const [questionEndsAt, setQuestionEndsAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

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

        const onConnect = () => {
          setIsConnected(true);
          setErrorMessage(null);
        };

        const onDisconnect = () => {
          setIsConnected(false);
        };

        const onRoomCreated = (payload: {
          roomCode: string;
          players: Player[];
          status: LiveStatus;
          totalQuestions: number;
        }) => {
          setRole('host');
          setRoomCodeState(payload.roomCode);
          setStatus(payload.status);
          setPlayers(payload.players);
          setLeaderboard(sortLeaderboard(payload.players));
          setTotalQuestions(payload.totalQuestions);
          setQuestionIndex(-1);
          setCurrentQuestion(null);
          setHasAnswered(false);
          setSelectedOptionIndex(null);
          setVoteCounts([0, 0, 0, 0]);
          setCorrectOptionIndex(null);
          setAnsweredCount(0);
          setTotalPlayers(payload.players.length);
          setIsCreatingRoom(false);
          setErrorMessage(null);
        };

        const onPlayerJoined = (payload: { roomCode: string; players: Player[] }) => {
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
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
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
            return;
          }

          setStatus('question');
          setQuestionIndex(payload.questionIndex);
          setTotalQuestions(payload.totalQuestions);
          setHasAnswered(false);
          setSelectedOptionIndex(null);
          setVoteCounts([0, 0, 0, 0]);
          setCorrectOptionIndex(null);
          setAnsweredCount(0);
          setErrorMessage(null);
        };

        const onQuestionStarted = (payload: {
          roomCode: string;
          questionIndex: number;
          totalQuestions: number;
          question: Question;
          endsAt: number;
        }) => {
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
            return;
          }

          setStatus('question');
          setCurrentQuestion(payload.question);
          setQuestionIndex(payload.questionIndex);
          setTotalQuestions(payload.totalQuestions);
          setHasAnswered(false);
          setSelectedOptionIndex(null);
          setVoteCounts([0, 0, 0, 0]);
          setCorrectOptionIndex(null);
          setAnsweredCount(0);
          setQuestionEndsAt(payload.endsAt);
          setClockNow(Date.now());
          setErrorMessage(null);
        };

        const onVoteUpdate = (payload: {
          roomCode: string;
          questionIndex: number;
          voteCounts: number[];
          answeredCount: number;
          totalPlayers: number;
        }) => {
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
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
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
            return;
          }

          setStatus('results');
          setVoteCounts(payload.voteCounts);
          setQuestionIndex(payload.questionIndex);
          setCorrectOptionIndex(payload.correctOptionIndex);
          setQuestionEndsAt(null);
        };

        const onLeaderboardUpdate = (payload: { roomCode: string; leaderboard: Player[] }) => {
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
            return;
          }

          setLeaderboard(sortLeaderboard(payload.leaderboard));
        };

        const onGameFinished = (payload: { roomCode: string; leaderboard: Player[] }) => {
          if (roomCodeRef.current && payload.roomCode !== roomCodeRef.current) {
            return;
          }

          setStatus('finished');
          setQuestionEndsAt(null);
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
    if (status !== 'question' || !questionEndsAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [status, questionEndsAt]);

  const secondsLeft = useMemo(() => {
    if (!questionEndsAt) {
      return LIVE_QUESTION_COUNTDOWN_SECONDS;
    }

    return Math.max(0, Math.ceil((questionEndsAt - clockNow) / 1000));
  }, [questionEndsAt, clockNow]);

  const setRoomCode = useCallback((value: string) => {
    setRoomCodeState(normalizeRoomCode(value));
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const createRoom = useCallback((questions?: Question[]) => {
    const socket = socketRef.current;
    if (!socket) {
      setErrorMessage('Live server is not ready yet.');
      return;
    }

    setErrorMessage(null);
    setRole('host');
    setIsCreatingRoom(true);
    if (questions && questions.length > 0) {
      socket.emit('create_room', { questions });
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

  return {
    isConnected,
    errorMessage,
    roomCode,
    role,
    status,
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
    isCreatingRoom,
    isJoiningRoom,
    setRoomCode,
    createRoom,
    joinRoom,
    startGame,
    nextQuestion,
    endGame,
    submitAnswer,
    clearError
  };
}
