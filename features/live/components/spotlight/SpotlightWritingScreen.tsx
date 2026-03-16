'use client';

import { useState } from 'react';
import { useSpotlightTemplates } from '@/features/live/hooks/useSpotlightTemplates';
import { pickRandomItem } from '@/features/live/utils';

interface SpotlightWritingScreenProps {
  spotlightName: string | null;
  roundIndex: number;
  isSpotlight: boolean;
  submittedCount: number;
  totalWriters: number;
  hasSubmitted: boolean;
  onSubmit: (text: string) => void;
}

export default function SpotlightWritingScreen({
  spotlightName,
  roundIndex,
  isSpotlight,
  submittedCount,
  totalWriters,
  hasSubmitted,
  onSubmit
}: SpotlightWritingScreenProps) {
  const [draft, setDraft] = useState('');
  const { templates, isLoading } = useSpotlightTemplates();
  const isDisabled = isSpotlight || hasSubmitted;

  const handleTemplate = (templateOptions: readonly string[]) => {
    if (isDisabled || templateOptions.length === 0) {
      return;
    }

    setDraft(pickRandomItem(templateOptions) ?? '');
  };

  const handleSubmit = () => {
    if (isDisabled) {
      return;
    }

    onSubmit(draft);
  };

  const spotlightLabel = spotlightName ? `🎤 ${spotlightName} is in the Spotlight!` : '🎤 Spotlight round';

  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Spotlight Round {Math.max(1, roundIndex)}</h1>
      </div>

      <div className="live-spotlight-banner">{spotlightLabel}</div>

      {isSpotlight ? (
        <div className="live-panel">
          <p className="live-question-copy">
            Everyone is writing an anonymous question for you. Get ready to answer out loud.
          </p>
          <p className="live-progress">
            {submittedCount}/{Math.max(0, totalWriters)} questions in
          </p>
        </div>
      ) : (
        <div className="live-panel">
          <label htmlFor="spotlight-question" className="live-label">
            Write one anonymous question
          </label>
          <textarea
            id="spotlight-question"
            className="live-input live-textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your question..."
            maxLength={160}
            disabled={isDisabled}
            rows={3}
          />

          <div className="live-template-row">
            <button
              type="button"
              className="live-btn-neutral"
              onClick={() => handleTemplate(templates.spicy)}
              disabled={isDisabled || isLoading || templates.spicy.length === 0}
            >
              😈 Spicy
            </button>
            <button
              type="button"
              className="live-btn-neutral"
              onClick={() => handleTemplate(templates.funny)}
              disabled={isDisabled || isLoading || templates.funny.length === 0}
            >
              😂 Funny
            </button>
            <button
              type="button"
              className="live-btn-neutral"
              onClick={() => handleTemplate(templates.deep)}
              disabled={isDisabled || isLoading || templates.deep.length === 0}
            >
              🤯 Deep
            </button>
          </div>

          <button type="button" className="live-btn-main" onClick={handleSubmit} disabled={isDisabled || draft.trim().length < 3}>
            {hasSubmitted ? 'Question Submitted' : 'Submit Question'}
          </button>

          <p className="live-helper-text">
            {submittedCount}/{Math.max(0, totalWriters)} questions in
          </p>
        </div>
      )}
    </section>
  );
}
