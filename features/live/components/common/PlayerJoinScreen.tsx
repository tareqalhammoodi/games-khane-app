'use client';

import { type ChangeEvent, useState } from 'react';
import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import type { LiveMode } from '@/features/live/types';
import { fileToOptimizedDataUrl } from '@/features/live/utils/imageUpload';

interface PlayerJoinScreenProps {
  roomCode: string;
  errorMessage: string | null;
  isJoining: boolean;
  roomMode: LiveMode | null;
  throwbackImageLabel?: string | null;
  onJoin: (nickname: string, throwbackImageDataUrl?: string) => void;
}

export default function PlayerJoinScreen({
  roomCode,
  errorMessage,
  isJoining,
  roomMode,
  throwbackImageLabel,
  onJoin
}: PlayerJoinScreenProps) {
  const [nickname, setNickname] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const isThrowbackRoom = roomMode === 'throwback';

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLocalError('Please choose an image file.');
      return;
    }

    try {
      setIsPreparingImage(true);
      setLocalError(null);
      setSelectedFileName(file.name);
      const optimizedImage = await fileToOptimizedDataUrl(file);
      setImagePreview(optimizedImage);
    } catch {
      setLocalError('Could not prepare that image. Try another one.');
      setSelectedFileName(null);
    } finally {
      setIsPreparingImage(false);
      event.target.value = '';
    }
  };

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

        {isThrowbackRoom ? (
          <>
            <label htmlFor="join-photo" className="live-label">
              Image
            </label>
            <input
              id="join-photo"
              className="live-file-input-hidden"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              disabled={isPreparingImage || isJoining}
            />
            <div className="live-file-row">
              <label htmlFor="join-photo" className="live-btn-neutral live-file-trigger">
                {isPreparingImage ? 'Preparing...' : 'Choose Image'}
              </label>
              <p className="live-file-name">{selectedFileName ?? 'No image selected yet'}</p>
            </div>

            {imagePreview ? (
              <div className="live-image-preview-card">
                <img src={imagePreview} alt="Selected upload preview" className="live-image-preview" />
              </div>
            ) : null}

            <p className="live-helper-text">
              This room needs an image of/from your: <strong>{throwbackImageLabel ?? 'throwback'}</strong>
            </p>
          </>
        ) : null}

        <button
          type="button"
          className="live-btn-main"
          onClick={() => onJoin(nickname, imagePreview ?? undefined)}
          disabled={
            isJoining ||
            isPreparingImage ||
            nickname.trim().length === 0 ||
            (isThrowbackRoom && !imagePreview)
          }
        >
          {isJoining ? 'Joining...' : 'Join'}
        </button>
      </div>

      {localError ? <p className="live-error">{localError}</p> : null}
      {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
    </section>
  );
}
