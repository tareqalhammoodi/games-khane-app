import { NextResponse } from 'next/server';

const REQUEST_TIMEOUT_MS = 10000;

function getGameApiBaseUrl() {
  return process.env.GAME_API_BASE_URL ?? process.env.NEXT_PUBLIC_GAME_API_BASE_URL;
}

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        accept: 'application/json'
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function proxyGameApiRequest(path: string, request?: Request) {
  const baseUrl = getGameApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error:
          'GAME_API_BASE_URL is not configured. Set it in your environment (e.g. http://localhost:3000).'
      },
      { status: 500 }
    );
  }

  try {
    const upstreamUrl = new URL(path, baseUrl);
    if (request) {
      const incomingUrl = new URL(request.url);
      incomingUrl.searchParams.forEach((value, key) => {
        upstreamUrl.searchParams.append(key, value);
      });
    }

    const upstreamResponse = await fetchWithTimeout(upstreamUrl.toString());

    const payload = await upstreamResponse.json().catch(() => null);
    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: 'Upstream API request failed.',
          status: upstreamResponse.status,
          details: payload
        },
        { status: upstreamResponse.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: 'Could not reach upstream API.'
      },
      { status: 502 }
    );
  }
}
