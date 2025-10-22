'use client';

import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  User,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, authLoading, error] = useAuthState(auth);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error('Error processing redirect result:', error);
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirectResult();
  }, []);

  const loading = authLoading || isProcessingRedirect;

  useEffect(() => {
    if (!loading && user) {
      console.log('Login successful! User data:', user);
    }
  }, [user, loading]);

  if (error) {
    console.error('Firebase Auth Error:', error);
  }

  return { user: user as User | null, loading };
}

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (err: any) {
    console.error('Authentication error:', err.message);
    throw err;
  }
};

// Email/Password Registration
export const registerWithEmailAndPassword = async (username: string, email: string, password: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: username });
    return user;
  } catch (err: any) {
    console.error('Registration error:', err.message);
    throw err;
  }
};

// Email/Password Sign-In
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (err: any) {
    console.error('Login error:', err.message);
    throw err;
  }
};

// Logout
export const logout = () => {
  signOut(auth);
};
