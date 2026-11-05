/*
# Seed grades, units and the mastery question bank

1. Grades: K (Pre-K & Kindergarten), Grade 1 and Grade 6 are available. Grades 2-5, 7 and 8 are listed but locked (coming soon).
2. Units
- Kindergarten: Count to 5, Find the number, Shapes, Which has the most?, Count to 10, What comes next?
- Grade 1 (Complete Canadian Curriculum "Numbers 1 to 10"): Count and choose, Number words, One more,
  Match the number, Comes after, Comes before. Unlocks after the last Kindergarten unit is mastered.
- Grade 6 (Multiplying by 10, 100 and 1000 worksheet): Multiply, Divide, Mixed, Missing number, Powers of ten.
3. Questions are generated so every unit has 10+ items; decimal answers are computed exactly in the database.
4. Removes the (unit, prompt) unique constraint because counting questions legitimately share a prompt.
*/

ALTER TABLE hk_questions DROP CONSTRAINT IF EXISTS hk_questions_unit_id_prompt_key;

INSERT INTO hk_grades (id, title, short, sort_order, available) VALUES
  ('K', 'Pre-K & Kindergarten', 'K', 0, true),
  ('G1', 'Grade 1', '1', 1, true),
  ('G2', 'Grade 2', '2', 2, false),
  ('G3', 'Grade 3', '3', 3, false),
  ('G4', 'Grade 4', '4', 4, false),
  ('G5', 'Grade 5', '5', 5, false),
  ('G6', 'Grade 6', '6', 6, true),
  ('G7', 'Grade 7', '7', 7, false),
  ('G8', 'Grade 8', '8', 8, false)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, short = EXCLUDED.short, sort_order = EXCLUDED.sort_order, available = EXCLUDED.available;

INSERT INTO hk_units (id, grade_id, sort_order, title, skill, emoji, prerequisite_unit_id) VALUES
  ('k-count-5', 'K', 1, 'Count to 5', 'Counting objects 1-5', '🍎', NULL),
  ('k-find-number', 'K', 2, 'Find the number', 'Recognising numerals 1-5', '🔢', 'k-count-5'),
  ('k-shapes', 'K', 3, 'Shapes', 'Naming simple shapes', '🔺', 'k-find-number'),
  ('k-most', 'K', 4, 'Which has the most?', 'Comparing groups', '🐸', 'k-shapes'),
  ('k-count-10', 'K', 5, 'Count to 10', 'Counting objects 6-10', '🐞', 'k-most'),
  ('k-patterns', 'K', 6, 'What comes next?', 'Simple patterns', '🔴', 'k-count-10'),
  ('g1-count', 'G1', 1, 'Count and choose', 'Counting and writing numbers 1-10', '🎀', 'k-patterns'),
  ('g1-words', 'G1', 2, 'Number words', 'Reading number words one to ten', '🐝', 'g1-count'),
  ('g1-one-more', 'G1', 3, 'One more', 'Adding one more to a group', '🍭', 'g1-words'),
  ('g1-match', 'G1', 4, 'Match the number', 'Matching a group to a number', '🧁', 'g1-one-more'),
  ('g1-after', 'G1', 5, 'Comes after', 'Number that comes after (to 20)', '➡️', 'g1-match'),
  ('g1-before', 'G1', 6, 'Comes before', 'Number that comes before (to 20)', '⬅️', 'g1-after'),
  ('g6-multiply', 'G6', 1, 'Multiply by 10, 100, 1000', 'Multiplying decimals by powers of ten', '✖️', NULL),
  ('g6-divide', 'G6', 2, 'Divide by 10, 100, 1000', 'Dividing by powers of ten', '➗', 'g6-multiply'),
  ('g6-mixed', 'G6', 3, 'Mixed practice', 'Choosing multiply or divide', '🔀', 'g6-divide'),
  ('g6-missing', 'G6', 4, 'Missing number', 'Finding the missing power of ten', '❓', 'g6-mixed'),
  ('g6-powers', 'G6', 5, 'Powers of ten', 'Exponents and scientific notation', '🚀', 'g6-missing')
