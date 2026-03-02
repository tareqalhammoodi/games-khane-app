'use client';

import { useRouter } from 'next/navigation';
import HostScreen from '@/features/live/components/HostScreen';
import LeaderboardScreen from '@/features/live/components/LeaderboardScreen';
import LiveHomeScreen from '@/features/live/components/LiveHomeScreen';
import ResultsScreen from '@/features/live/components/ResultsScreen';
import { useLiveGame } from '@/features/live/hooks/useLiveGame';

export default function LiveHomePage() {
  const router = useRouter();
  const {
    isConnected,
    errorMessage,
    roomCode,
    role,
    status,
    players,
    leaderboard,
    currentQuestion,
    voteCounts,
    correctOptionIndex,
    answeredCount,
    totalPlayers,
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
    createRoom();
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
        <HostScreen
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

        {status === 'results' ? (
          <ResultsScreen
            question={currentQuestion}
            correctOptionIndex={correctOptionIndex}
            voteCounts={voteCounts}
          />
        ) : null}

        {status === 'results' || status === 'finished' ? <LeaderboardScreen players={leaderboard} /> : null}

        {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
      </div>
    </main>
  );
}
