'use server';

/**
 * @fileOverview Summarizes a meeting transcript, extracting key points, decisions, and action items.
 *
 * - summarizeMeetingTranscript - A function that handles the meeting transcript summarization process.
 * - SummarizeMeetingTranscriptInput - The input type for the summarizeMeetingTranscript function.
 * - SummarizeMeetingTranscriptOutput - The return type for the summarizeMeetingTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to be summarized.'),
});
export type SummarizeMeetingTranscriptInput = z.infer<typeof SummarizeMeetingTranscriptInputSchema>;

const SummarizeMeetingTranscriptOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the meeting, including key points, decisions, and action items.'),
});
export type SummarizeMeetingTranscriptOutput = z.infer<typeof SummarizeMeetingTranscriptOutputSchema>;

export async function summarizeMeetingTranscript(
  input: SummarizeMeetingTranscriptInput
): Promise<SummarizeMeetingTranscriptOutput> {
  return summarizeMeetingTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingTranscriptPrompt',
  input: {schema: SummarizeMeetingTranscriptInputSchema},
  output: {schema: SummarizeMeetingTranscriptOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing meeting transcripts.

  Your goal is to extract the key points, decisions made, and action items discussed during the meeting.
  Provide a concise and informative summary that allows users to quickly understand the meeting's outcome without reading the entire transcript.

  Transcript: {{{transcript}}}`,
});

const summarizeMeetingTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingTranscriptFlow',
    inputSchema: SummarizeMeetingTranscriptInputSchema,
    outputSchema: SummarizeMeetingTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
