import { useCallback, useEffect, useRef, useState } from 'react';
import { getWords, shuffleWords } from '@/features/tilt-guess/services/tiltGuessWordService';
import type {
  MotionPermissionState,
  TiltGuessCategory,
  TiltGuessGameStatus,
  TiltGuessResult,
  TiltGuessWordHistoryItem,
} from '@/features/tilt-guess/types/tiltGuess';

interface UseTiltGuessResult {
  currentWord: string;
  timeRemaining: number;
  correctCount: number;
  skipCount: number;
  wordHistory: TiltGuessWordHistoryItem[];
  gameStatus: TiltGuessGameStatus;
  feedback: TiltGuessResult | null;
  isStarting: boolean;
  motionPermission: MotionPermissionState;
  canRequestMotionPermission: boolean;
  startGame: (category?: TiltGuessCategory) => Promise<boolean>;
  handleCorrect: () => void;
  handleSkip: () => void;
  endGame: () => void;
  resetGame: () => void;
  requestMotionPermission: () => Promise<boolean>;
}

const ROUND_DURATION_SECONDS = 60;
const WORD_SETTLE_MS = 1000;
const GESTURE_COOLDOWN_MS = 650;
const FEEDBACK_DURATION_MS = 220;
const CORRECT_BETA_THRESHOLD = 60;
const SKIP_BETA_THRESHOLD = -60;

type MotionPermissionResponse = 'granted' | 'denied';

type IOSMotionPermissionRequest = {
  requestPermission?: () => Promise<MotionPermissionResponse>;
};

const getMotionPermissionRequest = (): (() => Promise<MotionPermissionResponse>) | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const candidate = window.DeviceMotionEvent as (typeof DeviceMotionEvent & IOSMotionPermissionRequest) | undefined;
  return typeof candidate?.requestPermission === 'function' ? candidate.requestPermission : null;
};

