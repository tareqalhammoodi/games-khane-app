'use client';

import { SPOTLIGHT_REACTIONS } from "../../constants";


interface SpotlightRevealScreenProps {
  spotlightName: string | null;
  questionText: string | null;
  isSpotlight: boolean;
  reactionCounts: [number, number, number, number];
  answeredCount: number;
  totalReactors: number;
  hasReacted: boolean;
  selectedReactionIndex: number | null;
  onReact: (reactionIndex: number) => void;
  onOpenVotes: () => void;
}

export default function SpotlightRevealScreen({
  spotlightName,
  questionText,
  isSpotlight,
  reactionCounts,
  answeredCount,
  totalReactors,
  hasReacted,
  selectedReactionIndex,
  onReact,
  onOpenVotes
}: SpotlightRevealScreenProps) {
  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">Big Reveal</h1>
        <span className="live-status-pill">Answer Time</span>
      </div>

      <div className="live-spotlight-banner">
        {spotlightName
          ? `🎤 ${spotlightName} is on the spot`
          : "🎤 Spotlight time"}
      </div>

      <div className="live-panel live-reveal-panel">
        <div className="live-flip-card" aria-live="polite">
          <p className="live-question-copy live-question-copy--large">
            {questionText ?? "..."}
          </p>
        </div>
        <p className="live-muted" style={{ marginTop: "10px" }}>
          {isSpotlight
            ? "Answer out loud while everyone reacts."
            : "React live while the spotlight answers."}
        </p>
      </div>

      {!isSpotlight ? (
        <div className="live-reaction-grid">
          {SPOTLIGHT_REACTIONS.map((reaction, index) => (
            <button
              key={reaction.label}
              type="button"
              className={`live-reaction-btn live-option-btn--${index} ${selectedReactionIndex === index ? "live-option-selected" : ""}`}
              onClick={() => onReact(index)}
              disabled={hasReacted}
            >
              <span className="live-reaction-emoji">{reaction.emoji}</span>
              <span>{reaction.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="live-progress">
        {answeredCount}/{totalReactors} reacted
      </p>

      <div className="live-reaction-counts">
        {SPOTLIGHT_REACTIONS.map((reaction, index) => (
          <div
            key={`count-${reaction.label}`}
            className={`live-reaction-count live-reaction-count--${index}`}
          >
            <span>{reaction.emoji}</span>
            <strong>{reactionCounts[index] ?? 0}</strong>
          </div>
        ))}
      </div>

      {isSpotlight ? (
        <button type="button" className="live-btn-main" style={{ marginTop: "10px"}} onClick={onOpenVotes}>
          Open Votes
        </button>
      ) : (
        <p className="live-muted" style={{ marginTop: "10px" }}>
          Waiting for the spotlight to open votes...
        </p>
      )}
    </section>
  );
}
