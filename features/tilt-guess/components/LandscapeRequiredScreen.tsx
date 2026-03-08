interface LandscapeRequiredScreenProps {
  isLandscape: boolean;
  onBack: () => void;
}

export default function LandscapeRequiredScreen({ isLandscape, onBack }: LandscapeRequiredScreenProps) {
  return (
    <section className="tilt-guess-landscape-required" role="status" aria-live="polite">
      <div className="tilt-guess-landscape-stack">
        <div className="tilt-guess-landscape-content">
          <span className="tilt-guess-rotate-icon" aria-hidden="true">
            🔄
          </span>
          <h2>Rotate your phone to landscape to play.</h2>
          <p>{isLandscape ? 'Landscape detected. Starting game...' : 'Waiting for landscape orientation.'}</p>
        </div>
        <button type="button" className="tilt-guess-landscape-outside-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
