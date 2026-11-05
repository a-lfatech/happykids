/*
# Secure family progress backup and contact messages

1. Security fix on existing tables
- `child_profiles` and `child_progress` previously allowed anyone with the public app key
  to read and change every row (USING true). They hold child data and are not used by the app,
  so all public policies are removed and anon/authenticated access is revoked. No data is deleted.

2. New Tables
- `family_progress` - one private backup per parent account
  - `user_id` (uuid, primary key, defaults to the signed-in parent, references auth.users)
  - `state` (jsonb) - child profiles, settings and progress exactly as stored on the device
  - `updated_at` (bigint) - client timestamp (ms) used for "newest copy wins" sync
  - `created_at` (timestamptz)
- `contact_messages` - messages from the About page contact form
  - `id` (uuid), `name`, `email`, `message` (text, length-limited), `created_at`

3. Security
- RLS enabled on both new tables.
- `family_progress`: authenticated parents can select/insert/update/delete only their own row.
- `contact_messages`: anyone may submit (insert only); nobody can read messages through the app.

4. Notes
1. Children never sign in; only a parent account owns the backup.
2. No voice recordings or audio are stored anywhere.
*/

DROP POLICY IF EXISTS "anon_select_child_profiles" ON child_profiles;
DROP POLICY IF EXISTS "anon_insert_child_profiles" ON child_profiles;
DROP POLICY IF EXISTS "anon_update_child_profiles" ON child_profiles;
DROP POLICY IF EXISTS "anon_delete_child_profiles" ON child_profiles;
DROP POLICY IF EXISTS "anon_select_child_progress" ON child_progress;
DROP POLICY IF EXISTS "anon_insert_child_progress" ON child_progress;
DROP POLICY IF EXISTS "anon_update_child_progress" ON child_progress;
DROP POLICY IF EXISTS "anon_delete_child_progress" ON child_progress;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('child_profiles', 'child_progress')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

REVOKE ALL ON child_profiles FROM anon, authenticated;
REVOKE ALL ON child_progress FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS family_progress (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON family_progress TO authenticated;

DROP POLICY IF EXISTS "select_own_family_progress" ON family_progress;
CREATE POLICY "select_own_family_progress" ON family_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_family_progress" ON family_progress;
CREATE POLICY "insert_own_family_progress" ON family_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_family_progress" ON family_progress;
CREATE POLICY "update_own_family_progress" ON family_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_family_progress" ON family_progress;
CREATE POLICY "delete_own_family_progress" ON family_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email LIKE '%@%'),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
GRANT INSERT (name, email, message) ON contact_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anyone_can_send_contact_message" ON contact_messages;
CREATE POLICY "anyone_can_send_contact_message" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
