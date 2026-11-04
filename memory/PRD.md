# HappyKids (formerly Hop & Count) – PRD
## Original problem
v1: Hop & Count maths app (K–G1, numbers 1–10). v2: upgrade to HappyKids platform per user's HappyKids prompt + poster: landing page, learning dashboard, 5 learning worlds, rewards, parent dashboard, about, privacy/terms. Reading ideas (user's Lovable "Little Readers" app was not accessible; reading built from spec).

## Choices
- 6-box number line; grown-up gate = press & hold 3s
- Poster-style 3D character PNGs (Hoppy, Froggy, Sunny, Ellie elephant, Finn fox) in /frontend/public/hk
- All five worlds with starter games; Emergent Google sign-in for parents only (cloud backup), kids play without accounts

## Architecture
- Frontend React: data/worlds.js (worlds, activities, badges), data/quizzes.js, data/stories.js; QuizCore generic engine; StoryGame (read-along highlight), MemoryGame, DrawGame, ColourGame, Missing Numbers, More or Less; AppState (profiles, progress, settings, cloud sync)
- Backend FastAPI: /api/auth/session|me|logout, /api/progress GET/PUT, /api/contact

## Implemented
- 2026-11: v1 Hop & Count (14 puzzles), tested
- 2026-11: v2 HappyKids: 16 activities across 5 worlds, badges/certificates/avatar unlocks, profiles + levels, parent dashboard, Google cloud backup, music, reduced motion, about/contact, legal pages. Tested iteration_2 (backend 16/16, frontend ~96%, issues fixed)
- 2026-11: More or Less hop coaching (counts remaining hops, back-hops remove arrows, caps at required hops)

## Backlog
- P1: Recorded character voices; more reading (sight words, sentence building); counting to 20
- P2: Teacher/classroom mode, printable worksheets, more science topics
