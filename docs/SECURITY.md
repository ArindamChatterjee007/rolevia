# Security model

## Principles

- No self-service passwords before payment and human verification. Credentials are issued by an admin and sent to the learner's registered email and phone.
- Every student and admin sign-in needs the password **and** a one-time code (6 digits, 5-minute expiry, 5 attempts, single use). Student and admin sign-in pages only accept their own account type.
- The unlisted operations gate uses a passphrase with the same lockout as passwords; production must add server-side authorisation (and a second factor) before any real data appears there.
- Temporary passwords must be replaced at first sign-in; the backend refuses other calls until then.
- One active device per account. A new sign-in signs the previous device out; frequent switching triggers notices and an admin alert.
- Admin and operations roles are separate accounts and separate sessions; a student token can never reach admin or ops methods (`FORBIDDEN`).
- Audit log for every privileged action (verification, status changes, grading, content edits, announcements, device alerts).

## Preview limitations (read before sharing the link)

- The preview runs entirely in the visitor's browser. Anyone can reset it, read its fictional data and see the demo credentials. That is intentional for a demo and unacceptable for production.
- `#/ops` is unlisted, not hidden: anyone with the link can reach the passphrase screen. Production must enforce authorisation on the server for every ops and admin request.
- Passwords are hashed with salted SHA-256 in preview; production must use Argon2id or bcrypt on the server.
- Content Security Policy is strict (`default-src 'none'`, same-origin scripts, no inline scripts). Inline styles are allowed only for dynamic layout values.

## Production checklist

1. Server-side sessions in httpOnly, Secure, SameSite cookies bound to the device identity.
2. Rate limits on `login`, `verifyOtp`, `requestReset`; lockout and alerting on abuse.
3. Transactional email/SMS providers with delivery logs; never show one-time codes to staff.
4. Payment provider webhooks verified by signature; reconcile before `adminVerify`.
5. Private object storage for uploads; signed URLs with short expiry; virus scanning.
6. Privacy notice, retention and deletion schedule, consent for AI processing of learner documents.
7. Backups, restore drill, and an incident contact published to learners.
