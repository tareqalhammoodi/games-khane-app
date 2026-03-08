interface TiltGuessResultScreenProps {
  correctCount: number;
  skipCount: number;
  onPlayAgain: () => void;
  onBackToGames: () => void;
}

export default function TiltGuessResultScreen({
  correctCount,
  skipCount,
  onPlayAgain,
  onBackToGames,
}: TiltGuessResultScreenProps) {
  const totalScore = correctCount;

  return (
    <div className="screen game active tilt-guess-result">
      <h1>Round Complete</h1>

      <div className="tilt-guess-result-card">
        <div>
          <span>Correct guesses</span>
          <strong>{correctCount}</strong>
        </div>
        <div>
          <span>Skipped words</span>
          <strong>{skipCount}</strong>
        </div>
        <div>
          <span>Total score</span>
          <strong>{totalScore}</strong>
        </div>
      </div>

      <button type="button" onClick={onPlayAgain}>
        Play Again
      </button>
      <button className="back" type="button" onClick={onBackToGames}>
        ← Back to Games
      </button>
    </div>
  );
}
