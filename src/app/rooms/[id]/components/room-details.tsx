"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, Mic, QrCode, Square, Users, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase";
import { Room } from "@/types/room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import dynamic from "next/dynamic";

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
  loading: () => <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded-lg" />,
});

export default function RoomDetails({ roomId }: { roomId: string }) {
  const [joinUrl, setJoinUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const isHost = room?.hostId === user?.uid;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join?roomId=${roomId}`);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as Room;
        setRoom(roomData);

        if (user && !roomData.participants.some((p) => p.uid === user.uid)) {
          updateDoc(roomRef, {
            participants: arrayUnion({
              uid: user.uid,
              name: user.displayName || "New User",
              role: "participant",
            }),
          });
        }
      } else {
        toast({ variant: "destructive", title: "Room not found" });
        setRoom(null);
      }
    });

    return () => unsubscribe();
  }, [roomId, user, toast]);

  // Initialize media recorder
  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm;codecs=opus" });
        // Here you can upload the blob to your server
        console.log("Recording stopped, audio blob:", audioBlob);
        setRecordedChunks([]);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      return recorder;
    } catch (error) {
      console.error("Error initializing media recorder:", error);
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to start recording.",
      });
      return null;
    }
  };

  const handleStartRecording = async () => {
    if (!room || !isHost) return;

    try {
      const recorder = await initializeMediaRecorder();
      if (!recorder) return;

      // Start recording locally
      setRecordedChunks([]);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Update room status in Firebase
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        isRecording: true,
        recordingStartedAt: new Date(),
      });

      toast({
        title: "Recording started",
        description: "Meeting is now being recorded.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Failed to start recording",
        description: "Please try again.",
      });
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorder || !isRecording || !room || !isHost) return;

    try {
      // Stop recording locally
      mediaRecorder.stop();
      setIsRecording(false);

      // Update room status in Firebase
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        isRecording: false,
        recordingStoppedAt: new Date(),
      });

      toast({
        title: "Recording stopped",
        description: "Meeting recording has been saved.",
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast({
        variant: "destructive",
        title: "Failed to stop recording",
        description: "Please try again.",
      });
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setIsCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to copy link" });
    }
  };

  const handleProcessAndSummarize = async () => {
    if (!room) return;

    try {
      console.log("Triggering backend to process recordings for room:", roomId);

      // Here you would typically send the recorded audio to your backend
      if (recordedChunks.length > 0) {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm;codecs=opus" });
        console.log("Sending audio blob to backend:", audioBlob);
        // await uploadRecording(audioBlob, roomId);
      }

      toast({
        title: "Processing request sent",
        description: "Your recording is being processed and summarized.",
      });
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        variant: "destructive",
        title: "Failed to process recording",
        description: "Please try again.",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder, isRecording]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDot className="w-5 h-5" />
              Meeting Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room?.isRecording ? (
              <div className="flex items-center gap-2 text-red-500 font-medium">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                Recording in progress...
                {isRecording && <span className="text-xs text-muted-foreground ml-2">(Local recording active)</span>}
              </div>
            ) : (
              <p className="text-muted-foreground">{isHost ? "Ready to start recording" : "Waiting for host to start recording"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Invite Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            {joinUrl && (
              <div className="p-4 bg-card rounded-lg border flex items-center justify-center">
                <QRCode value={joinUrl} size={200} bgColor="#ECEFF1" fgColor="#1a1a1a" level="M" />
              </div>
            )}
            <div className="flex-1 w-full">
              <p className="text-sm text-muted-foreground mb-2">Or share this link:</p>
              <div className="flex w-full items-center space-x-2">
                <input type="text" readOnly value={joinUrl} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isHost && (
          <Card>
            <CardHeader>
              <CardTitle>Host Controls</CardTitle>
              <CardDescription>You have control over meeting recording</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {!room?.isRecording ? (
                <Button size="lg" onClick={handleStartRecording} disabled={isRecording}>
                  <Mic className="mr-2 h-5 w-5" /> Start Recording
                </Button>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                    Recording in progress...
                  </div>
                  <Button size="lg" variant="destructive" onClick={handleStopRecording}>
                    <Square className="mr-2 h-5 w-5" /> Stop Recording
                  </Button>
                </div>
              )}

              {/* Recording status for host */}
              {isRecording && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>🎤 Local recording is active</p>
                  <p>Audio is being captured from your microphone</p>
                </div>
              )}
            </CardContent>

            {room && !room.isRecording && room.participants.length > 0 && (
              <CardContent className="text-center border-t pt-6">
                <p className="text-muted-foreground mb-4">Finished with your meeting?</p>
                <Button onClick={handleProcessAndSummarize} disabled={recordedChunks.length === 0}>
                  Process Recording & Summarize
                </Button>
                {recordedChunks.length === 0 && <p className="text-xs text-muted-foreground mt-2">No recording data available</p>}
              </CardContent>
            )}
          </Card>
        )}

        {/* Participant View */}
        {!isHost && (
          <Card>
            <CardHeader>
              <CardTitle>Participant View</CardTitle>
              <CardDescription>You are a participant in this meeting</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{room?.isRecording ? "The meeting is being recorded. Please speak clearly." : "Waiting for the host to start recording."}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Participants ({room?.participants?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {room?.participants.map((p) => (
              <div key={p.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${p.uid}.png`} alt={p.name} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role === "host" ? "Host" : "Participant"}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${p.role === "host" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}`}>{p.role}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
