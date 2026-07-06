# KBA Analytics Fix — Change Log

## Problem
Page code for the KBA dynamic page (`/kbarticles/{slug}`) wrote directly to the
`KBAnalytics` collection via `wixData.insert('KBAnalytics', ...)` to log page
views and click-throughs. The collection's `itemInsert` permission is set to
CMS Editor only (intentionally — it shouldn't accept direct public writes from
site visitors). Because the insert ran from client-side page code, every
visitor hit `WD_PERMISSION_DENIED` and no analytics rows were ever written.

## Fix
Moved the insert into a backend web module and used `suppressAuth` to bypass
the collection's permission check for that one narrow operation, without
loosening the collection's public permissions at all.

- **`backend/kbAnalytics.web.js`** (new) — Velo backend module. Exports
  `logKbEvent(eventData)` via `webMethod(Permissions.Anyone, ...)`, so page
  code can call it. Internally calls `wixData.insert('KBAnalytics', {...},
  { suppressAuth: true })`. `suppressAuth` only works in backend code, which is
  why this had to move out of the page code file.
- **`kb-stub-velo-updated.js`** (replaces `kb-stub-velo.js`) — `logView()` and
  `logClick()` now call `logKbEvent(...)` from the backend module instead of
  calling `wixData.insert` directly. Everything else on the page (slug lookup,
  countdown/redirect, related articles, tag repeater) is unchanged.

## What did NOT change
- `KBAnalytics` collection permissions stay locked down (`itemInsert: CMS
  Editor`) — the collection is still closed to direct public writes.
- Data shape written to `KBAnalytics` is identical: `articleId`,
  `articleTitle`, `articleSlug`, `category`, `tier`, `eventType`
  (`"view"` or `"clickthrough"`), `timestamp`.
- Redirect/countdown behavior, related-articles loading, and page element
  wiring are unchanged.

## Install steps
1. Wix Editor → Dev Mode → **Backend** → add `backend/kbAnalytics.web.js`
   (must be in the Backend folder, not Page Code, for `suppressAuth` to work).
2. Replace the existing KB stub page code with `kb-stub-velo-updated.js`.
3. No collection permission changes needed.

## Verification
Both files pass `node --check` syntax validation.
