/**
 * AuthContext.jsx
 * ---------------
 * Global React context for authentication state.
 *
 * Provides:
 *  - user          : The signed-in Supabase user object, or null if guest.
 *  - session       : The full Supabase session, or null.
 *  - loading       : True while the initial session is being checked.
 *  - signInWithGoogle() : Triggers Google OAuth redirect flow.
 *  - signOut()          : Signs the user out (local data is NOT deleted).
 *
 * Design Rules:
 *  - If supabase client is null, the context stays in permanent Guest Mode.
 *  - All auth state changes are handled via onAuthStateChange to guarantee
 *    correct state on redirect-back from Google OAuth.
 *  - wrap <AuthProvider> at the root level (in App.jsx), outside all other
 *    providers so every component can access auth state.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { syncUserData } from "../utils/cloudSyncManager";

const DEFAULT_AUTH_CONTEXT = {
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false,
  isSyncing: false,
  lastSyncedAt: null,
  triggerSync: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext(DEFAULT_AUTH_CONTEXT);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const syncInFlightRef = useRef(null);
  const syncTimerRef = useRef(null);
  const retryAttemptRef = useRef(0);
  const triggerSyncRef = useRef(null);

  const triggerSync = useCallback(async (activeUserId) => {
    const targetId = activeUserId;
    if (!targetId) return;
    if (syncInFlightRef.current === targetId) return;

    syncInFlightRef.current = targetId;
    setIsSyncing(true);
    try {
      const res = await syncUserData(targetId);
      if (res.success) {
        retryAttemptRef.current = 0;
        setLastSyncedAt(new Date());
      } else if (typeof window !== "undefined" && window.navigator.onLine) {
        const attempt = retryAttemptRef.current;
        if (attempt < 4) {
          retryAttemptRef.current += 1;
          const delay = 2000 * (2 ** attempt);
          syncTimerRef.current = window.setTimeout(() => {
            triggerSyncRef.current?.(targetId);
          }, delay);
        }
      }
    } catch (err) {
      console.error("[AuthContext] Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
      syncInFlightRef.current = null;
    }
  }, []);

  triggerSyncRef.current = triggerSync;

  useEffect(() => {
    // If Supabase is not configured, stay in guest mode immediately
    if (!supabase) {
      setLoading(false);
      return;
    }

    const scheduleSync = () => {
      if (!user?.id) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        triggerSync(user.id);
      }, 750);
    };

    window.addEventListener("gateqa:sync-request", scheduleSync);
    window.addEventListener("online", scheduleSync);

    // Load existing session on mount (handles redirect-back from OAuth)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      const currentUser = existingSession?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        triggerSync(currentUser.id);
      }
    });

    // Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      setLoading(false);

      if (event === "SIGNED_IN" && newUser) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("gateqa:auth-signed-in", { detail: newUser }));
        }
        triggerSync(newUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("gateqa:sync-request", scheduleSync);
      window.removeEventListener("online", scheduleSync);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [triggerSync, user?.id]);

  /**
   * Sign in with Google via OAuth redirect.
   */
  const signInWithGoogle = async () => {
    if (!supabase) {
      console.warn("[GateQA Auth] Supabase not configured. Cannot sign in.");
      return { error: new Error("Supabase authentication is not configured.") };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("[GateQA Auth] Google sign-in error:", error.message);
    }
    return { data, error };
  };

  /**
   * Sign out the current user.
   * IMPORTANT: This does NOT delete localStorage data.
   */
  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[GateQA Auth] Sign-out error:", error.message);
    }
    setLastSyncedAt(null);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isSyncing,
    lastSyncedAt,
    triggerSync,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || DEFAULT_AUTH_CONTEXT;
}
