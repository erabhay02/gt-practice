# GT Practice — TODO

Live app: https://erabhay02.github.io/gt-practice/ (auto-deploys on every push to `main`; tests must pass first)

## Needs a parent (can't be done from code)
- [ ] Install on his device (iPhone/iPad: Safari → Share → Add to Home Screen; Android: Chrome → Install app).
- [ ] Settings ⚙️: set the test date, then use "Test the voice" and pick the clearest voice/speed on his device.
- [ ] Confirm with the school: CogAT **Level 8** (vs Level 9) and the test date.

## Done
### Foundation
- [x] All 9 CogAT Level 8 subtests, matching the real test's formats:
  - Verbal: Picture Analogies, Sentence Completion (read aloud), Picture Classification
  - Quantitative: Number Analogies (pictures of amounts), Number Puzzles (missing number), Number Series (abacus)
  - Nonverbal: Figure Matrices (2×2), Paper Folding (fold + punch/cut), Figure Classification
- [x] Practice mode with read-aloud, adaptive difficulty, no repeats until a bank is used up, shuffled answer positions
- [x] Works offline as an installable app; deployed to GitHub Pages with tests gating every deploy

### This session
- [x] Verbal banks doubled: Picture Analogies 60, Picture Classification 60, Sentence Completion 62 (+ integrity tests: 4 distinct choices, answer never in the prompt, no duplicates)
- [x] Mock test: battery-length runs (Verbal / Quantitative / Nonverbal) or a quick mixed test; per-part timer; untimed example + spoken how-to tip before each part
- [x] Figure variety: half-shaded shapes, inner marks (dot / line / ×), shapes nested inside shapes (medium/hard items)
- [x] Paper folding: diagonal folds, square holes, triangle cut-outs whose mirror copy flips direction ("copied but not flipped" is a wrong answer). Easy = 1 straight fold + 1 round hole; medium = any fold, 2 holes; hard = 2 folds or a triangle cut-out
- [x] Settings: test date (countdown on Home), read-aloud speed + voice picker + test button, mock timer on/off, reset progress
- [x] Progress page: countdown / days practiced / questions answered, "Focus next", per-part recent % + trend + difficulty level, mock-test history separate from practice
- [x] Printable worksheets: choose parts + 3/5/8 per part, A–D bubbles, Sentence Completion printed as "read aloud", answer key on the last page
- [x] Clarity fixes found by actually looking at screens and printouts: nearly-identical rotated shapes now count as look-alikes; bolder stripe/dot patterns; easy items use unrotated, recognizable shapes; abacus beads grouped in fives; no overlapping or mirror-collapsing paper holes; stale state when switching directly between practice types
- [x] GitHub Actions updated to Node 24 versions
- [x] Every answer shows ✓ Correct / ✗ Incorrect right away (practice, mock test, and mock examples); a missed question highlights the right answer and explains the rule. First answer counts.
- [x] Previous / Next on every question (Next becomes Skip if unanswered; mock-test Previous stays within the current timed part; summary shows skipped count)
- [x] Questions are read aloud only when the 🔊 button is tapped (no automatic reading; reading stops when moving to another question)
- [x] Read-aloud reliability: prefers a built-in device voice over Chrome's online Google voices (known to go silent on Macs), avoids Safari's cancel-then-speak bug, keeps Chrome from dropping speech mid-sentence; 🔊 shows "⏹ Reading…" (tap to stop) and a visible warning if no sound starts
- [x] Verified on the live site in a phone-size browser: offline load + offline practice, a full quick mock test start to finish, progress page records the run, no JS errors. 42 automated tests.

## Ideas for later
- [ ] If the school says Level 9: add text-based verbal items (verbal analogies / classification / sentence completion with words).
- [ ] Scores here are practice percentages, not CogAT scores (no age norms/percentiles); mock timing (~45 s/question) is an estimate.
- [ ] Emoji look differs by device; very old Android phones may show blanks for newer emoji (🪹 🛞 🪶 🪵 🪚).
- [ ] Optional: a short "how to take the test" walkthrough for him (pick one answer, don't rush, listen to the whole question).
- [ ] Optional: small rewards/sounds for streaks if motivation dips.
