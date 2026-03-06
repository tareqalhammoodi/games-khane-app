import { gameConfig } from '@/lib/gameConfig';
import type { GameDefinition, GameId, GamePromptApiResponse, GamePromptRecord } from '@/types/game';

export function getGameDefinition(gameId: GameId): GameDefinition {
  return gameConfig[gameId];
}

const REQUEST_TIMEOUT_MS = 10000;

interface RandomGameItemOptions {
  excludeIds?: string[];
  spicyMode?: boolean;
}

interface UniqueRandomGameItemOptions extends RandomGameItemOptions {
  excludeContents?: string[];
  maxAttempts?: number;
}

export class QuestionPoolExhaustedError extends Error {
  constructor() {
    super('No unseen questions left in this pool.');
    this.name = 'QuestionPoolExhaustedError';
  }
}

function normalizePromptContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim().toLowerCase();
}

function isPromptApiResponse(payload: unknown): payload is GamePromptApiResponse {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = (payload as { data?: unknown }).data;
  if (!record || typeof record !== 'object') {
    return false;
  }

  const content = (record as { content?: unknown }).content;
  return typeof content === 'string' && content.trim().length > 0;
}

function extractErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as {
    error?: { code?: unknown } | string;
    details?: { error?: { code?: unknown } };
  };

  if (record.error && typeof record.error === 'object' && typeof record.error.code === 'string') {
    return record.error.code;
  }

  if (record.details?.error && typeof record.details.error.code === 'string') {
    return record.details.error.code;
  }

  return null;
}

function buildRequestUrl(endpoint: string, options: RandomGameItemOptions): string {
  const { excludeIds = [], spicyMode = false } = options;
  if (excludeIds.length === 0 && !spicyMode) {
    return endpoint;
  }

  const params = new URLSearchParams();
  const uniqueIds = [...new Set(excludeIds)];
  uniqueIds.forEach((id) => params.append('excludeIds', id));
  if (spicyMode) {
    params.append('spicy', 'true');
  }

  return `${endpoint}?${params.toString()}`;
}

async function fetchWithTimeout(input: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getRandomGameItem(
  gameId: GameId,
  options: RandomGameItemOptions = {}
): Promise<GamePromptRecord> {
  const { endpoint } = getGameDefinition(gameId);
  const requestUrl = buildRequestUrl(endpoint, options);
  const response = await fetchWithTimeout(requestUrl);
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorCode = extractErrorCode(payload);
    if (response.status === 404 && errorCode === 'QUESTION_POOL_EXHAUSTED') {
      throw new QuestionPoolExhaustedError();
    }

    throw new Error(`Failed to fetch game prompt (${response.status})`);
  }

  if (!isPromptApiResponse(payload)) {
    throw new Error('Invalid game prompt response');
  }

  return payload.data;
}

export async function getUniqueGameItem(
  gameId: GameId,
  options: UniqueRandomGameItemOptions = {}
): Promise<GamePromptRecord> {
  const excludedIds = new Set(options.excludeIds ?? []);
  const excludedContents = new Set((options.excludeContents ?? []).map(normalizePromptContent));
  const maxAttempts = Math.max(1, options.maxAttempts ?? 64);
  const spicyMode = options.spicyMode ?? false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const prompt = await getRandomGameItem(gameId, {
      excludeIds: [...excludedIds],
      spicyMode
    });

    if (prompt.id) {
      excludedIds.add(prompt.id);
    }

    const normalizedContent = normalizePromptContent(prompt.content);
    if (!excludedContents.has(normalizedContent)) {
      return prompt;
    }
  }

  throw new QuestionPoolExhaustedError();
}
