'use client';

import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import RoomShareCard from '@/features/live/components/common/RoomShareCard';
import type { LiveStatus, Player } from '@/features/live/types';

interface QuizHostScreenProps {
  roomCode: string;
  status: LiveStatus | 'idle';
  players: Player[];
  questionText: string | null;
  voteCounts: number[];
  answeredCount: number;
  totalPlayers: number;
  onStartGame: () => void;
  onNextQuestion: () => void;
  onEndGame: () => void;
  onStartOver: () => void;
}

function statusLabel(status: QuizHostScreenProps['status']): string {
  if (status === 'question') {
    return 'Question Live';
  }

  if (status === 'results') {
    return 'Showing Results';
  }

  if (status === 'finished') {
    return 'Finished';
  }

  if (status === 'lobby') {
    return 'Lobby';
  }

  return 'Ready';
}

export default function QuizHostScreen({
  roomCode,
  status,
  players,
  questionText,
  voteCounts,
  answeredCount,
  totalPlayers,
  onStartGame,
  onNextQuestion,
  onEndGame,
  onStartOver
}: QuizHostScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Host Dashboard</h1>
        <span className="live-status-pill">{statusLabel(status)}</span>
      </div>

      <RoomCodeCard roomCode={roomCode} />

      <RoomShareCard roomCode={roomCode} joinPathBase="/live" />

      <div className="live-panel">
        <h2 className="live-section-title">Players ({players.length})</h2>
        <ul className="live-player-list">
          {players.length === 0 ? <li className="live-muted">Waiting for players...</li> : null}
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.nickname}</span>
              <strong>{player.score}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="live-panel">
        <h2 className="live-section-title">Live Votes</h2>
        <p className="live-question-copy">{questionText ?? 'Start when players join.'}</p>

        {(status === 'question' || status === 'results') && (
          <>
            <p className="live-progress">
              {answeredCount}/{totalPlayers} answered
            </p>
            <div className="live-vote-grid">
              {voteCounts.map((count, index) => (
                <div key={`vote-${index}`} className={`live-vote-card live-vote-card--${index}`}>
                  <span>Option {index + 1}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="live-actions">
        {status === 'lobby' && (
          <button type="button" className="live-btn-main" onClick={onStartGame} disabled={players.length === 0}>
            Start Game
          </button>
        )}

        {status === 'results' && (
          <button type="button" className="live-btn-main" onClick={onNextQuestion}>
            Next Question
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
