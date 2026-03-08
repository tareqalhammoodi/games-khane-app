import type { TiltGuessResult } from '@/features/tilt-guess/types/tiltGuess';

interface TiltGuessGameScreenProps {
  currentWord: string;
  timeRemaining: number;
  feedback: TiltGuessResult | null;
}

export default function TiltGuessGameScreen({
  currentWord,
  timeRemaining,
  feedback,
}: TiltGuessGameScreenProps) {
  return (
    <div className={`tilt-guess-game ${feedback ? `tilt-guess-game--${feedback}` : ''}`}>
      <div className="tilt-guess-top-row">
        <span className="tilt-guess-mode-pill">TILT &amp; GUESS</span>
        <div className="tilt-guess-timer-chip">
          <p className="tilt-guess-timer-label">Time</p>
          <p className="tilt-guess-timer">{timeRemaining}s</p>
        </div>
      </div>

      <div className="tilt-guess-word-wrap" aria-live="polite">
        <p className="tilt-guess-word">{currentWord || 'Get Ready...'}</p>
      </div>

      <div className="tilt-guess-instructions">
        <p className="tilt-guess-instruction tilt-guess-instruction--correct">Tilt DOWN if correct</p>
        <p className="tilt-guess-instruction tilt-guess-instruction--skip">Tilt UP to skip</p>
      </div>
    </div>
  );
}
