interface RoomCodeCardProps {
  roomCode: string;
  label?: string;
  emptyLabel?: string;
}

export default function RoomCodeCard({
  roomCode,
  label = 'Room Code',
  emptyLabel = '------'
}: RoomCodeCardProps) {
  return (
    <div className="live-room-box">
      <span>{label}</span>
      <strong>{roomCode || emptyLabel}</strong>
    </div>
  );
}
