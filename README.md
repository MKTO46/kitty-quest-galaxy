# Kitty Quest · Galaxy Autopilot V3.2

A separate **phone web app**, preserving the approved TRIAL galaxy design. This is not ESP32 firmware.

## Install on your phone

Open the published GitHub Pages URL once while online and wait for **OFFLINE READY**.

- **iPhone:** Safari → Share → Add to Home Screen → Add.
- **Android:** Chrome → menu → Install app / Add to Home screen.

Launch from the home screen. First visit and app updates need internet. After the cache is ready, the installed app and saved records work offline. No external fonts, CDN, sign-in, accounts or cloud sync.

## Train

HOME automatically chooses the day's emphasis. IRON presents one set at a time: 12 easy, 10 master, 8 challenge reps, for three rounds per movement. Initial loads are estimates; adjust with +/− and confirm the comfortable stage load once. These are not verified personal lifts. Actual reps can differ from the automatic target. Keep controlled form, leave a few reps in reserve, and stop for pain. Saturday is light technique; Sunday has no strength session. The 125 lb October lat pulldown goal is aspirational, never an automatic load prescription.

Each saved set advances to RECOVERY. READY continues, MORE REST extends the countdown, and STOP / FINISH ends safely with saved partial records. Completion never restarts a workout on the same day.

RUNNING prescribes jog/walk, controlled field shuttles, or easy walk/mobility according to the day. Intervals advance automatically. Start, pause, resume, add 30 seconds, then finish/save. An active session resumes after reload and keeps its original day. Timer time continues while the app is backgrounded; paused time is excluded. Walk whenever needed. Partial sessions retain their actual time, but do not claim full prescribed completion.

PROGRESS displays only actual saved records. Assisted pull-up records use the least assistance. CALENDAR glows white only after completed strength (or planned Sunday recovery) and prescribed movement; ♡ marks planned recovery. Tap any date or use the recap arrows for older summaries.

The photo-ready recap opens automatically once per device-local day when the app is open at or after 10 PM. If closed at 10 PM, it appears on the next opening after 10 PM that day. Browsers cannot reliably open a closed app at exactly 10 PM. Today's Recap is available anytime.

## Your records and backup

Records, confirmed loads, active workouts, intervals, timers and recap state live in IndexedDB **on this device only**. GitHub hosts public app code, never workout data. Clearing browser/site data, uninstalling, or switching browsers/devices may remove/separate records. Storage errors are shown, not silently reset.

PROGRESS → Local backup → EXPORT JSON saves a portable backup. IMPORT JSON validates a chosen backup and asks before replacing local records. Export first to keep the previous records. Use one training tab at a time; browsers supporting Web Locks prevent a second tab from writing stale data. On older browsers, close other tabs manually.

Updates install into a versioned service-worker cache and wait until existing app windows close. An update notice tells you to reopen after your session. Bump the service-worker VERSION when shipping changed assets. Updates do not clear training data. Legacy prototype records from `trial_autopilot_v3` migrate once; old completion flags are not treated as proof of finished training.

## Local development

Requires Node.js 24; no dependencies to install.

```sh
node scripts/icons.mjs
npm run build
npm test
npm start
```

Open `http://127.0.0.1:4173/kitty-quest-galaxy/`. PWA service workers require HTTPS or localhost, not opening HTML as a file.

Source is `src/`; deployment output is `dist/`. The original approved HTML and handoff are retained in `reference/`. Build copies its CSS verbatim, then adds accessibility, safe-area and reduced-motion support.

`.github/workflows/pages.yml` tests, builds and deploys `dist/` with GitHub Actions when Pages is configured to use **GitHub Actions**. Public static source; no secrets or personal history.

See `TEST_RESULTS.md` for completed checks and device verification limits.
