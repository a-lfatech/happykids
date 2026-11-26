/*
# Open reading adventures and everyday short words
## 1. Content
All reading units have their prerequisite cleared, leaving mathematics progression unchanged. Adds seven short-word groups and one high-frequency word group to hk_units and build/match questions to hk_questions. Adds whole_word flags for words that should be learned in context rather than forced into misleading sound rules.
## 2. Progress
Existing learner attempts and mastery remain intact. Reading round selection favours least-seen questions across modes, while resuming unanswered attempts.
## 3. Security
No new tables or grants. Existing token checks and private RLS tables remain unchanged. The reading round function keeps a fixed search path and explicit public RPC grants.
*/
UPDATE hk_units SET prerequisite_unit_id=NULL WHERE reading_content IS NOT NULL;
INSERT INTO hk_units(id,grade_id,sort_order,title,skill,teach,reading_content)
SELECT 'reading-short-'||rime,'K',sort,'Little words: '||rime,'Everyday short words','Read the whole word, then use it in a little sentence.',jsonb_build_object('rime',rime,'ending_cue',rime,'level','Little words','whole_word',true,'words',(SELECT jsonb_agg(jsonb_build_object('word',word,'onset',left(word,1),'sound',word,'picture','📖','meaning',sentence)) FROM jsonb_each_text(samples) a(word,sentence)))
FROM (VALUES
('m',100,'{"am":"I am happy."}'::jsonb),
('t',101,'{"at":"The cat is at the door.","it":"It is a ball."}'::jsonb),
('s',102,'{"as":"Hop as I hop.","is":"The sun is hot.","us":"Play with us."}'::jsonb),
('p',103,'{"up":"The balloon goes up."}'::jsonb),
('o',104,'{"do":"I do a dance.","go":"Go to the park.","no":"No, thank you.","so":"I am so happy.","to":"Walk to the tree."}'::jsonb),
('e',105,'{"be":"Be kind.","he":"He has a ball.","me":"Play with me.","we":"We read together."}'::jsonb),
('y',106,'{"by":"Sit by me.","my":"This is my book."}'::jsonb),
('story words',120,'{"the":"The cat is on the mat.","and":"A cat and a dog.","you":"You can read.","a":"A red ball.","I":"I can hop.","was":"It was sunny.","are":"We are happy.","have":"I have a book.","said":"She said hello.","they":"They play together.","with":"Read with me.","for":"This is for you."}'::jsonb)
) f(rime,sort,samples) ON CONFLICT(id) DO NOTHING;
UPDATE hk_units SET sort_order=sort_order+20 WHERE reading_content IS NOT NULL AND id NOT LIKE 'reading-short-%' AND id<>'reading-n' AND sort_order<120;
UPDATE hk_units SET reading_content=reading_content || '{"whole_word":true,"ending_cue":"in"}'::jsonb WHERE id='reading-n';
INSERT INTO hk_questions(unit_id,prompt,say,visual,choices,answer,hint,explain)
SELECT u.id,'Find the word in this little sentence.','Find '||(w->>'word')||'. '||(w->>'meaning'),jsonb_build_object('type','reading','mode',mode,'word',w->>'word','picture',w->>'picture','meaning',w->>'meaning','onset',w->>'onset','rime',u.reading_content->>'rime','sound',w->>'word','whole_word',true),
(SELECT jsonb_agg(x->>'word') FROM jsonb_array_elements(u.reading_content->'words') x),w->>'word','Listen to the whole word and look at the sentence.',w->>'meaning'
FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w CROSS JOIN (VALUES ('build'),('match')) m(mode)
WHERE u.id LIKE 'reading-short-%' AND NOT EXISTS(SELECT 1 FROM hk_questions q WHERE q.unit_id=u.id AND q.visual->>'word'=w->>'word' AND q.visual->>'mode'=mode);
CREATE OR REPLACE FUNCTION hk_reading_round(p_token uuid,p_unit text,p_mode text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; a hk_attempts%ROWTYPE; q hk_questions%ROWTYPE; qm text;
BEGIN
SELECT id INTO lid FROM hk_learners WHERE token=p_token; IF lid IS NULL THEN RAISE EXCEPTION 'learner_not_found'; END IF;
IF p_mode NOT IN ('build','match','challenge','explore') OR NOT EXISTS(SELECT 1 FROM hk_units WHERE id=p_unit AND reading_content IS NOT NULL) THEN RAISE EXCEPTION 'invalid_mode'; END IF;
IF hk_unit_status(lid,p_unit)='locked' THEN RAISE EXCEPTION 'unit_locked'; END IF;
qm:=CASE WHEN p_mode='match' THEN 'match' ELSE 'build' END;
SELECT * INTO a FROM hk_attempts WHERE learner_id=lid AND unit_id=p_unit AND reading_mode=p_mode AND first_correct IS NULL ORDER BY created_at DESC LIMIT 1;
IF NOT FOUND THEN
SELECT * INTO q FROM hk_questions q0 WHERE unit_id=p_unit AND visual->>'mode'=qm ORDER BY (SELECT count(*) FROM hk_attempts a0 WHERE a0.learner_id=lid AND a0.question_id=q0.id AND a0.reading_mode=p_mode),random() LIMIT 1;
INSERT INTO hk_attempts(learner_id,unit_id,question_id,reading_mode,guided) VALUES(lid,p_unit,q.id,p_mode,p_mode='explore') RETURNING * INTO a;
ELSE SELECT * INTO q FROM hk_questions WHERE id=a.question_id; END IF;
RETURN jsonb_build_object('attempt_id',a.id,'visual',q.visual,'choices',q.choices,'say',q.say,'help',hk_help_payload(a.id));
END $$;
REVOKE EXECUTE ON FUNCTION hk_reading_round(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hk_reading_round(uuid,text,text) TO anon,authenticated;