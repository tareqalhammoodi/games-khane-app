'use client';

import { useRoomShare } from '@/features/live/hooks/useRoomShare';

interface RoomShareCardProps {
  roomCode: string;
  joinPathBase?: string;
  title?: string;
}

export default function RoomShareCard({
  roomCode,
  joinPathBase = '/live',
  title = 'Scan QR to Join'
}: RoomShareCardProps) {
  const { joinUrl, qrCodeImageUrl, copyState, copyJoinLink } = useRoomShare({
    roomCode,
    joinPathBase
  });

  if (!joinUrl) {
    return null;
  }

  return (
    <div className="live-panel live-qr-panel">
      <h2 className="live-section-title">{title}</h2>
      <img src={qrCodeImageUrl} alt="Join room QR code" className="live-qr-image" />
      <p className="live-qr-url">{joinUrl}</p>
      <button type="button" className="live-btn-neutral live-copy-btn" onClick={copyJoinLink}>
        {copyState === 'copied' ? 'Link Copied' : copyState === 'failed' ? 'Copy Failed' : 'Copy Join Link'}
      </button>
    </div>
  );
}
