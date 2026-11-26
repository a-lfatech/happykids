/*
# Match positional word scenes
## 1. Content
Sets an/in/on questions in hk_questions to use their own three choices so children can match the apple, inside-box and on-table illustrations.
## 2. Safety
Updates choices only. Learner history and answers are unchanged. Idempotent.
## 3. Security
No new tables, policies, or grants.
*/
UPDATE hk_questions SET choices='["an","in","on"]'::jsonb WHERE unit_id='reading-n' AND visual->>'type'='reading';