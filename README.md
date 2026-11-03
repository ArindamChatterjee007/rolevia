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
| Admin console | `#/admin/*` | Verify registrations and issue credentials, lessons/assignments CRUD, grading queue, device alerts, payments, announcements, audit log |
| Operations (unlisted) | `#/ops` | Funnel, INR/USD preview ledgers with career-kit and referral reserves, cohort fill, founder notes. Unlisted is not private; see SECURITY.md |

Preview accounts (fictional, shown in the on-page preview inbox): student `RV-26-0001` / `Learn#2026`,
admin `admin@rolevia.demo` / `Admin#2026`, operations passphrase `ROLEVIA-OPS-PREVIEW`.
One-time codes and credential emails appear in the **preview inbox** (bottom-right button).

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
