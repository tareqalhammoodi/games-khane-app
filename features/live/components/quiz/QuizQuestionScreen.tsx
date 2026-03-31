import type { Question } from '@/features/live/types';

interface QuizQuestionScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  secondsLeft: number;
  timerTotalSeconds: number;
  hasAnswered: boolean;
  selectedOptionIndex: number | null;
  answeredCount: number;
  totalPlayers: number;
  onSelectOption: (optionIndex: number) => void;
}

export default function QuizQuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  secondsLeft,
  timerTotalSeconds,
  hasAnswered,
  selectedOptionIndex,
  answeredCount,
  totalPlayers,
  onSelectOption
}: QuizQuestionScreenProps) {
  const total = Math.max(1, timerTotalSeconds || 15);
  const timerWidth = `${Math.max(0, Math.min(100, (secondsLeft / total) * 100))}%`;
  const isImageRound = Boolean(question.imageDataUrl);

  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">
          {isImageRound ? 'Photo' : 'Question'} {questionIndex + 1}/{totalQuestions}
        </h1>
        <span className="live-timer-pill">{secondsLeft}s</span>
      </div>

      {question.imageDataUrl ? (
        <div className="live-image-stage">
          <img src={question.imageDataUrl} alt="Current round visual" className="live-round-image" />
        </div>
      ) : null}

      <p className="live-question-copy live-question-copy--large">{question.prompt}</p>

      <div className="live-time-track" aria-hidden="true">
        <span className="live-time-fill" style={{ width: timerWidth }} />
      </div>

      <div className="live-options-grid">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelectOption(index)}
            disabled={hasAnswered}
            className={`live-option-btn live-option-btn--${index} ${selectedOptionIndex === index ? 'live-option-selected' : ''}`}
          >
            <span className="live-option-key">{String.fromCharCode(65 + index)}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      <p className="live-progress">
        {answeredCount}/{totalPlayers} answered
      </p>
      {isImageRound ? <p className="live-muted">If this is your photo, sit this round out and let everyone else guess.</p> : null}
      {hasAnswered ? <p className="live-muted">Answer submitted. Waiting for results.</p> : null}
    </section>
  );
}
