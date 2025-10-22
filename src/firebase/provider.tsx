// 'use client';
// import {
//   createContext,
//   useContext,
//   type ReactNode,
// } from 'react';

// import type { FirebaseApp } from 'firebase/app';
// import type { Auth } from 'firebase/auth';
// import type { Firestore } from 'firebase/firestore';

// interface FirebaseContextValue {
//   firebaseApp: FirebaseApp;
//   auth: Auth;
//   firestore: Firestore;
// }

// const FirebaseContext = createContext<FirebaseContextValue | undefined>(
//   undefined
// );

// export function FirebaseProvider({
//   children,
//   ...value
// }: {
//   children: ReactNode;
// } & FirebaseContextValue) {
//   return (
//     <FirebaseContext.Provider value={value}>
//       {children}
//     </FirebaseContext.Provider>
//   );
// }

// export const useFirebase = () => {
//   const context = useContext(FirebaseContext);
//   if (context === undefined) {
//     throw new Error('useFirebase must be used within a FirebaseProvider');
//   }
//   return context;
// };

// export const useFirebaseApp = () => useFirebase().firebaseApp;
// export const useFirestore = () => useFirebase().firestore;
// export const useAuth = () => useFirebase().auth;

"use client";

import { auth, db } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithRedirect, signOut, User, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export function useAuth() {
  const [user, authLoading, error] = useAuthState(auth);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createOrUpdateUserProfile(result.user);
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirectResult();
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  const loading = authLoading || isProcessingRedirect;

  useEffect(() => {
    if (!loading && user) {
      console.log("Login successful! User data:", user);
      console.log("User profile:", userProfile);
    }
  }, [user, loading, userProfile]);

  if (error) {
    console.error("Firebase Auth Error:", error);
  }

  return {
    user: user as User | null,
    userProfile,
    loading,
  };
}

// Firestore functions
const createOrUpdateUserProfile = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const userData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
      lastLoginAt: new Date(),
      createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
    };

    if (userSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        lastLoginAt: userData.lastLoginAt,
      });
    } else {
      // Create new user
      await setDoc(userRef, userData);
    }

    console.log("User profile saved/updated successfully");
    return userData;
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
};

const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (err: any) {
    console.error("Authentication error:", err.message);
    throw err;
  }
};

// Email/Password Registration
export const registerWithEmailAndPassword = async (username: string, email: string, password: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile in Firebase Auth
    await updateProfile(user, { displayName: username });

    // Create user profile in Firestore
    await createOrUpdateUserProfile(user);

    return user;
  } catch (err: any) {
    console.error("Registration error:", err.message);
    throw err;
  }
};

// Email/Password Sign-In
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Update last login in Firestore
    await createOrUpdateUserProfile(user);

    return user;
  } catch (err: any) {
    console.error("Login error:", err.message);
    throw err;
  }
};

// Update user profile
export const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  try {
    // Update in Firebase Auth
    await updateProfile(user, updates);

    // Update in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      ...updates,
      lastLoginAt: new Date(), // Update last login time
    });

    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Logout
export const logout = () => {
  signOut(auth);
};

// Get user by ID (for other parts of your app)
export const getUserById = async (uid: string): Promise<UserProfile | null> => {
  return await getUserProfile(uid);
};
