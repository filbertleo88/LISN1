'use server';

import { summarizeMeetingTranscript } from '@/ai/flows/summarize-meeting-transcript';
import { generateVideoSummaryWithAvatar } from '@/ai/flows/generate-video-summary-with-avatar';
import { z } from 'zod';

const formSchema = z.object({
  transcript: z
    .string()
    .min(50, { message: 'Transcript must be at least 50 characters long.' }),
});

export interface SummaryState {
  summary?: string;
  narrationUrl?: string;
  error?: string;
  success: boolean;
}

export async function getSummaryAndNarration(
  prevState: SummaryState,
  formData: FormData
): Promise<SummaryState> {
  const validatedFields = formSchema.safeParse({
    transcript: formData.get('transcript'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.transcript?.join(', '),
    };
  }

  try {
    const summaryResult = await summarizeMeetingTranscript({
      transcript: validatedFields.data.transcript,
    });

    const summary = summaryResult.summary;

    if (!summary) {
      return { success: false, error: 'Failed to generate summary.' };
    }

    const narrationResult = await generateVideoSummaryWithAvatar({
      meetingSummary: summary,
    });

    const videoDataUri = narrationResult.videoDataUri;

    if (!videoDataUri) {
      return { success: false, error: 'Failed to generate narration.' };
    }

    return {
      success: true,
      summary,
      narrationUrl: videoDataUri,
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { success: false, error: `An error occurred: ${errorMessage}` };
  }
}
