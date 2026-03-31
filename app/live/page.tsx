'use client';

import { useRouter } from 'next/navigation';
import LiveHomeScreen from '@/features/live/components/common/LiveHomeScreen';
import QuizLeaderboardScreen from '@/features/live/components/quiz/QuizLeaderboardScreen';
import QuizHostScreen from '@/features/live/components/quiz/QuizHostScreen';
import QuizResultsScreen from '@/features/live/components/quiz/QuizResultsScreen';
import ThrowbackHostScreen from '@/features/live/components/throwback/ThrowbackHostScreen';
import { useLiveGame } from '@/features/live/hooks/useLiveGame';

export default function LiveHomePage() {
  const router = useRouter();
  const {
    isConnected,
    errorMessage,
    roomCode,
    role,
    status,
    mode,
    players,
    leaderboard,
    currentQuestion,
    voteCounts,
    correctOptionIndex,
    answeredCount,
    totalPlayers,
    throwbackPrompt,
    throwbackImageLabel,
    throwbackUploadedCount,
    throwbackConfig,
    isCreatingRoom,
    setRoomCode,
    createRoom,
    startGame,
    nextQuestion,
    endGame
  } = useLiveGame();

  const handleJoinGame = () => {
    if (roomCode.length === 6) {
      router.push(`/live/${roomCode}`);
    }
  };

  const handleStartOver = () => {
    if (mode === 'throwback') {
      createRoom({
        mode: 'throwback',
        throwbackConfig: throwbackConfig ?? undefined
      });
      return;
    }

    createRoom({ mode: 'quiz' });
  };

  const handleBackToMain = () => {
    router.push('/');
  };

  if (role !== 'host') {
    return (
      <main>
        <div className="app">
          <div className="live-page-actions">
            <button type="button" className="back live-back-btn" onClick={handleBackToMain}>
              ← Back to Main
            </button>
          </div>
          <LiveHomeScreen
            roomCode={roomCode}
            errorMessage={errorMessage}
            isConnected={isConnected}
            isCreatingRoom={isCreatingRoom}
            onRoomCodeChange={setRoomCode}
            onHostGame={createRoom}
            onJoinGame={handleJoinGame}
            availableModes={['quiz', 'throwback']}
            defaultMode="quiz"
            title="GameKhane Live"
            subtitle="Host quiz rounds or photo-based throwback guessing rooms."
          />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="app">
        <div className="live-page-actions">
          <button type="button" className="back live-back-btn" onClick={handleBackToMain}>
            ← Back to Main
          </button>
        </div>
        {mode === 'throwback' ? (
          <ThrowbackHostScreen
            roomCode={roomCode}
            status={status}
            players={players}
            prompt={throwbackPrompt}
            imageLabel={throwbackImageLabel}
            uploadedCount={throwbackUploadedCount}
            questionText={currentQuestion?.prompt ?? null}
            imageDataUrl={currentQuestion?.imageDataUrl ?? null}
            voteCounts={voteCounts}
            answeredCount={answeredCount}
            totalPlayers={totalPlayers}
            onStartGame={startGame}
            onNextQuestion={nextQuestion}
            onEndGame={endGame}
            onStartOver={handleStartOver}
          />
        ) : (
          <QuizHostScreen
            roomCode={roomCode}
            status={status}
            players={players}
            questionText={currentQuestion?.prompt ?? null}
            voteCounts={voteCounts}
            answeredCount={answeredCount}
            totalPlayers={totalPlayers}
            onStartGame={startGame}
            onNextQuestion={nextQuestion}
            onEndGame={endGame}
            onStartOver={handleStartOver}
          />
        )}

        {status === 'results' ? (
          <QuizResultsScreen
            question={currentQuestion}
            correctOptionIndex={correctOptionIndex}
            voteCounts={voteCounts}
          />
        ) : null}

        {status === 'results' || status === 'finished' ? <QuizLeaderboardScreen players={leaderboard} /> : null}

        {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
      </div>
    </main>
  );
}
