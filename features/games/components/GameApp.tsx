"use client";

import dynamic from "next/dynamic";
import GameScreen from "@/features/games/components/GameScreen";
import HomeScreen from "@/features/games/components/HomeScreen";
import { useGameFlow } from "@/features/games/hooks/useGameFlow";

const WheelScreen = dynamic(
  () => import("@/features/wheel/components/WheelScreen"),
  {
    ssr: false,
  },
);

export default function GameApp() {
  const {
    screen,
    gameText,
    isLoading,
    currentConfig,
    openGame,
    nextGame,
    goHome,
  } = useGameFlow();

  return (
    <div className="app">
      <HomeScreen isActive={screen === "home"} onOpenGame={openGame} />
      <GameScreen
        isActive={screen === "game"}
        config={currentConfig}
        text={gameText}
        isLoading={isLoading}
        onNext={nextGame}
        onBack={goHome}
      />
      <WheelScreen isActive={screen === "wheel"} onBack={goHome} />
    </div>
  );
}
