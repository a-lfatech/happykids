/*
# Two-letter starter words and concise sound cues
## 1. Content
Adds an unlocked starter family containing an, in, and on to existing hk_units and hk_questions. Places it before the three-letter families. Updates reading_content sound cues and corresponding question visuals to repeat simple sounds without letter-name explanations.
## 2. Data safety
No tables or columns are created or removed. Existing questions, learner attempts and mastery are preserved. Inserts are idempotent.
## 3. Security
Existing private-table permissions, RLS and token-checked reading RPCs remain unchanged. No new public access is granted.
*/
INSERT INTO hk_units(id,grade_id,sort_order,title,skill,emoji,teach,reading_content)
VALUES ('reading-n','K',100,'First words: an, in, on','Two-letter blending','📖','Join the vowel sound to nnn. Read the whole word.',
'{"rime":"n","grade":"K","level":"First words","concept":"Two-letter words","ending_cue":"nnn","objective":"Blend two sounds into an, in, and on.","words":[{"onset":"a","sound":"ah, ah","word":"an","picture":"🍎","meaning":"An apple"},{"onset":"i","sound":"ih, ih","word":"in","picture":"📥","meaning":"In the box"},{"onset":"o","sound":"aw, aw","word":"on","picture":"🔛","meaning":"On"}]}'::jsonb)
ON CONFLICT (id) DO NOTHING;
UPDATE hk_units u SET reading_content=jsonb_set(u.reading_content,'{words}',(
SELECT jsonb_agg(CASE WHEN sounds.cue IS NOT NULL THEN jsonb_set(w,'{sound}',to_jsonb(sounds.cue)) ELSE w END ORDER BY ord)
FROM jsonb_array_elements(u.reading_content->'words') WITH ORDINALITY words(w,ord)
LEFT JOIN (VALUES ('b','buh, buh'),('c','kuh, kuh'),('h','huh, huh'),('m','mmm, mmm'),('f','fff, fff'),('p','puh, puh'),('v','vvv, vvv'),('r','rrr, rrr'),('t','tuh, tuh'),('fl','fff, lll, fl')) sounds(onset,cue) ON sounds.onset=w->>'onset'
)) WHERE u.reading_content IS NOT NULL;
UPDATE hk_questions q SET visual=jsonb_set(q.visual,'{sound}',w->'sound')
FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w
WHERE q.unit_id=u.id AND q.visual->>'type'='reading' AND q.visual->>'word'=w->>'word';
INSERT INTO hk_questions(unit_id,prompt,say,visual,choices,answer,hint,explain)
SELECT u.id,CASE WHEN mode='build' THEN 'Build this two-letter word.' ELSE 'Find the picture.' END,
CASE WHEN mode='build' THEN 'Build '||(w->>'word') ELSE 'Read the word. Find its picture.' END,
jsonb_build_object('type','reading','mode',mode,'word',w->>'word','picture',w->>'picture','meaning',w->>'meaning','onset',w->>'onset','rime','n','sound',w->>'sound'),
CASE WHEN mode='build' THEN '["a","i","o"]'::jsonb ELSE '["an","in","on"]'::jsonb END,
CASE WHEN mode='build' THEN w->>'onset' ELSE w->>'word' END,
'Listen to the first sound. Join it to nnn.',(w->>'onset')||' + n makes '||(w->>'word')||'.'
FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w CROSS JOIN (VALUES ('build'),('match')) m(mode)
WHERE u.id='reading-n' AND NOT EXISTS(SELECT 1 FROM hk_questions q WHERE q.unit_id=u.id AND q.visual->>'word'=w->>'word' AND q.visual->>'mode'=mode);