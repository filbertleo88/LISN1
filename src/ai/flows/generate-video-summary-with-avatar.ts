'use server';
/**
 * @fileOverview Generates a video summary with an AI avatar narrating the key findings of a meeting.
 *
 * - generateVideoSummaryWithAvatar - A function that generates a video summary with an AI avatar.
 * - GenerateVideoSummaryWithAvatarInput - The input type for the generateVideoSummaryWithAvatar function.
 * - GenerateVideoSummaryWithAvatarOutput - The return type for the generateVideoSummaryWithAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateVideoSummaryWithAvatarInputSchema = z.object({
  meetingSummary: z.string().describe('The summary of the meeting transcript.'),
});
export type GenerateVideoSummaryWithAvatarInput = z.infer<typeof GenerateVideoSummaryWithAvatarInputSchema>;

const GenerateVideoSummaryWithAvatarOutputSchema = z.object({
  videoDataUri: z.string().describe('The video data URI of the AI avatar narration.'),
});
export type GenerateVideoSummaryWithAvatarOutput = z.infer<typeof GenerateVideoSummaryWithAvatarOutputSchema>;

export async function generateVideoSummaryWithAvatar(input: GenerateVideoSummaryWithAvatarInput): Promise<GenerateVideoSummaryWithAvatarOutput> {
  return generateVideoSummaryWithAvatarFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateVideoSummaryWithAvatarFlow = ai.defineFlow(
  {
    name: 'generateVideoSummaryWithAvatarFlow',
    inputSchema: GenerateVideoSummaryWithAvatarInputSchema,
    outputSchema: GenerateVideoSummaryWithAvatarOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: input.meetingSummary,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const videoDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {videoDataUri};
  }
);
