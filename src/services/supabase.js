/**
 * supabase.js
 * -----------
 * Initializes and exports the Supabase client instance.
 *
 * GRACEFUL FALLBACK: If env vars are missing (e.g., CI builds, preview
 * deployments without secrets), the client is null. All auth/sync code
 * must guard against a null supabase client. This ensures the app builds
 * and runs perfectly in Guest Mode without Supabase credentials.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Persist the session in localStorage so users stay logged in
          // across page refreshes and browser restarts.
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

if (!supabase) {
  console.warn(
    "[GateQA Auth] Supabase client is not initialized. " +
      "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
      "Running in Guest-only mode."
  );
}
