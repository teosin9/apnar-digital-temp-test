# Apnar digital — TEMP Vercel test copy only

This folder is a SEPARATE temporary copy. It is NOT the original Apnar file,
NOT the live-ready server folder, and NOT the real client deploy pack.
Do not use this folder for the real deploy — the real pack must be fresh
after testing, with all test data cleared.

## What was changed for Vercel (temp copy only)
- `server.js`: the request handler is now exported as `handleRequest` and the
  server only listens when run directly (`node server.js`). No logic changed.
- `api/index.js`: Vercel serverless entry, reuses the same handler.
- `vercel.json`: all routes rewrite to `/api/index.js`.
- Data dirs: on Vercel (`VERCEL=1`) data goes to `/tmp/apnar-data` and uploads
  to `/tmp/apnar-uploads`, because deployment files are read-only.
- `package.json`: `nodemailer` is now a real dependency, so SMTP can work on
  Vercel when env vars are set.

## What was tested locally (2026-10-29)
- Local mode: signup, login, gated listing, home — passed.
- Vercel mode simulation (`VERCEL=1`, /tmp data): setup-status, signup,
  login, gated listing, home — 6/6 passed, password format 8 mixed
  (numbers + letters + # @ * $), password never printed.
- After testing: temp data reset to clean seed (users 0, sessions 0, posts 0,
  services 7/5/5/5), outbox removed, /tmp data removed.
- Original file and live-ready server folder were not touched.

## Hard limits for this temp copy — read before deploying
1. Vercel functions are stateless. Data in /tmp is per-instance and
   ephemeral: accounts, sessions and uploads can disappear on a new
   instance, redeploy, or cold start. This temp test cannot prove
   long-term persistence. Real deploy needs external/persistent storage.
2. Email: without SMTP env vars, signup in demo mode saves the password to
   the server-side outbox only — the user on a phone cannot receive it.
   For a usable phone test on Vercel, set SMTP env vars in the Vercel
   project (see below) and set LIVE_MODE=1, so signup refuses clearly
   (503) instead of faking success when SMTP is missing.
3. This server UI is plain, not the preview design, and it does NOT yet
   include the preview/demo Prompt unlock direct-to-WhatsApp flow.
   Server version of that flow is still "later" by the owner's choice.
4. Admin device-code lock for live is NOT built in this copy.

## Steps to deploy this temp copy (owner must do step 1)
1. Owner creates a GitHub repo himself — the Muse GitHub App cannot create
   repositories (403). Suggested name: apnar-digital-temp-test.
   After he creates it, Muse can push these files normally.
2. Push this folder's contents to that repo (main branch).
3. In Vercel, link the existing empty project `apnar-digital` (or a new
   temp project) to that repo, or use create_git_project with
   repo `teosin9/apnar-digital-temp-test` and the team id.
4. Set env vars in Vercel (values via secure form, never in chat/code):
   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (optional),
   LIVE_MODE=1 for a usable temp test.
5. Deploy, then test: /admin-setup first (admin only, hash only),
   then signup -> email password -> login -> gated listing -> forgot ->
   delete account. Clear all temp test data after testing.
6. Do NOT copy test data into the real deploy. The real pack is built
   fresh after testing.
