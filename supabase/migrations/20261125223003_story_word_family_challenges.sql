/*
# Story word challenges and single sound cues
## 1. Content
Adds ten four-word families for common early story vocabulary to hk_units and hk_questions. New families unlock in sequence after -ag. Updates existing repeated sound cues to a single sound. No new tables or columns.
## 2. Progress and safety
Existing attempts, questions, mastery and access remain unchanged. New questions use the existing help and mastery system. Content inserts are idempotent and preserve user progress.
## 3. Security
Existing RLS, private table grants and token-checked RPCs remain in force. No additional grants or policies.
*/
UPDATE hk_units u SET reading_content=jsonb_set(reading_content,'{words}',(SELECT jsonb_agg(jsonb_set(w,'{sound}',to_jsonb(split_part(w->>'sound',',',1))) ORDER BY ord) FROM jsonb_array_elements(reading_content->'words') WITH ORDINALITY a(w,ord))) WHERE reading_content IS NOT NULL;
INSERT INTO hk_units(id,grade_id,sort_order,title,skill,emoji,prerequisite_unit_id,teach,reading_content)
SELECT 'reading-'||rime,'K',105+n,'Story challenge -'||rime,'Story word blending','📖',prev,'Blend the first sound and the ending. Find the word in a story.',
jsonb_build_object('rime',rime,'grade','K–1','level','Story word challenge','concept','Words for short stories','ending_cue',rime,'objective','Build and read four story words.','words',(SELECT jsonb_agg(jsonb_build_object('onset',left(word,length(word)-length(rime)),'word',word,'picture',picture,'sound',sound)) FROM jsonb_to_recordset(content::jsonb) AS x(word text,picture text,sound text)))
FROM (VALUES
(0,'ad','reading-ag','[{"word":"dad","picture":"👨","sound":"duh"},{"word":"sad","picture":"😢","sound":"sss"},{"word":"bad","picture":"👎","sound":"buh"},{"word":"mad","picture":"😠","sound":"mmm"}]'),
(1,'am','reading-ad','[{"word":"jam","picture":"🍓","sound":"juh"},{"word":"ham","picture":"🍖","sound":"huh"},{"word":"ram","picture":"🐏","sound":"rrr"},{"word":"Sam","picture":"🧒","sound":"sss"}]'),
(2,'en','reading-am','[{"word":"hen","picture":"🐔","sound":"huh"},{"word":"pen","picture":"🖊️","sound":"puh"},{"word":"ten","picture":"🔟","sound":"tuh"},{"word":"den","picture":"🏠","sound":"duh"}]'),
(3,'et','reading-en','[{"word":"pet","picture":"🐕","sound":"puh"},{"word":"wet","picture":"💧","sound":"wuh"},{"word":"net","picture":"🥅","sound":"nnn"},{"word":"jet","picture":"✈️","sound":"juh"}]'),
(4,'ig','reading-et','[{"word":"pig","picture":"🐷","sound":"puh"},{"word":"big","picture":"🐘","sound":"buh"},{"word":"dig","picture":"⛏️","sound":"duh"},{"word":"wig","picture":"💇","sound":"wuh"}]'),
(5,'in','reading-ig','[{"word":"bin","picture":"🗑️","sound":"buh"},{"word":"pin","picture":"📌","sound":"puh"},{"word":"tin","picture":"🥫","sound":"tuh"},{"word":"fin","picture":"🦈","sound":"fff"}]'),
(6,'ip','reading-in','[{"word":"zip","picture":"🤐","sound":"zzz"},{"word":"lip","picture":"👄","sound":"lll"},{"word":"sip","picture":"🥤","sound":"sss"},{"word":"dip","picture":"🥣","sound":"duh"}]'),
(7,'og','reading-ip','[{"word":"dog","picture":"🐶","sound":"duh"},{"word":"log","picture":"🪵","sound":"lll"},{"word":"frog","picture":"🐸","sound":"fff rrr"},{"word":"fog","picture":"🌫️","sound":"fff"}]'),
(8,'op','reading-og','[{"word":"hop","picture":"🐇","sound":"huh"},{"word":"top","picture":"🔝","sound":"tuh"},{"word":"mop","picture":"🧹","sound":"mmm"},{"word":"pop","picture":"🎈","sound":"puh"}]'),
(9,'un','reading-op','[{"word":"sun","picture":"☀️","sound":"sss"},{"word":"run","picture":"🏃","sound":"rrr"},{"word":"fun","picture":"🎉","sound":"fff"},{"word":"bun","picture":"🥯","sound":"buh"}]')
) f(n,rime,prev,content) ON CONFLICT(id) DO NOTHING;
UPDATE hk_questions q SET visual=jsonb_set(q.visual,'{sound}',w->'sound') FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w WHERE q.unit_id=u.id AND q.visual->>'type'='reading' AND q.visual->>'word'=w->>'word';
INSERT INTO hk_questions(unit_id,prompt,say,visual,choices,answer,hint,explain)
SELECT u.id,CASE WHEN mode='build' THEN 'Build the story word.' ELSE 'Find the story picture.' END,
CASE WHEN mode='build' THEN 'Your challenge: build '||(w->>'word') ELSE 'Your challenge: read the word and find its picture.' END,
jsonb_build_object('type','reading','mode',mode,'word',w->>'word','picture',w->>'picture','onset',w->>'onset','rime',u.reading_content->>'rime','sound',w->>'sound'),
CASE WHEN mode='build' THEN (SELECT jsonb_agg(x->>'onset') FROM jsonb_array_elements(u.reading_content->'words') x) ELSE (SELECT jsonb_agg(x->>'word') FROM jsonb_array_elements(u.reading_content->'words') x) END,
CASE WHEN mode='build' THEN w->>'onset' ELSE w->>'word' END,
'Listen to the first sound. Join it to the ending.',(w->>'onset')||' + '||(u.reading_content->>'rime')||' makes '||(w->>'word')||'.'
FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w CROSS JOIN (VALUES ('build'),('match')) m(mode)
WHERE u.reading_content IS NOT NULL AND NOT EXISTS(SELECT 1 FROM hk_questions q WHERE q.unit_id=u.id AND q.visual->>'word'=w->>'word' AND q.visual->>'mode'=mode);