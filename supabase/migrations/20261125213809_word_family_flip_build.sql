/*
# Word Family Flip & Build
## 1. Content
Adds reading_content JSON to existing units and reading_mode to attempts. Seeds four sample phonics families with real words, onset sound cues, pictures and objectives. Existing question bank stores build and picture-match questions.
## 2. Progress
Uses existing learner tokens, attempts, help levels and server-side 80% mastery. Reading sessions resume unanswered attempts. Catalog reports assisted and independent practice and exploration. Higher families require prerequisite mastery.
## 3. Security
No new tables. Existing locked tables remain private. Token-checked RPCs expose only the learner's progress. Internal status helper remains private. No existing data is removed.
*/
ALTER TABLE hk_units ADD COLUMN IF NOT EXISTS reading_content jsonb;
ALTER TABLE hk_attempts ADD COLUMN IF NOT EXISTS reading_mode text;
INSERT INTO hk_units(id,grade_id,sort_order,title,skill,emoji,prerequisite_unit_id,teach,reading_content)
SELECT 'reading-'||f.rime,'K',100+f.n,'Word family -'||f.rime,f.concept,'📖',f.prev,
'Listen to the beginning sound, then the ending. Slide them together slowly. Read the whole word.',
jsonb_build_object('rime',f.rime,'grade','K–1','level',f.level,'concept',f.concept,'ending_cue',f.cue,'objective','Blend beginning sounds with a shared ending to read real words.','words',f.words::jsonb)
FROM (VALUES
(1,'at',null::text,'Beginning reader','Short a • CVC','at, as in cat','[{"onset":"c","sound":"A short kuh sound, as at the start of cat. Not the letter name see.","word":"cat","picture":"🐈"},{"onset":"b","sound":"A short buh sound, as at the start of bat.","word":"bat","picture":"🦇"},{"onset":"h","sound":"Breathe out gently: hhh, as at the start of hat.","word":"hat","picture":"🎩"},{"onset":"m","sound":"Close your lips and hum: mmm.","word":"mat","picture":"▧","meaning":"A small floor mat"}]'),
(2,'an',null::text,'Beginning reader','Short a • CVC','an, as in fan','[{"onset":"f","sound":"Blow air gently over your lower lip: fff.","word":"fan","picture":"🪭"},{"onset":"m","sound":"Close your lips and hum: mmm.","word":"man","picture":"👨"},{"onset":"p","sound":"A short puh sound, as at the start of pan.","word":"pan","picture":"🍳"},{"onset":"v","sound":"Touch your lower lip with your teeth and buzz: vvv.","word":"van","picture":"🚐"}]'),
(3,'ug','reading-at','Growing reader','Short u • CVC','ug, as in bug','[{"onset":"b","sound":"A short buh sound, as at the start of bug.","word":"bug","picture":"🐞"},{"onset":"h","sound":"Breathe out gently: hhh.","word":"hug","picture":"🫂"},{"onset":"m","sound":"Close your lips and hum: mmm.","word":"mug","picture":"☕"},{"onset":"r","sound":"The rrr sound, as at the start of rug.","word":"rug","picture":"▧","meaning":"A floor rug"}]'),
(4,'ag','reading-ug','Blend explorer','Short a • consonant blends','ag, as in bag. In flag, keep both f and l sounds.','[{"onset":"b","sound":"A short buh sound, as at the start of bag.","word":"bag","picture":"👜"},{"onset":"t","sound":"A short tuh sound, as at the start of tag.","word":"tag","picture":"🏷️"},{"onset":"fl","sound":"Blend fff and lll together. Keep both sounds, without adding a vowel between them.","word":"flag","picture":"🚩"}]')
) f(n,rime,prev,level,concept,cue,words) ON CONFLICT(id) DO NOTHING;
INSERT INTO hk_questions(unit_id,prompt,say,visual,choices,answer,hint,explain)
SELECT u.id,CASE WHEN mode='build' THEN 'Build the word for this picture.' ELSE 'Read the word and choose its picture.' END,
CASE WHEN mode='build' THEN 'Build '||(w->>'word') ELSE 'Read the word yourself. Choose its picture.' END,
jsonb_build_object('type','reading','mode',mode,'word',w->>'word','picture',w->>'picture','meaning',w->>'meaning','onset',w->>'onset','rime',u.reading_content->>'rime','sound',w->>'sound'),
CASE WHEN mode='build' THEN (SELECT jsonb_agg(x->>'onset') FROM jsonb_array_elements(u.reading_content->'words') x) ELSE (SELECT jsonb_agg(x->>'word') FROM jsonb_array_elements(u.reading_content->'words') x) END,
CASE WHEN mode='build' THEN w->>'onset' ELSE w->>'word' END,
'Listen for the beginning sound. Then join it to the ending.',(w->>'onset')||' + '||(u.reading_content->>'rime')||' makes '||(w->>'word')||'.'
FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w CROSS JOIN (VALUES ('build'),('match')) m(mode)
WHERE u.reading_content IS NOT NULL AND NOT EXISTS(SELECT 1 FROM hk_questions q WHERE q.unit_id=u.id AND q.visual->>'word'=w->>'word' AND q.visual->>'mode'=mode);
CREATE OR REPLACE FUNCTION hk_unit_status(p_learner uuid,p_unit text) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE u hk_units%ROWTYPE; go int; avail boolean; so int;
BEGIN
SELECT * INTO u FROM hk_units WHERE id=p_unit; IF NOT FOUND THEN RETURN 'locked'; END IF;
SELECT sort_order,available INTO go,avail FROM hk_grades WHERE id=u.grade_id;
IF NOT avail THEN RETURN 'locked'; END IF;
IF EXISTS(SELECT 1 FROM hk_unit_progress WHERE learner_id=p_learner AND unit_id=p_unit AND mastered_at IS NOT NULL) THEN RETURN 'mastered'; END IF;
IF u.reading_content IS NOT NULL THEN
IF u.prerequisite_unit_id IS NULL OR EXISTS(SELECT 1 FROM hk_unit_progress WHERE learner_id=p_learner AND unit_id=u.prerequisite_unit_id AND mastered_at IS NOT NULL) THEN RETURN 'unlocked'; END IF;
RETURN 'locked'; END IF;
SELECT g.sort_order INTO so FROM hk_learners l JOIN hk_grades g ON g.id=l.start_grade WHERE l.id=p_learner;
IF go<=so OR EXISTS(SELECT 1 FROM hk_unit_progress WHERE learner_id=p_learner AND unit_id=u.prerequisite_unit_id AND mastered_at IS NOT NULL) THEN RETURN 'unlocked'; END IF;
RETURN 'locked'; END $$;
REVOKE EXECUTE ON FUNCTION hk_unit_status(uuid,text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION hk_reading_catalog(p_token uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; BEGIN
SELECT id INTO lid FROM hk_learners WHERE token=p_token; IF lid IS NULL THEN RAISE EXCEPTION 'learner_not_found'; END IF;
RETURN (SELECT jsonb_agg(jsonb_build_object('id',u.id,'content',u.reading_content,'status',hk_unit_status(lid,u.id),'best',coalesce(p.best,0),'target',hk_unit_target(u.id),'assisted',(SELECT count(*) FROM hk_attempts WHERE learner_id=lid AND unit_id=u.id AND (guided OR help_level>0)),'independent',(SELECT count(*) FROM hk_attempts WHERE learner_id=lid AND unit_id=u.id AND first_correct=true AND NOT guided AND help_level=0),'explored',(SELECT count(*) FROM hk_attempts WHERE learner_id=lid AND unit_id=u.id AND reading_mode='explore'),'built',(SELECT count(*) FROM hk_attempts WHERE learner_id=lid AND unit_id=u.id AND first_correct=true AND reading_mode IN ('build','challenge')),'read',(SELECT count(*) FROM hk_attempts WHERE learner_id=lid AND unit_id=u.id AND first_correct=true AND reading_mode='match' AND NOT guided),'last_practised',p.updated_at) ORDER BY u.sort_order) FROM hk_units u LEFT JOIN hk_unit_progress p ON p.unit_id=u.id AND p.learner_id=lid WHERE u.reading_content IS NOT NULL);
END $$;
REVOKE EXECUTE ON FUNCTION hk_reading_catalog(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hk_reading_catalog(uuid) TO anon,authenticated;
CREATE OR REPLACE FUNCTION hk_reading_round(p_token uuid,p_unit text,p_mode text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; a hk_attempts%ROWTYPE; q hk_questions%ROWTYPE; qm text; BEGIN
SELECT id INTO lid FROM hk_learners WHERE token=p_token; IF lid IS NULL THEN RAISE EXCEPTION 'learner_not_found'; END IF;
IF p_mode NOT IN ('build','match','challenge','explore') OR NOT EXISTS(SELECT 1 FROM hk_units WHERE id=p_unit AND reading_content IS NOT NULL) THEN RAISE EXCEPTION 'invalid_mode'; END IF;
IF hk_unit_status(lid,p_unit)='locked' THEN RAISE EXCEPTION 'unit_locked'; END IF;
qm:=CASE WHEN p_mode='match' THEN 'match' ELSE 'build' END;
SELECT * INTO a FROM hk_attempts WHERE learner_id=lid AND unit_id=p_unit AND reading_mode=p_mode AND first_correct IS NULL ORDER BY created_at DESC LIMIT 1;
IF NOT FOUND THEN
SELECT * INTO q FROM hk_questions WHERE unit_id=p_unit AND visual->>'mode'=qm ORDER BY CASE WHEN p_mode='challenge' AND id IN(SELECT question_id FROM hk_attempts WHERE learner_id=lid AND unit_id=p_unit AND reading_mode='challenge' AND first_correct=true) THEN 1 ELSE 0 END,random() LIMIT 1;
INSERT INTO hk_attempts(learner_id,unit_id,question_id,reading_mode,guided) VALUES(lid,p_unit,q.id,p_mode,p_mode='explore') RETURNING * INTO a;
ELSE SELECT * INTO q FROM hk_questions WHERE id=a.question_id; END IF;
RETURN jsonb_build_object('attempt_id',a.id,'visual',q.visual,'choices',q.choices,'say',q.say,'help',hk_help_payload(a.id)); END $$;
REVOKE EXECUTE ON FUNCTION hk_reading_round(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hk_reading_round(uuid,text,text) TO anon,authenticated;