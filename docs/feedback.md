# MVP feedback capture

Feedback captures the visible application viewport only when Feedback is pressed.
The screenshot is taken before the composer opens. Author choices are Lia, Aram,
Glen, and Justin; these are self-identification, not authentication. Orders stay in the
existing browser repository. Feedback never saves or discards order edits.

## Server setup

The existing project is `gnlmjxxyhxbdljummiey`. Migration
`20260918132910_mvp_feedback.sql` creates `public.mvp_feedback` with RLS enabled,
no browser grants/policies, and INSERT only for service_role. Explicit revocation
removes Supabase's possible default broader service_role grants. The private
`mvp-feedback-screenshots` bucket accepts PNG/WebP files up to 2 MiB, with no
browser storage policies. No other application schema is modified.

Vercel Preview uses server environment variables `SUPABASE_URL` and
`SUPABASE_SECRET_KEY`. The latter must contain a current `sb_secret_` key.
Never use a `VITE_` variable, commit a credential, or log request bodies/keys.
The endpoint rejects missing or non-secret keys. No legacy fallback is automatic.
Supabase secret keys are elevated credentials; table grants do not narrow their
authority over other project resources. Only the endpoint's fixed table/bucket
operations are exposed to the client.

## Request and limits

`POST /api/feedback` accepts multipart/form-data with binary `screenshot`, `author`,
`note`, `captured_at`, `view_name`, `order_id`, `screen_title`, `viewport_width`,
`viewport_height`, `session_id`, `app_version`, `git_commit`, and a random
`request_id` retained for retries. Notes are trimmed and limited to 5,000 characters.
The endpoint bounds the entire body before multipart parsing, validates author,
metadata, file size, MIME type and PNG/WebP signatures. Cross-origin browser
requests are rejected, but this is not caller authentication or a rate limiter.
The accessible Preview is intended for a controlled research audience.

The server derives a UUID from a keyed hash of the request ID and complete payload.
Identical retries produce the same UUID and cannot create duplicate rows, without
requiring SELECT. Changed drafts produce different IDs. Uploads do not overwrite.
Only definitive insert failures trigger cleanup of this request's new upload;
uncertain failures keep the object for retry. No content or credentials are logged.
No read endpoint or public screenshot URLs are provided. Authorized researchers
can inspect feedback through Supabase's administrative tools.

`npm run dev` serves the UI only; local save needs a Vercel Function runtime and
securely provisioned server credentials. Without it the draft remains available
with Retry. Tests mock network writes. Production credentials are not configured.

The build records version 0.1.0 and a commit when available. Source-based CLI
deployments can set the non-secret build variable `SAVINGLIA_GIT_COMMIT`;
append `-dirty` for uncommitted implementations. This identifies the source
baseline without claiming the feature itself is committed.

## Verification

Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
Verify every app view and mobile sizes 360×800, 390×844, 430×932. The button sits
above the measured Order Review action bar; safe-area padding is included.
The composer follows the visual viewport and has a scrolling body plus fixed
action row for short/keyboard-constrained screens. Screenshot failure does not
open an empty composer. Save failure retains the draft; cancel has no remote write.
All feedback UI is excluded from screenshots and printed documents.
