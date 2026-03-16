'use client';

import type { SpotlightPlayer } from '@/features/live/types';

interface SpotlightGuessScreenProps {
  questionText: string | null;
  choices: SpotlightPlayer[];
  answeredCount: number;
  totalGuessers: number;
  isSpotlight: boolean;
  hasGuessed: boolean;
  selectedGuessId: string | null;
  onGuess: (playerId: string) => void;
}

export default function SpotlightGuessScreen({
  questionText,
  choices,
  answeredCount,
  totalGuessers,
  isSpotlight,
  hasGuessed,
  selectedGuessId,
  onGuess
}: SpotlightGuessScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Who Asked?</h1>
      </div>

      <p className="live-question-copy live-question-copy--large">{questionText ?? '...'}</p>

      {isSpotlight ? (
        <p className="live-muted">Everyone else is guessing who asked. Sit tight.</p>
      ) : (
        <>
          <div className="live-guess-grid">
            {choices.map((player) => (
              <button
                key={player.id}
                type="button"
                className={`live-guess-btn ${selectedGuessId === player.id ? 'live-guess-btn--selected' : ''}`}
                onClick={() => onGuess(player.id)}
                disabled={hasGuessed}
              >
                {player.nickname}
              </button>
            ))}
          </div>

          <p className="live-progress">
            {answeredCount}/{totalGuessers} guessed
          </p>
        </>
      )}
    </section>
  );
}
