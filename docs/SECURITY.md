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

## Live classes and recordings

- Audio and video are peer-to-peer and encrypted by WebRTC (DTLS-SRTP). Chat, live-question notices, reactions, mute requests and connection messages pass through the signalling relay in clear text; the relay authorises each socket with the learner's session when it connects and again every heartbeat, and stamps `from`, `role` and `name` on every message so a learner cannot pose as the host. Clients ignore host-only messages (quiz, close, mute request, recording notice, end class) from non-hosts.
- In the same-browser preview the identity on BroadcastChannel messages is self-declared: every tab belongs to the same person, so this is not a trust boundary.
- Backend overrides (`?api=`, `?signal=`) are honoured only on localhost; on a public origin a crafted link could otherwise send sign-in requests to another server.
- Hosts must announce recording; the room shows a recording badge to every participant and the pre-join screen states that the host may record.
- Recordings are created on the host's device. Uploading to Google Drive uses the host's own Google account (OAuth scope limited to files the app creates). Share recordings only with enrolled students; prefer restricted sharing over "anyone with the link".
- The API never returns the answer key of an open live question to learners; scoring happens when the host closes it. In live mode the quiz bank (with answers) is not downloaded by the browser at all; in the preview it is part of the in-browser backend, so preview points are demonstrative only.
- Google Drive sign-in uses a one-time nonce in the OAuth `state`; a token returned without the matching nonce is discarded, so a crafted link cannot plant someone else's Drive token in the host's browser.
- Recording chunks are written to IndexedDB every 4 s; a write failure stops the recording with a visible error instead of producing a silently truncated file, and stored chunks can be recovered from the class details page.

## Course material

- Lessons, slide decks, interview questions and quiz answer keys are sold content. They reach the browser only through session-checked API calls for enrolled learners; `server/api.mjs` returns 404 for `/app/content/*` outside preview mode, and live mode never imports the in-browser backend or the content bundle.
- Slide decks are drafts (admin-only) until an admin with the content permission publishes them. During a live class, participants can fetch the attached draft deck without answers or presenter notes; after the class it needs publication.
- View-only means: watermark with the learner's name and ID, no download links, no print styles, non-draggable images, context menu disabled on slides. It does not and cannot prevent screenshots or retyping; the watermark makes leaks attributable.
- Admin-uploaded images on slides are validated as `image/*` data URLs up to 400 KB; hosts only.

## Labs and third-party accounts

- Rolevia Sheets runs entirely in the browser; lab answers are checked locally and only the score reaches the API.
- Google Sheets route: OAuth implicit flow with a one-time nonce in `state`, scopes `spreadsheets` and `drive.file` (files the app creates), token kept in the learner's session storage, never sent to Rolevia. Requires the founder's Google OAuth client ID; absent, the route is hidden.
- The learner's AI assistant: the provider key is stored in the learner's own browser (localStorage, device-bound, with a Disconnect button) and sent only to that provider's endpoint; Rolevia never proxies, stores or logs keys, prompts or replies, so a server breach cannot expose them. Learners are told usage is billed to their account. The brief builder blocks obvious confidential data and the module teaches never to paste confidential data. "Continue with ChatGPT" stays inactive until OpenAI approves Rolevia as a partner and a client ID is configured. Admin "Draft with my assistant" runs on the admin's own key and only pre-fills a form the admin must review and save.
- Company logos: trademarks. A logo is accepted only as an image file up to 60 KB, is held privately until a written-permission record (grantor, reference, date, recorded by, recorded at) exists, and is unpublished the moment that record is removed. Names are shown as nominative use with a no-endorsement notice.

## Production checklist

1. Server-side sessions in httpOnly, Secure, SameSite cookies bound to the device identity.
2. Rate limits on `login`, `verifyOtp`, `requestReset`; lockout and alerting on abuse.
3. Transactional email/SMS providers with delivery logs; never show one-time codes to staff.
4. Payment provider webhooks verified by signature; reconcile before `adminVerify`. Until then the live server runs in manual-payment mode: a client-side "payment success" grants nothing; students receive transfer instructions and an admin with the payments permission confirms each transfer against the bank or UPI statement.
5. Private object storage for uploads; signed URLs with short expiry; virus scanning.
6. Privacy notice, retention and deletion schedule, consent for AI processing of learner documents.
7. Backups, restore drill, and an incident contact published to learners.
