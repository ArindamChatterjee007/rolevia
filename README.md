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
| Operations (unlisted) | `#/ops` | Funnel, INR/USD preview ledgers with career-kit and referral reserves, cohort fill, founder notes. Unlisted is not private; see SECURITY.md |

Preview accounts (fictional, shown in the on-page preview inbox): student `RV-26-0001` / `Learn#2026`;
admins `RV-ADM-001` (programme lead), `RV-ADM-002` (learning & content manager), `RV-ADM-003`
(student success & verification) with the temporary passwords listed in the preview inbox panel; operations
passphrase `ROLEVIA-OPS-PREVIEW`. Admins must set a new password at first sign-in. One-time codes and
credential emails appear in the **preview inbox** (bottom-right button).

### Admin roles and the tracker

| Role | Can do | Cannot do |
| --- | --- | --- |
| Programme lead | Everything, including audit log, task creation and reassignment | — |
| Learning & content manager | Upload lessons (links + files), create assignments, grade, announce, work tasks | Verify students, change student status, view payments/alerts/audit |
| Student success & verification | Verify paid registrations and issue IDs, suspend/reactivate, review device alerts and payments, work tasks | Edit lessons/assignments, grade, announce, view audit |

The tracker (`#/admin/tracker`) shows the registration pipeline (unpaid → awaiting verification → active),
learner progress (lessons, quiz days, labs, assignments, points, last activity, device switches) and the task
queue. Tasks are created automatically when a payment succeeds (verify), an assignment is submitted (grade)
or a device alert opens (review), and complete themselves when the work is done. The lead can create and
assign custom tasks. The founder manages admin accounts (create, reset password, suspend, change role) in
the operations view.

### Registration form and uploads

Registration collects name, city, email, mobile, qualification, graduation year, current situation,
preferred live-session slot, goal and referral code with inline validation, then confirms the email/phone
with a 6-digit code before skills are chosen and paid for. Assignment submissions and lesson materials
accept real files: up to 400 KB per file is stored in the preview (with a SHA-256 checksum) and downloadable
by the grader or learner; larger files are recorded by name and should be shared by link. Production moves
files to private object storage.

## How it is built

- Zero runtime dependencies: vanilla ES modules, CSS custom properties, hash routing, Web Crypto for hashing.
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

- Preview payments, OTP delivery, credentials and messages are simulated in the browser. Nothing is charged or sent.
- Company names are research targets from public career portals; no partnership, endorsement or placement is implied and no third-party logos are embedded.
- Fees, dates, terms and the brand name are proposals until confirmed in writing. No job, salary or interview outcome is guaranteed.
- Unlisted routes are not security. Production must put the admin and operations areas behind server-side authorisation.
