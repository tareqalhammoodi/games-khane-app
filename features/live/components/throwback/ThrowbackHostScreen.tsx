'use client';

import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import RoomShareCard from '@/features/live/components/common/RoomShareCard';
import type { LiveStatus, Player } from '@/features/live/types';

interface ThrowbackHostScreenProps {
  roomCode: string;
  status: LiveStatus | 'idle';
  players: Player[];
  prompt: string | null;
  imageLabel: string | null;
  uploadedCount: number;
  questionText: string | null;
  imageDataUrl: string | null;
  voteCounts: number[];
  answeredCount: number;
  totalPlayers: number;
  onStartGame: () => void;
  onNextQuestion: () => void;
  onEndGame: () => void;
  onStartOver: () => void;
}

function statusLabel(status: ThrowbackHostScreenProps['status']): string {
  if (status === 'question') {
    return 'Photo Live';
  }

  if (status === 'results') {
    return 'Photo Results';
  }

  if (status === 'finished') {
    return 'Finished';
  }

  if (status === 'lobby') {
    return 'Collecting Photos';
  }

  return 'Ready';
}

export default function ThrowbackHostScreen({
  roomCode,
  status,
  players,
  prompt,
  imageLabel,
  uploadedCount,
  questionText,
  imageDataUrl,
  voteCounts,
  answeredCount,
  totalPlayers,
  onStartGame,
  onNextQuestion,
  onEndGame,
  onStartOver
}: ThrowbackHostScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Throwback Host</h1>
        <span className="live-status-pill">{statusLabel(status)}</span>
      </div>

      <RoomCodeCard roomCode={roomCode} />
      <RoomShareCard roomCode={roomCode} joinPathBase="/live" />

      <div className="live-panel">
        <h2 className="live-section-title">Round Setup</h2>
        <p className="live-question-copy">{prompt ?? 'Whose photo is this?'}</p>
        <p className="live-helper-text">
          Players upload an image of/from their: <strong>{imageLabel ?? 'childhood'}</strong>
        </p>
        {status === 'lobby' ? (
          <p className="live-progress">
            {uploadedCount}/{players.length} photos ready
          </p>
        ) : null}
        {(status === 'question' || status === 'results') && questionText ? (
          <p className="live-progress">
            {answeredCount}/{totalPlayers} guessed this photo
          </p>
        ) : null}
      </div>

      <div className="live-panel">
        <h2 className="live-section-title">Players ({players.length})</h2>
        <ul className="live-player-list">
          {players.length === 0 ? <li className="live-muted">Waiting for players...</li> : null}
          {players.map((player) => (
            <li key={player.id}>
              <div className="live-player-stack">
                <span>{player.nickname}</span>
                <span className={`live-upload-pill ${player.hasUploadedImage ? 'live-upload-pill--ready' : ''}`}>
                  {player.hasUploadedImage ? 'Photo ready' : 'Waiting'}
                </span>
              </div>
              <strong>{player.score}</strong>
            </li>
          ))}
        </ul>
      </div>

      {(status === 'question' || status === 'results') && voteCounts.length > 0 ? (
        <div className="live-panel">
          <h2 className="live-section-title">Live Votes</h2>
          {imageDataUrl ? (
            <div className="live-image-stage">
              <img src={imageDataUrl} alt="Current throwback round" className="live-round-image" />
            </div>
          ) : null}
          <p className="live-question-copy">{questionText ?? 'Photo round is live.'}</p>
          <div className="live-vote-grid">
            {voteCounts.map((count, index) => (
              <div key={`vote-${index}`} className={`live-vote-card live-vote-card--${index % 4}`}>
                <span>Choice {index + 1}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="live-actions">
        {status === 'lobby' ? (
          <button
            type="button"
            className="live-btn-main"
            onClick={onStartGame}
            disabled={players.length < 2 || uploadedCount !== players.length}
          >
            Start Throwback
          </button>
        ) : null}

        {status === 'results' ? (
          <button type="button" className="live-btn-main" onClick={onNextQuestion}>
            Next Photo
          </button>
        ) : null}

        {status !== 'finished' ? (
          <button type="button" className="live-btn-danger" onClick={onEndGame}>
            End Game
          </button>
        ) : null}

        {status === 'finished' ? (
          <button type="button" className="live-btn-main" onClick={onStartOver}>
            Start Over
          </button>
        ) : null}
      </div>
    </section>
  );
}
