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

type DetectorState = 'NEUTRAL' | 'LOCKED';
type MotionPermissionResponse = 'granted' | 'denied';

type IOSMotionPermissionRequest = {
  requestPermission?: () => Promise<MotionPermissionResponse>;
};

const ROUND_DURATION_SECONDS = 60;
const WORD_LOCK_TIME_MS = 1200;
const GESTURE_COOLDOWN_MS = 800;
const FEEDBACK_DURATION_MS = 220;
const MOTION_PERMISSION_STORAGE_KEY = 'tilt_guess_motion_permission_granted';

// Gravity-Z thresholds (Heads Up style).
const FACE_DOWN_THRESHOLD = -7; // Correct
const FACE_UP_THRESHOLD = 7; // Skip
const NEUTRAL_MIN = -3;
const NEUTRAL_MAX = 3;

// Low-pass filter: keeps motion responsive while reducing jitter.
const SMOOTHING_ALPHA = 0.2;

const getMotionPermissionRequest = (): (() => Promise<MotionPermissionResponse>) | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const candidate = window.DeviceMotionEvent as (typeof DeviceMotionEvent & IOSMotionPermissionRequest) | undefined;
  return typeof candidate?.requestPermission === 'function' ? candidate.requestPermission : null;
};

const readStoredMotionPermissionGranted = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(MOTION_PERMISSION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const storeMotionPermissionGranted = (granted: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (granted) {
      window.localStorage.setItem(MOTION_PERMISSION_STORAGE_KEY, 'true');
      return;
    }

    window.localStorage.removeItem(MOTION_PERMISSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures (private/restricted contexts).
  }
};

const isNeutral = (z: number): boolean => z > NEUTRAL_MIN && z < NEUTRAL_MAX;

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
  const currentWordRef = useRef('');

  // High-frequency detector state is kept in refs to avoid re-renders.
  const detectorStateRef = useRef<DetectorState>('NEUTRAL');
  const lastGestureAtRef = useRef(0);
  const smoothedZRef = useRef(0);
  const hasSmoothedZRef = useRef(false);

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

  const resetDetector = useCallback(() => {
    detectorStateRef.current = 'NEUTRAL';
    lastGestureAtRef.current = 0;
    smoothedZRef.current = 0;
    hasSmoothedZRef.current = false;
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
      storeMotionPermissionGranted(true);
      return true;
    }

    const requestPermission = getMotionPermissionRequest();
    if (!requestPermission) {
      setMotionPermission('granted');
      storeMotionPermissionGranted(true);
      return true;
    }

    try {
      const result = await requestPermission();
      const granted = result === 'granted';
      setMotionPermission(granted ? 'granted' : 'denied');
      storeMotionPermissionGranted(granted);
      return granted;
    } catch {
      setMotionPermission('denied');
      storeMotionPermissionGranted(false);
      return false;
    }
  }, [canRequestMotionPermission]);

  const startGame = useCallback(
    async (category?: TiltGuessCategory): Promise<boolean> => {
      if (gameStatus === 'playing') {
        return true;
      }

      if (canRequestMotionPermission && motionPermission !== 'granted') {
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
        setCorrectCount(0);
        setSkipCount(0);
        setWordHistory([]);
        setTimeRemaining(ROUND_DURATION_SECONDS);
        setGameStatus('playing');
        resetDetector();
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
    [
      advanceWord,
      canRequestMotionPermission,
      clearFeedbackTimeout,
      clearTimer,
      gameStatus,
      motionPermission,
      resetDetector,
    ],
  );

  const resetGame = useCallback(() => {
    clearTimer();
    clearFeedbackTimeout();

    wordsRef.current = [];
    wordIndexRef.current = 0;
    currentWordRef.current = '';
    wordShownAtRef.current = 0;
    resetDetector();

    setCurrentWord('');
    setTimeRemaining(ROUND_DURATION_SECONDS);
    setCorrectCount(0);
    setSkipCount(0);
    setWordHistory([]);
    setGameStatus('idle');
    setFeedback(null);
    setIsStarting(false);
  }, [clearFeedbackTimeout, clearTimer, resetDetector]);

  useEffect(() => {
    const permissionRequired = getMotionPermissionRequest() !== null;
    setCanRequestMotionPermission(permissionRequired);

    if (!permissionRequired) {
      setMotionPermission('granted');
      storeMotionPermissionGranted(true);
      return;
    }

    const alreadyGranted = readStoredMotionPermissionGranted();
    setMotionPermission(alreadyGranted ? 'granted' : 'required');
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }

    const onMotion = (event: DeviceMotionEvent) => {
      const rawZ = event.accelerationIncludingGravity?.z;
      if (typeof rawZ !== 'number') {
        return;
      }

      const now = Date.now();

      // Low-pass smoothing to remove jitter.
      if (!hasSmoothedZRef.current) {
        smoothedZRef.current = rawZ;
        hasSmoothedZRef.current = true;
      } else {
        smoothedZRef.current = smoothedZRef.current * (1 - SMOOTHING_ALPHA) + rawZ * SMOOTHING_ALPHA;
      }

      const z = smoothedZRef.current;

      // Word stabilization lock to avoid accidental immediate fires.
      if (now - wordShownAtRef.current < WORD_LOCK_TIME_MS) {
        return;
      }

      // Cooldown between gestures.
      if (now - lastGestureAtRef.current < GESTURE_COOLDOWN_MS) {
        return;
      }

      // Reset detector only when phone returns close to vertical neutral.
      if (isNeutral(z)) {
        detectorStateRef.current = 'NEUTRAL';
        return;
      }

      // Gestures fire only from NEUTRAL -> tilt transition.
      if (detectorStateRef.current !== 'NEUTRAL') {
        return;
      }

      if (z < FACE_DOWN_THRESHOLD) {
        detectorStateRef.current = 'LOCKED';
        lastGestureAtRef.current = now;
        handleCorrect();
        return;
      }

      if (z > FACE_UP_THRESHOLD) {
        detectorStateRef.current = 'LOCKED';
        lastGestureAtRef.current = now;
        handleSkip();
      }
    };

    window.addEventListener('devicemotion', onMotion);

    return () => {
      window.removeEventListener('devicemotion', onMotion);
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
