'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandscapeRequiredScreen from '@/features/tilt-guess/components/LandscapeRequiredScreen';
import TiltGuessGameScreen from '@/features/tilt-guess/components/TiltGuessGameScreen';
import TiltGuessHomeScreen from '@/features/tilt-guess/components/TiltGuessHomeScreen';
import TiltGuessResultScreen from '@/features/tilt-guess/components/TiltGuessResultScreen';
import { useDeviceOrientation } from '@/features/tilt-guess/hooks/useDeviceOrientation';
import { useTiltGuess } from '@/features/tilt-guess/hooks/useTiltGuess';
import type { TiltGuessCategorySelection } from '@/features/tilt-guess/types/tiltGuess';

type TiltGuessView = 'home' | 'landscape' | 'game' | 'result';

export default function TiltGuessPage() {
  const router = useRouter();
  const { isLandscape } = useDeviceOrientation();
  const {
    currentWord,
    timeRemaining,
    correctCount,
    skipCount,
    gameStatus,
    feedback,
    isStarting,
    motionPermission,
    canRequestMotionPermission,
    startGame,
    endGame,
    resetGame,
    requestMotionPermission,
  } = useTiltGuess();

  const [view, setView] = useState<TiltGuessView>('home');
  const [pendingStart, setPendingStart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TiltGuessCategorySelection>('all');

  const beginRound = useCallback(async (): Promise<boolean> => {
    const apiCategory = selectedCategory === 'all' ? undefined : selectedCategory;
    const started = await startGame(apiCategory);

    if (started) {
      setPendingStart(false);
      setView('game');
      return true;
    }

    setPendingStart(false);
    setView('home');
    return false;
  }, [selectedCategory, startGame]);

  const handleStartRequest = useCallback(() => {
    if (!isLandscape) {
      setPendingStart(true);
      setView('landscape');
      return;
    }

    void beginRound();
  }, [beginRound, isLandscape]);

  const handleEnableMotionControls = useCallback(() => {
    void requestMotionPermission();
  }, [requestMotionPermission]);

  const handleLandscapeBack = useCallback(() => {
    setPendingStart(false);
    setView('home');
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!isLandscape) {
      setPendingStart(true);
      setView('landscape');
      return;
    }

    void beginRound();
  }, [beginRound, isLandscape]);

  const handleBackToGames = useCallback(() => {
    resetGame();
    router.push('/');
  }, [resetGame, router]);

  useEffect(() => {
    if (view === 'landscape' && pendingStart && isLandscape) {
      void beginRound();
    }
  }, [beginRound, isLandscape, pendingStart, view]);

  useEffect(() => {
    if (gameStatus === 'finished') {
      setView('result');
    }
  }, [gameStatus]);

  return (
    <main>
      <div className="app tilt-guess-app">
        {view === 'landscape' ? (
          <LandscapeRequiredScreen isLandscape={isLandscape} onBack={handleLandscapeBack} />
        ) : null}

        {view === 'game' ? (
          <>
            <TiltGuessGameScreen currentWord={currentWord} timeRemaining={timeRemaining} feedback={feedback} />
            <button type="button" className="tilt-guess-end-outside-btn" onClick={endGame}>
              End Round
            </button>
          </>
        ) : null}

        {view === 'result' ? (
          <TiltGuessResultScreen
            correctCount={correctCount}
            skipCount={skipCount}
            onPlayAgain={handlePlayAgain}
            onBackToGames={handleBackToGames}
          />
        ) : null}

        {view === 'home' ? (
          <TiltGuessHomeScreen
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onStartGame={handleStartRequest}
            onBack={handleBackToGames}
            isStarting={isStarting}
            motionPermission={motionPermission}
            canRequestMotionPermission={canRequestMotionPermission}
            onEnableMotionControls={handleEnableMotionControls}
          />
        ) : null}
      </div>
    </main>
  );
}
