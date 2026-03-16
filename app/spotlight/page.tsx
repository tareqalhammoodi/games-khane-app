'use client';

import { useRouter } from 'next/navigation';
import LiveHomeScreen from '@/features/live/components/common/LiveHomeScreen';
import SpotlightHostScreen from '@/features/live/components/spotlight/SpotlightHostScreen';
import SpotlightResultsScreen from '@/features/live/components/spotlight/SpotlightResultsScreen';
import { useLiveGame } from '@/features/live/hooks/useLiveGame';

export default function SpotlightHomePage() {
  const router = useRouter();
  const {
    isConnected,
    errorMessage,
    roomCode,
    role,
    status,
    players,
    spotlightNickname,
    spotlightRoundIndex,
    spotlightSubmittedCount,
    spotlightTotalWriters,
    spotlightReactionCounts,
    spotlightReactionAnswered,
    spotlightTotalReactors,
    spotlightGuessAnswered,
    spotlightTotalGuessers,
    spotlightQuestionText,
    spotlightResults,
    spotlightSkipReason,
    isCreatingRoom,
    setRoomCode,
    createRoom,
    startGame,
    endGame,
    nextSpotlightRound
  } = useLiveGame();

  const handleJoinGame = () => {
    if (roomCode.length === 6) {
      router.push(`/spotlight/${roomCode}`);
    }
  };

  const handleStartOver = () => {
    createRoom({ mode: 'spotlight' });
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
            availableModes={['spotlight']}
            defaultMode="spotlight"
            title="Hot Seat Live"
            subtitle="Anonymous questions, reactions, and guess who asked."
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

        <SpotlightHostScreen
          roomCode={roomCode}
          status={status}
          players={players}
          spotlightName={spotlightNickname}
          roundIndex={spotlightRoundIndex}
          submittedCount={spotlightSubmittedCount}
          totalWriters={spotlightTotalWriters}
          reactionCounts={spotlightReactionCounts}
          reactionAnswered={spotlightReactionAnswered}
          totalReactors={spotlightTotalReactors}
          guessAnswered={spotlightGuessAnswered}
          totalGuessers={spotlightTotalGuessers}
          questionText={spotlightQuestionText}
          skipReason={spotlightSkipReason}
          onStartGame={startGame}
          onNextRound={nextSpotlightRound}
          onEndGame={endGame}
          onStartOver={handleStartOver}
        />

        {status === 'results' ? (
          <SpotlightResultsScreen results={spotlightResults} skipReason={spotlightSkipReason} />
        ) : null}

        {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
      </div>
    </main>
  );
}
