-- Migration: 20260901_user_tracker.sql
-- Description: Create public.user_tracker table for GATE CSE & DA syllabus progress,
--              bounded revision summaries, custom column values (mock, mock count, priority, marks),
--              topic notes with LWW tombstones, and countdown/column preferences.
--
-- Core Architecture Invariants:
--   1. PRACTICE DATA IS STRICTLY READ-ONLY TO TRACKER:
--      Solved PYQ IDs, question attempt histories, and performance analytics are ALREADY
--      stored in public.user_progress. The Tracker derives all PYQ counts, coverage percentages,
--      and accuracy rates dynamically in-memory (0ms). Zero practice data is duplicated here.
--   2. BOUNDED PAYLOAD SIZE (FREE-TIER OPTIMIZED):
--      Full append-only revision events remain in browser localStorage. Supabase receives
--      strictly bounded SyncedRevisionSummary maps (< 10 KB per user lifetime).
--   3. TRACK ISOLATION:
--      GATE CSE and GATE DA states are stored in isolated column partitions (cse_* vs da_*).

CREATE TABLE IF NOT EXISTS public.user_tracker (
    -- User Reference (1:1 with authenticated profile)
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Active User Preferences & Exam Countdown Settings
    active_track TEXT NOT NULL DEFAULT 'cse' CHECK (active_track IN ('cse', 'da')),
    exam_date_cse TEXT NOT NULL DEFAULT '2027-02-06',
    exam_date_da TEXT NOT NULL DEFAULT '2027-02-07',
    countdown_display_mode TEXT NOT NULL DEFAULT 'hero' CHECK (countdown_display_mode IN ('hero', 'compact', 'hidden')),
    show_countdown_widget BOOLEAN NOT NULL DEFAULT true,
    visible_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- GATE CSE Track Partition (Manual Annotations Only)
    cse_theory JSONB NOT NULL DEFAULT '{}'::jsonb,         -- Map: { [nodeId]: { isCompleted: boolean, completedAt: string | null } }
    cse_revisions JSONB NOT NULL DEFAULT '{}'::jsonb,      -- Map: { [nodeId]: { lastRevisedAt: string | null, lastSessionAccuracy: number | null, totalRevisionCount: number } }
    cse_custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Map: { [nodeId]: { mock?: boolean, mockCount?: number, priority?: string, marks?: string, target?: string, remarks?: string } }
    cse_notes JSONB NOT NULL DEFAULT '{}'::jsonb,          -- Map: { [nodeId]: { content: string, updatedAt: string, isDeleted: boolean } }
    
    -- GATE DA Track Partition (Manual Annotations Only)
    da_theory JSONB NOT NULL DEFAULT '{}'::jsonb,          -- Map: { [nodeId]: { isCompleted: boolean, completedAt: string | null } }
    da_revisions JSONB NOT NULL DEFAULT '{}'::jsonb,       -- Map: { [nodeId]: { lastRevisedAt: string | null, lastSessionAccuracy: number | null, totalRevisionCount: number } }
    da_custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,   -- Map: { [nodeId]: { mock?: boolean, mockCount?: number, priority?: string, marks?: string, target?: string, remarks?: string } }
    da_notes JSONB NOT NULL DEFAULT '{}'::jsonb,           -- Map: { [nodeId]: { content: string, updatedAt: string, isDeleted: boolean } }
    
    -- Schema Version & Timestamps
    data_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comments for documentation & catalog inspection
COMMENT ON TABLE public.user_tracker IS 'Stores GATE CSE and DA preparation tracker state (theory, revisions, custom columns, notes, preferences). Practice PYQ history is read-only and lives in user_progress.';
COMMENT ON COLUMN public.user_tracker.cse_theory IS 'CSE Theory completion checkboxes { [nodeId]: { isCompleted, completedAt } }';
COMMENT ON COLUMN public.user_tracker.cse_revisions IS 'Bounded CSE revision summaries { [nodeId]: { lastRevisedAt, lastSessionAccuracy, totalRevisionCount } }';
COMMENT ON COLUMN public.user_tracker.cse_custom_fields IS 'Custom columns per node { [nodeId]: { mock, mockCount, priority, marks, target, remarks } }';
COMMENT ON COLUMN public.user_tracker.cse_notes IS 'Topic notes with LWW timestamp and isDeleted tombstones { [nodeId]: { content, updatedAt, isDeleted } }';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_tracker ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present to ensure clean idempotent execution
DROP POLICY IF EXISTS "Users can read own tracker data" ON public.user_tracker;
DROP POLICY IF EXISTS "Users can insert own tracker data" ON public.user_tracker;
DROP POLICY IF EXISTS "Users can update own tracker data" ON public.user_tracker;
DROP POLICY IF EXISTS "Users can delete own tracker data" ON public.user_tracker;

-- RLS Policies (Optimized with (SELECT auth.uid()))
CREATE POLICY "Users can read own tracker data"
    ON public.user_tracker FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own tracker data"
    ON public.user_tracker FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own tracker data"
    ON public.user_tracker FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own tracker data"
    ON public.user_tracker FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Role Privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_tracker TO authenticated;

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_user_tracker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_tracker_timestamp ON public.user_tracker;
CREATE TRIGGER set_user_tracker_timestamp
    BEFORE UPDATE ON public.user_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_tracker_updated_at();
