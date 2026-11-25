/*
# Pronounceable consonant sound cues
## 1. Content correction
Device voices can read stretched cues such as mmm, sss, fff, lll, rrr, vvv and zzz as letter names. These are replaced with short spoken sounds (muh, suh, fuh, luh, ruh, vuh, zuh) in hk_units reading_content word sounds and hk_questions reading visual sounds and hints. Displayed letters and words are unchanged.
## 2. Data safety
Updates only; nothing is removed. Re-running is safe.
## 3. Security
No access rules change.
*/
CREATE OR REPLACE FUNCTION pg_temp.hk_fix_sound(s text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(replace(replace(replace(replace(s,'mmm','muh'),'sss','suh'),'fff','fuh'),'lll','luh'),'rrr','ruh'),'vvv','vuh'),'zzz','zuh')
$$;
UPDATE hk_units SET reading_content=jsonb_set(reading_content,'{words}',(SELECT jsonb_agg(jsonb_set(w,'{sound}',to_jsonb(pg_temp.hk_fix_sound(w->>'sound'))) ORDER BY ord) FROM jsonb_array_elements(reading_content->'words') WITH ORDINALITY a(w,ord))) WHERE reading_content IS NOT NULL AND reading_content->'words' IS NOT NULL;
UPDATE hk_questions SET visual=jsonb_set(visual,'{sound}',to_jsonb(pg_temp.hk_fix_sound(visual->>'sound'))) WHERE visual->>'type'='reading' AND visual->>'sound' ~ '(mmm|sss|fff|lll|rrr|vvv|zzz)';
UPDATE hk_questions SET hint=pg_temp.hk_fix_sound(hint) WHERE visual->>'type'='reading' AND hint ~ '(mmm|sss|fff|lll|rrr|vvv|zzz)';