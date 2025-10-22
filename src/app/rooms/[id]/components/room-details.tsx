'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Mic, QrCode, Square, Users, CircleDot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import { Room } from '@/types/room';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';

export default function RoomDetails({ roomId }: { roomId: string }) {
  const [joinUrl, setJoinUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const isHost = room?.hostId === user?.uid;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join?roomId=${roomId}`);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as Room;
        setRoom(roomData);

        if (user && !roomData.participants.some(p => p.uid === user.uid)) {
          updateDoc(roomRef, {
            participants: arrayUnion({
              uid: user.uid,
              name: user.displayName || 'New User',
              role: 'participant'
            })
          });
        }
      } else {
        toast({ variant: 'destructive', title: 'Room not found' });
        setRoom(null);
      }
    });

    return () => unsubscribe();
  }, [roomId, user, toast]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    joinUrl
  )}&bgcolor=ECEFF1`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setIsCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to copy link' });
    }
  };

  const handleToggleRecording = async () => {
    if (!room || !isHost) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { isRecording: !room.isRecording });
  };

  const handleProcessAndSummarize = async () => {
    console.log('Triggering backend to process recordings for room:', roomId);
    toast({ title: 'Processing request sent', description: 'Your recording is being processed and summarized.' });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-8">

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CircleDot className="w-5 h-5"/>
                    Meeting Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                {room?.isRecording ? (
                    <div className="flex items-center gap-2 text-red-500 font-medium">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        Recording in progress...
                    </div>
                ) : (
                    <p className="text-muted-foreground">Waiting for host to start recording</p>
                )}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> Invite Participants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            {joinUrl && (
              <div className="p-4 bg-card rounded-lg border">
                <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
              </div>
            )}
            <div className="flex-1 w-full">
              <p className="text-sm text-muted-foreground mb-2">Or share this link:</p>
              <div className="flex w-full items-center space-x-2">
                <input type="text" readOnly value={joinUrl} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isHost && (
          <Card>
            <CardHeader>
              <CardTitle>Host Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {!room?.isRecording ? (
                <Button size="lg" onClick={handleToggleRecording}>
                  <Mic className="mr-2 h-5 w-5" /> Start Recording
                </Button>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                    Recording...
                  </div>
                  <Button size="lg" variant="destructive" onClick={handleToggleRecording}>
                    <Square className="mr-2 h-5 w-5" /> Stop Recording
                  </Button>
                </div>
              )}
            </CardContent>
            {room && !room.isRecording && (
            <CardContent className="text-center border-t pt-6">
              <p className="text-muted-foreground mb-4">Finished with your meeting?</p>
                <Button onClick={handleProcessAndSummarize}>
                  Process Recording & Summarize
                </Button>
            </CardContent>
          )}
          </Card>
        )}
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {room?.participants.map((p) => (
              <div key={p.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${p.uid}.png`} alt={p.name} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div><p className="font-medium">{p.name}</p></div>
                </div>
                <span className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${p.role === 'host' ? 'bg-primary/20 text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {p.role}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
