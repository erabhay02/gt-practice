# ThinkSprout — TODO

Live app: https://erabhay02.github.io/gt-practice/ (auto-deploys on every push to `main`; tests must pass first)

## Needs a parent (can't be done from code)
- [ ] Open the app once: existing progress moves into a profile called "My child" (2nd grade). Rename it in 🔒 Grown-ups → Children, set the test date there, then add the 1st grader.
- [ ] Install on each child's device (iPhone/iPad: Safari → Share → Add to Home Screen; Android: Chrome → Install app).
- [ ] Confirm with each school: CogAT level (Level 7 = 1st grade, Level 8 = 2nd grade) and test dates.
- [ ] Phase 2 prep: start Apple Developer enrollment ($99/yr, approval can take 1–2 days), create the Google Play developer account ($25), pick the subdomain (e.g. `practice.yourdomain.com`), have the Supabase project ready.

## Phase 2 — accounts + iPhone/Android apps + invite-only beta (in progress)
Built and tested locally (switched off in the live app until the real backend is connected):
- [x] Database: parents, children, sessions, invite codes; row-level security; sign-up trigger redeems invites; account deletion (`supabase/migrations/0001_init.sql`) — 23 backend checks pass on a local Supabase
- [x] Sign-in / create account with invite / 6-digit email codes / password reset / "waiting for invite"; parent Account tab (sync now, sign out, delete account)
- [x] Local-first sync: works offline, merges two devices (sessions never lost or doubled, newest edit wins, removals reach every device) — 12 two-device UI checks pass
- [x] Privacy Policy + Terms drafts (`public/privacy.html`, `public/terms.html`) — **review; set up privacy@astrala.us or change the address**
- [x] iPhone app project (Capacitor, `ios/`), app icon + launch screen; builds and runs in the iOS Simulator
Waiting on:
- [x] Supabase project "thinksprout" (us-east-1): database + security rules, 5 one-use invite codes, email via Twilio SendGrid from no-reply@astrala.us, code-based email templates; parent account created and verified; accounts switched on in the live app
- [x] Cloudflare Pages project "thinksprout": every push deploys to https://thinksprout.pages.dev (alongside github.io)
- [ ] Attach custom domain thinksprout.astrala.us (Cloudflare → Workers & Pages → thinksprout → Custom domains)
- [x] Apple Developer membership active (team PFMBH72U95); App Store Connect app "ThinkSprout"; build 1.0 (1) uploaded 2026-10-04
  - Next upload: bump CURRENT_PROJECT_VERSION in `ios/App/App.xcodeproj/project.pbxproj`. Archive unsigned (`CODE_SIGNING_ALLOWED=NO`), then `xcodebuild -exportArchive` with method app-store-connect, destination upload, `-allowProvisioningUpdates` (no registered device needed)
- [ ] TestFlight internal testers (family), then external testers for invited families (needs a short Beta App Review)
- [ ] Sign in on every existing device while still on github.io (uploads progress), then switch domain, then make the repo private
- [x] Android app project (Capacitor, `android/`): icon, launch screen, portrait; runs in the emulator. Build with JDK 21 (`~/.jdks/jdk-21.*`); Android Studio's bundled Java 25 is too new for Gradle 8.14
- [ ] Google Play developer account: verify identity + phone; verify a real Android device in the Play Console app (borrow one) → upload key, then closed testing (12 testers × 14 days before production)
- [ ] Email sending (e.g. Resend) before inviting many families (Supabase's built-in email is rate-limited)

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
