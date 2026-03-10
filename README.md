# 🎮 Games Khane

**GameKhane** is a simple, web app for friends to hang out, laugh, and kill indecision.

It includes classic party games like **Truth or Dare**, **Would You Rather**, **Most Likely To**, **Challenges**, **Chit-Chat**, and **What Are We Doing Tonight?** — all in one phone-friendly app that you can try [here](https://games-khane.vercel.app/).

I built this for myself and my friends, but you can easily customize the questions and challenges to match you and your group.

## Stack

- Next.js (latest stable via `next@latest`)
- App Router
- TypeScript
- React (vanilla patterns: state/effects/hooks)
- Global CSS (migrated from original styles)

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Project Structure

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
    InfoDialog.tsx
features/
  games/
    components/
      GameApp.tsx
      HomeScreen.tsx
      GameScreen.tsx
    constants/
      howToPlayDialogContent.ts
    hooks/
      useGameFlow.ts
    services/
      gameContentService.ts
  wheel/
    components/
      WheelScreen.tsx
      WheelInputSection.tsx
      WheelCanvasSection.tsx
      WheelResultModal.tsx
    hooks/
      useWheel.ts
    lib/
      wheelMath.ts
      wheelCanvas.ts
hooks/
  useClickOutside.ts
  useDialog.ts
  useEscapeKey.ts
  useTooltip.ts
lib/
  gameConfig.ts
types/
  dialog.ts
  game.ts
  wheel.ts
```

## Migration Notes

- Original screen switching and DOM updates were converted to React state transitions.
- Game content is fetched from API endpoints:
  - `/api/truth-dare`
  - `/api/would-you-rather`
  - `/api/most-likely`
  - `/api/challenge`
  - `/api/conversation`
  - `/api/tonight`
  - `/api/riddles`
  - `/api/emoji-decode`
- Game API response shape expected by the client:
  - `{ data: { id, type, content, createdAt } }`
- Wheel canvas logic was migrated to a client component using refs + effects.
- Tooltip and dialog behavior are handled with reusable hooks/components (`useTooltip`, `useDialog`, `InfoDialog`).
- Styling values were preserved to maintain pixel consistency with the previous version.
- SEO metadata is defined in `app/layout.tsx`.
- Wheel UI is lazy-loaded via dynamic import in `features/games/components/GameApp.tsx`.

## Environment

- Optional:
  - `NEXT_PUBLIC_GAME_API_BASE_URL` (example: `https://api.example.com`)
  - `NEXT_PUBLIC_LIVE_SOCKET_URL` (example: `https://api.example.com`)
  - `NEXT_PUBLIC_LIVE_SOCKET_PATH` (default: `/live/socket.io`)
  - If omitted, the app will call relative paths (same domain), e.g. `/api/truth-dare`.

---

Have fun & pass the phone 🎉
