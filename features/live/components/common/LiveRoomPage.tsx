'use client';

import { useRouter } from 'next/navigation';
import PlayerJoinScreen from '@/features/live/components/common/PlayerJoinScreen';
import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import QuizLeaderboardScreen from '@/features/live/components/quiz/QuizLeaderboardScreen';
import QuizQuestionScreen from '@/features/live/components/quiz/QuizQuestionScreen';
import QuizResultsScreen from '@/features/live/components/quiz/QuizResultsScreen';
import SpotlightChoiceScreen from '@/features/live/components/spotlight/SpotlightChoiceScreen';
import SpotlightGuessScreen from '@/features/live/components/spotlight/SpotlightGuessScreen';
import SpotlightRevealScreen from '@/features/live/components/spotlight/SpotlightRevealScreen';
import SpotlightResultsScreen from '@/features/live/components/spotlight/SpotlightResultsScreen';
import SpotlightWritingScreen from '@/features/live/components/spotlight/SpotlightWritingScreen';
import { useLiveGame } from '@/features/live/hooks/useLiveGame';

interface LiveRoomPageProps {
  roomCode: string;
  startOverPath?: string;
  forceSpotlight?: boolean;
}

export default function LiveRoomPage({ roomCode, startOverPath = '/live', forceSpotlight = false }: LiveRoomPageProps) {
  const router = useRouter();
  const {
    status,
    role,
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
    errorMessage,
    isJoiningRoom,
    joinRoom,
    submitAnswer,
    submitSpotlightQuestion,
    selectSpotlightQuestion,
    openSpotlightVotes,
    submitSpotlightReaction,
    submitSpotlightGuess,
    nextSpotlightRound
  } = useLiveGame({ initialRoomCode: roomCode });

  const hasJoined = role === 'player' && status !== 'idle';
  const isSpotlight = !!spotlightId && !!socketId && spotlightId === socketId;
  const isSpotlightMode =
    mode === 'spotlight' ||
    status === 'writing' ||
    status === 'choice' ||
    status === 'reveal' ||
    status === 'reaction' ||
    status === 'guess';
  const isSpotlightRoom = forceSpotlight || mode === 'spotlight' || isSpotlightMode;

  const handleBackToMain = () => {
    router.push('/');
  };

  const handleStartOver = () => {
    router.push(startOverPath);
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
            <RoomCodeCard roomCode={roomCode} />
            <p className="live-muted">You joined successfully. The host will start soon.</p>
          </section>
          {!isSpotlightRoom ? <QuizLeaderboardScreen players={players} /> : null}
        </div>
      </main>
    );
  }

  if (status === 'question' && currentQuestion) {
    return (
      <main>
        <div className="app">
          <QuizQuestionScreen
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            secondsLeft={secondsLeft}
            timerTotalSeconds={timerTotalSeconds}
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

  if (isSpotlightMode) {
    if (status === 'writing') {
      return (
        <main>
          <div className="app">
            <SpotlightWritingScreen
              spotlightName={spotlightNickname}
              roundIndex={spotlightRoundIndex}
              isSpotlight={isSpotlight}
              submittedCount={spotlightSubmittedCount}
              totalWriters={spotlightTotalWriters}
              hasSubmitted={hasSubmittedQuestion}
              onSubmit={submitSpotlightQuestion}
            />
          </div>
        </main>
      );
    }

    if (status === 'choice') {
      return (
        <main>
          <div className="app">
            <SpotlightChoiceScreen
              spotlightName={spotlightNickname}
              isSpotlight={isSpotlight}
              choices={spotlightChoices}
              onSelect={selectSpotlightQuestion}
            />
          </div>
        </main>
      );
    }

    if (status === 'reveal') {
      return (
        <main>
          <div className="app">
            <SpotlightRevealScreen
              spotlightName={spotlightNickname}
              questionText={spotlightQuestionText}
              isSpotlight={isSpotlight}
              reactionCounts={spotlightReactionCounts}
              answeredCount={spotlightReactionAnswered}
              totalReactors={spotlightTotalReactors}
              hasReacted={hasReacted}
              selectedReactionIndex={selectedReactionIndex}
              onReact={submitSpotlightReaction}
              onOpenVotes={openSpotlightVotes}
            />
          </div>
        </main>
      );
    }

    if (status === 'guess') {
      return (
        <main>
          <div className="app">
            <SpotlightGuessScreen
              questionText={spotlightQuestionText}
              choices={spotlightGuessOptions}
              answeredCount={spotlightGuessAnswered}
              totalGuessers={spotlightTotalGuessers}
              isSpotlight={isSpotlight}
              hasGuessed={hasGuessed}
              selectedGuessId={selectedGuessId}
              onGuess={submitSpotlightGuess}
            />
          </div>
        </main>
      );
    }

    if (status === 'results') {
      return (
        <main>
          <div className="app">
            <SpotlightResultsScreen
              results={spotlightResults}
              skipReason={spotlightSkipReason}
              canContinue={isSpotlight}
              onContinue={nextSpotlightRound}
            />
          </div>
        </main>
      );
    }
  }

  if (status === 'results') {
    return (
      <main>
        <div className="app">
          <QuizResultsScreen
            question={currentQuestion}
            correctOptionIndex={correctOptionIndex}
            voteCounts={voteCounts}
          />
          <QuizLeaderboardScreen players={leaderboard} />
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
        {!isSpotlightRoom ? <QuizLeaderboardScreen players={leaderboard} /> : null}
      </div>
    </main>
  );
}
