"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

export default function JoinRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId && name) {
      setIsLoading(true);

      try {
        const formattedRoomId = roomId.toUpperCase();

        // Check if room exists
        const roomRef = doc(db, "rooms", formattedRoomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "Please check the room ID and try again.",
          });
          setIsLoading(false);
          return;
        }

        // Generate unique participant ID
        const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add participant to the room
        await updateDoc(roomRef, {
          participants: arrayUnion({
            uid: participantId,
            name: name.trim(),
            role: "participant",
            joinedAt: new Date(),
          }),
        });

        toast({
          title: "Success!",
          description: `You've joined the room as ${name}`,
        });

        // Redirect to room page with participant info
        router.push(`/rooms/${formattedRoomId}?participantId=${participantId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        toast({
          variant: "destructive",
          title: "Error joining room",
          description: "Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Join or Create a Room</h1>
          <p className="mt-2 text-muted-foreground">Enter a room ID to join, or create a new one to get started.</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Join a Meeting Room</CardTitle>
              <CardDescription>Enter the 6-digit room ID and your name to join.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input id="room-id" placeholder="ABC123" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} required maxLength={6} className="uppercase tracking-widest text-center font-mono text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!roomId || !name || isLoading}>
                {isLoading ? "Joining Room..." : "Join Room"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button variant="secondary" className="w-full" asChild>
          <Link href="/rooms/create">
            Create a New Room <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
