import type { Question } from '@/features/live/types/live';

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  secondsLeft: number;
  hasAnswered: boolean;
  selectedOptionIndex: number | null;
  answeredCount: number;
  totalPlayers: number;
  onSelectOption: (optionIndex: number) => void;
}

export default function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  secondsLeft,
  hasAnswered,
  selectedOptionIndex,
  answeredCount,
  totalPlayers,
  onSelectOption
}: QuestionScreenProps) {
  const timerWidth = `${Math.max(0, Math.min(100, (secondsLeft / 15) * 100))}%`;

  return (
    <section className="live-shell">
      <div className="live-header-row">
        <h1 className="live-title">
          Question {questionIndex + 1}/{totalQuestions}
        </h1>
        <span className="live-timer-pill">{secondsLeft}s</span>
      </div>

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
      {hasAnswered ? <p className="live-muted">Answer submitted. Waiting for results.</p> : null}
    </section>
  );
}
