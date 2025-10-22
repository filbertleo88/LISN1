import RoomDetails from './components/room-details';

export default function RoomPage({
  params,
}: {
  params: { id: string };
}) {
  const roomId = params.id;

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">Room ID</p>
        <h1 className="text-6xl font-bold tracking-widest font-mono text-primary">
          {roomId}
        </h1>
      </div>
      <RoomDetails roomId={roomId}/>
    </div>
  );
}
