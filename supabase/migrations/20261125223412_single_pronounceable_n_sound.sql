/*
# Correct the single n sound
## 1. Content correction
Replaces the nnn spelling, which device voices can read as three letter names, with the pronounceable single cue nuh. Updates hk_units reading_content, teaching text, and hk_questions visual sound and hint. The displayed letter n and all words are unchanged.
## 2. Data safety
No tables, columns, questions, attempts or progress are removed. Updates are idempotent.
## 3. Security
Existing RLS, grants and token-checked functions are unchanged.
*/
UPDATE hk_units u SET reading_content=jsonb_set(reading_content,'{words}',(SELECT jsonb_agg(CASE WHEN w->>'sound'='nnn' THEN jsonb_set(w,'{sound}','"nuh"'::jsonb) ELSE w END ORDER BY ord) FROM jsonb_array_elements(reading_content->'words') WITH ORDINALITY a(w,ord))) WHERE reading_content IS NOT NULL;
UPDATE hk_units SET reading_content=jsonb_set(reading_content,'{ending_cue}','"nuh"'::jsonb) WHERE reading_content->>'ending_cue'='nnn';
UPDATE hk_units SET teach=replace(teach,'nnn','nuh') WHERE reading_content IS NOT NULL AND teach LIKE '%nnn%';
UPDATE hk_questions SET visual=jsonb_set(visual,'{sound}','"nuh"'::jsonb) WHERE visual->>'type'='reading' AND visual->>'sound'='nnn';
UPDATE hk_questions SET hint=replace(hint,'nnn','nuh') WHERE visual->>'type'='reading' AND hint LIKE '%nnn%';