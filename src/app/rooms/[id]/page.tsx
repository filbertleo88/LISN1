import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Users } from 'lucide-react';
import RoomDetails from './components/room-details';

export default function RoomPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const roomId = params.id;
  const participants = Array.isArray(searchParams.name)
    ? searchParams.name
    : searchParams.name
    ? [searchParams.name]
    : [];
  
  // The host is always a participant
  const allParticipants = ['Host', ...participants];

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">Room ID</p>
        <h1 className="text-6xl font-bold tracking-widest font-mono text-primary">
          {roomId}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <RoomDetails roomId={roomId}/>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({allParticipants.length})
              </CardTitle>
              <CardDescription>
                Users currently in the room.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {allParticipants.map((name, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                    </span>
                    <span className="font-medium">{name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
