/*
# Mastery-based learning path (server-enforced)

1. New Tables
- `hk_grades` - grade levels (K..G8); `available` marks grades with content built.
- `hk_units` - ordered skill units per grade; `prerequisite_unit_id` must be mastered to unlock;
  `mastery_target` correct first tries needed within the last `window_size` answers.
- `hk_questions` - the question bank. `answer` and `hint` are never sent to the browser in advance.
- `hk_learners` - an anonymous learner identified only by a random secret `token`.
  No name, birthday or other personal details are stored on the server (the child's name stays on the device).
- `hk_attempts` - each question shown to a learner; only the FIRST answer counts toward mastery.
- `hk_unit_progress` - per learner/unit best score and mastery timestamp.

2. Security
- RLS enabled on every table with NO policies and all direct privileges revoked from anon/authenticated:
  the browser cannot read answers, edit progress or unlock units directly.
- All access goes through SECURITY DEFINER functions that validate the learner token and enforce locks:
  `hk_create_learner`, `hk_set_start_grade`, `hk_grade_map`, `hk_next_question`, `hk_answer`.
  These are intentionally callable by anon (children never sign in); the secret token is the credential.
- Helper `hk_unit_status` is not callable from the browser.

3. Unlock rules (decided on the server)
1. A mastered unit stays open.
2. Grades below the learner's starting grade are open for review.
3. The first unit of the starting grade is open.
4. Any other unit opens only when its prerequisite unit is mastered.
5. Grades without content (`available = false`) are always locked.
*/

CREATE TABLE IF NOT EXISTS hk_grades (
  id text PRIMARY KEY,
  title text NOT NULL,
  short text NOT NULL,
  sort_order int NOT NULL,
  available boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS hk_units (
  id text PRIMARY KEY,
  grade_id text NOT NULL REFERENCES hk_grades(id),
  sort_order int NOT NULL,
  title text NOT NULL,
  skill text NOT NULL,
  emoji text NOT NULL DEFAULT '⭐',
  prerequisite_unit_id text REFERENCES hk_units(id),
  mastery_target int NOT NULL DEFAULT 4,
  window_size int NOT NULL DEFAULT 5
);
CREATE INDEX IF NOT EXISTS hk_units_grade_idx ON hk_units(grade_id, sort_order);

CREATE TABLE IF NOT EXISTS hk_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id text NOT NULL REFERENCES hk_units(id),
  prompt text NOT NULL,
  say text NOT NULL,
  visual jsonb,
  choices jsonb NOT NULL,
  answer text NOT NULL,
  hint text NOT NULL,
  explain text NOT NULL,
  UNIQUE (unit_id, prompt)
);
CREATE INDEX IF NOT EXISTS hk_questions_unit_idx ON hk_questions(unit_id);

CREATE TABLE IF NOT EXISTS hk_learners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  start_grade text NOT NULL REFERENCES hk_grades(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hk_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES hk_learners(id) ON DELETE CASCADE,
  unit_id text NOT NULL REFERENCES hk_units(id),
  question_id uuid NOT NULL REFERENCES hk_questions(id),
  first_correct boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz
);
CREATE INDEX IF NOT EXISTS hk_attempts_learner_unit_idx ON hk_attempts(learner_id, unit_id, answered_at DESC);

CREATE TABLE IF NOT EXISTS hk_unit_progress (
  learner_id uuid NOT NULL REFERENCES hk_learners(id) ON DELETE CASCADE,
  unit_id text NOT NULL REFERENCES hk_units(id),
  best int NOT NULL DEFAULT 0,
  answered int NOT NULL DEFAULT 0,
  correct int NOT NULL DEFAULT 0,
  mastered_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id, unit_id)
);

ALTER TABLE hk_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_unit_progress ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON hk_grades, hk_units, hk_questions, hk_learners, hk_attempts, hk_unit_progress FROM anon, authenticated;

CREATE OR REPLACE FUNCTION hk_unit_status(p_learner uuid, p_unit text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_unit hk_units%ROWTYPE;
  v_grade_order int;
  v_available boolean;
  v_start text;
  v_start_order int;
  v_first int;
BEGIN
  SELECT * INTO v_unit FROM hk_units WHERE id = p_unit;
  IF NOT FOUND THEN RETURN 'locked'; END IF;
  SELECT g.sort_order, g.available INTO v_grade_order, v_available FROM hk_grades g WHERE g.id = v_unit.grade_id;
  IF NOT v_available THEN RETURN 'locked'; END IF;
  IF EXISTS (SELECT 1 FROM hk_unit_progress p WHERE p.learner_id = p_learner AND p.unit_id = p_unit AND p.mastered_at IS NOT NULL) THEN
    RETURN 'mastered';
  END IF;
  SELECT l.start_grade INTO v_start FROM hk_learners l WHERE l.id = p_learner;
  SELECT g.sort_order INTO v_start_order FROM hk_grades g WHERE g.id = v_start;
  IF v_grade_order < v_start_order THEN RETURN 'unlocked'; END IF;
  IF v_unit.prerequisite_unit_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM hk_unit_progress p WHERE p.learner_id = p_learner AND p.unit_id = v_unit.prerequisite_unit_id AND p.mastered_at IS NOT NULL
  ) THEN
    RETURN 'unlocked';
  END IF;
  SELECT min(u.sort_order) INTO v_first FROM hk_units u WHERE u.grade_id = v_unit.grade_id;
  IF v_unit.grade_id = v_start AND v_unit.sort_order = v_first THEN RETURN 'unlocked'; END IF;
  RETURN 'locked';
