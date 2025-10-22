"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomId } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async (userId: string, userName: string) => {
    setIsCreating(true);
    const newRoomId = generateRoomId();
    const roomRef = doc(db, "rooms", newRoomId);

    try {
      await setDoc(roomRef, {
        roomId: newRoomId,
        hostId: userId,
        participants: [{ uid: userId, name: userName, role: "host" }],
        isRecording: false,
        createdAt: serverTimestamp(),
      });
      router.replace(`/rooms/${newRoomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({ title: "Failed to create room", variant: "destructive" });
      setIsCreating(false);
    }
  };

  const handleCreateWithUser = () => {
    if (user) {
      createRoom(user.uid, user.displayName || "Host");
    }
  };

  const handleDemoMode = () => {
    createRoom("demo-user-id", "Demo User");
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold font-headline">Checking authentication...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  // Show room creation in progress
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold font-headline">Creating Your Room...</h1>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    );
  }

  // Main UI - user can choose to sign in or use demo
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold font-headline">Create a Room</h1>
          <p className="text-muted-foreground">{user ? "Ready to create your room?" : "Sign in to create a room or try demo mode to test the features."}</p>
        </div>

        <div className="flex flex-col gap-4">
          {user ? (
            <Button onClick={handleCreateWithUser} size="lg">
              Create Room Now
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push("/login")} size="lg">
                Sign In to Create Room
              </Button>
              <Button variant="outline" onClick={handleDemoMode} size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Try Demo Mode
              </Button>
            </>
          )}
        </div>

        {!user && <p className="text-xs text-muted-foreground mt-4">Demo mode creates a temporary room with a demo account for testing purposes.</p>}
      </div>
    </div>
  );
}
