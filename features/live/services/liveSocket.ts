'use client';

import { io, type Socket } from 'socket.io-client';

import type { ClientToServerEvents, ServerToClientEvents } from '@/features/live/types';

type LiveSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: LiveSocket | null = null;

function getSocketUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_LIVE_SOCKET_URL ?? process.env.NEXT_PUBLIC_GAME_API_BASE_URL;

  if (!rawUrl) {
    throw new Error('NEXT_PUBLIC_LIVE_SOCKET_URL or NEXT_PUBLIC_GAME_API_BASE_URL must be configured.');
  }

  const parsed = new URL(rawUrl);
  return `${parsed.protocol}//${parsed.host}`;
}

function getSocketPath(): string {
  return process.env.NEXT_PUBLIC_LIVE_SOCKET_PATH ?? '/live/socket.io';
}

export async function getLiveSocket(): Promise<LiveSocket> {
  if (socketInstance) {
    return socketInstance;
  }

  const socketUrl = getSocketUrl();
  const socketPath = getSocketPath();

  socketInstance = io(socketUrl, {
    path: socketPath,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000,
    withCredentials: true,
  });

  return socketInstance;
}

export function getLiveSocketIfReady(): LiveSocket | null {
  return socketInstance;
}
