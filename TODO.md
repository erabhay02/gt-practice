# ThinkSprout — TODO

Live app: https://thinksprout.pages.dev and https://erabhay02.github.io/gt-practice/ (both auto-deploy on every push to `main`; tests must pass first). iPhone/iPad: TestFlight.

## Content expansion (2026-10-10, DONE — committed locally, not pushed)
- [x] **Phase 1 of a broader improvement/expansion plan, fully complete** (full plan: ask
  to see it, or it covers — in order — content depth, privacy-safe usage insight, CogAT
  Levels 11/12, score context, an accessibility pass, OLSAT/NNAT3, growth/referral, then
  monetization and a classroom tier last, as requested). Seven/eight rounds of
  hand-authored additions across all 6 content banks (`src/content/banks/`), each
  appended at the true end of its file's `RAW_ITEMS` array (never interleaved) so
  existing items keep their index-based ids — real kids' "already seen" exclusion
  history depends on that. Final counts vs. the original baseline (doubling target in
  parens), all met or exceeded:
  - verbal-analogy: 142/142 — exact 2x
  - verbal-classification: 110/110 — exact 2x
  - sentence-reading: 116/116 — exact 2x
  - picture-analogy: 182/182 — exact 2x
  - picture-classification: 141/132 — exceeded
  - sentence-completion: 148/148 — exact 2x (new audio recorded locally via
    `scripts/generate_audio.py`'s offline Piper TTS pipeline each round that touched it)
  Closing the gap on the three emoji/picture-based banks took more rounds than the
  word-based ones, since fresh, unambiguous, single-concept emoji are a scarcer resource
  than English vocabulary — the last push leaned on adding fresh non-duplicate example
  sets under *existing* category labels (e.g. a second, different "fruits" item), which
  is valid since the bank's uniqueness rule is on the example set, not the category name.
  Updated the grade 1/2 locked-content fingerprint test
  (`locked-grades.regression.test.ts`) each round it touched grade 1/2 content. Full
  suite (151 tests) passing, including the audio-coverage check.
- [ ] Waiting on a future push + the Android/iOS build-and-submit cycle that goes with it
  (content changes alone don't need a native rebuild, but bundling with whatever else
  ships was the plan).
- [x] **Phase 2, fully complete (2026-10-10): privacy-safe usage insight.** Migration
  `supabase/migrations/0003_usage_insights.sql` adds a security-definer function
  `public.usage_insights()` (same pattern as `has_access()` in `0001_init.sql`) that
  rolls the existing `sessions` table up into weekly counts by grade/sub_type/kind. No
  `parent_id`, `child_id`, session id, or child name/avatar in the output, and a
  `having count(*) >= 3` clause so a single family's activity can't be singled out from
  a sparse bucket. Applied to the live `thinksprout` project and verified directly:
  - `select * from usage_insights();` returns only aggregate rows — ran it live and got
    exactly one row (grade 2, paper-folding, practice, 3 sessions, 62.5% avg accuracy);
    every other grade/sub_type/kind bucket is still below the suppression threshold on
    the current small dataset, which is itself a sign the suppression is doing its job.
  - `information_schema.routine_privileges` confirms EXECUTE is granted only to
    `postgres` and `service_role` — no `anon`/`authenticated` grant, so the app's public
    keys cannot call it at all. Owner-only, as intended; no app code calls this.
  - `public/privacy.html` updated with an honest disclosure that aggregate,
    de-identified usage counts are reviewed internally, and the "last updated" date
    bumped to October 10, 2026.
  Exposure is the SQL editor only for now (per the plan: "start with the SQL-editor
  route; build UI only if that proves insufficient") — no admin UI built.
- [ ] **Phase 3, in progress (2026-10-10): CogAT Levels 11/12 (5th/6th grade).**
  Plumbing is done and tested: `Grade` extended to 0–6, `LEVELS`/`GRADES` in
  `levels.ts` have 5/6 entries (mirroring grade 4's item counts — Riverside's specs
  give Levels 9–12 the same subtest structure), `contentLoader.ts`'s `BANKS` wired up,
  every UI component already drives off `LEVELS`/`GRADES` with no hardcoded ceiling so
  none needed changes. Generator difficulty genuinely raised for 5/6, not just grade
  4's curve reused: `upperGradeDifficulty()` always serves the hardest figural tier,
  and `numberGenerators.ts`'s rule/analogy/series/puzzle generators start where grade
  4's hardest difficulty left off. Full suite (151 tests, `newGrades.test.ts` extended
  to exercise grades 5/6 too) passing; `tsc -b` clean.
  - Added genuinely harder (not just copied) hand-authored content tagged
    `grades:[5,6]`, across two batches (2026-10-10): verbal-analogy 15→**40**,
    verbal-classification 12→**33**, sentence-reading 12→**37** — on top of
    everything grade 3/4 already has (same cumulative-tier pattern already used for
    grade 3 → grade 4). The exclusive grade-5/6 tier is now comparable in size to
    grade 4's own exclusive tier (37–41 items). Every item checked against the
    file's existing content for exact/near-duplicate word pairs, example sets, or
    sentences before adding — a few draft items were caught and replaced for
    exactly that reason.
  - **Not done yet**: still short of full Level 11/12 depth (nowhere near grades
    0–4's post-Phase-1 item counts) — continuing to build this out is its own
    standing task, same as the three emoji-based banks were in Phase 1.
    **Nobody has verified any of this against real released Level 11/12 practice
    materials** — the plan's own stated bar before calling this "matching the real
    format."
  - [x] `supabase/migrations/0004_grades_5_to_6.sql` applied to the live `thinksprout`
    database and verified directly (`children_grade_check` now reads
    `grade >= 0 AND grade <= 6`). The app's grade picker now genuinely lets a parent
    select 5th/6th grade for a real child end to end.

- [x] **Phase 4, fully complete (2026-10-10): score context.** Researched first, per
  the plan's own bar: Riverside publishes the general CogAT score *scale* (Standard
  Age Score mean 100/SD 16, Age Percentile Rank 1–99, stanine breakdown) in
  parent-facing explainer PDFs, but the actual age-adjusted norm tables are
  proprietary and never published — there's no legitimate way to translate
  ThinkSprout's own practice-accuracy percentage into a real percentile, since
  practice items aren't age-normed against a national sample. Took the plan's
  explicit fallback instead of inventing a fake calibration: `ProgressDashboard.tsx`
  now shows an always-visible "this is a practice score, not a CogAT score"
  disclaimer right below the score legend (there was previously none anywhere near
  the actual score display — only a generic trademark note on a separate Settings
  screen), plus a collapsible "What does a real CogAT score look like?" explainer
  with genuinely useful, publicly sourced context on the SAS/percentile scale, so
  parents have something real to calibrate against once they get an actual school
  report. `tsc -b` clean, full suite (151 tests) passing, dev server boots cleanly.
  **Not verified in an actual browser session** (no browser automation tool
  available) — worth a quick manual look in Parent Area → Progress before shipping.

- [x] **Phase 5, fully complete (2026-10-10): accessibility pass on figural items.**
  Ran the dataviz skill's `validate_palette.js` (OKLab ΔE under simulated
  protan/deutan/tritan vision) on `shapePalette.ts`'s 5-color `COLORS` array —
  measured, not eyeballed. Found two real failures (blue/purple: ΔE 0.9, a
  near-total collision under deuteranopia; green/amber: ΔE 5.7, a hard fail under
  protanopia) and one borderline pair (red/green: ΔE 7.4). This mattered because
  `matrixGenerator.ts`'s easiest items can pick color as the *one* changing
  attribute, making an item solvable only by telling two specific colors apart.
  Replaced the palette with one where all 10 pairs clear the CVD floor, the
  normal-vision floor, and contrast (blue #4C6FEB, purple #7E22CE, magenta
  #DC267F, red #991B1B, gold #D97706); the one pair still at the "legal only with
  secondary encoding" floor (blue/purple) gets a dashed outline ring in
  `primitives.tsx` regardless of fill type, so it's never color-alone. Also fixed
  `ContentTile.tsx`'s separately-duplicated bead-color array (now imports
  `COLORS` instead of drifting) and `numberGenerators.ts`'s two hardcoded
  algebra-symbol colors. Updated 5 locked-content fingerprint hashes (matrix +
  classification for grades 1/2, number-puzzle for grade 2 only). Scoped to the
  color system specifically, per the plan — did not do a separate font/contrast
  pass on the rest of the UI this round.