END $$;

CREATE OR REPLACE FUNCTION hk_create_learner(p_start_grade text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_token uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hk_grades WHERE id = p_start_grade AND available) THEN
    RAISE EXCEPTION 'invalid_grade' USING ERRCODE = '22023';
  END IF;
  INSERT INTO hk_learners (start_grade) VALUES (p_start_grade) RETURNING token INTO v_token;
  RETURN jsonb_build_object('token', v_token, 'start_grade', p_start_grade);
END $$;

CREATE OR REPLACE FUNCTION hk_set_start_grade(p_token uuid, p_grade text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hk_grades WHERE id = p_grade AND available) THEN
    RAISE EXCEPTION 'invalid_grade' USING ERRCODE = '22023';
  END IF;
  UPDATE hk_learners SET start_grade = p_grade WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  RETURN jsonb_build_object('start_grade', p_grade);
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
        'units', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', u.id, 'title', u.title, 'skill', u.skill, 'emoji', u.emoji,
            'status', hk_unit_status(v_id, u.id),
            'best', COALESCE(p.best, 0), 'target', u.mastery_target
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
    'best', COALESCE(v_best, 0), 'target', v_unit.mastery_target, 'status', v_status
  );
END $$;

CREATE OR REPLACE FUNCTION hk_answer(p_token uuid, p_attempt uuid, p_choice text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_a hk_attempts%ROWTYPE;
  v_q hk_questions%ROWTYPE;
  v_unit hk_units%ROWTYPE;
  v_correct boolean;
  v_first boolean;
  v_window int;
  v_best int;
  v_mastered_at timestamptz;
  v_newly boolean;
  v_next jsonb;
BEGIN
  SELECT l.id INTO v_id FROM hk_learners l WHERE l.token = p_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'learner_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_a FROM hk_attempts WHERE id = p_attempt AND learner_id = v_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'attempt_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_q FROM hk_questions WHERE id = v_a.question_id;
  SELECT * INTO v_unit FROM hk_units WHERE id = v_a.unit_id;

  v_correct := (p_choice = v_q.answer);
  v_first := v_a.first_correct IS NULL;

  IF v_first THEN
    UPDATE hk_attempts SET first_correct = v_correct, answered_at = now() WHERE id = p_attempt;
    SELECT count(*) FILTER (WHERE w.first_correct) INTO v_window FROM (
      SELECT a.first_correct FROM hk_attempts a
      WHERE a.learner_id = v_id AND a.unit_id = v_a.unit_id AND a.first_correct IS NOT NULL
      ORDER BY a.answered_at DESC LIMIT v_unit.window_size
    ) w;
    INSERT INTO hk_unit_progress AS up (learner_id, unit_id, best, answered, correct)
    VALUES (v_id, v_a.unit_id, v_window, 1, CASE WHEN v_correct THEN 1 ELSE 0 END)
    ON CONFLICT (learner_id, unit_id) DO UPDATE SET
      best = GREATEST(up.best, EXCLUDED.best),
      answered = up.answered + 1,
      correct = up.correct + EXCLUDED.correct,
      updated_at = now();
    UPDATE hk_unit_progress SET mastered_at = now()
    WHERE learner_id = v_id AND unit_id = v_a.unit_id AND mastered_at IS NULL AND best >= v_unit.mastery_target
    RETURNING true INTO v_newly;
  END IF;

  SELECT p.best, p.mastered_at INTO v_best, v_mastered_at FROM hk_unit_progress p WHERE p.learner_id = v_id AND p.unit_id = v_a.unit_id;

  IF COALESCE(v_newly, false) THEN
    SELECT jsonb_build_object('id', u.id, 'title', u.title, 'emoji', u.emoji) INTO v_next
    FROM hk_units u WHERE u.prerequisite_unit_id = v_a.unit_id ORDER BY u.sort_order LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'correct', v_correct, 'counted', v_first,
    'hint', CASE WHEN v_correct THEN NULL ELSE v_q.hint END,
    'explain', CASE WHEN v_correct THEN v_q.explain ELSE NULL END,
    'best', COALESCE(v_best, 0), 'target', v_unit.mastery_target,
    'mastered', v_mastered_at IS NOT NULL, 'newly_mastered', COALESCE(v_newly, false),
    'next_unit', v_next
  );
END $$;

REVOKE ALL ON FUNCTION hk_unit_status(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION hk_create_learner(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION hk_set_start_grade(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION hk_grade_map(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION hk_next_question(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION hk_answer(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hk_create_learner(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hk_set_start_grade(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hk_grade_map(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hk_next_question(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hk_answer(uuid, uuid, text) TO anon, authenticated;
