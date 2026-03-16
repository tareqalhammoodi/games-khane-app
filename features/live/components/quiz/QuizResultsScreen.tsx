import type { Question } from '@/features/live/types';

interface QuizResultsScreenProps {
  question: Question | null;
  correctOptionIndex: number | null;
  voteCounts: number[];
}

export default function QuizResultsScreen({
  question,
  correctOptionIndex,
  voteCounts
}: QuizResultsScreenProps) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  return (
    <section className="live-shell">
      <h1 className="live-title">Results</h1>

      <div className="live-panel">
        <p className="live-question-copy">{question?.prompt ?? 'Round complete'}</p>
        {question && typeof correctOptionIndex === 'number' ? (
          <p className="live-correct-answer">Correct answer: {question.options[correctOptionIndex]}</p>
        ) : null}

        <ul className="live-results-list">
          {question
            ? question.options.map((option, index) => {
                const votes = voteCounts[index] ?? 0;
                const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                return (
                  <li
                    key={option}
                    className={`live-result-item ${index === correctOptionIndex ? 'live-result-item--correct' : ''}`}
                  >
                    <div className="live-result-head">
                      <span>{option}</span>
                      <strong>{votes}</strong>
                    </div>
                    <div className="live-result-track" aria-hidden="true">
                      <span className={`live-result-fill live-result-fill--${index}`} style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })
            : null}
        </ul>
      </div>
    </section>
  );
}
