/**
 * AuthContext — Firebase Auth replacement for Clerk hooks.
 *
 * Exposes:
 *   useAuthContext() → { user, firebaseUser, isLoaded, isSignedIn, signOut }
 *
 * `user` shape matches what the app expects from Clerk's useUser():
 *   user.displayName, user.email, user.photoURL,
 *   user.role  (from Firebase custom claims: firebaseUser.customClaims?.role)
 *
 * Custom claims are read from the ID token so they require the Firebase Admin
 * SDK to set them.  Until claims are set the role defaults to "admin" so
 * existing functionality is preserved during the transition.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [role, setRole] = useState("admin");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Read custom claims from ID token (set via Firebase Admin SDK)
        const tokenResult = await fbUser.getIdTokenResult();
        setRole(tokenResult.claims?.role ?? "admin");
      }
      setFirebaseUser(fbUser ?? null);
    });
    return unsub;
  }, []);

  const isLoaded    = firebaseUser !== undefined;
  const isSignedIn  = isLoaded && firebaseUser !== null;

  // Shape that the rest of the app consumes (mirrors Clerk's user object)
  const user = isSignedIn
    ? {
        // Identity
        displayName: firebaseUser.displayName ?? "",
        email:       firebaseUser.email ?? "",
        photoURL:    firebaseUser.photoURL ?? null,
        uid:         firebaseUser.uid,

        // Clerk-compatible aliases used across components
        firstName:   (firebaseUser.displayName ?? "").split(" ")[0] ?? "",
        lastName:    (firebaseUser.displayName ?? "").split(" ").slice(1).join(" ") ?? "",
        imageUrl:    firebaseUser.photoURL ?? null,
        primaryEmailAddress: { emailAddress: firebaseUser.email ?? "" },

        // Role (from custom claims)
        role,
        publicMetadata: { role },
      }
    : null;

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoaded, isSignedIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
