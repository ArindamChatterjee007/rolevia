# Rolevia Business Skills Studio · web preview

Premium dark-theme web application for Rolevia: public site, student portal, admin console and an
unlisted operations view. This repository is the **preview edition**: a static site with an
in-browser mock backend, so every flow is clickable on GitHub Pages without a server, real payments
or real messages.

- Live preview: https://arindamchatterjee007.github.io/rolevia/ (deployed by GitHub Actions after tests pass)
- Backend contract and hosting plan: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Security model (OTP, one active device, verification): [docs/SECURITY.md](docs/SECURITY.md)

## What is in the preview

| Area | Route | Highlights |
| --- | --- | --- |
| Public site | `#/`, `#/skills`, `#/pricing`, `#/demo`, `#/leaderboard`, `#/faq` | Orbiting skill modules, animated counters, company-name marquee (no logos), moving principles ticker, interactive demo calculator, INR/USD pricing |
| Registration | `#/register` | Details → choose skills → review and **pay first** → awaiting human verification |
| Student sign-in | `#/login` | Student ID or email + password → 6-digit one-time code → single active device |
| Student portal | `#/portal/*` | Dashboard, lessons, 8 interactive labs, daily quiz with streaks, assignments, leaderboard with LinkedIn badge sharing, add-ons and career kit, profile picture, password and device security |
| Admin console | `#/admin/*` | Role-based: tracker and task queue, verify registrations and issue credentials, lessons/assignments with file attachments, grading queue with downloads, device alerts, payments, announcements, audit log |
| Live classroom | `#/classroom/:id` | Built-in video room (camera, mic, screen share) over WebRTC, chat, hand raise, reactions, live quiz pushed to every screen with countdown and live results, host-side composite recording, attendance; or an external meeting link with Rolevia chat/quiz alongside |
| Operations (unlisted) | `#/ops` | Funnel, INR/USD preview collections, cohort fill, admin team management, founder notes. Unlisted is not private; see SECURITY.md |

Preview accounts (fictional, shown in the on-page preview inbox): student `RV-26-0001` / `Learn#2026`;
admins `RV-ADM-001` (programme lead), `RV-ADM-002` (learning & content manager), `RV-ADM-003`
(student success & verification) with the temporary passwords listed in the preview inbox panel; operations
passphrase `ROLEVIA-OPS-PREVIEW`. Admins must set a new password at first sign-in. One-time codes and
credential emails appear in the **preview inbox** (bottom-right button). Both sign-in pages also show a
**Preview shortcut** card: one click signs in as a demo student or admin and enters the one-time code for
you (it keeps the published demo password). The card exists only in preview mode; live mode has no
shortcuts and never shows credentials.

### Admin roles and the tracker

| Role | Can do | Cannot do |
| --- | --- | --- |
| Programme lead | Everything, including revenue, audit log and creating or assigning tasks to any role or person | — |
| Learning & content manager | Upload lessons (links + files), create assignments, grade, announce, work tasks for the content role (and create tasks for itself) | Verify students, see contact details, payments, revenue, alerts or audit |
| Student success & verification | Verify paid registrations and issue IDs, suspend/reactivate, review device alerts and payments, work tasks for the success role | Edit lessons/assignments, grade, announce, see revenue or audit |

The tracker (`#/admin/tracker`) shows the registration pipeline (unpaid → awaiting verification → active),
learner progress (lessons, quiz days, labs, assignments, points, last activity, device switches) and the task
queue. Tasks are created automatically when a payment succeeds (verify), an assignment is submitted (grade)
or a device alert opens (review), and complete themselves when the work is done (they cannot be ticked off
manually). The lead can create and assign custom tasks to anyone; other roles can only create tasks for
their own role or themselves. The founder manages admin accounts (create, reset password, suspend, change
role) in the operations view. Every admin must replace the temporary password before any other action.

### Live classes

Admins with the `classes` permission (programme lead, learning & content manager) schedule classes per
skill module (`#/admin/classes`): title, start time, duration, host, built-in room or external meeting link.
Enrolled students are notified and can enter the room 15 minutes before the start. Inside the room:

- **Video**: camera/mic with mute controls, screen sharing, pin-to-stage, peer-to-peer WebRTC (mesh; fine for the proposed 12-learner cohorts).
- **Live quiz**: the host sends a question from the module bank or writes a custom question/poll with a 30–90 s timer; it appears on every participant's screen; the host watches answers arrive, then closes and reveals. Correct answers earn 10 points, participation 2, counted on the leaderboard.
- **Chat, hand raise, reactions, "ask to mute"**, participant roster with status.
- **Recording** (host): a composite of the shared screen (or camera grid) plus mixed audio, encoded in the browser and buffered in IndexedDB. On stop the host downloads the `.webm`, or uploads straight to their Google Drive when `googleClientId` is configured, and attaches the link to the class so students see "Watch recording".
- **Attendance** is recorded when each learner joins/leaves from their own account; the class detail page shows attendance minutes, every live question's distribution and per-student answers, and recordings.

