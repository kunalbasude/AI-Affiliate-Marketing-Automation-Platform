"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/config";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  getIdToken: async () => "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result from Google sign-in (fires on page load after redirect)
    getRedirectResult(getFirebaseAuth())
      .then(async (result) => {
        if (result?.user) {
          await saveGoogleUser(result.user);
        }
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
      });

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocSnap = await getDoc(doc(getFirebaseDb(), "users", firebaseUser.uid));
          if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
          } else {
            // User exists in Auth but not in Firestore yet — use auth data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              username: firebaseUser.email?.split("@")[0] || "",
              plan: "free",
              storeSettings: { storeName: "", bio: "", accentColor: "#4f46e5" },
              aiUsage: { generationsThisMonth: 0, lastResetDate: new Date().toISOString().split("T")[0] },
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            } as User);
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          // Still set user from auth data so app doesn't get stuck
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            username: firebaseUser.email?.split("@")[0] || "",
            plan: "free",
            storeSettings: { storeName: "", bio: "", accentColor: "#4f46e5" },
            aiUsage: { generationsThisMonth: 0, lastResetDate: new Date().toISOString().split("T")[0] },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // Wait for onAuthStateChanged to fire and loading to become false
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        if (user) {
          unsubscribe();
          resolve();
        }
      });
    });
  };

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(firebaseUser, { displayName });

    const userData = {
      email,
      displayName,
      username,
      plan: "free" as const,
      storeSettings: { storeName: `${displayName}'s Store`, bio: "", accentColor: "#4f46e5" },
      aiUsage: { generationsThisMonth: 0, lastResetDate: new Date().toISOString().split("T")[0] },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(getFirebaseDb(), "users", firebaseUser.uid), userData);
    await setDoc(doc(getFirebaseDb(), "usernames", username), { uid: firebaseUser.uid });
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setUser(null);
  };

  const saveGoogleUser = async (firebaseUser: import("firebase/auth").User) => {
    try {
      const userDocRef = doc(getFirebaseDb(), "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        const username = firebaseUser.email?.split("@")[0] || `user_${Date.now()}`;
        const userData = {
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          username,
          photoURL: firebaseUser.photoURL || "",
          plan: "free" as const,
          storeSettings: { storeName: `${firebaseUser.displayName}'s Store`, bio: "", accentColor: "#4f46e5" },
          aiUsage: { generationsThisMonth: 0, lastResetDate: new Date().toISOString().split("T")[0] },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await setDoc(userDocRef, userData);
        await setDoc(doc(getFirebaseDb(), "usernames", username), { uid: firebaseUser.uid });
      }
    } catch (firestoreError) {
      console.error("Firestore save failed (auth still succeeded):", firestoreError);
    }
  };

  const getIdToken = async (): Promise<string> => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    return currentUser.getIdToken();
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      await saveGoogleUser(result.user);
      // Wait for auth state to update
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
      });
    } catch (popupErr: unknown) {
      const code = (popupErr as { code?: string })?.code;
      // If popup was blocked or closed, fall back to redirect flow
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        await signInWithRedirect(getFirebaseAuth(), provider);
        // getRedirectResult will handle the result on the next page load (handled in useEffect above)
        return;
      }
      throw popupErr;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}
