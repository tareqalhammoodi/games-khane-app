import { DialogContent } from "@/types/dialog";

export const HOW_TO_PLAY: DialogContent = {
  kicker: 'Quick Guide',
  title: 'How to Play',
  intro: 'Pick a mode and jump in. Here’s the easiest way to run each one.',
  actionLabel: "Let's Play",
  steps: [],
  sections: [
    {
      heading: 'Classic Party Flow (Spinner + Questions)',
      steps: [
        'Open the game on two phones.',
        'On Phone 1, open the Spinner and add everyone’s names.',
        'Spin the wheel — whoever it lands on is up!',
        'On Phone 2, open the Questions and read their challenge.',
        'After their turn, spin again and keep the fun going!'
      ]
    },
    {
      heading: 'Quiz Mode (GameKhane Live)',
      steps: [
        'Open GameKhane Live and choose Host or Join.',
        'The host creates a room and shares the code.',
        'Everyone joins from their own phone.',
        'Answer each question before time runs out.',
        'Scores are based on correctness and speed.'
      ]
    },
    {
      heading: 'Tilt & Guess',
      steps: [
        'Pick a category and rotate to landscape.',
        'One player holds the phone to their forehead.',
        'Everyone else gives clues without saying the exact word.',
        'Tilt down for a correct guess and tilt up to skip a word.',
        'Play until the 60-second timer ends, then switch players.'
      ]
    }
  ]
} as const;
