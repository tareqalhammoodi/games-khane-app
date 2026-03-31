'use client';

import { type ChangeEvent, useState } from 'react';
import RoomCodeCard from '@/features/live/components/common/RoomCodeCard';
import { fileToOptimizedDataUrl } from '@/features/live/utils/imageUpload';

interface ThrowbackUploadScreenProps {
  roomCode: string;
  prompt: string | null;
  imageLabel: string | null;
  uploadedCount: number;
  totalPlayers: number;
  hasUploadedImage: boolean;
  errorMessage: string | null;
  onSubmit: (imageDataUrl: string) => void;
}

export default function ThrowbackUploadScreen({
  roomCode,
  prompt,
  imageLabel,
  uploadedCount,
  totalPlayers,
  hasUploadedImage,
  errorMessage,
  onSubmit
}: ThrowbackUploadScreenProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsPreparing(true);
      setLocalError(null);
      setSelectedFileName(file.name);
      const optimizedImage = await fileToOptimizedDataUrl(file);
      setPreview(optimizedImage);
    } catch {
      setLocalError('Could not prepare that image. Try a different one.');
      setSelectedFileName(null);
    } finally {
      setIsPreparing(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!preview) {
      setLocalError('Choose a photo first.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    onSubmit(preview);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <section className="live-shell">
      <h1 className="live-title">Upload Your Throwback</h1>
      <RoomCodeCard roomCode={roomCode} />

      <div className="live-panel">
        <p className="live-question-copy">{prompt ?? 'Whose photo is this?'}</p>
        <p className="live-helper-text">
          Provide an image of/from your: <strong>{imageLabel ?? 'childhood'}</strong>
        </p>
        <p className="live-progress">
          {uploadedCount}/{totalPlayers} photos ready
        </p>
      </div>

      <div className="live-panel">
        <label htmlFor="throwback-upload" className="live-label">
          Choose a photo
        </label>
        <input
          id="throwback-upload"
          className="live-file-input-hidden"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          disabled={isPreparing}
        />
        <div className="live-file-row">
          <label htmlFor="throwback-upload" className="live-btn-neutral live-file-trigger">
            {isPreparing ? 'Preparing...' : 'Choose Image'}
          </label>
          <p className="live-file-name">{selectedFileName ?? 'No image selected yet'}</p>
        </div>

        {preview ? (
          <div className="live-image-preview-card">
            <img src={preview} alt="Throwback upload preview" className="live-image-preview" />
          </div>
        ) : null}

        <button
          type="button"
          className="live-btn-main"
          onClick={handleSubmit}
          disabled={!preview || isPreparing || isSubmitting}
        >
          {isPreparing ? 'Preparing...' : hasUploadedImage ? 'Replace Photo' : 'Upload Photo'}
        </button>

        {hasUploadedImage ? (
          <p className="live-helper-text">Your photo is already in. You can replace it until the host starts.</p>
        ) : null}
      </div>

      {localError ? <p className="live-error">{localError}</p> : null}
      {errorMessage ? <p className="live-error">{errorMessage}</p> : null}
    </section>
  );
}
