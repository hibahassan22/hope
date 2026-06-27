import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth } from "../firebase/auth.js";
import { db } from "../firebase/firestore.js";
import {
  loginWithEmail,
  logout as authLogout,
  fetchUserProfile,
} from "../services/authService.js";
import { resolvePermissions, ROLES, ROLE_LABELS } from "../lib/roles.js";

const AuthContext = createContext(null);

function mapProfile(fbUser, profile, permissions, claimRole) {
  if (!fbUser) return null;
  const fullName = profile?.fullName ?? fbUser.displayName ?? "";
  const parts = fullName.split(" ");
  const role = claimRole ?? profile?.role ?? ROLES.ADMIN;
  return {
    uid: fbUser.uid,
    email: profile?.email ?? fbUser.email ?? "",
    displayName: fullName,
    fullName,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    phone: profile?.phone ?? "",
    department: profile?.department ?? "",
    photoURL: profile?.avatar ?? fbUser.photoURL ?? null,
    imageUrl: profile?.avatar ?? fbUser.photoURL ?? null,
    role,
    status: profile?.status ?? "active",
    permissions,
    firstLogin: profile?.firstLogin ?? false,
    createdBy: profile?.createdBy ?? "",
  };
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [claimRole, setClaimRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const effectiveRole = claimRole ?? profile?.role ?? ROLES.ADMIN;

  const login = useCallback(async (email, password) => loginWithEmail(email, password), []);
  const logout = useCallback(async () => authLogout(), []);

  const permissions = useMemo(
    () => resolvePermissions(effectiveRole, rolePermissions, profile?.permissions),
    [effectiveRole, rolePermissions, profile?.permissions]
  );

  const user = useMemo(
    () => (firebaseUser ? mapProfile(firebaseUser, profile, permissions, claimRole) : null),
    [firebaseUser, profile, permissions, claimRole]
  );

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return null;
    const p = await fetchUserProfile(firebaseUser.uid);
    setProfile(p);
    const tokenResult = await firebaseUser.getIdTokenResult(true);
    setClaimRole(tokenResult.claims?.role ?? null);
    return p;
  }, [firebaseUser]);

  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      profileUnsub?.();
      profileUnsub = null;

      if (fbUser) {
        setLoading(true);
        setFirebaseUser(fbUser);
        try {
          const tokenResult = await fbUser.getIdTokenResult(true);
          setClaimRole(tokenResult.claims?.role ?? null);
        } catch {
          setClaimRole(null);
        }

        profileUnsub = onSnapshot(
          doc(db, "users", fbUser.uid),
          async (snap) => {
            try {
              const data = snap.exists() ? { uid: snap.id, ...snap.data() } : null;
              setProfile(data);

              let claimsRole = null;
              try {
                const tokenResult = await fbUser.getIdTokenResult(true);
                claimsRole = tokenResult.claims?.role ?? null;
                setClaimRole(claimsRole);
              } catch {
                setClaimRole(null);
              }

              const role = claimsRole ?? data?.role ?? ROLES.ADMIN;
              try {
                const roleSnap = await getDoc(doc(db, "roles", role));
                setRolePermissions(roleSnap.exists() ? roleSnap.data().permissions ?? [] : []);
              } catch {
                setRolePermissions([]);
              }
            } finally {
              setLoading(false);
            }
          },
          () => setLoading(false)
        );
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setClaimRole(null);
        setRolePermissions([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsub?.();
    };
  }, []);

  const isLoaded = firebaseUser !== undefined && !loading;
  const isSignedIn = isLoaded && firebaseUser !== null;

  const value = {
    user,
    profile,
    role: user?.role ?? ROLES.ADMIN,
    permissions,
    loading: !isLoaded,
    isLoaded,
    isSignedIn,
    login,
    logout,
    signOut: logout,
    refreshUser,
    firebaseUser,
    roleLabel: ROLE_LABELS[user?.role] ?? user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
