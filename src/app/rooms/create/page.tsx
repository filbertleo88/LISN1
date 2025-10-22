'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomId } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function CreateRoomPage() {
  const router = useRouter();

  useEffect(() => {
    const newRoomId = generateRoomId();
    router.replace(`/rooms/${newRoomId}`);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold font-headline">Creating Your Room...</h1>
      <p className="text-muted-foreground">You will be redirected shortly.</p>
    </div>
  );
}
