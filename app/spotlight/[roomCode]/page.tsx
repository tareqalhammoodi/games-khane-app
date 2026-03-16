import LiveRoomPage from '@/features/live/components/common/LiveRoomPage';

export default async function SpotlightRoomRoute({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;

  return <LiveRoomPage roomCode={roomCode.toUpperCase()} startOverPath="/spotlight" forceSpotlight />;
}
