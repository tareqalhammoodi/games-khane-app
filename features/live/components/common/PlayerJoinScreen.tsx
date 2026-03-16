'use client';

import { useState } from 'react';
import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';

interface PlayerJoinScreenProps {
  roomCode: string;
  errorMessage: string | null;
  isJoining: boolean;
  onJoin: (nickname: string) => void;
}

export default function PlayerJoinScreen({
  roomCode,
  errorMessage,
  isJoining,
  onJoin
}: PlayerJoinScreenProps) {
  const [nickname, setNickname] = useState('');

  return (
    <section className="live-shell">
      <h1 className="live-title">Join Room</h1>
      <RoomCodeCard roomCode={roomCode} />

      <div className="live-panel">
        <label htmlFor="nickname" className="live-label">
          Nickname
        </label>
        <input
          id="nickname"
          className="live-input"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Your name"
          maxLength={24}
        />

        <button type="button" className="live-btn-main" onClick={() => onJoin(nickname)} disabled={isJoining || nickname.trim().length === 0}>
          {isJoining ? 'Joining...' : 'Join'}
        </button>
      </div>

      {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
    </section>
  );
}
