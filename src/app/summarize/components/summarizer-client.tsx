'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSummaryAndNarration, type SummaryState } from '../actions';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clapperboard, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export default function SummarizerClient() {
  const initialState: SummaryState = { success: false };
  const [state, formAction] = useFormState(getSummaryAndNarration, initialState);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const avatarImage = PlaceHolderImages.find(img => img.id === 'ai-avatar');

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'Your summary and narration have been generated.',
      });
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div>
      <Card>
        <form action={formAction}>
          <CardContent className="p-6">
            <Textarea
              name="transcript"
              placeholder="Paste your full meeting transcript here..."
              className="min-h-[200px] text-base"
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Make sure to provide a detailed transcript for the best results.
            </p>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.error && !state.success && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && state.summary && state.narrationUrl && (
        <div ref={resultsRef} className="mt-12">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline mb-8">Your AI-Generated Summary</h2>
            <div className="grid gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Meeting Summary</CardTitle>
                        <CardDescription>Key points, decisions, and action items.</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                        <p>{state.summary}</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clapperboard className="w-5 h-5" /> AI Narration</CardTitle>
                        <CardDescription>Listen to your summary.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        {avatarImage && (
                             <Image 
                                src={avatarImage.imageUrl} 
                                alt={avatarImage.description}
                                width={128}
                                height={128}
                                className="rounded-full mb-4 shadow-lg"
                                data-ai-hint={avatarImage.imageHint}
                            />
                        )}
                       
                        <audio controls src={state.narrationUrl} className="w-full mt-4">
                            Your browser does not support the audio element.
                        </audio>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
