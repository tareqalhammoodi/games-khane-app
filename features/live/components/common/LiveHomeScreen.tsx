"use client";

import { useMemo, useState } from "react";
import type { LiveMode, Question } from "@/features/live/types";

type HostMode = "default" | "custom";

type QuestionDraft = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
};

interface LiveHomeScreenProps {
  roomCode: string;
  errorMessage: string | null;
  isConnected: boolean;
  isCreatingRoom: boolean;
  onRoomCodeChange: (value: string) => void;
  onHostGame: (options?: { mode?: LiveMode; questions?: Question[] }) => void;
  onJoinGame: () => void;
  availableModes?: LiveMode[];
  defaultMode?: LiveMode;
  title?: string;
  subtitle?: string;
}

const createQuestionDraft = (): QuestionDraft => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  prompt: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
});

function toQuestions(drafts: QuestionDraft[]): Question[] {
  return drafts
    .map((draft, index) => ({
      id: `custom-${index + 1}`,
      prompt: draft.prompt.trim(),
      options: [
        draft.options[0].trim(),
        draft.options[1].trim(),
        draft.options[2].trim(),
        draft.options[3].trim(),
      ] as [string, string, string, string],
      correctOptionIndex: draft.correctOptionIndex,
    }))
    .filter((question) => {
      return (
        question.prompt.length > 0 &&
        question.options.every((option) => option.length > 0)
      );
    });
}

