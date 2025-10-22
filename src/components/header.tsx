'use client';

import { useAuth, signInWithGoogle, logout } from '@/lib/auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DoorOpen, LogOut } from 'lucide-react';

export default function Header() {
    const { user, loading } = useAuth();

    return (
        <header className="flex justify-between items-center p-4 border-b bg-background">
            <Link href="/" className="text-2xl font-bold">Meeting App</Link>
            <div>
                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/create-room"><DoorOpen className="w-4 h-4 mr-2"/>Create Room</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2"/>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={signInWithGoogle}>Login</Button>
                )}
            </div>
        </header>
    );
}
