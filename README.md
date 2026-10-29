# Apnar digital — server (LIVE-READY PREPARATION, NOT PUBLISHED)

**Prepared for live at the user's request on 2026-10-29, but NOT deployed and NOT shared publicly yet.** The user chose "prepare live-ready only, do not publish yet". Do not publish until he explicitly says publish.

## What it is

- `server.js` — Node.js server, no required dependencies (built-in `http`, `crypto` scrypt, multipart parsing). `nodemailer` is an *optional* dependency, used only if you set SMTP env vars.
- Persistent storage: `data/db.json` (atomic write: temp file + rename, survives restart).
- Uploads: `uploads/` (served at `/uploads/...`).
- Public page: served from the API, not hardcoded — admin edits appear after reload.
- Admin panel: `/admin` (admin role only).

## Run it locally

```bash
cd ~/workspace/apnar-digital-server
npm install   # optional: installs nodemailer only; the server also runs without it
node server.js
# or: npm start
```

Open:

- Public page: http://localhost:3000/
- Admin setup (first run only): http://localhost:3000/admin-setup
- Admin panel: http://localhost:3000/admin

Port: `PORT` env var, default `3000` (e.g. `PORT=4000 node server.js`).

## First run — admin account (no hardcoded credentials)

1. Open `/admin-setup` in the browser.
2. Enter an admin email + password (at least 8 characters) in that form.
3. The server hashes it with salted scrypt and stores **only the hash** in `data/db.json`.
4. After that, `/api/setup` refuses to create a second admin.
5. Never put an email or password into code, git, logs, or chat to create the account — use the form.

## Live-ready changes (2026-10-29, prepared, not published)

- **Live password format:** signup and forgot-password now generate an **8-character password mixing numbers, letters, and symbols # @ * $** (at least one of each class, crypto RNG, shuffled). Verified by test: both signup and forgot passwords passed the format check, old password failed after forgot, new password worked.
- **Delete account:** `POST /api/delete-account` (logged-in visitor only) deletes the user row and all their sessions and clears the cookie. After deletion, that email + password no longer logs in — verified by test. The public page shows a "Delete my account" button for logged-in visitors only, with a confirm step. Admin accounts are not deleted by this endpoint.
- **LIVE_MODE guard:** if `LIVE_MODE=1` is set and SMTP is not configured, signup creates no account (503) and forgot-password does not replace the old password, so a live user is never issued a password they cannot receive. In normal demo mode without SMTP, the outbox fallback still applies.
- **Still pending before any real publish:** real SMTP sender config (not provided, never tested with real email), Vercel/hosting reconnection check, admin password rotation, and the admin device-code lock for live (see below). The static preview/demo artifacts were NOT changed in this live-ready step and still use their test-email simulation.

## Visitor auth — exactly this flow

1. Visitor signs up with **email only** (`/api/signup`).
2. Server generates a **live-format 8-character password** (numbers + letters + # @ * $, crypto RNG), hashes it with scrypt, stores only the hash.
3. Website "sends" that password by email:
   - **If SMTP env vars are set** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`), it sends via nodemailer.
   - **If NOT set (local demo default)**, it saves the outgoing email to `data/outbox.json` and logs `DEMO MODE — no real email sent, check outbox` to the server console only. The password is **never** returned to a public page or API response.
4. Visitor logs in with email + that live-format password.
5. After logout, the same email + password logs them in again (persisted, hashed).
6. Wrong password fails. Logout clears the httpOnly session cookie.
7. Forgot password (`POST /api/forgot-password`, email only; "Forgot password?" link in the public login modal): for an existing visitor account, the server generates a **new live-format 8-character password**, replaces the stored scrypt hash, invalidates that user's existing sessions, and sends the new password by the same email / demo-outbox path as signup. The old password then fails, and only the newest website-sent password works, until the account is deleted. A user-chosen or old password never works. The endpoint always returns the same generic message — "If an account exists, a new password was sent to your email." — and never returns the password or reveals whether an email exists. There is **no** reset code or reset link flow: the new password itself is delivered by email, per the standing rule. Admin accounts created via `/admin-setup` are not changed by this endpoint (they keep their setup password).
8. Delete account: see the live-ready section above — a visitor's password stays accepted until they delete their account, and deletion is now implemented and tested.
7. Browsing is free: / and /api/services need no login. Tapping any listing while logged out shows the login modal, remembers that listing, and opens it after login. The single-listing detail API /api/item/:id is server-gated (401 when logged out) — the public list is summary only.
8. Sessions persist: httpOnly cookie Max-Age 30 days, session row stored in data/db.json, so login survives browser close and server restart until explicit logout.

To test locally in demo mode, read the generated password from `data/outbox.json` on the server machine (that file is server-side only; there is no public endpoint that returns it).

## Admin panel — what the admin can control without code changes

From `/admin`, logged in as admin only:

- Edit service text: title, Short, Full for Course, Prompt, Tool, Product.
- Create / edit / delete listings (items) in any service.
- Edit listing text (title, blurb, demo price, demo stock — Prompt items have **no** price / Buy / stock fields, by design).
- Upload images and attach them to listings (`/api/admin/upload`).
- Update Prompt items (Prompt is just a service whose items are edited the same way, without commerce fields).
- Create / edit / delete posts.

Seed data: Course (7 items), Prompt (5 items, no price/stock), Tool (5 items), Product (5 items). Course/Tool/Product prices are demo-labelled until the owner sets real values.

## FUTURE live requirement — NOT implemented in this local demo

The user explicitly said: for the local demo, do **not** lock ourselves before making the key.

For the **live** version only, this must be added before going live:

- Admin receives a code on login from another device, or after logout, and must enter that code to continue (device-code / second-factor check for admin logins).

Do not add that lock to this local demo without a new explicit instruction.

## Real email — not yet tested

Real email sending is **untested** here because no SMTP configuration has been provided in this local build. In demo mode no real email is sent. To enable it later, set the SMTP env vars above and install nodemailer (`npm install`), then test signup end-to-end.

## Security notes

- No email, password, secret, or credential value is written in code, files, git, or logs by this project. If you ever paste one into a file by mistake, remove it and rotate it.
- Sessions are httpOnly cookies (`SameSite=Lax`); logout clears the session server-side and in the browser.
- Uploads are saved under `uploads/` with sanitised filenames; do not serve that folder from anywhere else.
