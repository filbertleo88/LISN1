'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomId } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait until auth state is loaded
    if (!user) {
        // Handle unauthenticated user
        toast({ title: 'Please sign in to create a room', variant: 'destructive' });
        router.push('/login'); // Redirect to a login page
        return;
    }

    const newRoomId = generateRoomId();
    const roomRef = doc(db, 'rooms', newRoomId);

    const createRoom = async () => {
        try {
            await setDoc(roomRef, {
                roomId: newRoomId,
                hostId: user.uid,
                participants: [
                    { uid: user.uid, name: user.displayName || 'Host', role: 'host' },
                ],
                isRecording: false,
                createdAt: serverTimestamp(),
            });
            router.replace(`/rooms/${newRoomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast({ title: 'Failed to create room', variant: 'destructive' });
            // Optionally redirect to an error page or back to the home page
            router.push('/');
        }
    }

    createRoom();

  }, [router, user, loading, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold font-headline">Creating Your Room...</h1>
      <p className="text-muted-foreground">You will be redirected shortly.</p>
    </div>
  );
}
