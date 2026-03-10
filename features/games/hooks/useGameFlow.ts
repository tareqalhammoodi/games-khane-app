import { useCallback, useMemo, useRef, useState } from 'react';
import {
  getGameDefinition,
  getUniqueGameItem,
  QuestionPoolExhaustedError
} from '@/features/games/services/gameContentService';
import type { AppScreen, GameDefinition, GameId, PlayableId } from '@/types/game';

interface UseGameFlowResult {
  screen: AppScreen;
  gameText: string;
  isLoading: boolean;
  currentConfig: GameDefinition | null;
  openGame: (id: PlayableId) => void;
  nextGame: () => void;
  goHome: () => void;
}

function createEmptySeenPromptMap(): Record<GameId, string[]> {
  return {
    mostLikely: [],
    truthDare: [],
    wouldRather: [],
    challenge: [],
    conversation: [],
    tonight: [],
    riddles: [],
    emojiDecode: []
  };
}

function createEmptySeenContentMap(): Record<GameId, string[]> {
  return {
    mostLikely: [],
    truthDare: [],
    wouldRather: [],
    challenge: [],
    conversation: [],
    tonight: [],
    riddles: [],
    emojiDecode: []
  };
}

export function useGameFlow(): UseGameFlowResult {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [currentGame, setCurrentGame] = useState<GameId | null>(null);
  const [gameText, setGameText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const seenPromptIdsRef = useRef<Record<GameId, string[]>>(createEmptySeenPromptMap());
  const seenPromptContentsRef = useRef<Record<GameId, string[]>>(createEmptySeenContentMap());

  const currentConfig = useMemo(
    () => (currentGame ? getGameDefinition(currentGame) : null),
    [currentGame]
  );

  const loadPrompt = useCallback(async (gameId: GameId) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);

    try {
      const seenIds = seenPromptIdsRef.current[gameId];
      const seenContents = seenPromptContentsRef.current[gameId];
      const nextPrompt = await getUniqueGameItem(gameId, {
        excludeIds: seenIds,
        excludeContents: seenContents
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

      setGameText(nextPrompt.content);
    } catch (error) {
      if (error instanceof QuestionPoolExhaustedError) {
        seenPromptIdsRef.current[gameId] = [];
        seenPromptContentsRef.current[gameId] = [];

        try {
          const nextPrompt = await getUniqueGameItem(gameId);
          if (nextPrompt.id) {
            seenPromptIdsRef.current[gameId].push(nextPrompt.id);
          }
          if (nextPrompt.content) {
            seenPromptContentsRef.current[gameId].push(nextPrompt.content);
          }

          if (requestIdRef.current !== requestId) {
            return;
          }

          setGameText(nextPrompt.content);
          return;
        } catch {
          if (requestIdRef.current !== requestId) {
            return;
          }

          setGameText('Could not load a question. Tap again.');
          return;
        }
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      setGameText('Could not load a question. Tap again.');
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const nextGame = useCallback(() => {
    if (!currentGame || isLoading) {
      return;
    }

    void loadPrompt(currentGame);
  }, [currentGame, isLoading, loadPrompt]);

  const openGame = useCallback((id: PlayableId) => {
    if (id === 'wheel') {
      setScreen('wheel');
      return;
    }

    if (id === 'tiltGuess' || id === 'liveQuiz') {
      return;
    }

    seenPromptIdsRef.current[id] = [];
    seenPromptContentsRef.current[id] = [];
    setCurrentGame(id);
    setScreen('game');
    setGameText('');
    void loadPrompt(id);
  }, [loadPrompt]);

  const goHome = useCallback(() => {
    requestIdRef.current += 1;
    setCurrentGame(null);
    setGameText('');
    setIsLoading(false);
    setScreen('home');
  }, []);

  return {
    screen,
    gameText,
    isLoading,
    currentConfig,
    openGame,
    nextGame,
    goHome
  };
}
