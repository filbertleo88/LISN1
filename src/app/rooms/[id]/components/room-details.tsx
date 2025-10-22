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
import { Check, Copy, Mic, QrCode, Square, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room } from '@/types/room';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function RoomDetails({ roomId }: { roomId: string }) {
  const [joinUrl, setJoinUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join?roomId=${roomId}`);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setRoom(doc.data() as Room);
      } else {
        toast({
          variant: 'destructive',
          title: 'Room not found',
          description: 'This room does not seem to exist.',
        });
        setRoom(null);
      }
    });

    return () => unsubscribe();
  }, [roomId, toast]);

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
      toast({
        variant: 'destructive',
        title: 'Failed to copy link',
        description: 'Please copy the link manually.',
      });
    }
  };

  const handleToggleRecording = async () => {
    if (!room) return;
    const roomRef = doc(db, 'rooms', roomId);
    try {
      await updateDoc(roomRef, {
        isRecording: !room.isRecording,
      });
      toast({
        title: `Recording ${!room.isRecording ? 'started' : 'stopped'}.`,
      });
    } catch (error) {
      console.error('Error updating recording state:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating recording state',
        description: 'Could not update the recording status. Please try again.',
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> Invite Participants</CardTitle>
                <CardDescription>
                Share the QR code or link to have others join this room.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-8">
                {joinUrl && (
                <div className="p-4 bg-card rounded-lg border">
                    <Image
                    src={qrCodeUrl}
                    alt="QR Code to join room"
                    width={200}
                    height={200}
                    />
                </div>
                )}
                <div className="flex-1 w-full">
                <p className="text-sm text-muted-foreground mb-2">Or share this link:</p>
                <div className="flex w-full items-center space-x-2">
                    <input
                    type="text"
                    readOnly
                    value={joinUrl}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopy} disabled={!joinUrl}>
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Meeting Controls</CardTitle>
                <CardDescription>Once everyone has joined, start the recording.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {!room?.isRecording ? (
                    <Button size="lg" onClick={handleToggleRecording} disabled={!room}>
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
                <CardContent>
                    <div className="text-center border-t pt-6">
                        <p className="text-muted-foreground mb-4">Finished with your meeting?</p>
                        <Button asChild>
                            <Link href="/summarize">Process Recording & Summarize</Link>
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Participants</CardTitle>
                <CardDescription>See who has joined the meeting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {room?.participants && room.participants.length > 0 ? (
                    room.participants.map((p) => (
                        <div key={p.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://avatar.vercel.sh/${p.uid}.png`} alt={p.name} />
                                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                </div>
                            </div>
                           
                            <span className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${p.role === 'host' ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'}`}>
                                {p.role}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No participants have joined yet.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
