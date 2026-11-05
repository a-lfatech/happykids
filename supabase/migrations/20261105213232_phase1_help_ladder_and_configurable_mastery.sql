/*
# Phase 1: help ladder, configurable mastery threshold, sample-content labels

## Plain-English summary
When a child struggles, help now builds up step by step instead of repeating the same hint:
1. a hint, 2. a different explanation of the idea (plus a "show me" walk-through on screen),
3. guided practice (only two choices left). Asking for help before answering is allowed and never
penalised, but that answer gives no mastery credit, so mastery still reflects independent understanding.
The mastery threshold is now a percentage (default 80%), set per grade with optional per-unit override.
Grade 6 now opens after Grade 1 is mastered. Every unit is labelled "sample" content.

## Modified tables
1. `hk_grades`
   - `mastery_percent` (int, default 80, 50-100): mastery threshold for units in this grade.
2. `hk_units`
   - `mastery_percent` (int, nullable, 50-100): optional override of the grade threshold.
   - `teach` (text): an alternative explanation of the unit's concept, used at help step 2.
   - `content_status` (text, default 'sample'; 'sample' or 'reviewed'): whether content has been
     reviewed against a curriculum standard. All current content is 'sample'.
   - `mastery_target` is kept but no longer used; the target is computed from the percentage.
3. `hk_attempts`
   - `help_level` (int, default 0, 0-3): highest help step shown for this question.
   - `guided` (boolean, default false): help was used before the first answer; excluded from mastery window.
   - `tried` (jsonb, default '[]'): wrong choices already tried, so guided practice never offers them again.

## Data changes
- `g6-multiply` now requires `g1-before` (the last Grade 1 unit), fixing Grade 6 never unlocking.
- `teach` text written for all 17 existing units.

## Functions
- New internal `hk_unit_target(unit)`: ceil(window_size * effective percent / 100). 80% of 5 = 4 (unchanged).
- New internal `hk_help_payload(attempt)`: builds help for the attempt's current step.
- New RPC `hk_get_help(token, attempt)`: child asks for help; moves one step up the ladder.
- `hk_answer`: wrong answers move one help step up and return help; mastery window skips guided attempts.
- `hk_next_question`, `hk_grade_map`: use computed target; grade map also returns `content_status`.

## Security
- Tables stay fully locked (no direct access). Internal helpers are not callable by anon/authenticated.
- `hk_get_help` checks the attempt belongs to the learner token, like `hk_answer`. Answers are never sent;
  guided choices only appear after help steps that already remove mastery credit for that question.
*/

