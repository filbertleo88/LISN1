'use client';

import Link from 'next/link';
import { useAuth, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

export default function SiteHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold font-headline text-lg">LISN</span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/summarize"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Summarize
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            ) : user ? (
              <>
                <div className="flex items-center text-sm font-medium text-muted-foreground mr-4">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {user.displayName || user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
