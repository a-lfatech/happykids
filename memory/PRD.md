# HOP & COUNT – PRD
## Original problem
Premium interactive early-learning maths app for K–Grade 1 (numbers 1–10), based on a Grade 1 worksheet: Missing Numbers (6 puzzles) and More or Less (8 puzzles), characters Hoppy (bunny), Froggy (frog), Sunny (chick), speech bubbles, TTS, optional voice listening ("thank you"), stars for first-try, celebration screen, grown-up corner, local progress.

## User choices
- Number line: 6 boxes around the question
- Characters: hand-built vector (SVG) cartoons with expressions
- Grown-up gate: press & hold 3 seconds
- Future: will also teach reading; Brilliant.org-style learn-by-doing

## Architecture (frontend only, React + Tailwind + Framer Motion)
- games/logic.js (puzzles + math validation), games/registry.js (module list for future games)
- lib/audioManager.js (Web Audio chimes, Web Speech TTS, 3s no-voice detection), lib/speechRecognitionManager.js (6s on-demand listening, nothing stored)
- context/AppState.jsx (localStorage `hopcount_progress_v1`), hooks/useGameSession, useVoice
- pages: Home, MissingNumbersGame, MoreOrLessGame, AchievementScreen, ParentDashboard

## Implemented (Nov 2026)
- All 14 puzzles, any-order blank filling, progressive hints, hop arcs w/ arrowheads & hop numbers, auto-hop on correct
- Progress dots (todo/current/done/star), session + lifetime stars, end screen, leave-game confirm
- Parent dashboard: stats, practice areas, objectives, sound/speech/mic/volume, reset
- Tested: 100% flows pass (iteration_1)

## Backlog
- P1: Reading module (phonics/sight words) using registry; counting to 20
- P2: multiple child profiles, recorded voices, printable worksheets, teacher mode
