# Architecture and backend contract

## Preview versus production

| Concern | Preview (this repository) | Production (next phase) |
| --- | --- | --- |
| Hosting | GitHub Pages, static `site/` | Static front end on any CDN; API on a small Node/edge service with a database |
| Data | `localStorage` key `rolevia.preview.v3` seeded with fictional learners | PostgreSQL/SQLite with migrations; encrypted backups; retention and deletion schedule |
| Messages | Preview inbox panel | Transactional email (e.g. SES/Postmark) and SMS provider for one-time codes; templates in `store.js` wording |
| Payments | Simulated success/declined | Payment provider checkout (Razorpay/Stripe), server-side order creation, signed webhooks, reconciliation before verification |
| Secrets | None; demo credentials are published on purpose | Environment variables only; never in the repository |

`site/app/store.js` implements every rule the API must keep. The front end calls it through
`ctx.api.<method>(payload)`; swapping in an HTTP client with the same method names is the only change
the pages need.

## API surface (same method names over HTTPS)

| Method | Purpose | Notes |
| --- | --- | --- |
| `requestContactCode`, `register`, `quote`, `pay`, `applicationStatus` | Registration before credentials | Email/phone confirmed by code, full profile fields validated server-side, payment required before verification; a human approves |
| `adminVerify`, `adminSetStatus` | Issue Student ID + temporary password; suspend/reject | ID format `RV-YY-0001`; temporary password sent to the learner only |
| `login`, `verifyOtp`, `me`, `logout`, `changePassword`, `requestReset`, `resetPassword` | Authentication | 6-digit OTP, 5-minute expiry, 5 attempts, password lockout after 5 failures |
| `dashboard`, `lessons`, `completeLesson`, `dailyQuiz`, `submitQuiz`, `completeLab`, `assignments`, `submitAssignment`, `leaderboard`, `badge`, `updateProfile`, `purchase`, `notifications`, `referralStatus` | Student portal | Points: 10 per correct answer, streak bonus, labs up to 50, graded scores, 5 per lesson |
| `adminOverview`, `adminTracker`, `adminCreateTask`, `adminUpdateTask`, `adminStudents`, `adminContent`, `adminUpsertLesson`, `adminDeleteLesson`, `adminUpsertAssignment`, `adminSubmissions`, `adminGrade`, `adminAnnounce`, `adminDeviceAlerts`, `adminResolveAlert`, `adminPayments`, `adminAudit` | Admin console | Permission-checked per role (`ROLES` in `store.js`); every mutation is audit-logged; tasks auto-open and auto-complete |
| `opsLogin`, `opsSummary`, `opsTeam`, `opsCreateAdmin`, `opsResetAdmin`, `opsSetAdmin`, `opsSaveNote` | Unlisted operations | Separate role; manages admin accounts; production uses server-side allow-list |

Preview-only helpers (`previewInbox`, `previewForeignLogin`, `previewReset`, `previewCredentials`)
must not exist in the production API.

## Sessions and devices

- A session is `{ token, userId, deviceId, deviceLabel, createdAt, lastSeen }`. The device identity is a random UUID stored on the device plus a readable label.
- Signing in revokes every other active session for the account. If the previous session was on a different device the account's `deviceSwitches` counter increments and a history entry is stored.
- At every `deviceSwitchThreshold` (default 5) the learner receives an in-app notification and an email ("You are using multiple devices"), and an admin alert opens.
- `me()` rejects a token presented from a different device (`DEVICE_MISMATCH`) or a revoked token (`SESSION_REVOKED`), which the front end turns into the "signed out on another device" screen. Sessions idle for 7 days expire.
- Production should additionally bind the device identity to a secure, httpOnly cookie, rate-limit by IP and account, and log sign-ins with coarse geolocation.

## Content pipeline

- Admin uploads recordings to private storage or an unlisted video host and pastes an `https://` link per lesson. The preview stores links only.
- Assignments accept text, an `https://` link and a file name in preview; production stores uploads in private object storage with virus scanning and per-learner access.
- Daily quizzes pick 5 of 8 questions per module deterministically from the date, so every learner sees the same set on a given day; one attempt per module per day.

## Deployment sequence

1. Keep this preview as the design reference and acceptance suite (`tests/`).
2. Implement the API with the same method names; reuse `tests/unit/store.test.mjs` as behavioural specs.
3. Add `HttpApi` in `site/app/context.js` and switch `ctx.api` by configuration; keep the preview adapter for demos.
4. Replace the preview banner and inbox with real messaging; enable real payments only after written terms, tax handling and refund paths are approved.
5. Move hosting from GitHub Pages to the chosen host; keep the GitHub Actions test gate.
