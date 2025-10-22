
import RoomDetails from "./components/room-details";

interface RoomPageProps {
  params: Promise<{ id: string }>; // Ganti roomId menjadi id
}

export default async function RoomPage({ params }: RoomPageProps) {
  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.id; // Ambil dari id, bukan roomId

    console.log("=== ROOM PAGE DEBUG ===");
    console.log("Resolved params:", resolvedParams);
    console.log("RoomId:", roomId);
    console.log("=== END DEBUG ===");

    if (!roomId) {
      return (
        <div className="container mx-auto max-w-5xl py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Room ID not found</h1>
            <p className="text-muted-foreground">Please check the room URL and try again.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">Room ID</p>
          <h1 className="text-6xl font-bold tracking-widest font-mono text-primary">{roomId}</h1>
        </div>
        <RoomDetails roomId={roomId} />
      </div>
    );
  } catch (error) {
    console.error("Error in RoomPage:", error);
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error loading room</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }
}

export async function generateMetadata({ params }: RoomPageProps) {
  try {
    const { id: roomId } = await params; // Destructure dengan alias
    return {
      title: `Room ${roomId} - Meeting App`,
      description: `Join meeting room ${roomId}`,
    };
  } catch (error) {
    return {
      title: `Room - Meeting App`,
      description: `Join meeting room`,
    };
  }
}
