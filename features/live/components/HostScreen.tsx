'use client';

import { useMemo, useState } from 'react';
import type { Player } from '@/features/live/types/live';

interface HostScreenProps {
  roomCode: string;
  status: 'lobby' | 'question' | 'results' | 'finished' | 'idle';
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

function statusLabel(status: HostScreenProps['status']): string {
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

export default function HostScreen({
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
}: HostScreenProps) {
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');

  const joinUrl = useMemo(() => {
    if (!roomCode) {
      return '';
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}/live/${roomCode}`;
    }

    return `/live/${roomCode}`;
  }, [roomCode]);

  const qrCodeImageUrl = useMemo(() => {
    if (!joinUrl) {
      return '';
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}`;
  }, [joinUrl]);

  const handleCopyJoinLink = async () => {
    if (!joinUrl || !navigator?.clipboard) {
      setCopyFeedback('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyFeedback('copied');
      window.setTimeout(() => setCopyFeedback('idle'), 1600);
    } catch {
      setCopyFeedback('failed');
      window.setTimeout(() => setCopyFeedback('idle'), 1600);
    }
  };

  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Host Dashboard</h1>
        <span className="live-status-pill">{statusLabel(status)}</span>
      </div>

      <div className="live-room-box">
        <span>Room Code</span>
        <strong>{roomCode || '------'}</strong>
      </div>

      {joinUrl ? (
        <div className="live-panel live-qr-panel">
          <h2 className="live-section-title">Scan QR to Join</h2>
          <img src={qrCodeImageUrl} alt="Join room QR code" className="live-qr-image" />
          <p className="live-qr-url">{joinUrl}</p>
          <button type="button" className="live-btn-neutral live-copy-btn" onClick={handleCopyJoinLink}>
            {copyFeedback === 'copied' ? 'Link Copied' : copyFeedback === 'failed' ? 'Copy Failed' : 'Copy Join Link'}
          </button>
        </div>
      ) : null}

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