- [x] **Bundled small polish items (2026-10-10), not part of the phase plan:**
  - A one-time "how to practice" walkthrough before a child's very first-ever
    session (regular practice, not just mock tests, which already had per-part
    examples) — `QuizRunner`'s new `showWelcome` prop, driven by
    `sessions.length === 0`, no new persisted state.
  - A small celebration (🔥 badge + confetti) when a session's completion reaches
    a streak milestone (3/7/14/30/50/100 days) — `STREAK_MILESTONES` in
    `progressStore.ts`, `QuizRunner`'s new `milestoneStreak` prop.
  - Closes out the old **"Ideas for later"** item *"Scores are practice
    percentages, not CogAT scores (no age norms/percentiles)"* — that's exactly
    what Phase 4 above fixed.
  - None of these three were verified in an actual browser session (no browser
    automation tool available this session) — worth a few minutes of manual
    click-through (a brand-new profile's first practice session; a seeded
    multi-day streak) before shipping.

## Next up — needs a parent
- [ ] Custom domain **thinksprout.astrala.us**: wait until the Astrala site / Nexus AI move is done (handled in a separate project), then Cloudflare → Workers & Pages → thinksprout → Custom domains → add it
- [ ] Sign in on every device the kids already use **at the github.io link** (uploads their local progress) before switching addresses
- [ ] Supabase: delete test user `thinksprout-pwcheck@example.com` (Authentication → Users); set minimum password length to 8 (Authentication → Sign In / Providers → Email)
- [ ] Review the Privacy Policy + Terms (`public/privacy.html`, `public/terms.html`); set up privacy@astrala.us (Cloudflare Email Routing → Gmail) or change the address
- [ ] If not done yet: rename "My child" and set the test date (🔒 Grown-ups → Children), then add the 1st grader
- [ ] Confirm with each school: CogAT level (Level 7 = 1st grade, Level 8 = 2nd grade) and test dates

