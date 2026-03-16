import { useCallback, useMemo, useState } from 'react';

const COPY_RESET_DELAY_MS = 1600;

type CopyState = 'idle' | 'copied' | 'failed';

interface UseRoomShareOptions {
  roomCode: string;
  joinPathBase?: string;
}

export function useRoomShare({ roomCode, joinPathBase = '/live' }: UseRoomShareOptions) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const joinUrl = useMemo(() => {
    if (!roomCode) {
      return '';
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}${joinPathBase}/${roomCode}`;
    }

    return `${joinPathBase}/${roomCode}`;
  }, [roomCode, joinPathBase]);

  const qrCodeImageUrl = useMemo(() => {
    if (!joinUrl) {
      return '';
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}`;
  }, [joinUrl]);

  const copyJoinLink = useCallback(async () => {
    if (!joinUrl || !navigator?.clipboard) {
      setCopyState('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), COPY_RESET_DELAY_MS);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), COPY_RESET_DELAY_MS);
    }
  }, [joinUrl]);

  return {
    joinUrl,
    qrCodeImageUrl,
    copyState,
    copyJoinLink
  };
}
