'use client';

import { useState } from 'react';
import type { SpotlightChoice } from '@/features/live/types';

interface SpotlightChoiceScreenProps {
  spotlightName: string | null;
  isSpotlight: boolean;
  choices: SpotlightChoice[];
  onSelect: (questionId: string) => void;
}

export default function SpotlightChoiceScreen({
  spotlightName,
  isSpotlight,
  choices,
  onSelect
}: SpotlightChoiceScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (questionId: string) => {
    if (!isSpotlight || selectedId) {
      return;
    }

    setSelectedId(questionId);
    onSelect(questionId);
  };

  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Pick a Question</h1>
      </div>

      <div className="live-spotlight-banner">
        {spotlightName ? `🎤 ${spotlightName} chooses the card` : '🎤 Spotlight chooses the card'}
      </div>

      <div className="live-spotlight-choice-grid">
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const label = !isSpotlight ? '???' : isSelected ? choice.text : '???';

          return (
            <button
              key={choice.id}
              type="button"
              className={`live-spotlight-card ${isSelected ? 'live-spotlight-card--selected' : ''}`}
              onClick={() => handleSelect(choice.id)}
              disabled={!isSpotlight || !!selectedId}
            >
              <span className="live-spotlight-card__mystery">{label}</span>
              {!isSelected && isSpotlight ? <span className="live-spotlight-card__hint">Tap to reveal</span> : null}
            </button>
          );
        })}
      </div>

      {!isSpotlight ? <p className="live-muted">Waiting for the spotlight to pick a card...</p> : null}
    </section>
  );
}
