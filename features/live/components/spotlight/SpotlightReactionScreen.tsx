'use client';

import { SPOTLIGHT_REACTIONS } from "../../constants";


interface SpotlightReactionScreenProps {
  questionText: string | null;
  reactionCounts: [number, number, number, number];
  answeredCount: number;
  totalPlayers: number;
  hasReacted: boolean;
  selectedReactionIndex: number | null;
  onReact: (reactionIndex: number) => void;
}

export default function SpotlightReactionScreen({
  questionText,
  reactionCounts,
  answeredCount,
  totalPlayers,
  hasReacted,
  selectedReactionIndex,
  onReact
}: SpotlightReactionScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">React</h1>
      </div>

      <p className="live-question-copy live-question-copy--large">{questionText ?? '...'}</p>

      <div className="live-reaction-grid">
        {SPOTLIGHT_REACTIONS.map((reaction, index) => (
          <button
            key={reaction.label}
            type="button"
            className={`live-reaction-btn live-option-btn--${index} ${selectedReactionIndex === index ? 'live-option-selected' : ''}`}
            onClick={() => onReact(index)}
            disabled={hasReacted}
          >
            <span className="live-reaction-emoji">{reaction.emoji}</span>
            <span>{reaction.label}</span>
          </button>
        ))}
      </div>

      <p className="live-progress">
        {answeredCount}/{totalPlayers} reacted
      </p>

      <div className="live-reaction-counts">
        {SPOTLIGHT_REACTIONS.map((reaction, index) => (
          <div key={`count-${reaction.label}`} className={`live-reaction-count live-reaction-count--${index}`}>
            <span>{reaction.emoji}</span>
            <strong>{reactionCounts[index] ?? 0}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
