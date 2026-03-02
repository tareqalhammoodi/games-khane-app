'use client';

import { useRouter } from 'next/navigation';
import LeaderboardScreen from '@/features/live/components/LeaderboardScreen';
import PlayerJoinScreen from '@/features/live/components/PlayerJoinScreen';
import QuestionScreen from '@/features/live/components/QuestionScreen';
import ResultsScreen from '@/features/live/components/ResultsScreen';
import { useLiveGame } from '@/features/live/hooks/useLiveGame';

interface LiveRoomPageProps {
  roomCode: string;
}

export default function LiveRoomPage({ roomCode }: LiveRoomPageProps) {
  const router = useRouter();
  const {
    status,
    role,
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
    errorMessage,
    isJoiningRoom,
    joinRoom,
    submitAnswer
  } = useLiveGame({ initialRoomCode: roomCode });

  const hasJoined = role === 'player' && status !== 'idle';

  const handleBackToMain = () => {
    router.push('/');
  };

  const handleStartOver = () => {
    router.push('/live');
  };

  if (!hasJoined) {
    return (
      <main>
        <div className="app">
          <div className="live-page-actions">
            <button type="button" className="back live-back-btn" onClick={handleBackToMain}>
              ← Back to Main
            </button>
          </div>
          <PlayerJoinScreen
            roomCode={roomCode}
            errorMessage={errorMessage}
            isJoining={isJoiningRoom}
            onJoin={joinRoom}
          />
        </div>
      </main>
    );
  }

  if (status === 'lobby') {
    return (
      <main>
        <div className="app">
          <section className="live-shell">
            <h1 className="live-title">Waiting for Host</h1>
            <div className="live-room-box">
              <span>Room Code</span>
              <strong>{roomCode}</strong>
            </div>
            <p className="live-muted">You joined successfully. The host will start soon.</p>
          </section>
          <LeaderboardScreen players={players} />
        </div>
      </main>
    );
  }

  if (status === 'question' && currentQuestion) {
    return (
      <main>
        <div className="app">
          <QuestionScreen
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            secondsLeft={secondsLeft}
            hasAnswered={hasAnswered}
            selectedOptionIndex={selectedOptionIndex}
            answeredCount={answeredCount}
            totalPlayers={totalPlayers}
            onSelectOption={submitAnswer}
          />
        </div>
      </main>
    );
  }

  if (status === 'results') {
    return (
      <main>
        <div className="app">
          <ResultsScreen
            question={currentQuestion}
            correctOptionIndex={correctOptionIndex}
            voteCounts={voteCounts}
          />
          <LeaderboardScreen players={leaderboard} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="app">
        <section className="live-shell">
          <h1 className="live-title">Game Finished</h1>
          <p className="live-muted">Thanks for playing in room {roomCode}.</p>
          <div className="live-actions live-finish-actions">
            <button type="button" className="live-btn-main" onClick={handleStartOver}>
              Start Over
            </button>
            <button type="button" className="back live-back-btn" onClick={handleBackToMain}>
              ← Back to Main
            </button>
          </div>
        </section>
        <LeaderboardScreen players={leaderboard} />
      </div>
    </main>
  );
}
