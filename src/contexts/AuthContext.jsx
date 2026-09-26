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
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import {
  syncUserData,
  getSyncMeta,
  isProgressDirty,
  isTrackerDirty,
  SYNC_META_KEY,
} from "../utils/cloudSyncManager";

const SYNC_DEBOUNCE_MS = 750;
const MIN_SYNC_INTERVAL_MS = 120_000; // 2 minutes (Option 2)

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
  const lastSuccessfulSyncRef = useRef({ userId: null, timestamp: 0 });
  const channelRef = useRef(null);
  const userRef = useRef(null);
  userRef.current = user;

  const triggerSync = useCallback(async (activeUserId, options = {}) => {
    let targetId = typeof activeUserId === "string" ? activeUserId : userRef.current?.id;
    let opts = options;
    if (typeof activeUserId === "object" && activeUserId !== null) {
      opts = activeUserId;
      targetId = userRef.current?.id;
    } else if (typeof activeUserId === "boolean") {
      opts = { force: activeUserId };
      targetId = userRef.current?.id;
    }

    if (!targetId) return;
    if (syncInFlightRef.current === targetId) return;

    const { force = false, ignoreCooldown = false } = opts;
    const meta = getSyncMeta();
    const progressDirty = force || isProgressDirty(meta);
    const trackerDirty = force || isTrackerDirty(meta);

    // If neither table is dirty and sync is not forced, skip
    if (!force && !progressDirty && !trackerDirty) {
      return;
    }

    const lastSync = lastSuccessfulSyncRef.current;
    const elapsed = Date.now() - lastSync.timestamp;
    if (!force && !ignoreCooldown && lastSync.userId === targetId && elapsed < MIN_SYNC_INTERVAL_MS) {
      return;
    }

    syncInFlightRef.current = targetId;
    setIsSyncing(true);

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: "sync-started", userId: targetId });
      } catch {}
    }

    try {
      const res = await syncUserData(targetId, force ? { force: true } : {});
      if (res.success) {
        retryAttemptRef.current = 0;
        const now = Date.now();
        lastSuccessfulSyncRef.current = {
          userId: targetId,
          timestamp: now,
        };
        setLastSyncedAt(new Date(now));

        if (channelRef.current) {
          try {
            channelRef.current.postMessage({ type: "sync-completed", userId: targetId, timestamp: now });
          } catch {}
        }
      } else if (typeof window !== "undefined" && window.navigator.onLine) {
        const attempt = retryAttemptRef.current;
        if (attempt < 4) {
          retryAttemptRef.current += 1;
          const delay = 2000 * (2 ** attempt);
          syncTimerRef.current = window.setTimeout(() => {
            triggerSyncRef.current?.(targetId, opts);
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

    // Multi-tab coordination via BroadcastChannel
    let channel = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new window.BroadcastChannel("gateqa_sync_channel");
        channelRef.current = channel;
        channel.onmessage = (event) => {
          const msg = event?.data;
          if (!msg) return;
          if (msg.type === "sync-started") {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
          } else if (msg.type === "sync-completed") {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
            const ts = msg.timestamp || Date.now();
            lastSuccessfulSyncRef.current = {
              userId: msg.userId || userRef.current?.id,
              timestamp: ts,
            };
            setLastSyncedAt(new Date(ts));
          }
        };
      }
    } catch {}

    const handleStorage = (event) => {
      if (event.key === SYNC_META_KEY) {
        const meta = getSyncMeta();
        const isDirty = isProgressDirty(meta) || isTrackerDirty(meta);
        if (!isDirty && syncTimerRef.current) {
          clearTimeout(syncTimerRef.current);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    const scheduleSync = () => {
      const activeId = userRef.current?.id;
      if (!activeId) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

      const lastSync = lastSuccessfulSyncRef.current;
      const elapsed = Date.now() - lastSync.timestamp;
      const cooldownRemaining = lastSync.userId === activeId
        ? Math.max(0, MIN_SYNC_INTERVAL_MS - elapsed)
        : 0;

      syncTimerRef.current = setTimeout(() => {
        triggerSync(activeId);
      }, Math.max(SYNC_DEBOUNCE_MS, cooldownRemaining));
    };

    const handleVisibilityChange = () => {
      const activeId = userRef.current?.id;
      if (!activeId) return;
      const meta = getSyncMeta();
      const isDirty = isProgressDirty(meta) || isTrackerDirty(meta);
      if (isDirty) {
        // Tab hidden: best-effort sync attempt; Tab visible: resume pending sync
        triggerSync(activeId, { ignoreCooldown: true });
      }
    };

    window.addEventListener("gateqa:sync-request", scheduleSync);
    window.addEventListener("online", scheduleSync);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Load existing session on mount (handles redirect-back from OAuth)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      const currentUser = existingSession?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        triggerSync(currentUser.id, { force: true });
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
        triggerSync(newUser.id, { force: true });
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("gateqa:sync-request", scheduleSync);
      window.removeEventListener("online", scheduleSync);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (channel) {
        channel.close();
        channelRef.current = null;
      }
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [triggerSync]);

  /**
   * Sign in with Google via OAuth redirect.
   */
  const signInWithGoogle = useCallback(async () => {
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
  }, []);

  /**
   * Sign out the current user.
   * IMPORTANT: This does NOT delete localStorage data.
   */
  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[GateQA Auth] Sign-out error:", error.message);
    }
    setLastSyncedAt(null);
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isSyncing,
    lastSyncedAt,
    triggerSync,
    signInWithGoogle,
    signOut,
  }), [user, session, loading, isSyncing, lastSyncedAt, triggerSync, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || DEFAULT_AUTH_CONTEXT;
}
