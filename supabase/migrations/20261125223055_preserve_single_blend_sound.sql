/*
# Preserve both sounds in the fl blend
## 1. Content
Updates the existing flag cue in hk_units reading_content and matching hk_questions visuals so f and l are each pronounced once. No new tables or columns.
## 2. Security and safety
Existing RLS, grants and learner progress are unchanged. No records are removed; the update is idempotent.
*/
UPDATE hk_units u SET reading_content=jsonb_set(reading_content,'{words}',(SELECT jsonb_agg(CASE WHEN w->>'onset'='fl' THEN jsonb_set(w,'{sound}','"fff lll"'::jsonb) ELSE w END ORDER BY ord) FROM jsonb_array_elements(reading_content->'words') WITH ORDINALITY a(w,ord))) WHERE id='reading-ag';
UPDATE hk_questions SET visual=jsonb_set(visual,'{sound}','"fff lll"'::jsonb) WHERE unit_id='reading-ag' AND visual->>'onset'='fl';