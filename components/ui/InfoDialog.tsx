'use client';

import type { InfoDialogProps } from '@/types/dialog';

export default function InfoDialog({
  isOpen,
  onClose,
  kicker,
  title,
  intro,
  steps,
  sections = [],
  actionLabel,
  titleId = 'infoDialogTitle'
}: InfoDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="info-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="info-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="info-dialog__close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>

        <p className="info-dialog__kicker">{kicker}</p>
        <h2 id={titleId}>{title}</h2>
        <p className="info-dialog__intro">{intro}</p>

        {steps.length > 0 ? (
          <ol className="info-dialog__steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}

        {sections.map((section) => (
          <section key={section.heading} className="info-dialog__section">
            <h3>{section.heading}</h3>
            <ol className="info-dialog__steps">
              {section.steps.map((step) => (
                <li key={`${section.heading}-${step}`}>{step}</li>
              ))}
            </ol>
          </section>
        ))}

        <button type="button" className="info-dialog__action" onClick={onClose}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
