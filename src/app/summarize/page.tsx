'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function SummarizePage() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          AI Meeting Summarizer
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste your meeting transcript below. Our AI will analyze the text to
          extract key points, decisions, and action items, and even generate an
          audio narration.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Enter Transcript</CardTitle>
            <CardDescription>
              Paste your full meeting transcript in the text area below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="transcript"
              placeholder="Paste your full meeting transcript here..."
              className="min-h-[200px] text-base"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Make sure to provide a detailed transcript for the best results.
            </p>
            <Button type="submit" disabled={isLoading || !transcript.trim()}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {error && (
        <Card className="mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
