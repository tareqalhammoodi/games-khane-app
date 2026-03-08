import { TILT_GUESS_CATEGORIES } from '@/features/tilt-guess/constants/categories';
import type {
  MotionPermissionState,
  TiltGuessCategorySelection,
} from '@/features/tilt-guess/types/tiltGuess';

interface TiltGuessHomeScreenProps {
  selectedCategory: TiltGuessCategorySelection;
  onCategorySelect: (category: TiltGuessCategorySelection) => void;
  onStartGame: () => void;
  onBack: () => void;
  isStarting: boolean;
  motionPermission: MotionPermissionState;
  canRequestMotionPermission: boolean;
  onEnableMotionControls: () => void;
}

export default function TiltGuessHomeScreen({
  selectedCategory,
  onCategorySelect,
  onStartGame,
  onBack,
  isStarting,
  motionPermission,
  canRequestMotionPermission,
  onEnableMotionControls,
}: TiltGuessHomeScreenProps) {
  const needsMotionPermission = canRequestMotionPermission && motionPermission !== 'granted';

  return (
    <div className="screen game active tilt-guess-home">
      <h1>Tilt & Guess</h1>
      <p className="tilt-guess-subtitle">Hold the phone on your forehead and let your friends give clues.</p>

      <div className="tilt-guess-category-grid" role="radiogroup" aria-label="Tilt and Guess categories">
        {TILT_GUESS_CATEGORIES.map((category) => {
          const isActive = category.id === selectedCategory;

          return (
            <button
              key={category.id}
              type="button"
              className={`tilt-guess-category-btn ${isActive ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.id)}
              role="radio"
              aria-checked={isActive}
            >
              <strong>{category.label}</strong>
              <span>{category.subtitle}</span>
            </button>
          );
        })}
      </div>

      {needsMotionPermission ? (
        <div className="tilt-guess-motion-box" role="status" aria-live="polite">
          <p>Motion access is required on iOS devices.</p>
          <button type="button" onClick={onEnableMotionControls} disabled={isStarting}>
            Enable Motion Controls
          </button>
        </div>
      ) : null}

      <button
        type="button"
        id="tiltGuessStartBtn"
        onClick={onStartGame}
        disabled={isStarting || needsMotionPermission}
      >
        {isStarting ? 'Preparing...' : 'Start Game'}
      </button>

      <button className="back" onClick={onBack} type="button">
        ← Back
      </button>
    </div>
  );
}
