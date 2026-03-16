'use client';

import type { SpotlightRoundResults } from '@/features/live/types';
import { SPOTLIGHT_REACTIONS } from '../../constants';

interface SpotlightResultsScreenProps {
  results: SpotlightRoundResults | null;
  skipReason: string | null;
  canContinue?: boolean;
  onContinue?: () => void;
}

export default function SpotlightResultsScreen({
  results,
  skipReason,
  canContinue = false,
  onContinue
}: SpotlightResultsScreenProps) {
  if (skipReason) {
    return (
      <section className="live-shell">
        <h1 className="live-title">Round Skipped</h1>
        <p className="live-muted">{skipReason}</p>
        {canContinue && onContinue ? (
          <button type="button" className="live-btn-main" onClick={onContinue}>
            Next Spotlight
          </button>
        ) : null}
      </section>
    );
  }

  if (!results) {
    return (
      <section className="live-shell">
        <h1 className="live-title">Round Complete</h1>
        <p className="live-muted">Waiting for the next spotlight...</p>
        {canContinue && onContinue ? (
          <button type="button" className="live-btn-main" onClick={onContinue}>
            Next Spotlight
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="live-shell">
      <h1 className="live-title">Results</h1>

      <div className="live-panel">
        <p className="live-muted">Who is most likely to have asked the question based on the vote?</p>
        <p className="live-question-copy" style={{marginTop: 15, fontWeight: 900}}>{results.questionText}</p>

        <div className="live-guess-results">
          <h2 className="live-section-title">Votes</h2>
          <ul className="live-results-list">
            {results.guessResults.map((guess) => (
              <li key={guess.playerId} className="live-result-item">
                <div className="live-result-head">
                  <span>{guess.nickname}</span>
                  <strong>{guess.count}</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="live-helper-text">Who really asked stays secret.</p>
      </div>

      {canContinue && onContinue ? (
        <div className="live-actions">
          <button type="button" className="live-btn-main" onClick={onContinue}>
            Next Spotlight
          </button>
        </div>
      ) : null}
    </section>
  );
}
