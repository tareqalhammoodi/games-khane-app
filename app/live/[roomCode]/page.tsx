import LiveRoomPage from '@/features/live/components/LiveRoomPage';

export default async function LiveRoomRoute({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;

  return <LiveRoomPage roomCode={roomCode.toUpperCase()} />;
}
