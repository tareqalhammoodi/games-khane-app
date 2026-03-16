const REQUEST_TIMEOUT_MS = 10000;

export type SpotlightTemplates = {
  spicy: string[];
  funny: string[];
  deep: string[];
};

const EMPTY_TEMPLATES: SpotlightTemplates = {
  spicy: [],
  funny: [],
  deep: []
};

function buildRequestUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_GAME_API_BASE_URL?.trim();
  const path = '/api/spotlight/templates';

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isTemplatesPayload(payload: unknown): payload is SpotlightTemplates {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as { spicy?: unknown; funny?: unknown; deep?: unknown };
  return isStringArray(record.spicy) && isStringArray(record.funny) && isStringArray(record.deep);
}

function isTemplatesResponse(payload: unknown): payload is { data: SpotlightTemplates } {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as { data?: unknown };
  return isTemplatesPayload(record.data);
}

function normalizeList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const trimmed = value.replace(/\s+/g, ' ').trim();
    const key = trimmed.toLowerCase();

    if (!trimmed || seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

function normalizeTemplates(templates: SpotlightTemplates): SpotlightTemplates {
  return {
    spicy: normalizeList(templates.spicy),
    funny: normalizeList(templates.funny),
    deep: normalizeList(templates.deep)
  };
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

export async function getSpotlightTemplates(): Promise<SpotlightTemplates> {
  const requestUrl = buildRequestUrl();
  const response = await fetchWithTimeout(requestUrl);
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Failed to fetch spotlight templates (${response.status})`);
  }

  if (!isTemplatesResponse(payload)) {
    throw new Error('Invalid spotlight templates payload');
  }

  const normalized = normalizeTemplates(payload.data);
  return normalized.spicy.length || normalized.funny.length || normalized.deep.length
    ? normalized
    : EMPTY_TEMPLATES;
}
