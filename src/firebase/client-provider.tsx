'use client';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This is a workaround for a bug in Next.js where the provider is
// initialized twice in a row, causing a flicker.
let firebaseApp: any;

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }

  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
}
