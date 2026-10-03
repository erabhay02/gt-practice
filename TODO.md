# GT Practice — TODO

Live app: https://erabhay02.github.io/gt-practice/ (auto-deploys on push to `main`)

## Needs a parent (can't be done from code)
- [ ] Install on his device, test offline (airplane mode), eyeball abacus / paper-folding / 2×2 screens, check the read-aloud voice.
- [ ] Confirm with the school: CogAT **Level 8** (vs Level 9) and the test date.

## In progress / planned
- [ ] Untimed sample questions before each mock-test part
- [ ] More figure variety (split/half-shaded shapes, inner lines, multi-element figures)
- [ ] Better progress page (mock vs practice, trend, focus areas)
- [ ] Settings page (reset progress, speech speed, timer on/off)
- [ ] Printable worksheets
- [ ] Paper folding: diagonal folds + cut-out shapes
- [ ] Update GitHub Actions versions (Node 20 deprecation warning)

## Done
- [x] Phase 1 + 2: all 9 Level 8 subtests, practice mode, read-aloud, adaptive difficulty, repeat avoidance, PWA/offline
- [x] Realism pass: Number Puzzles / abacus Number Series / picture Number Analogies, 2×2 Figure Matrices, fold-and-punch Paper Folding, plausible distractors, shuffled answer positions, battery-based timed mock tests
- [x] Deployed to GitHub Pages with tests gating every deploy
- [x] Verbal banks doubled: Picture Analogies 60, Picture Classification 60, Sentence Completion 62 (+ integrity tests: 4 distinct choices, answer never in prompt, no duplicates)
