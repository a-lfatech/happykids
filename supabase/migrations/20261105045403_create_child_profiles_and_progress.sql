/*
# Create child profiles and progress tables

## Summary
Sets up the data layer for HappyKids learning progress persistence. This is a
single-tenant schema (no auth required yet — the app currently uses localStorage
with optional MongoDB cloud sync via the FastAPI backend). These tables provide
a future-ready Supabase data store that the app can migrate to.

## New Tables

### child_profiles
- id (uuid, primary key) — unique profile identifier
- name (text) — child's nickname (no real names required)
- avatar (text) — character avatar identifier (hoppy, froggy, sunny, etc.)
- level (text) — learning level (K, G1, G2, etc.)
- created_at (timestamptz) — when the profile was created

### child_progress
- id (uuid, primary key) — unique progress record identifier
- profile_id (uuid, foreign key to child_profiles) — which child this belongs to
- state (jsonb) — the full progress state (games, stars, recent activity, settings)
- updated_at (timestamptz) — last update timestamp
- created_at (timestamptz) — when the record was first created

## Security
- RLS enabled on both tables.
- Since the app has no sign-in screen yet, policies use TO anon, authenticated
  so the anon-key client can read and write its own data.
- This is intentionally shared/public data (single-tenant app, no auth yet).
- When auth is added later, these policies should be updated to use auth.uid()
  ownership checks.

## Important Notes
1. The child_progress table stores the same JSON state structure that the app
   currently saves to localStorage (key: hopcount_progress_v1).
2. The state column is jsonb to allow flexible schema evolution as the app grows.
3. A unique constraint on (profile_id) ensures one progress record per child.
*/

CREATE TABLE IF NOT EXISTS child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text NOT NULL DEFAULT 'hoppy',
  level text NOT NULL DEFAULT 'K',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS child_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id)
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON child_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON child_progress TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_child_profiles" ON child_profiles;
CREATE POLICY "anon_select_child_profiles"
ON child_profiles FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_child_profiles" ON child_profiles;
CREATE POLICY "anon_insert_child_profiles"
ON child_profiles FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_child_profiles" ON child_profiles;
CREATE POLICY "anon_update_child_profiles"
ON child_profiles FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_child_profiles" ON child_profiles;
CREATE POLICY "anon_delete_child_profiles"
ON child_profiles FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_child_progress" ON child_progress;
CREATE POLICY "anon_select_child_progress"
ON child_progress FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_child_progress" ON child_progress;
CREATE POLICY "anon_insert_child_progress"
ON child_progress FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_child_progress" ON child_progress;
CREATE POLICY "anon_update_child_progress"
ON child_progress FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_child_progress" ON child_progress;
CREATE POLICY "anon_delete_child_progress"
ON child_progress FOR DELETE
TO anon, authenticated USING (true);
