'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getGameDefinition,
  getUniqueGameItem,
  QuestionPoolExhaustedError
} from '@/features/games/services/gameContentService';
import type { GameId } from '@/types/game';

interface GameRouteScreenProps {
  gameId: GameId;
}

export default function GameRouteScreen({ gameId }: GameRouteScreenProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpicyMode, setIsSpicyMode] = useState(false);
  const requestIdRef = useRef(0);
  const seenPromptIdsRef = useRef<string[]>([]);
  const seenPromptContentsRef = useRef<string[]>([]);

  const config = useMemo(() => getGameDefinition(gameId), [gameId]);
  const supportsSpicyMode = config.supportsSpicy !== false;
  const supportsAnswerReveal = gameId === 'riddles' || gameId === 'emojiDecode';

  const loadPrompt = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);

    try {
      const seenIds = seenPromptIdsRef.current;
      const seenContents = seenPromptContentsRef.current;
      const nextPrompt = await getUniqueGameItem(gameId, {
        excludeIds: seenIds,
        excludeContents: seenContents,
        spicyMode: supportsSpicyMode ? isSpicyMode : false
      });

      if (nextPrompt.id && !seenIds.includes(nextPrompt.id)) {
        seenIds.push(nextPrompt.id);
      }
      if (nextPrompt.content && !seenContents.includes(nextPrompt.content)) {
        seenContents.push(nextPrompt.content);
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      setText(nextPrompt.content);
      setAnswerText(nextPrompt.answer?.trim() ?? '');
      setShowAnswer(false);
    } catch (error) {
      if (error instanceof QuestionPoolExhaustedError) {
        seenPromptIdsRef.current = [];
        seenPromptContentsRef.current = [];

        try {
          const nextPrompt = await getUniqueGameItem(gameId, {
            spicyMode: supportsSpicyMode ? isSpicyMode : false
          });
          if (nextPrompt.id) {
            seenPromptIdsRef.current.push(nextPrompt.id);
          }
          if (nextPrompt.content) {
            seenPromptContentsRef.current.push(nextPrompt.content);
          }

          if (requestIdRef.current !== requestId) {
            return;
          }

          setText(nextPrompt.content);
          setAnswerText(nextPrompt.answer?.trim() ?? '');
          setShowAnswer(false);
          return;
        } catch {
          if (requestIdRef.current !== requestId) {
            return;
          }

          setText('Could not load a question. Tap again.');
          setAnswerText('');
          setShowAnswer(false);
          return;
        }
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      setText('Could not load a question. Tap again.');
      setAnswerText('');
      setShowAnswer(false);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [gameId, isSpicyMode, supportsSpicyMode]);

  useEffect(() => {
    seenPromptIdsRef.current = [];
    seenPromptContentsRef.current = [];
    setAnswerText('');
    setShowAnswer(false);
    void loadPrompt();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadPrompt]);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleSpicyToggle = useCallback(() => {
    setIsSpicyMode((previous) => !previous);
  }, []);

  return (
    <div className="screen game active" id="gameScreen">
      <h1 id="gameTitle">{config.title}</h1>
      {supportsSpicyMode ? (
        <div className="game-mode-toggle">
          <span className="game-mode-label">Spicy Mode</span>
          <button
            type="button"
            className={`game-mode-btn ${isSpicyMode ? 'game-mode-btn--active' : ''}`}
            onClick={handleSpicyToggle}
            aria-pressed={isSpicyMode}
          >
            {isSpicyMode ? 'ON' : 'OFF'}
          </button>
        </div>
      ) : null}
      <div className="card" id="gameText" aria-live="polite">
        {text || (isLoading ? 'Loading...' : '')}
      </div>
      {supportsAnswerReveal && answerText ? (
        <>
          <button
            type="button"
            className="game-answer-btn"
            onClick={() => setShowAnswer((prev) => !prev)}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer ? <div className="card game-answer-card">{answerText}</div> : null}
        </>
      ) : null}
      <button onClick={() => void loadPrompt()} id="gameButton" type="button" disabled={isLoading}>
        {config.buttonText}
      </button>
      <button className="back" onClick={handleBack} type="button">
        ← Back
      </button>
    </div>
  );
}
