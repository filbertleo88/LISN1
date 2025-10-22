import SummarizerClient from './components/summarizer-client';

export default function SummarizePage() {
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
      <SummarizerClient />
    </div>
  );
}
