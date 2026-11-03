# Architecture and backend contract

## Preview versus production

| Concern | Preview (this repository) | Production (next phase) |
| --- | --- | --- |
| Hosting | GitHub Pages, static `site/` | `server/api.mjs` on any Node host (serves the site, API and `/ws`), or static site + API with `ROLEVIA_ALLOW_ORIGIN` |
| Data | `localStorage` key `rolevia.preview.v6` seeded with fictional learners (placeholder contacts; no internal economics) | `fileStorage` JSON or `githubStorage` (private repo file) now; a relational database later if volume grows |
| Messages | Preview inbox panel | Transactional email (e.g. SES/Postmark) and SMS provider for one-time codes; templates in `store.js` wording |
| Payments | Simulated success/declined | Payment provider checkout (Razorpay/Stripe), server-side order creation, signed webhooks, reconciliation before verification |
| Secrets | None; demo credentials are published on purpose | Environment variables only (`GITHUB_TOKEN`, `ROLEVIA_OPS_PASSPHRASE`, webhook URL); never in the repository |
| Recordings / course files | Downloaded `.webm`; links pasted | Google Drive (restricted sharing) or GitHub Releases via links; direct Drive upload with the host's OAuth consent |

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
- Accounts with a temporary password receive `PASSWORD_CHANGE_REQUIRED` from every method except `me`, `changePassword` and `logout` until a new password is set.
- Device alerts and review tasks are raised for students; staff accounts still follow the one-active-device rule and receive the security notice.
- Production should additionally bind the device identity to a secure, httpOnly cookie, rate-limit by IP and account, and log sign-ins with coarse geolocation.

## Live classes

- Scheduling, attendance, live quizzes and recordings are domain data (`state.classes`) with API methods `classes`, `classAccess`, `joinClass`, `leaveClass`, `classQuizAnswer`, `classQuizStatus`, `adminClasses`, `adminClassDetail`, `adminUpsertClass`, `adminSetClassStatus`, `adminPushQuiz`, `adminCloseQuiz`, `adminAddRecording`, `adminNoteChat`.
- Real-time traffic uses a transport interface (`site/app/classroom/transport.js`): `createLocalTransport` (BroadcastChannel, preview) or `createSocketTransport` (WebSocket to `server/signal.mjs`). The relay stamps `from`, `role` and `name` from the verified session; the room UI honours host-only message types only from `role: "host"`. Envelope: `{ room, from, role, name, to?, type, payload, at }`. The relay authorises every socket through `classAccess` and announces `peer-left`.
- Media is a WebRTC mesh (`site/app/classroom/rtc.js`) using perfect negotiation per pair; screen share is a second stream identified by stream id in presence messages. Default ICE is public STUN; add TURN through `iceServers` for restrictive networks.
- Live quiz: host `adminPushQuiz` → broadcast `quiz` (answer key stripped) → learner `classQuizAnswer` → broadcast `answered` → host `classQuizStatus` → host `adminCloseQuiz` → broadcast `quiz-close` → learner `classQuizStatus` for own points. Closing a class closes open quizzes and attendance and completes the host task.
- Recording (`site/app/classroom/recorder.js`): canvas composite + Web Audio mix → MediaRecorder → IndexedDB chunks → `.webm` download, optional resumable upload to Google Drive (`drive.js`, OAuth implicit flow, scope `drive.file`) → `adminAddRecording` link.

## Server and storage

`server/api.mjs` hosts the same core (`createMockServer` with `seedMode: "empty"` and `payments: "manual"`, so `pay`/`purchase` record a transfer request that `adminConfirmPayment` activates) behind `POST /api/<method>`, blocks preview-only methods, maps `ApiError` codes to HTTP statuses, serves `site/` and `/config.json`, relays `/ws`, and forwards outgoing messages to `ROLEVIA_NOTIFY_WEBHOOK`. Storage adapters (`server/storage.mjs`): `fileStorage` (JSON on disk) and `githubStorage` (private repository file via the contents API with blob-SHA concurrency, debounced writes, conflict retry). State carries a `rev` counter so browser tabs and the server detect staleness cheaply.

## Content pipeline

- Admin uploads recordings to private storage or an unlisted video host and pastes an `https://` link per lesson; small slides/worksheets can be attached directly.
- Assignments and lesson materials accept text, `https://` links and files; the preview stores files up to 400 KB (base64, with a client-computed SHA-256 recorded as metadata) and records larger files by name. Production stores uploads in private object storage with server-side checksums, virus scanning and per-learner access.
- Daily quizzes pick 5 of 8 questions per module deterministically from the date, so every learner sees the same set on a given day; one attempt per module per day.

## Deployment sequence

1. Keep this preview as the design reference and acceptance suite (`tests/`).
2. Implement the API with the same method names; reuse `tests/unit/store.test.mjs` as behavioural specs.
3. Add `HttpApi` in `site/app/context.js` and switch `ctx.api` by configuration; keep the preview adapter for demos.
4. Replace the preview banner and inbox with real messaging; enable real payments only after written terms, tax handling and refund paths are approved.
5. Move hosting from GitHub Pages to the chosen host; keep the GitHub Actions test gate.
