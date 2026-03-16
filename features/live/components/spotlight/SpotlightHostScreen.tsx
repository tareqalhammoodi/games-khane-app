'use client';

import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import RoomShareCard from '@/features/live/components/common/RoomShareCard';
import type { LiveStatus, Player } from '@/features/live/types';

interface SpotlightHostScreenProps {
  roomCode: string;
  status: LiveStatus | 'idle';
  players: Player[];
  spotlightName: string | null;
  roundIndex: number;
  submittedCount: number;
  totalWriters: number;
  reactionCounts: [number, number, number, number];
  reactionAnswered: number;
  totalReactors: number;
  guessAnswered: number;
  totalGuessers: number;
  questionText: string | null;
  skipReason: string | null;
  joinPathBase?: string;
  onStartGame: () => void;
  onNextRound: () => void;
  onEndGame: () => void;
  onStartOver: () => void;
}

function statusLabel(status: SpotlightHostScreenProps['status']): string {
  if (status === 'writing') {
    return 'Collecting Questions';
  }

  if (status === 'choice') {
    return 'Choosing';
  }

  if (status === 'reveal') {
    return 'Answering';
  }

  if (status === 'reaction') {
    return 'Reactions';
  }

  if (status === 'guess') {
    return 'Voting';
  }

  if (status === 'results') {
    return 'Results';
  }

  if (status === 'finished') {
    return 'Finished';
  }

  if (status === 'lobby') {
    return 'Lobby';
  }

  return 'Ready';
}

export default function SpotlightHostScreen({
  roomCode,
  status,
  players,
  spotlightName,
  roundIndex,
  submittedCount,
  totalWriters,
  reactionCounts,
  reactionAnswered,
  totalReactors,
  guessAnswered,
  totalGuessers,
  questionText,
  skipReason,
  joinPathBase = '/spotlight',
  onStartGame,
  onNextRound,
  onEndGame,
  onStartOver
}: SpotlightHostScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Spotlight Host</h1>
        <span className="live-status-pill">{statusLabel(status)}</span>
      </div>

      <RoomCodeCard roomCode={roomCode} />

      <RoomShareCard roomCode={roomCode} joinPathBase={joinPathBase} />

      <div className="live-panel">
        <h2 className="live-section-title">Players ({players.length})</h2>
        <ul className="live-player-list">
          {players.length === 0 ? <li className="live-muted">Waiting for players...</li> : null}
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.nickname}</span>
              <span className="live-muted">Joined</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="live-panel">
        <h2 className="live-section-title">Round {Math.max(1, roundIndex)}</h2>
        <p className="live-question-copy">
          {spotlightName ? `Spotlight: ${spotlightName}` : 'Waiting for spotlight...'}
        </p>
        {status === 'writing' ? (
          <p className="live-progress">
            {submittedCount}/{Math.max(0, totalWriters)} questions in
          </p>
        ) : null}
        {status === 'reveal' && questionText ? (
          <p className="live-question-copy">{questionText}</p>
        ) : null}
        {status === 'reveal' || status === 'reaction' ? (
          <div className="live-vote-grid">
            {reactionCounts.map((count, index) => (
              <div key={`reaction-${index}`} className={`live-vote-card live-vote-card--${index}`}>
                <span>Reaction {index + 1}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        ) : null}
        {status === 'reveal' || status === 'reaction' ? (
          <p className="live-progress">
            {reactionAnswered}/{totalReactors} reacted
          </p>
        ) : null}
        {status === 'guess' ? (
          <p className="live-progress">
            {guessAnswered}/{totalGuessers} guessed
          </p>
        ) : null}
        {status === 'results' && skipReason ? <p className="live-muted">{skipReason}</p> : null}
      </div>

      <div className="live-actions">
        {status === 'lobby' && (
          <button type="button" className="live-btn-main" onClick={onStartGame} disabled={players.length === 0}>
            Start Game
          </button>
        )}

        {status === 'results' && (
          <button type="button" className="live-btn-main" onClick={onNextRound}>
            Next Spotlight
          </button>
        )}

        {status !== 'finished' && (
          <button type="button" className="live-btn-danger" onClick={onEndGame}>
            End Game
          </button>
        )}

        {status === 'finished' && (
          <button type="button" className="live-btn-main" onClick={onStartOver}>
            Start Over
          </button>
        )}
      </div>
    </section>
  );
}
