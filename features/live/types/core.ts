export type LiveMode = 'quiz' | 'spotlight' | 'throwback';

export type LiveStatus =
  | 'lobby'
  | 'question'
  | 'results'
  | 'finished'
  | 'writing'
  | 'choice'
  | 'reveal'
  | 'reaction'
  | 'guess';

export type LiveRole = 'host' | 'player';

export type GameFinishedReason = 'completed' | 'host_ended' | 'host_disconnected';
