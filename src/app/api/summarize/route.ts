import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// IMPORTANT: Set up your GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  const { transcript } = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured. Please set GEMINI_API_KEY.' },
      { status: 500 }
    );
  }

  if (!transcript) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      As an expert meeting summarizer, your task is to create a concise and structured summary of the provided meeting transcript.

      Analyze the transcript to identify the following key elements:
      - **Key Discussion Points:** What were the main topics and outcomes of the conversation?
      - **Decisions Made:** What were the final conclusions or resolutions?
      - **Action Items:** What specific tasks were assigned, and who is responsible for them?

      Based on your analysis, generate a summary in markdown format with the following sections:
      - A short, one-sentence overall summary.
      - A bulleted list of the key discussion points.
      - A bulleted list of the decisions made.
      - A table of action items with columns for "Task" and "Assigned To".

      Transcript:
      ---
      ${transcript}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary.' },
      { status: 500 }
    );
  }
}