## Next up — Claude (after the items above)
- [ ] iPhone build 2 (iPad landscape fix is committed, not uploaded — upload only when asked)
- [ ] Make the repo private once thinksprout.astrala.us is live (this ends the github.io site)
- [ ] TestFlight external testers for invited families: needs the privacy URL on the new domain, a beta description, a contact email, then a ~1-day Beta App Review
- [ ] Android closed testing: at least 12 testers opted in for 14 days in a row before Google allows production (personal accounts). Needs store listing basics + app content forms first
- [ ] Optional: stop the local Supabase Docker stack (`npx supabase stop`)

## Grades K–4 (2026-10-05) — on the web; not yet in the store builds
- [x] Kindergarten (CogAT Level 5/6): picture format like 1st grade, easier (amounts up to 5, one change at a time, one fold/one hole), K-only picture items, no NOT questions
- [x] 3rd and 4th grade (Levels 9 and 10): reading-based verbal parts (Verbal Analogies, Sentence Completion with a written sentence, Verbal Classification), written-number quantitative parts (number-pair rules, number series, equations incl. ×/÷ and shape symbols), 2nd-grade figure rules one step harder; Level 9/10 test lengths (22/20/20, 18/16/18, 22/16/22) and the official 10 minutes per part when the timer is on
- [x] 1st- and 2nd-grade content locked by fingerprint tests (unchanged); database accepts grades 0–4 (`supabase/migrations/0002_grades_k_to_4.sql`, applied)
- [x] Privacy Policy rewritten (all grades, apps, SendGrid/Cloudflare/GitHub, COPPA rights, security, changes); removed-child records on the server keep no name/details
- [x] iPhone build 1.0 (2) uploaded to TestFlight 2026-10-05 (grades K–4 + iPad landscape fix); Android versionCode 2 built and signed (`~/Desktop/ThinkSprout-1.0-build2.aab`) for the parent to upload to Internal testing
- [x] Build 3 (2026-10-10): Phases 3–5 + bug fixes (blank matrix tile, purple shape cue, results copy). iOS 1.0 (3) uploaded to TestFlight 2026-10-10; Android versionCode 3 signed (`~/Desktop/ThinkSprout-1.0-build3.aab`) for the parent to upload to Internal testing
- [ ] ⚠️ Build 1 only knows grades 1–2: update every device to build 2 before adding a K/3rd/4th-grade child
- [ ] Have a teacher/parent skim the new 3rd/4th-grade word items; K/1st practice-test lengths are approximate

## Phase 2 — done
- [x] Database: parents, children, sessions, invite codes; row-level security; sign-up trigger redeems invites; account deletion (`supabase/migrations/0001_init.sql`)
- [x] Sign-in / create account with invite / emailed codes (6–10 digits) / password reset / "waiting for invite"; parent Account tab (sync now, sign out, delete account)
- [x] Local-first sync: works offline, merges devices (sessions never lost or doubled, newest edit wins, removals reach every device)
- [x] Supabase project "thinksprout" (us-east-1): 5 one-use invite codes; email via Twilio SendGrid from no-reply@astrala.us with code-based templates
- [x] Cloudflare Pages project "thinksprout" deployed by GitHub Actions (secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [x] Apple Developer membership (individual, erabhay02@gmail.com, team PFMBH72U95); App Store Connect app "ThinkSprout"; build 1.0 (1) on TestFlight — parent tested sign-in, password reset, practice, read-aloud
  - Next upload: bump CURRENT_PROJECT_VERSION in `ios/App/App.xcodeproj/project.pbxproj`; archive unsigned (`CODE_SIGNING_ALLOWED=NO`), then `xcodebuild -exportArchive` (method app-store-connect, destination upload, `-allowProvisioningUpdates`) — no registered device needed
- [x] iPad: all orientations allowed (iPadOS 26 ignores UIRequiresFullScreen and letterboxes portrait-only apps); iPhone stays portrait
- [x] Google Play developer account verified (identity, phone, device); Play Console app "ThinkSprout" (`us.astrala.thinksprout`); build 1.0 (1) on Internal testing, 2026-10-05
  - Internal testing track: https://play.google.com/console/u/0/developers/5576492736591040075/app/4973348788680510983/tracks/4701726088458995866?tab=releases (a new release stays a Draft until "Save and publish"; check Publishing overview for unpublished changes)
  - Upload key: `~/.thinksprout/` (outside the repo, created by `scripts/create-android-upload-key.sh`; parent has the password). Google manages the app signing key
  - Next upload: bump `versionCode` in `android/app/build.gradle`; `npm run build && npx cap sync android`; `ANDROID_HOME=~/Library/Android/sdk JAVA_HOME=~/.jdks/jdk-21.*/Contents/Home ./gradlew bundleRelease` in `android/` (no `local.properties`, so the SDK path must be passed); upload `app/build/outputs/bundle/release/app-release.aab` in Play Console
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
