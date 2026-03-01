'use client';

import Link from 'next/link';
import InfoDialog from '@/components/ui/InfoDialog';
import { HOW_TO_PLAY } from '@/features/games/constants/howToPlay';
import { useDialog } from '@/hooks/useDialog';
import type { PlayableId } from '@/types/game';

interface HomeScreenProps {
  isActive: boolean;
  onOpenGame: (id: PlayableId) => void;
}

export default function HomeScreen({ isActive, onOpenGame }: HomeScreenProps) {
  const { isOpen, open, close } = useDialog();
  return (
    <div className={`screen ${isActive ? 'active' : ''}`} id="home">
      <h1>🎮 Games Khane</h1>
      <p>Pick a game &amp; pass the phone</p>

      <div className="home-help-inline">
        <button type="button" className="how-to-play-btn" onClick={open}>
          How to play?
        </button>
      </div>

      <div className="menu">
        <Link href="/live" className="menu-link-btn">
          🔴 GameKhane Live
        </Link>
        <button onClick={() => onOpenGame('mostLikely')}>😂 Who’s Most Likely To</button>
        <button onClick={() => onOpenGame('truthDare')}>🃏 Truth or Dare</button>
        <button onClick={() => onOpenGame('wouldRather')}>🤔 Would You Rather</button>
        <button onClick={() => onOpenGame('challenge')}>🎲 Random Challenge</button>
        <button onClick={() => onOpenGame('conversation')}>🧠 Conversation Starter</button>
        <button onClick={() => onOpenGame('tonight')}>🎯 What Are We Doing Tonight?</button>
        <button onClick={() => onOpenGame('wheel')}>☸️ Spin the wheel?</button>
      </div>

      <InfoDialog
        isOpen={isOpen}
        onClose={close}
        kicker={HOW_TO_PLAY.kicker}
        title={HOW_TO_PLAY.title}
        intro={HOW_TO_PLAY.intro}
        steps={HOW_TO_PLAY.steps}
        actionLabel={HOW_TO_PLAY.actionLabel}
        titleId="howToPlayDialogTitle"
      />
    </div>
  );
}
