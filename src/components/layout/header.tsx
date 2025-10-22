"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Clapperboard, Menu, User, LogOut, Video, FileText, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth, signInWithGoogle, logout } from "@/lib/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, userProfile } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-background/80 backdrop-blur-sm border-b"}`}>
      <div className="container flex h-16 items-center">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold font-headline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LISN</span>
          </Link>
          <nav className="flex items-center space-x-8 text-sm font-medium">
            <Link href="/summarize" className="flex items-center space-x-2 transition-all duration-200 text-foreground/70 hover:text-foreground group py-2">
              <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Summarizer</span>
            </Link>
            <Link href="/join" className="flex items-center space-x-2 transition-all duration-200 text-foreground/70 hover:text-foreground group py-2">
              <Video className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Rooms</span>
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center flex-1">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent/50 transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-r-0 bg-background/95 backdrop-blur-md">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LISN</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <nav className="flex flex-col gap-1">
                    <Link href="/summarize" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 group">
                      <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>Summarizer</span>
                    </Link>
                    <Link href="/join" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 group">
                      <Video className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>Rooms</span>
                    </Link>
                  </nav>

                  {/* Mobile Auth Section */}
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{userProfile?.displayName || user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <Button variant="ghost" size="sm" className="w-full justify-start mt-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full mx-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={signInWithGoogle}>
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold font-headline text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LISN</span>
            </Link>
          </div>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="flex items-center justify-end flex-1 space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 px-3 rounded-full hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-transparent hover:border-blue-500 transition-colors">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">{getUserInitials(userProfile?.displayName || user.displayName || "User")}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">{userProfile?.displayName || user.displayName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-700 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="hidden sm:flex text-foreground/70 hover:text-foreground transition-colors">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={signInWithGoogle}>
                <User className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