export function useTiltGuess(): UseTiltGuessResult {
  const [currentWord, setCurrentWord] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION_SECONDS);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [wordHistory, setWordHistory] = useState<TiltGuessWordHistoryItem[]>([]);
  const [gameStatus, setGameStatus] = useState<TiltGuessGameStatus>('idle');
  const [feedback, setFeedback] = useState<TiltGuessResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [motionPermission, setMotionPermission] = useState<MotionPermissionState>('unknown');
  const [canRequestMotionPermission, setCanRequestMotionPermission] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordsRef = useRef<string[]>([]);
  const wordIndexRef = useRef(0);
  const wordShownAtRef = useRef(0);
  const lastGestureAtRef = useRef(0);
  const currentWordRef = useRef('');

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  const showFeedback = useCallback(
    (result: TiltGuessResult) => {
      clearFeedbackTimeout();
      setFeedback(result);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
      }, FEEDBACK_DURATION_MS);
    },
    [clearFeedbackTimeout],
  );

  const advanceWord = useCallback(() => {
    if (wordsRef.current.length === 0) {
      setCurrentWord('');
      currentWordRef.current = '';
      return;
    }

    if (wordIndexRef.current >= wordsRef.current.length) {
      wordsRef.current = shuffleWords(wordsRef.current);
      wordIndexRef.current = 0;
    }

    const nextWord = wordsRef.current[wordIndexRef.current] ?? '';
    wordIndexRef.current += 1;

    setCurrentWord(nextWord);
    currentWordRef.current = nextWord;
    wordShownAtRef.current = Date.now();
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    clearFeedbackTimeout();
    setFeedback(null);
    setGameStatus('finished');
  }, [clearFeedbackTimeout, clearTimer]);

  const handleResult = useCallback(
    (result: TiltGuessResult) => {
      if (gameStatus !== 'playing') {
        return;
      }

      const activeWord = currentWordRef.current.trim();
      if (activeWord) {
        setWordHistory((previous) => [...previous, { word: activeWord, result }]);
      }

      if (result === 'correct') {
        setCorrectCount((previous) => previous + 1);
      } else {
        setSkipCount((previous) => previous + 1);
      }

      showFeedback(result);
      advanceWord();
    },
    [advanceWord, gameStatus, showFeedback],
  );

  const handleCorrect = useCallback(() => {
    handleResult('correct');
  }, [handleResult]);

  const handleSkip = useCallback(() => {
    handleResult('skip');
  }, [handleResult]);

  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    if (!canRequestMotionPermission) {
      setMotionPermission('granted');
      return true;
    }

    const requestPermission = getMotionPermissionRequest();

    if (!requestPermission) {
      setMotionPermission('granted');
      return true;
    }

    try {
      const response = await requestPermission();
      const granted = response === 'granted';
      setMotionPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch {
      setMotionPermission('denied');
      return false;
    }
  }, [canRequestMotionPermission]);

  const startGame = useCallback(
    async (category?: TiltGuessCategory): Promise<boolean> => {
      if (gameStatus === 'playing') {
        return true;
      }

      const permissionRequired = canRequestMotionPermission;
      if (permissionRequired && motionPermission !== 'granted') {
        return false;
      }

      setIsStarting(true);

      try {
        const words = await getWords(category);
        if (words.length === 0) {
          throw new Error('No words available for this category.');
        }

        clearTimer();
        clearFeedbackTimeout();
        setFeedback(null);

        wordsRef.current = words;
        wordIndexRef.current = 0;
        wordShownAtRef.current = Date.now();
        lastGestureAtRef.current = 0;

        setCorrectCount(0);
        setSkipCount(0);
        setWordHistory([]);
        setTimeRemaining(ROUND_DURATION_SECONDS);
        setGameStatus('playing');

        advanceWord();

        timerRef.current = setInterval(() => {
          setTimeRemaining((previous) => {
            if (previous <= 1) {
              clearTimer();
              setGameStatus('finished');
              return 0;
            }

            return previous - 1;
          });
        }, 1000);

        return true;
      } catch {
        setGameStatus('idle');
        return false;
      } finally {
        setIsStarting(false);
      }
    },
    [advanceWord, canRequestMotionPermission, clearFeedbackTimeout, clearTimer, gameStatus, motionPermission],
  );

  const resetGame = useCallback(() => {
    clearTimer();
    clearFeedbackTimeout();

    wordsRef.current = [];
    wordIndexRef.current = 0;
    wordShownAtRef.current = 0;
    lastGestureAtRef.current = 0;
    currentWordRef.current = '';

    setCurrentWord('');
    setTimeRemaining(ROUND_DURATION_SECONDS);
    setCorrectCount(0);
    setSkipCount(0);
    setWordHistory([]);
    setGameStatus('idle');
    setFeedback(null);
    setIsStarting(false);
  }, [clearFeedbackTimeout, clearTimer]);

  useEffect(() => {
    const permissionRequired = getMotionPermissionRequest() !== null;
    setCanRequestMotionPermission(permissionRequired);
    setMotionPermission(permissionRequired ? 'required' : 'granted');
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }

    const onDeviceOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta;

      if (typeof beta !== 'number') {
        return;
      }

      const now = Date.now();
      if (now - wordShownAtRef.current < WORD_SETTLE_MS) {
        return;
      }

      if (now - lastGestureAtRef.current < GESTURE_COOLDOWN_MS) {
        return;
      }

      if (beta > CORRECT_BETA_THRESHOLD) {
        lastGestureAtRef.current = now;
        handleCorrect();
        return;
      }

      if (beta < SKIP_BETA_THRESHOLD) {
        lastGestureAtRef.current = now;
        handleSkip();
      }
    };

    window.addEventListener('deviceorientation', onDeviceOrientation);

    return () => {
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, [gameStatus, handleCorrect, handleSkip]);

  useEffect(() => {
    if (gameStatus === 'finished') {
      clearTimer();
    }
  }, [clearTimer, gameStatus]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearFeedbackTimeout();
    };
  }, [clearFeedbackTimeout, clearTimer]);

  return {
    currentWord,
    timeRemaining,
    correctCount,
    skipCount,
    wordHistory,
    gameStatus,
    feedback,
    isStarting,
    motionPermission,
    canRequestMotionPermission,
    startGame,
    handleCorrect,
    handleSkip,
    endGame,
    resetGame,
    requestMotionPermission,
  };
}
