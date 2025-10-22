import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clapperboard, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Summarization',
    description:
      'Gemini AI processes your transcripts to extract key points, decisions, and action items automatically.',
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'Collaborative Rooms',
    description:
      'Create rooms for group meetings. Invite participants via QR code or a unique Room ID to record and sync audio seamlessly.',
  },
  {
    icon: <Clapperboard className="w-8 h-8 text-primary" />,
    title: 'AI Avatar Narration',
    description:
      'Generate a video summary where an AI avatar narrates the key findings, making updates engaging and easy to digest.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                  Unlock Your Meeting&apos;s Potential
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Record, transcribe, and summarize your conversations with the
                  power of AI. LISN saves you time and ensures no critical
                  information is missed.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/summarize">Start Summarizing</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/rooms/create">Create a Room</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Streamline Your Workflow
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LISN provides a comprehensive suite of tools to make your
                  meetings more productive and efficient.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              {features.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="font-headline">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} LISN. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
