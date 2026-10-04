# ThinkSprout — TODO

Live app: https://erabhay02.github.io/gt-practice/ (auto-deploys on every push to `main`; tests must pass first)

## Needs a parent (can't be done from code)
- [ ] Open the app once: existing progress moves into a profile called "My child" (2nd grade). Rename it in 🔒 Grown-ups → Children, set the test date there, then add the 1st grader.
- [ ] Install on each child's device (iPhone/iPad: Safari → Share → Add to Home Screen; Android: Chrome → Install app).
- [ ] Confirm with each school: CogAT level (Level 7 = 1st grade, Level 8 = 2nd grade) and test dates.
- [ ] Phase 2 prep: start Apple Developer enrollment ($99/yr, approval can take 1–2 days), create the Google Play developer account ($25), pick the subdomain (e.g. `practice.yourdomain.com`), have the Supabase project ready.

## Phase 2 — accounts + iPhone/Android apps + invite-only beta (next)
- [ ] Move hosting off GitHub Pages to the subdomain; make the repo private
- [ ] Supabase: parent accounts, children synced across devices (nickname + grade only — COPPA), invite codes
- [ ] Capacitor iOS + Android builds; offline + recorded audio inside the app
- [ ] Privacy policy, in-app account deletion; TestFlight + Google Play closed testing for invited families

## Phase 3 — subscriptions
- [ ] RevenueCat on Apple/Google in-app purchases; free tier vs full access; paywall behind the parental gate
- [ ] Store listings (no "CogAT" in the name; trademark disclaimer), App Review

## Done
### Phase 1 (1st grade + profiles + redesign)
- [x] 1st grade (CogAT Level 7) added alongside 2nd grade (Level 8, unchanged): easier rules in every part (picture-only Number Puzzles, amounts up to 8, one straight fold, one change at a time in Figure Matrices, simpler verbal items + 20 new 1st-grade Picture Analogies); Level 7 practice-test lengths (13/13/12, 13/11/13, 11/10/11)
- [x] 2nd-grade content locked by a fingerprint test, so 1st-grade work can't change what a 2nd grader sees
- [x] Child profiles: "Who's practicing?", per-child progress/streak/history/test date; existing progress migrated automatically
- [x] "Today's practice": 12 questions across the weakest, least-practiced, and a rotating part; marks the day done
- [x] Redesign as ThinkSprout: playful kid screens (Sprout mascot, rounded fonts bundled for offline, chunky buttons, confetti) and calm parent area behind a parental gate (Progress · Children · Worksheets · Settings)
- [x] Practice tests untimed by default (K–2 CogAT is officially untimed); timer is a parent option
- [x] Trademark disclaimer in parent Settings; new sprout app icon
- [x] Verified in a phone-size browser: first run, two children, 1st-grade daily practice, gate, parent pages, upgrade from old saved data; 80 automated tests

### Earlier
- [x] All 9 CogAT Level 8 subtests matching the real formats; practice with ✓/✗ feedback, Previous/Next, adaptive difficulty, no repeats
- [x] Mock tests by battery with untimed examples and how-to tips; progress page; printable worksheets
- [x] Figure variety (half-shading, marks, nested shapes); paper folding with diagonal folds and cut-outs
- [x] Pre-recorded read-aloud (78 sentences, Piper LJSpeech voice), works offline; sound check in Settings
- [x] Installable offline app on GitHub Pages; tests gate every deploy

## Ideas for later
- [ ] When questions change, re-record: `npx tsx scripts/collect-prompts.ts`, then `scripts/generate_audio.py` (setup steps are in that file). CI fails until this is done.
- [ ] If a school uses Level 9 (3rd grade): add text-based verbal items.
- [ ] Scores are practice percentages, not CogAT scores (no age norms/percentiles).
- [ ] Optional: a short "how to take the test" walkthrough; small rewards for streaks.