ON CONFLICT (id) DO UPDATE SET grade_id = EXCLUDED.grade_id, sort_order = EXCLUDED.sort_order, title = EXCLUDED.title,
  skill = EXCLUDED.skill, emoji = EXCLUDED.emoji, prerequisite_unit_id = EXCLUDED.prerequisite_unit_id;

DO $$
DECLARE
  words text[] := ARRAY['one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
BEGIN
  IF EXISTS (SELECT 1 FROM hk_questions) THEN RETURN; END IF;

  -- K: Count to 5
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-count-5', 'How many ' || e.name || '?', 'How many ' || e.name || ' can you count?',
    jsonb_build_object('type','count','emoji',e.emoji,'n',n),
    jsonb_build_array(n::text, (n % 5 + 1)::text, ((n + 2) % 5 + 1)::text), n::text,
    'Touch each one as you count. One, two, three...', 'Yes! There ' || CASE WHEN n = 1 THEN 'is ' ELSE 'are ' END || n || ' ' || CASE WHEN n = 1 THEN e.one ELSE e.name END || '.'
  FROM generate_series(1,5) n,
    (VALUES ('🍎','apples','apple'),('🐞','ladybugs','ladybug'),('⭐','stars','star'),('🐟','fish','fish')) e(emoji,name,one);

  -- K: Find the number
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-find-number', 'Find the number ' || words[n], 'Can you find the number ' || words[n] || '?',
    jsonb_build_object('type','count','emoji','⭐','n',n),
    jsonb_build_array(n::text, ((n + v) % 5 + 1)::text, ((n + v + 2) % 5 + 1)::text), n::text,
    'Count the stars. Which number matches?', 'Great! That is the number ' || words[n] || '.'
  FROM generate_series(1,5) n, generate_series(0,1) v;

  -- K: Shapes
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-shapes', 'Which one is a ' || s.name || '?', 'Which one is a ' || s.name || '?', NULL,
    jsonb_build_array(s.emoji, o1.emoji, o2.emoji), s.emoji, s.hint, 'Yes! That is a ' || s.name || '.'
  FROM (VALUES (1,'🔵','circle','A circle is round like a ball.'),(2,'🟥','square','A square has 4 straight sides that are the same.'),
               (3,'🔺','triangle','A triangle has 3 sides and 3 corners.'),(4,'⭐','star','A star has 5 pointy tips.'),
               (5,'💗','heart','A heart is the shape of love.')) s(i,emoji,name,hint),
    (VALUES (1,'🔵'),(2,'🟥'),(3,'🔺'),(4,'⭐'),(5,'💗')) o1(i,emoji),
    (VALUES (1,'🔵'),(2,'🟥'),(3,'🔺'),(4,'⭐'),(5,'💗')) o2(i,emoji)
  WHERE o1.i = (s.i % 5) + 1 AND o2.i IN ((s.i + 1) % 5 + 1, (s.i + 2) % 5 + 1) AND o2.i <> s.i;

  -- K: Which has the most?
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-most', 'Which group has the most?', 'Which group has the most ' || e.name || '?', NULL,
    jsonb_build_array(repeat(e.emoji, t.a), repeat(e.emoji, t.b), repeat(e.emoji, t.c)),
    repeat(e.emoji, greatest(t.a, t.b, t.c)),
    'Count each group. The biggest number has the most.', 'Yes! That group has ' || greatest(t.a, t.b, t.c) || ' ' || e.name || '. That is the most!'
  FROM (VALUES (1,3,5),(4,2,1),(2,5,3),(1,4,2),(3,1,5)) t(a,b,c),
    (VALUES ('🐸','frogs'),('🍓','strawberries')) e(emoji,name);

  -- K: Count to 10
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-count-10', 'How many ' || e.name || '?', 'How many ' || e.name || ' can you count?',
    jsonb_build_object('type','count','emoji',e.emoji,'n',n),
    jsonb_build_array(n::text, (n - 1)::text, (CASE WHEN n = 10 THEN 8 ELSE n + 1 END)::text), n::text,
    'Count slowly and touch each one. Do not skip any!', 'Yes! There are ' || n || ' ' || e.name || '.'
  FROM generate_series(6,10) n, (VALUES ('🐞','ladybugs'),('🎈','balloons'),('🌼','flowers')) e(emoji,name);

  -- K: Patterns
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'k-patterns', 'What comes next?', 'Look at the pattern. What comes next?',
    jsonb_build_object('type','pattern','items', p.items),
    jsonb_build_array(p.ans, p.d1, p.d2), p.ans,
    'Say the pattern out loud. What repeats?', 'Yes! The pattern keeps repeating.'
  FROM (VALUES
    ('["🔴","🔵","🔴","🔵","🔴"]'::jsonb,'🔵','🔴','🟢'),
    ('["🐶","🐱","🐶","🐱"]'::jsonb,'🐶','🐱','🐰'),
    ('["⭐","⭐","🌙","⭐","⭐"]'::jsonb,'🌙','⭐','☀️'),
    ('["🍎","🍌","🍇","🍎","🍌"]'::jsonb,'🍇','🍎','🍌'),
    ('["🟢","🟡","🟢","🟡","🟢"]'::jsonb,'🟡','🟢','🔴'),
    ('["🚗","🚗","🚌","🚗","🚗"]'::jsonb,'🚌','🚗','🚲'),
    ('["🐸","🐟","🐸","🐟"]'::jsonb,'🐸','🐟','🐞'),
    ('["🌸","🌼","🌸","🌼","🌸"]'::jsonb,'🌼','🌸','🍀'),
    ('["🔺","🟦","🔵","🔺","🟦"]'::jsonb,'🔵','🔺','🟦'),
    ('["👏","👏","🦶","👏","👏"]'::jsonb,'🦶','👏','🎵')
  ) p(items,ans,d1,d2);

  -- G1: Count and choose
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-count', 'Count the ' || e.name || '.', 'Count the ' || e.name || '. How many are there?',
    jsonb_build_object('type','count','emoji',e.emoji,'n',n),
    jsonb_build_array(n::text, (CASE WHEN n = 1 THEN 3 ELSE n - 1 END)::text, (CASE WHEN n = 10 THEN 8 ELSE n + 1 END)::text), n::text,
    'Point to each one and count out loud.', 'Yes! There ' || CASE WHEN n = 1 THEN 'is ' ELSE 'are ' END || n || '.'
  FROM generate_series(1,10) n, (VALUES ('🎀','bows'),('🌳','trees'),('🦋','butterflies')) e(emoji,name);

  -- G1: Number words
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-words', 'How many ' || e.name || '? Pick the word.', 'How many ' || e.name || '? Pick the number word.',
    jsonb_build_object('type','count','emoji',e.emoji,'n',n),
    jsonb_build_array(words[n], words[CASE WHEN n = 10 THEN 8 ELSE n + 1 END], words[CASE WHEN n = 1 THEN 3 ELSE n - 1 END]), words[n],
    'Count first, then find the word for that number.', 'Yes! ' || n || ' is written ' || words[n] || '.'
  FROM generate_series(1,10) n, (VALUES ('🐝','bees'),('🐦','birds')) e(emoji,name);

  -- G1: One more
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-one-more', 'Add 1 more ' || e.one || '. How many now?', 'Here are ' || n || ' ' || e.name || '. If we add one more, how many will there be?',
    jsonb_build_object('type','count','emoji',e.emoji,'n',n,'plus',1),
    jsonb_build_array((n + 1)::text, n::text, (n + 2)::text), (n + 1)::text,
    'One more means the next number when you count.', 'Yes! ' || n || ' and 1 more makes ' || (n + 1) || '.'
  FROM generate_series(1,9) n, (VALUES ('🍭','lollipops','lollipop'),('🍦','ice creams','ice cream')) e(emoji,name,one);

  -- G1: Match the number
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-match', 'Which group shows ' || n || '?', 'Which group shows ' || words[n] || ' ' || e.name || '?',
    jsonb_build_object('type','big','text', n::text),
    jsonb_build_array(repeat(e.emoji, n), repeat(e.emoji, n - 1), repeat(e.emoji, n + 1)), repeat(e.emoji, n),
    'Count each group carefully. Which one matches the number?', 'Yes! That group has ' || n || ' ' || e.name || '.'
  FROM generate_series(2,9) n, (VALUES ('🧁','cupcakes'),('🍞','slices of bread')) e(emoji,name);

  -- G1: Comes after
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-after', 'What number comes after ' || n || '?', 'What number comes after ' || n || '?',
    jsonb_build_object('type','sequence','items', jsonb_build_array(n::text, '?')),
    jsonb_build_array((n + 1)::text, (CASE WHEN n = 1 THEN 3 ELSE n - 1 END)::text, (n + 2)::text), (n + 1)::text,
    'Count forward: say the number, then the very next one.', 'Yes! After ' || n || ' comes ' || (n + 1) || '.'
  FROM generate_series(1,19) n;

  -- G1: Comes before
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g1-before', 'What number comes before ' || n || '?', 'What number comes before ' || n || '?',
    jsonb_build_object('type','sequence','items', jsonb_build_array('?', n::text)),
    jsonb_build_array((n - 1)::text, (n + 1)::text, (CASE WHEN n = 2 THEN 3 ELSE n - 2 END)::text), (n - 1)::text,
    'Count backward: the number just before is one less.', 'Yes! ' || (n - 1) || ' comes just before ' || n || '.'
  FROM generate_series(2,20) n;

  -- G6: Multiply, Divide, Mixed (worksheet items plus extra practice)
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT x.unit,
    trim_scale(x.a)::text || ' ' || x.op || ' ' || x.p || ' = ?',
    'What is ' || trim_scale(x.a)::text || CASE WHEN x.op = '×' THEN ' times ' ELSE ' divided by ' END || x.p || '?',
    jsonb_build_object('type','big','text', trim_scale(x.a)::text || ' ' || x.op || ' ' || x.p),
    jsonb_build_array(trim_scale(x.ans)::text, trim_scale(x.ans * 10)::text, trim_scale(x.ans / 10)::text,
      trim_scale(CASE WHEN x.op = '×' THEN x.ans / 100 ELSE x.ans * 100 END)::text),
    trim_scale(x.ans)::text,
    CASE WHEN x.op = '×' THEN 'Multiplying by ' || x.p || ' moves every digit ' || length(x.p::text) - 1 || ' place' || CASE WHEN x.p > 10 THEN 's' ELSE '' END || ' to the LEFT. The number gets bigger.'
         ELSE 'Dividing by ' || x.p || ' moves every digit ' || length(x.p::text) - 1 || ' place' || CASE WHEN x.p > 10 THEN 's' ELSE '' END || ' to the RIGHT. The number gets smaller.' END,
    trim_scale(x.a)::text || ' ' || x.op || ' ' || x.p || ' = ' || trim_scale(x.ans)::text || '. The digits moved ' || length(x.p::text) - 1 || ' place' || CASE WHEN x.p > 10 THEN 's' ELSE '' END || ' to the ' || CASE WHEN x.op = '×' THEN 'left.' ELSE 'right.' END
  FROM (
    SELECT v.unit, v.a, v.op, v.p, CASE WHEN v.op = '×' THEN v.a * v.p ELSE v.a / v.p END AS ans
    FROM (VALUES
      ('g6-multiply',13::numeric,'×',10),('g6-multiply',11,'×',100),('g6-multiply',5.7,'×',10),('g6-multiply',6.8,'×',10),
      ('g6-multiply',12.8,'×',10),('g6-multiply',4.7,'×',100),('g6-multiply',14.3,'×',100),('g6-multiply',1.5,'×',1000),
      ('g6-multiply',11.6,'×',10),('g6-multiply',2.24,'×',10),('g6-multiply',0.3,'×',1000),('g6-multiply',0.75,'×',10),
      ('g6-multiply',3.42,'×',100),('g6-multiply',0.06,'×',1000),
      ('g6-divide',130,'÷',10),('g6-divide',1500,'÷',10),('g6-divide',3100,'÷',100),('g6-divide',23,'÷',10),
      ('g6-divide',63,'÷',10),('g6-divide',59,'÷',10),('g6-divide',143,'÷',10),('g6-divide',120,'÷',100),
      ('g6-divide',190,'÷',100),('g6-divide',6,'÷',10),('g6-divide',17,'÷',100),('g6-divide',45,'÷',1000),
      ('g6-divide',4.5,'÷',10),('g6-divide',320,'÷',1000),
      ('g6-mixed',63,'×',1000),('g6-mixed',4.3,'×',100),('g6-mixed',1.2,'÷',10),('g6-mixed',12.6,'×',100),
      ('g6-mixed',2.3,'÷',100),('g6-mixed',0.45,'×',1000),('g6-mixed',1435,'÷',10),('g6-mixed',34678,'÷',100),
      ('g6-mixed',15.34,'×',10),('g6-mixed',0.06,'÷',10),('g6-mixed',0.14,'×',10),('g6-mixed',4.5,'÷',1000)
    ) v(unit,a,op,p)
  ) x;

  -- G6: Missing number
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g6-missing',
    trim_scale(m.a)::text || ' ' || m.op || ' ☐ = ' || trim_scale(m.r)::text,
    trim_scale(m.a)::text || CASE WHEN m.op = '×' THEN ' times what number' ELSE ' divided by what number' END || ' equals ' || trim_scale(m.r)::text || '?',
    jsonb_build_object('type','big','text', trim_scale(m.a)::text || ' ' || m.op || ' ☐ = ' || trim_scale(m.r)::text),
    '["10","100","1000","10000"]'::jsonb, m.p::text,
    'Count how many places the digits moved. 1 place = 10, 2 places = 100, 3 places = 1000.',
    'Yes! The digits moved ' || length(m.p::text) - 1 || ' place' || CASE WHEN m.p > 10 THEN 's' ELSE '' END || ', so the missing number is ' || m.p || '.'
  FROM (
    SELECT v.a, v.op, v.p, CASE WHEN v.op = '×' THEN v.a * v.p ELSE v.a / v.p END AS r
    FROM (VALUES (5.87::numeric,'×',10),(13.7,'×',100),(5.87,'×',100),(4.37,'×',1000),(0.687,'×',100),(8.6,'×',10),
                 (84.6,'÷',100),(447,'÷',100),(3.87,'÷',10),(16.6,'÷',100),(8460,'÷',1000),(43.7,'÷',10)) v(a,op,p)
  ) m;

  -- G6: Powers of ten
  INSERT INTO hk_questions (unit_id, prompt, say, visual, choices, answer, hint, explain)
  SELECT 'g6-powers',
    CASE WHEN w.k IS NULL THEN '10' ELSE trim_scale(w.k)::text || ' × 10' END || w.sup || ' = ?',
    'What is ' || CASE WHEN w.k IS NULL THEN '10' ELSE trim_scale(w.k)::text || ' times 10' END || ' to the power of ' || w.e || '?',
    jsonb_build_object('type','big','text', CASE WHEN w.k IS NULL THEN '10' ELSE trim_scale(w.k)::text || ' × 10' END || w.sup),
    jsonb_build_array(trim_scale(w.ans)::text, trim_scale(w.ans * 10)::text, trim_scale(w.ans / 10)::text, trim_scale(w.ans * 100)::text),
    trim_scale(w.ans)::text,
    '10 to the power of ' || w.e || ' means 1 followed by ' || w.e || ' zeros. Then multiply.',
    'Yes! 10' || w.sup || ' = ' || power(10, w.e)::bigint || ', so the answer is ' || trim_scale(w.ans)::text || '.'
  FROM (
    SELECT v.k, v.e, v.sup, COALESCE(v.k, 1) * power(10::numeric, v.e) AS ans
    FROM (VALUES (NULL::numeric,2,'²'),(NULL,3,'³'),(NULL,4,'⁴'),(5,2,'²'),(8,3,'³'),(7.5,2,'²'),(1.2,3,'³'),
                 (1.52,2,'²'),(0.75,3,'³'),(1.75,4,'⁴'),(2.912,3,'³'),(3.4,2,'²')) v(k,e,sup)
  ) w;
END $$;
