# CODEX: CREATE AND BUILD KITTY QUEST — OFFLINE PHONE WEB APP

## YOUR RESPONSIBILITY — IMPORTANT
**YOU (CODEX) MUST CREATE THE NEW GITHUB REPOSITORY. THE USER IS NOT CREATING IT.**
Use the GitHub account connected to your Codex session. Create a new repository named `kitty-quest-galaxy-autopilot` (or the closest available name if taken), initialize it, commit the completed source, configure GitHub Pages, and provide the user the actual repository URL and published Pages URL. Do not tell the user to create the repo, upload files, or write code. You are responsible for implementation, testing, committing and deployment setup. If your GitHub permissions truly cannot create repos or configure Pages, state the exact permission limitation and provide the exact one-click authorization step required. Do not pretend deployment succeeded.

## SCOPE — NOT THE ESP32
This project is **a separate offline-first installable PHONE web application (PWA)**. NOT firmware, NOT Arduino, NOT ESP-IDF, NOT flashing, and NOT the physical ESP32. The ESP32 version is being developed separately by Cal. Do not conflate these builds.

## APPROVED VISUAL REFERENCE
`TRIAL_Galaxy_Autopilot_V3_2_Daily_Recap.html` is the user's *approved* Galaxy V3.2 look and interaction reference. The user has explicitly approved its deep dark purple/black nebula, dark navy blue, bright white accents, moving stars, slow bouncing silver-white NON-INTERACTIVE cross, extraordinarily transparent outlined glass bubble panels/buttons with pop/burst animation, phone-friendly controls, clock, and exact overall visual character. **DO NOT REDESIGN, RECOLOR, OR REPLACE IT WITH A GENERIC DASHBOARD.** Preserve aesthetics and navigation; fix defects and improve underlying architecture only.

## EXPERIENCE — AUTOPILOT, NOT FORMS
The app decides the current day's workout focus, the next exercise, stage, round, target reps, weight suggestion, prescribed run/walk/shuttle and duration. The user wants to tap buttons and train, not pick among lists or type notes. Show ONE next action at a time, with an obvious progress indicator. Preserve 12 easy reps -> 10 mastered -> 8 challenging reps, up to three rounds as approved, with adjustable weights and +/- actual reps, accurate resume/save. Do not invent real personal strength history; placeholder weights in reference are NOT verified lifts. Add a single low-friction baseline confirmation or correction before using an unverified initial load, and remember adjustments offline. 125 lb lat pulldown is an aspirational late-October target, not a prescribed starting load. Auto-advance correctly, never endlessly restart after completion.

## MODULES TO IMPLEMENT — ALL FUNCTIONAL
1. HOME: today/date/focus picked automatically, clock, module navigation, on-demand Today's Recap.
2. IRON: daily rotating emphasis across back, chest, arms, shoulders, core; all areas worked at sensible varying effort, mindful of recovery. Persist every real set: timestamp/day, movement, stage, round, target/actual reps, resistance, completion. Weight and rep +/- controls. Sunday can be recovery/field focused.
3. RECOVERY: only READY (continue workout), MORE REST (extends a visible functioning countdown), STOP/FINISH (ends safely). No feelings, notes, or form input.
4. RUNNING + FIELD: app automatically prescribes manageable jogging/walking and field shuttle/suicide out-and-back intervals, varied across the week; include start, pause, resume, +30 sec/more, finish/save; track elapsed time and intervals without asking for distance/effort. Avoid forcing daily sprints; easy movement days count. Running helps user's sleep.
5. PROGRESS: only true saved records, PRs and totals; no fake demo entries or made-up metrics.
6. CALENDAR: auto-highlight current date; finished training days glow bright WHITE, uncompleted days remain DARK; distinguish planned rest from skipped sessions. Persist state correctly across days/timezones.
7. TIMER: start/pause/reset/+30 SEC; +30 works during countdown and when paused; no jumpy reset on rendering.
8. 10 PM DAILY RECAP: automatically show photo-ready summary when app is OPEN at 10:00 PM local device time; if closed/backgrounded, show when next opened after 10 PM. Manual Today's Recap button anytime. Display actual exercise sets/reps/weights, running/shuttle durations, workout totals, sensible completion badges; no fabricated history. Legible portrait screenshot layout. Include older recap viewing without adding unwanted Notes/Files tabs.

REMOVE/DO NOT ADD: Notes, Calculator, Files, Settings, manual weekly-focus selector, manual exercise picker, manual stage/round picker, text feeling/form notes, distance input, subjective effort input, internet accounts, cloud sync, required sign-in, WIFI-dependent runtime.

## OFFLINE-FIRST PWA / GITHUB PAGES
- Build installable static PWA: `index.html`, proper `manifest.webmanifest`, locally generated icons, versioned service worker precache and updates, no external network/CDN/font dependency. Use relative URLs with GitHub Pages repository subpath (e.g. `/kitty-quest-galaxy-autopilot/`), handle start_url/scope correctly.
- Reliable IndexedDB workout data, schema migrations, persisted in-flight workouts, and running progress. No silently resetting logs. Browser's private data remains ONLY ON THE DEVICE; GitHub does not store workout data. User can optionally export/import local JSON backups through an unobtrusive action without a Files tab, though UI should remain unchanged.
- Accessible phone-sized tap targets and navigation that never visually overlaps or misses touch. Preserve GPU-friendly CSS bubbles and cross; reduce motion when system preference requests it.
- Respect offline limitations: first visit and updates require internet; installed app and data work offline after assets cached. Do not claim an auto-popup fires at exactly 10 PM while browser is closed.
- Avoid unsafe exercise progression and excessive daily failure; recovery days and user's reported under-fueling should be respected. Prompts should never force pushing through pain.

## TEST AND SHIP — MANDATORY
- Create the new GitHub repo YOURSELF, push/commit full functioning code, and configure GitHub Pages if authorized.
- Run automated or scripted tests for workout state transitions, 12/10/8 and 3-round sequencing, reload persistence, +/- reps/weight, Recovery READY/MORE REST/STOP, timer +30 while running/paused, shuttle interval transitions, calendar day completion, and recap aggregation. Run production build if applicable.
- Test PWA offline mode, install manifest, service-worker scope, reload and navigation in a real browser test environment when available; document any tests requiring a physical phone.
- Return the REAL GitHub repository link, actual live Pages link **only if confirmed**, test results, and any remaining issues. Do not just return another specification or an incomplete scaffold. Do not announce success before tests.
- Make a `README.md` giving straightforward install-on-phone instructions (iPhone: Safari → Share → Add to Home Screen; Android: Chrome → Install app/Add to Home screen), basic operation, offline behavior, data privacy, and backup steps.

## START IMMEDIATELY
1. Inspect the supplied approved HTML carefully.
2. Create the GitHub repo using YOUR GitHub connection.
3. Implement the app and test it.
4. Push commits; enable Pages if possible.
5. Report actual working links and tested features. The USER is not responsible for creating or uploading to a repo.