export default function LiveHomeScreen({
  roomCode,
  errorMessage,
  isConnected,
  isCreatingRoom,
  onRoomCodeChange,
  onHostGame,
  onJoinGame,
  availableModes = ["quiz", "spotlight"],
  defaultMode,
  title = "GameKhane Live",
  subtitle = "Real-time rooms for quizzes or spotlight rounds.",
}: LiveHomeScreenProps) {
  const [liveMode, setLiveMode] = useState<LiveMode>(() => {
    if (defaultMode && availableModes.includes(defaultMode)) {
      return defaultMode;
    }

    return availableModes[0] ?? "quiz";
  });
  const [hostMode, setHostMode] = useState<HostMode>("default");
  const [customQuestions, setCustomQuestions] = useState<QuestionDraft[]>([
    createQuestionDraft(),
  ]);
  const [localError, setLocalError] = useState<string | null>(null);

  const validCustomQuestions = useMemo(
    () => toQuestions(customQuestions),
    [customQuestions],
  );

  const handleHostGame = () => {
    if (liveMode === "spotlight") {
      setLocalError(null);
      onHostGame({ mode: "spotlight" });
      return;
    }

    if (hostMode === "default") {
      setLocalError(null);
      onHostGame({ mode: "quiz" });
      return;
    }

    if (validCustomQuestions.length === 0) {
      setLocalError("Add at least one complete custom question.");
      return;
    }

    setLocalError(null);
    onHostGame({ mode: "quiz", questions: validCustomQuestions });
  };

  const updateDraft = (
    id: string,
    updater: (draft: QuestionDraft) => QuestionDraft,
  ) => {
    setCustomQuestions((previous) =>
      previous.map((draft) => (draft.id === id ? updater(draft) : draft)),
    );
  };

  return (
    <section className="live-shell">
      <h1 className="live-title">{title}</h1>
      <p className="live-subtitle">{subtitle}</p>

      <div className="live-panel">
        <h2 className="live-section-title">Host Setup</h2>

        {availableModes.length > 1 ? (
          <div className="live-mode-toggle live-mode-toggle--wide">
            {availableModes.includes("quiz") ? (
              <button
                type="button"
                className={`live-mode-btn ${liveMode === "quiz" ? "live-mode-btn--active" : ""}`}
                onClick={() => setLiveMode("quiz")}
              >
                Quiz Live
              </button>
            ) : null}
            {availableModes.includes("spotlight") ? (
              <button
                type="button"
                className={`live-mode-btn ${liveMode === "spotlight" ? "live-mode-btn--active" : ""}`}
                onClick={() => setLiveMode("spotlight")}
              >
                Spotlight
              </button>
            ) : null}
          </div>
        ) : null}

        {liveMode === "spotlight" ? (
          <p className="live-muted" style={{ marginBottom: "20px" }}>
            Anonymous questions for one player at a time. Players react and
            guess who asked.
          </p>
        ) : null}

        {liveMode === "quiz" ? (
          <>
            <div className="live-mode-toggle">
              <button
                type="button"
                className={`live-mode-btn ${hostMode === "default" ? "live-mode-btn--active" : ""}`}
                onClick={() => setHostMode("default")}
              >
                Use Default Questions
              </button>
              <button
                type="button"
                className={`live-mode-btn ${hostMode === "custom" ? "live-mode-btn--active" : ""}`}
                onClick={() => setHostMode("custom")}
              >
                Add Questions Manually
              </button>
            </div>
          </>
        ) : null}

        {liveMode === "quiz" && hostMode === "custom" ? (
          <div className="live-custom-builder">
            <p className="live-muted" style={{ marginBottom: 10 }}>
              Create your own multiple-choice questions (4 options).
            </p>

            {customQuestions.map((question, index) => (
              <div key={question.id} className="live-question-card">
                <div className="live-question-card__head">
                  <strong>Question {index + 1}</strong>
                  {customQuestions.length > 1 ? (
                    <button
                      type="button"
                      className="live-mini-danger"
                      onClick={() =>
                        setCustomQuestions((previous) =>
                          previous.filter((entry) => entry.id !== question.id),
                        )
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <input
                  className="live-input"
                  value={question.prompt}
                  onChange={(event) =>
                    updateDraft(question.id, (draft) => ({
                      ...draft,
                      prompt: event.target.value,
                    }))
                  }
                  placeholder="Question text"
                />

                {[0, 1, 2, 3].map((optionIndex) => (
                  <input
                    key={`${question.id}-option-${optionIndex}`}
                    className="live-input"
                    value={question.options[optionIndex]}
                    onChange={(event) =>
                      updateDraft(question.id, (draft) => {
                        const updatedOptions = [...draft.options] as [
                          string,
                          string,
                          string,
                          string,
                        ];
                        updatedOptions[optionIndex] = event.target.value;
                        return {
                          ...draft,
                          options: updatedOptions,
                        };
                      })
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                ))}

                <label
                  className="live-label"
                  htmlFor={`correct-${question.id}`}
                >
                  Correct option
                </label>
                <select
                  id={`correct-${question.id}`}
                  className="live-input live-select"
                  value={question.correctOptionIndex}
                  onChange={(event) =>
                    updateDraft(question.id, (draft) => ({
                      ...draft,
                      correctOptionIndex: Number(event.target.value),
                    }))
                  }
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>
            ))}

            <button
              type="button"
              className="live-btn-neutral"
              onClick={() =>
                setCustomQuestions((previous) => [
                  ...previous,
                  createQuestionDraft(),
                ])
              }
            >
              Add Another Question
            </button>

            <p className="live-helper-text">
              Ready questions: {validCustomQuestions.length}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          className="live-btn-main"
          onClick={handleHostGame}
          disabled={!isConnected || isCreatingRoom}
        >
          {isCreatingRoom ? "Creating Room..." : "Host Game"}
        </button>

        <div className="live-divider">
          <span>OR</span>
        </div>

        <label htmlFor="liveRoomCode" className="live-label">
          Enter room code
        </label>
        <input
          id="liveRoomCode"
          className="live-input live-input--code"
          value={roomCode}
          onChange={(event) => onRoomCodeChange(event.target.value)}
          placeholder="ABC123"
          maxLength={6}
          inputMode="text"
          autoCapitalize="characters"
        />

        <button
          type="button"
          className="live-btn-neutral"
          onClick={onJoinGame}
          disabled={roomCode.length !== 6}
        >
          Join Game
        </button>
      </div>

      <p
        className={`live-connection ${isConnected ? "live-connection--online" : "live-connection--offline"}`}
      >
        {isConnected ? "Connected" : "Connecting..."}
      </p>

      {localError ? <p className="live-error">{localError}</p> : null}
      {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
    </section>
  );
}
