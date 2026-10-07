# seo-snapshots

Dated output from `seo-indexability-check.sh`, for diffing progress over time.

## ⚠️ Files marked `-BROWSER-UA-invalid`

Everything before **2026-09-11 bot-UA** was measured with a custom user-agent
(`SEO-Indexability-Check/1.0`). Wix serves its server-rendered crawler copy only to
recognised crawler user-agents; a custom UA gets the client-side bundle instead.

**Those files therefore measure the browser response while describing it as what Google
sees. They are not a baseline and must not be diffed against current runs.** They are kept
only as a record of what was measured and when.

The word counts in them are real — they are just answering a different question
("what does a browser fetch return?") than the one the reports asked
("what does Google index?").

## The real day zero

`seo-indexability-20260911-BOT-UA.csv` — first run with the Googlebot UA, after the
rewrite that fetches both responses and self-checks the crawler render via the
`seo_render` column.

Diff current runs against that file.