In the GitHub Pages preview the room connects **tabs in the same browser** (BroadcastChannel signalling), so you
can demo host + learners side by side (sessions are per tab). Cross-device classes need the signalling server
below (`signalUrl`), and real-world networks may also need a TURN server (`iceServers`).

### Running it for real: the Node server (GitHub as the database)

`server/api.mjs` runs the same domain logic behind an HTTP API, serves `site/`, relays class signalling on
`/ws`, and persists state through a storage adapter:

```sh
npm install
# JSON file on disk (simple VPS)
ROLEVIA_OPS_PASSPHRASE='a-long-founder-passphrase' PORT=8080 node server/api.mjs
# GitHub as the database: one JSON file in a PRIVATE repository, written through the contents API
ROLEVIA_STORAGE=github GITHUB_REPO=owner/rolevia-data GITHUB_TOKEN=... \
ROLEVIA_OPS_PASSPHRASE='a-long-founder-passphrase' node server/api.mjs
```

Production starts **empty** (no fictional people): the founder signs in at `#/ops/login` with the passphrase,
creates the admin accounts, and shares each Admin ID + temporary password privately. The served
`/config.json` points the site at the API (`apiBase: "/"`) and the relay (`signalUrl: "/ws"`).

**Payments without a provider.** The live server runs in *manual* payment mode: a student's "pay" step
records a quote and emails bank-transfer / UPI instructions with a payment reference
(`ROLEVIA_PAYMENT_INSTRUCTIONS` holds your account details text); nothing is activated until an admin with
the payments permission confirms the transfer on the Payments page, which then triggers the normal
verification task. The preview's simulated card payments (`ROLEVIA_PREVIEW=1`) are refused in live mode.

Optional env: `ROLEVIA_NOTIFY_WEBHOOK` (every outgoing email/SMS is POSTed as JSON to your mail/SMS
automation), `ROLEVIA_GOOGLE_CLIENT_ID` (Drive uploads), `ROLEVIA_ICE_SERVERS` (JSON, add TURN),
`ROLEVIA_ALLOW_ORIGIN` (if the static site is hosted elsewhere), `ROLEVIA_PREVIEW=1` (demo seed),
`ROLEVIA_STATE_FILE` (file storage path; the default `data/` folder is git-ignored). File storage writes
atomically and refuses to start on a corrupt file rather than re-seeding over it.

Limits of GitHub-as-database: one commit per write burst (debounced 1.5 s), one writer (a single server
process), API rate limits, and a practical size of a few MB (reads above 1 MB use the raw media type; the
contents API stops at 100 MB). It suits small cohorts and keeps a full history, but attachments should stay
small and recordings should live in Drive/Releases as links. Recording note: the host's tab composes the
recording with a timer that browsers throttle when the tab is hidden, so keep the room tab visible (or on a
second screen) while presenting from another window.

### Registration form and uploads

Registration collects name, city, email, mobile, qualification, graduation year, current situation,
preferred live-session slot, goal and referral code with inline validation, then confirms the email/phone
with a 6-digit code before skills are chosen and paid for. Assignment submissions and lesson materials
accept real files: up to 400 KB per file is stored in the preview (with a SHA-256 checksum) and downloadable
by the grader or learner; larger files are recorded by name and should be shared by link. Production moves
files to private object storage.

## How it is built

- No build step and no front-end dependencies: vanilla ES modules, CSS custom properties, hash routing, Web Crypto for hashing. The optional Node server has one runtime dependency (`ws`).
- `site/app/store.js` is the mock backend and the behavioural contract for the real API.
- `site/data/curriculum.json` is the single source of truth for modules, prices, career-kit and referral rules.
- Quiz questions, assignment briefs and principles live in `site/app/content/` (original content, fictional data).
- Fonts: Manrope (SIL Open Font License, see `site/assets/fonts/LICENSE.txt`). Logo: original Rolevia mark.

## Tests and deployment run on GitHub, not locally

`.github/workflows/ci-pages.yml` installs Playwright, runs `node --test` unit tests for every backend
rule, runs the end-to-end suite (registration → payment → verification → OTP → portal, labs, quiz,
leaderboard, second-device sign-out, admin, ops), uploads screenshots, then deploys `site/` to
GitHub Pages. No build step is required.

```sh
npm install
npm run test:unit
npx playwright install --with-deps chromium
npm run test:e2e
```

## Honest boundaries

- Preview payments, OTP delivery, credentials and messages are simulated in the browser. Nothing is charged or sent by the site itself; the LinkedIn buttons open LinkedIn after a confirmation that explains preview badge links only resolve in your own browser.
- Classroom media never passes through Rolevia servers (peer-to-peer WebRTC); the preview room only reaches tabs in the same browser. Recording happens on the host's device; Google Drive upload uses the host's own account and consent.
- The preview keeps all data in the visitor's browser (single browser, synced across tabs on reload); demo accounts use placeholder emails and phone numbers, and the public data file contains no internal cost or margin figures.
- Company names are research targets from public career portals; no partnership, endorsement or placement is implied and no third-party logos are embedded.
- Fees, dates, terms and the brand name are proposals until confirmed in writing. No job, salary or interview outcome is guaranteed.
- Unlisted routes are not security. Production must put the admin and operations areas behind server-side authorisation.
