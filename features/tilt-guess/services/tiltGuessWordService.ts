import type { TiltGuessCategory, TiltGuessWordApiResponse, TiltGuessWordRecord } from '@/features/tilt-guess/types/tiltGuess';

const REQUEST_TIMEOUT_MS = 10000;

function buildApiPath(category?: TiltGuessCategory): string {
  return category ? `/api/tilt-guess/${category}` : '/api/tilt-guess';
}

function buildRequestUrl(category?: TiltGuessCategory): string {
  const baseUrl = process.env.NEXT_PUBLIC_GAME_API_BASE_URL?.trim();
  const path = buildApiPath(category);

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function isWordRecord(payload: unknown): payload is TiltGuessWordRecord {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as { content?: unknown };
  return typeof record.content === 'string' && record.content.trim().length > 0;
}

function isWordApiResponse(payload: unknown): payload is TiltGuessWordApiResponse {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const response = payload as { data?: unknown };
  if (Array.isArray(response.data)) {
    return response.data.every((entry) => isWordRecord(entry));
  }

  return isWordRecord(response.data);
}

function normalizeWords(records: TiltGuessWordRecord[]): string[] {
  const seen = new Set<string>();
  const words: string[] = [];

  for (const item of records) {
    const normalized = item.content.replace(/\s+/g, ' ').trim();
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) {
      continue;
    }

    seen.add(key);
    words.push(normalized);
  }

  return words;
}

export function shuffleWords(words: string[]): string[] {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
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

export async function getWords(category?: TiltGuessCategory): Promise<string[]> {
  const requestUrl = buildRequestUrl(category);
  const response = await fetchWithTimeout(requestUrl);
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Failed to fetch tilt-guess words (${response.status})`);
  }

  if (!isWordApiResponse(payload)) {
    throw new Error('Invalid tilt-guess response payload');
  }

  const records = Array.isArray(payload.data) ? payload.data : [payload.data];
  return shuffleWords(normalizeWords(records));
}
