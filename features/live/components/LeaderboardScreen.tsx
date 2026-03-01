import type { Player } from '@/features/live/types/live';

interface LeaderboardScreenProps {
  players: Player[];
}

export default function LeaderboardScreen({ players }: LeaderboardScreenProps) {
  return (
    <section className="live-shell">
      <h1 className="live-title">Leaderboard</h1>

      <div className="live-panel">
        <ul className="live-leaderboard">
          {players.length === 0 ? <li className="live-muted">No players yet.</li> : null}
          {players.map((player, index) => (
            <li key={player.id} className={`live-leader ${index === 0 ? 'live-leader--first' : ''}`}>
              <span>
                {index + 1}. {player.nickname}
              </span>
              <strong>{player.score}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
