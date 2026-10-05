# ThinkSprout — TODO

Live app: https://thinksprout.pages.dev and https://erabhay02.github.io/gt-practice/ (both auto-deploy on every push to `main`; tests must pass first). iPhone/iPad: TestFlight.

## Next up — needs a parent
- [ ] Custom domain **thinksprout.astrala.us**: wait until the Astrala site / Nexus AI move is done (handled in a separate project), then Cloudflare → Workers & Pages → thinksprout → Custom domains → add it
- [ ] Sign in on every device the kids already use **at the github.io link** (uploads their local progress) before switching addresses
- [ ] Supabase: delete test user `thinksprout-pwcheck@example.com` (Authentication → Users); set minimum password length to 8 (Authentication → Sign In / Providers → Email)
- [ ] Review the Privacy Policy + Terms (`public/privacy.html`, `public/terms.html`); set up privacy@astrala.us (Cloudflare Email Routing → Gmail) or change the address
- [ ] Google Play: finish identity + phone verification; verify a real Android device in the Play Console app (a borrowed phone is fine)
- [ ] If not done yet: rename "My child" and set the test date (🔒 Grown-ups → Children), then add the 1st grader
- [ ] Confirm with each school: CogAT level (Level 7 = 1st grade, Level 8 = 2nd grade) and test dates

## Next up — Claude (after the items above)
- [ ] iPhone build 2 (iPad landscape fix is committed, not uploaded — upload only when asked)
- [ ] Make the repo private once thinksprout.astrala.us is live (this ends the github.io site)
- [ ] TestFlight external testers for invited families: needs the privacy URL on the new domain, a beta description, a contact email, then a ~1-day Beta App Review
- [ ] Android: create the upload signing key with the parent (kept on the Mac, never in the repo), build a release bundle, Play closed testing (12 testers × 14 days before production)
- [ ] Optional: stop the local Supabase Docker stack (`npx supabase stop`)

## Phase 2 — done
- [x] Database: parents, children, sessions, invite codes; row-level security; sign-up trigger redeems invites; account deletion (`supabase/migrations/0001_init.sql`)
- [x] Sign-in / create account with invite / emailed codes (6–10 digits) / password reset / "waiting for invite"; parent Account tab (sync now, sign out, delete account)
- [x] Local-first sync: works offline, merges devices (sessions never lost or doubled, newest edit wins, removals reach every device)
- [x] Supabase project "thinksprout" (us-east-1): 5 one-use invite codes; email via Twilio SendGrid from no-reply@astrala.us with code-based templates
- [x] Cloudflare Pages project "thinksprout" deployed by GitHub Actions (secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [x] Apple Developer membership (individual, erabhay02@gmail.com, team PFMBH72U95); App Store Connect app "ThinkSprout"; build 1.0 (1) on TestFlight — parent tested sign-in, password reset, practice, read-aloud
  - Next upload: bump CURRENT_PROJECT_VERSION in `ios/App/App.xcodeproj/project.pbxproj`; archive unsigned (`CODE_SIGNING_ALLOWED=NO`), then `xcodebuild -exportArchive` (method app-store-connect, destination upload, `-allowProvisioningUpdates`) — no registered device needed
- [x] iPad: all orientations allowed (iPadOS 26 ignores UIRequiresFullScreen and letterboxes portrait-only apps); iPhone stays portrait
- [x] Android app project (Capacitor, `android/`): adaptive icon, launch screen, portrait; runs in the emulator. Build with JDK 21 (`~/.jdks/jdk-21.*`) — Android Studio's bundled Java 25 is too new for Gradle 8.14

## Phase 3 — subscriptions
- [ ] RevenueCat on Apple/Google in-app purchases; free tier vs full access; paywall behind the parental gate
- [ ] Store listings (no "CogAT" in the name; trademark disclaimer), age rating, App Store privacy questionnaire, App Review
- [ ] App Store Connect: Paid Apps agreement, banking and tax forms (needed before subscriptions)

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