ALTER TABLE hk_grades ADD COLUMN IF NOT EXISTS mastery_percent int NOT NULL DEFAULT 80;
ALTER TABLE hk_units ADD COLUMN IF NOT EXISTS mastery_percent int;
ALTER TABLE hk_units ADD COLUMN IF NOT EXISTS teach text NOT NULL DEFAULT '';
ALTER TABLE hk_units ADD COLUMN IF NOT EXISTS content_status text NOT NULL DEFAULT 'sample';
ALTER TABLE hk_attempts ADD COLUMN IF NOT EXISTS help_level int NOT NULL DEFAULT 0;
ALTER TABLE hk_attempts ADD COLUMN IF NOT EXISTS guided boolean NOT NULL DEFAULT false;
ALTER TABLE hk_attempts ADD COLUMN IF NOT EXISTS tried jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hk_grades_mastery_percent_range') THEN
    ALTER TABLE hk_grades ADD CONSTRAINT hk_grades_mastery_percent_range CHECK (mastery_percent BETWEEN 50 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hk_units_mastery_percent_range') THEN
    ALTER TABLE hk_units ADD CONSTRAINT hk_units_mastery_percent_range CHECK (mastery_percent IS NULL OR mastery_percent BETWEEN 50 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hk_units_content_status_check') THEN
    ALTER TABLE hk_units ADD CONSTRAINT hk_units_content_status_check CHECK (content_status IN ('sample', 'reviewed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hk_attempts_help_level_range') THEN
    ALTER TABLE hk_attempts ADD CONSTRAINT hk_attempts_help_level_range CHECK (help_level BETWEEN 0 AND 3);
  END IF;
END $$;

UPDATE hk_units SET prerequisite_unit_id = 'g1-before'
WHERE id = 'g6-multiply' AND prerequisite_unit_id IS NULL AND EXISTS (SELECT 1 FROM hk_units WHERE id = 'g1-before');

UPDATE hk_units u SET teach = t.teach FROM (VALUES
('k-count-5', 'Let''s count together. Each time you touch one picture, say the next number. The last number you say tells you how many.'),
('k-find-number', 'Every number has its own shape. Count the pictures first, then look for the number that matches the last number you said.'),
('k-shapes', 'Look at the sides and corners. A triangle has 3 sides. A square has 4 sides that are all the same. A circle is round, with no corners at all.'),
('k-most', 'The group with the most has more things in it. Count each group, or imagine lining them up. The longer line has more.'),
('k-count-10', 'Big numbers are easier in small steps. Count the first five, then keep going: six, seven, eight, nine, ten.'),
('k-patterns', 'A pattern is a part that repeats, like a song you sing again and again. Find the part that repeats, then say it again to see what comes next.'),
('g1-count', 'Touch each picture once and say one number for each touch. Never skip one and never count one twice. The last number you say is how many.'),
('g1-words', 'Every number has a word. 1 is one, 2 is two, 3 is three. Count first, then find the word that sounds like your number.'),
('g1-one-more', 'One more means the very next number. Count the group, then say one more number. That number is your answer.'),
('g1-match', 'Say the number out loud. Then count each group, touching each picture once, until you find the group that stops right on your number.'),
('g1-after', 'Imagine a number line. Comes after means take one step forward. Say the number, then say the next one.'),
('g1-before', 'Imagine a number line. Comes before means take one step back. Count up to the number. The one you said just before it is the answer.'),
('g6-multiply', 'Picture a place-value chart: thousands, hundreds, tens, ones, tenths. Multiplying by 10 slides every digit one column to the left. By 100, two columns. By 1000, three columns. The decimal point stays still.'),
('g6-divide', 'Use the place-value chart again. Dividing by 10 slides every digit one column to the right, so the number gets ten times smaller. By 100, two columns. By 1000, three columns.'),
('g6-mixed', 'First decide: will the number get bigger or smaller? Multiplying makes it bigger, so digits slide left. Dividing makes it smaller, so digits slide right. Then count the zeros to know how many places.'),
('g6-missing', 'Compare the two numbers. Count how many places the digits slid. Each place is one zero: 1 place is 10, 2 places is 100, 3 places is 1000.'),
('g6-powers', 'The small raised number tells you how many tens are multiplied together. 10 cubed is 10 × 10 × 10, which is 1 followed by 3 zeros: 1000.')
) AS t(id, teach) WHERE u.id = t.id AND u.teach = '';

CREATE OR REPLACE FUNCTION hk_unit_target(p_unit text)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(1, CEIL(u.window_size * COALESCE(u.mastery_percent, g.mastery_percent, 80) / 100.0)::int)
  FROM hk_units u JOIN hk_grades g ON g.id = u.grade_id WHERE u.id = p_unit;
$$;
REVOKE EXECUTE ON FUNCTION hk_unit_target(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION hk_help_payload(p_attempt uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_a hk_attempts%ROWTYPE;
  v_q hk_questions%ROWTYPE;
  v_u hk_units%ROWTYPE;
  v_left jsonb;
  v_wrong jsonb;
BEGIN
  SELECT * INTO v_a FROM hk_attempts WHERE id = p_attempt;
  IF NOT FOUND OR v_a.help_level = 0 THEN RETURN NULL; END IF;
  SELECT * INTO v_q FROM hk_questions WHERE id = v_a.question_id;
  SELECT * INTO v_u FROM hk_units WHERE id = v_a.unit_id;

  IF v_a.help_level = 1 THEN
    RETURN jsonb_build_object('level', 1, 'text', v_q.hint);
  ELSIF v_a.help_level = 2 THEN
    RETURN jsonb_build_object('level', 2, 'text', COALESCE(NULLIF(v_u.teach, ''), v_q.hint),
      'demo', COALESCE(v_q.visual->>'type', '') IN ('count', 'pattern', 'sequence'));
  END IF;

  SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) INTO v_left FROM jsonb_array_elements(v_q.choices) c
  WHERE c #>> '{}' <> v_q.answer AND NOT (v_a.tried @> jsonb_build_array(c));
  SELECT c INTO v_wrong FROM jsonb_array_elements(v_left) c ORDER BY random() LIMIT 1;
  RETURN jsonb_build_object('level', 3, 'text', 'Let''s do this one together. The answer is one of these.',
    'choices', (SELECT jsonb_agg(x ORDER BY random()) FROM (
      SELECT to_jsonb(v_q.answer) x UNION ALL SELECT v_wrong WHERE v_wrong IS NOT NULL) s));
END $$;
REVOKE EXECUTE ON FUNCTION hk_help_payload(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION hk_get_help(p_token uuid, p_attempt uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_a hk_attempts%ROWTYPE;
BEGIN
  SELECT l.id INTO v_id FROM hk_learners l WHERE l.token = p_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_a FROM hk_attempts WHERE id = p_attempt AND learner_id = v_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'attempt_not_found' USING ERRCODE = 'P0002'; END IF;
  UPDATE hk_attempts SET help_level = LEAST(3, help_level + 1),
    guided = guided OR first_correct IS NULL
  WHERE id = p_attempt;
  RETURN jsonb_build_object('help', hk_help_payload(p_attempt));
END $$;
REVOKE EXECUTE ON FUNCTION hk_get_help(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hk_get_help(uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION hk_answer(p_token uuid, p_attempt uuid, p_choice text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_a hk_attempts%ROWTYPE;
  v_q hk_questions%ROWTYPE;
  v_unit hk_units%ROWTYPE;
  v_target int;
  v_correct boolean;
  v_first boolean;
  v_window int;
  v_best int;
  v_mastered_at timestamptz;
  v_newly boolean;
  v_next jsonb;
  v_help jsonb;
BEGIN
  SELECT l.id INTO v_id FROM hk_learners l WHERE l.token = p_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_a FROM hk_attempts WHERE id = p_attempt AND learner_id = v_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'attempt_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_q FROM hk_questions WHERE id = v_a.question_id;
  SELECT * INTO v_unit FROM hk_units WHERE id = v_a.unit_id;
  v_target := hk_unit_target(v_a.unit_id);

  v_correct := (p_choice = v_q.answer);
  v_first := v_a.first_correct IS NULL;

  IF v_first THEN
    UPDATE hk_attempts SET first_correct = v_correct, answered_at = now() WHERE id = p_attempt;
    IF NOT v_a.guided THEN
      SELECT count(*) FILTER (WHERE w.first_correct) INTO v_window FROM (
        SELECT a.first_correct FROM hk_attempts a
        WHERE a.learner_id = v_id AND a.unit_id = v_a.unit_id AND a.first_correct IS NOT NULL AND NOT a.guided
        ORDER BY a.answered_at DESC LIMIT v_unit.window_size
      ) w;
    END IF;
    INSERT INTO hk_unit_progress AS up (learner_id, unit_id, best, answered, correct)
    VALUES (v_id, v_a.unit_id, COALESCE(v_window, 0), 1, CASE WHEN v_correct THEN 1 ELSE 0 END)
    ON CONFLICT (learner_id, unit_id) DO UPDATE SET
      best = GREATEST(up.best, EXCLUDED.best),
      answered = up.answered + 1,
      correct = up.correct + EXCLUDED.correct,
      updated_at = now();
    UPDATE hk_unit_progress SET mastered_at = now()
    WHERE learner_id = v_id AND unit_id = v_a.unit_id AND mastered_at IS NULL AND best >= v_target
    RETURNING true INTO v_newly;
  END IF;

  IF NOT v_correct THEN
    UPDATE hk_attempts SET help_level = LEAST(3, help_level + 1),
      tried = CASE WHEN v_q.choices @> jsonb_build_array(p_choice) AND NOT tried @> jsonb_build_array(p_choice)
                   THEN tried || jsonb_build_array(p_choice) ELSE tried END
    WHERE id = p_attempt;
    v_help := hk_help_payload(p_attempt);
  END IF;

  SELECT p.best, p.mastered_at INTO v_best, v_mastered_at FROM hk_unit_progress p WHERE p.learner_id = v_id AND p.unit_id = v_a.unit_id;

  IF COALESCE(v_newly, false) THEN
    SELECT jsonb_build_object('id', u.id, 'title', u.title, 'emoji', u.emoji) INTO v_next
    FROM hk_units u WHERE u.prerequisite_unit_id = v_a.unit_id ORDER BY u.sort_order LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'correct', v_correct, 'counted', v_first AND NOT v_a.guided,
    'hint', CASE WHEN v_correct THEN NULL ELSE v_q.hint END,
    'help', v_help,
    'explain', CASE WHEN v_correct THEN v_q.explain ELSE NULL END,
    'best', COALESCE(v_best, 0), 'target', v_target,
    'mastered', v_mastered_at IS NOT NULL, 'newly_mastered', COALESCE(v_newly, false),
    'next_unit', v_next
  );
END $$;

CREATE OR REPLACE FUNCTION hk_next_question(p_token uuid, p_unit text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_unit hk_units%ROWTYPE;
  v_status text;
  v_q hk_questions%ROWTYPE;
  v_attempt uuid;
  v_best int;
BEGIN
  SELECT l.id INTO v_id FROM hk_learners l WHERE l.token = p_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_unit FROM hk_units WHERE id = p_unit;
  IF NOT FOUND THEN RAISE EXCEPTION 'unit_not_found' USING ERRCODE = 'P0002'; END IF;
  v_status := hk_unit_status(v_id, p_unit);
  IF v_status = 'locked' THEN RAISE EXCEPTION 'unit_locked' USING ERRCODE = '42501'; END IF;

  SELECT q.* INTO v_q FROM hk_questions q
  WHERE q.unit_id = p_unit
    AND q.id NOT IN (
      SELECT a.question_id FROM hk_attempts a
      WHERE a.learner_id = v_id AND a.unit_id = p_unit
      ORDER BY a.created_at DESC LIMIT 4
    )
  ORDER BY random() LIMIT 1;
  IF NOT FOUND THEN
    SELECT q.* INTO v_q FROM hk_questions q WHERE q.unit_id = p_unit ORDER BY random() LIMIT 1;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_questions' USING ERRCODE = 'P0002'; END IF;

  INSERT INTO hk_attempts (learner_id, unit_id, question_id) VALUES (v_id, p_unit, v_q.id) RETURNING id INTO v_attempt;
  SELECT p.best INTO v_best FROM hk_unit_progress p WHERE p.learner_id = v_id AND p.unit_id = p_unit;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt, 'unit_id', p_unit, 'unit_title', v_unit.title,
    'prompt', v_q.prompt, 'say', v_q.say, 'visual', v_q.visual,
    'choices', (SELECT jsonb_agg(c ORDER BY random()) FROM jsonb_array_elements(v_q.choices) c),
    'best', COALESCE(v_best, 0), 'target', hk_unit_target(p_unit), 'status', v_status,
    'content_status', v_unit.content_status
  );
END $$;

CREATE OR REPLACE FUNCTION hk_grade_map(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_start text;
BEGIN
  SELECT l.id, l.start_grade INTO v_id, v_start FROM hk_learners l WHERE l.token = p_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  RETURN jsonb_build_object(
    'start_grade', v_start,
    'grades', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id, 'title', g.title, 'short', g.short, 'available', g.available,
        'mastery_percent', g.mastery_percent,
        'units', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', u.id, 'title', u.title, 'skill', u.skill, 'emoji', u.emoji,
            'status', hk_unit_status(v_id, u.id),
            'best', COALESCE(p.best, 0), 'target', hk_unit_target(u.id),
            'content_status', u.content_status
          ) ORDER BY u.sort_order)
          FROM hk_units u
          LEFT JOIN hk_unit_progress p ON p.unit_id = u.id AND p.learner_id = v_id
          WHERE u.grade_id = g.id
        ), '[]'::jsonb)
      ) ORDER BY g.sort_order)
      FROM hk_grades g
    ), '[]'::jsonb)
  );
END $$;
