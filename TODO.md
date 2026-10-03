# GT Practice — TODO

Live app: https://erabhay02.github.io/gt-practice/ (auto-deploys on push to `main`)

## Needs a parent (can't be done from code)
- [ ] Install on his device, test offline (airplane mode), eyeball abacus / paper-folding / 2×2 screens, check the read-aloud voice.
- [ ] Confirm with the school: CogAT **Level 8** (vs Level 9) and the test date.

## In progress / planned
- [ ] Printable worksheets
- [ ] Paper folding: diagonal folds + cut-out shapes
- [ ] Update GitHub Actions versions (Node 20 deprecation warning)

## Done
- [x] Phase 1 + 2: all 9 Level 8 subtests, practice mode, read-aloud, adaptive difficulty, repeat avoidance, PWA/offline
- [x] Realism pass: Number Puzzles / abacus Number Series / picture Number Analogies, 2×2 Figure Matrices, fold-and-punch Paper Folding, plausible distractors, shuffled answer positions, battery-based timed mock tests
- [x] Deployed to GitHub Pages with tests gating every deploy
- [x] Verbal banks doubled: Picture Analogies 60, Picture Classification 60, Sentence Completion 62 (+ integrity tests: 4 distinct choices, answer never in prompt, no duplicates)
- [x] Mock test: optional untimed example before each part, with a spoken how-to tip; practice mode shows the tip after answering generated questions
- [x] Figure variety: half-shaded shapes, inner marks (dot / line / ×), shapes nested inside shapes — used by Figure Matrices and Figure Classification on medium/hard items (visually verified via headless-Chrome renders)
- [x] UI verified on an emulated iPhone-size screen (no overflow, no JS errors). Fixed from screenshots: nearly-identical rotated stars/polygons now count as look-alikes (25° rule); abacus beads grouped in fives; stale state when switching directly between practice types
- [x] Settings page (⚙️ on Home): test date with countdown on Home, read-aloud speed + voice picker + test button, mock-test timer on/off, reset progress (with confirmation)
- [x] Progress page: countdown / days practiced / questions answered, "Focus next" (weakest recent parts, then untried), per-part recent % + trend bars + current difficulty, mock-test history kept separate from practice (tap a run for per-part scores)
