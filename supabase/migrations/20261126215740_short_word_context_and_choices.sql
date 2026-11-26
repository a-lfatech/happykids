/*
# Short word context and meaningful choices
## 1. Content
Updates an/in/on teaching sentences and question visuals in hk_units and hk_questions. Everyday word groups use full-word choices, with distractors even for a single-word group.
## 2. Data safety
Idempotent content updates only; attempts and mastery remain unchanged.
## 3. Security
No access-control changes or new tables.
*/
UPDATE hk_units SET reading_content=jsonb_set(reading_content,'{words}',(SELECT jsonb_agg(w || jsonb_build_object('sound',w->>'word','meaning',CASE w->>'word' WHEN 'an' THEN 'An apple.' WHEN 'in' THEN 'The ball is in the box.' ELSE 'The ball is on the table.' END) ORDER BY ord) FROM jsonb_array_elements(reading_content->'words') WITH ORDINALITY a(w,ord))) WHERE id='reading-n';
UPDATE hk_questions q SET visual=q.visual || jsonb_build_object('whole_word',true,'sound',q.visual->>'word','meaning',w->>'meaning'), answer=q.visual->>'word',choices=(SELECT jsonb_agg(v) FROM (SELECT q.visual->>'word' v UNION SELECT 'am' UNION SELECT 'it' UNION SELECT 'up') s),say='Find '||(q.visual->>'word')||'. '||(w->>'meaning'),hint='Listen to the whole word and look at the picture.' FROM hk_units u CROSS JOIN LATERAL jsonb_array_elements(u.reading_content->'words') w WHERE q.unit_id=u.id AND u.reading_content->>'whole_word'='true' AND q.visual->>'word'=w->>'word';