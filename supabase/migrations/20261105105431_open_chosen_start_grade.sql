/*
# Open every unit in the learner's chosen starting grade

1. Changes
- `hk_unit_status(p_learner, p_unit)` now returns 'unlocked' for every unit in the
  learner's chosen start grade AND every grade below it (previously only the first
  unit of the start grade was open, and later ones chained by mastery).
- Grades above the start grade still chain by mastery (prerequisite rule unchanged).
- Mastered units still report 'mastered'; unavailable grades still report 'locked'.

2. Security
- No table, grant or policy changes. Function stays SECURITY DEFINER with a fixed search_path.
- Locks are still enforced server-side by hk_next_question for grades above the start grade.

3. Data
- No data is modified or removed.
*/
CREATE OR REPLACE FUNCTION public.hk_unit_status(p_learner uuid, p_unit text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
v_unit hk_units%ROWTYPE;
v_grade_order int;
v_available boolean;
v_start_order int;
BEGIN
SELECT * INTO v_unit FROM hk_units WHERE id = p_unit;
IF NOT FOUND THEN RETURN 'locked'; END IF;
SELECT g.sort_order, g.available INTO v_grade_order, v_available FROM hk_grades g WHERE g.id = v_unit.grade_id;
IF NOT v_available THEN RETURN 'locked'; END IF;
IF EXISTS (SELECT 1 FROM hk_unit_progress p WHERE p.learner_id = p_learner AND p.unit_id = p_unit AND p.mastered_at IS NOT NULL) THEN
RETURN 'mastered';
END IF;
SELECT g.sort_order INTO v_start_order FROM hk_learners l JOIN hk_grades g ON g.id = l.start_grade WHERE l.id = p_learner;
IF v_grade_order <= v_start_order THEN RETURN 'unlocked'; END IF;
IF v_unit.prerequisite_unit_id IS NOT NULL AND EXISTS (
SELECT 1 FROM hk_unit_progress p WHERE p.learner_id = p_learner AND p.unit_id = v_unit.prerequisite_unit_id AND p.mastered_at IS NOT NULL
) THEN
RETURN 'unlocked';
END IF;
RETURN 'locked';
END $function$;

REVOKE EXECUTE ON FUNCTION public.hk_unit_status(uuid, text) FROM PUBLIC, anon, authenticated;
