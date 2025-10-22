'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Check, Copy, Mic, QrCode, Square } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RoomDetails({ roomId }: { roomId: string }) {
  const [joinUrl, setJoinUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join?roomId=${roomId}`);
    }
  }, [roomId]);

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

  return (
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
                {!isRecording ? (
                    <Button size="lg" onClick={() => setIsRecording(true)}>
                        <Mic className="mr-2 h-5 w-5" /> Start Recording
                    </Button>
                ) : (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-4">
                            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                            Recording...
                        </div>
                        <Button size="lg" variant="destructive" onClick={() => setIsRecording(false)}>
                            <Square className="mr-2 h-5 w-5" /> Stop Recording
                        </Button>
                    </div>
                )}
            </CardContent>
            {!isRecording && (
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
  );
}
