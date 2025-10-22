import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Clapperboard, Menu, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              LISN
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/summarize"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Summarizer
            </Link>
            <Link
              href="/join"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Rooms
            </Link>
          </nav>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <div className="flex-1 flex justify-start items-center md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <Clapperboard className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">LISN</span>
            </Link>
          </div>
          <SheetContent side="left" className="pr-0">
            <div className="flex flex-col h-full">
              <Link
                href="/"
                className="flex items-center"
              >
                <Clapperboard className="h-6 w-6 mr-2 text-primary" />
                <span className="font-bold">LISN</span>
              </Link>
              <div className="flex flex-col mt-8 space-y-4">
                <Link href="/summarize" className="text-muted-foreground hover:text-foreground">Summarizer</Link>
                <Link href="/join" className="text-muted-foreground hover:text-foreground">Rooms</Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button asChild>
            <Link href="/summarize">
              <Sparkles className="mr-2 h-4 w-4" /> Get Started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
