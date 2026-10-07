# SEO Optimization & Testing Process

**myTech@Newark — Academic Technology Services**
**Version 1.0 · September 11, 2026**

How we measure whether our pages can be found, what we change, and how we prove the change
worked. Written so someone who has never touched this site can repeat the work and get the
same numbers.

---

## 1. What we are actually optimizing

Search visibility on this site is three separate problems with three different fixes. Keeping
them apart matters, because work on one does nothing for the others.

| # | Problem | Cause | Fix |
|---|---|---|---|
| 1 | **Content invisible to crawlers** | Page content sits in cross-origin iframes whose `src` is injected by JavaScript | Architectural — native page elements, or CMS-driven pages |
| 2 | **Dead legacy URLs** | Pre-Wix Drupal addresses still rank in Google and return 404 | Configuration — 301 redirects |
| 3 | **Index hygiene** | Scratch, duplicate, and placeholder pages are live and in the sitemap | Configuration — delete, `noindex`, or build the page |

Problems 2 and 3 are cheap and high-impact. Problem 1 is the expensive one. Do them in that
order. Full measured detail: `mytech-search-visibility-report.md`.

### The governing principle

> **There are two responses, and they answer different questions.**
>
> The **bot** response (Googlebot UA) is what Google indexes — every verdict keys off it.
> The **browser** response (Chrome UA) is useful only as a comparison. **The gap between
> them is the most diagnostic thing we can measure.**

Search crawlers and AI assistants largely do not execute JavaScript, so we measure raw HTTP
responses rather than the rendered page. But that alone is not enough: **Wix serves a
server-rendered copy only to recognised crawler user-agents.** A custom UA does not earn that
render — it receives the client-side bundle.

Versions of this script before 2026-09-11 used a custom UA (`SEO-Indexability-Check/1.0`) and
therefore measured the *browser* response while reporting it as what Google sees. **Every
number produced before that date describes the wrong response.** The affected snapshots are
renamed `-BROWSER-UA-invalid` and must not be diffed against current runs.

This is why the script now self-checks (§2). The general lesson, worth carrying beyond this
script: **assert that you got the response you think you got, rather than assuming the
request worked.**

---

## 2. The tool

`seo-indexability-check.sh` — bash + curl + perl, no dependencies beyond macOS defaults.
Lives in the repo root. The same script is used for myRUN (`~/Documents/MyRUN/`).

### The self-check — read this column first

```
seo_render    yes | no
```

Did the request actually earn the crawler render? Detected by Wix's own `"isSEO":true`
flag in the bot response (it is `false` for a browser UA). `seoSsrOnly` and
`thunderbolt-seo-isolated-renderer` are kept as fallbacks.

**Changed 2026-10-06.** The check used to rely on `seoSsrOnly` alone in practice. Wix removed
that marker site-wide, and 55 of 166 rows read `no` — and therefore `NOT INDEXABLE` — while
their word counts matched the previous run to the word. A rendering side effect is a fragile
marker; an explicit flag is less so. If `no` appears on many rows at once with unchanged word
counts, suspect the marker before the site. Snapshot from the broken run:
`seo-snapshots/seo-indexability-20261006-STALE-SELFCHECK-invalid.csv`.

The script also checks the **browser** response for `"isSEO":true`. If the browser UA ever
earns the crawler render too, `delivery` and `h1_match` are comparing the bot copy with
itself, and the row gets the warning `browser UA also got crawler render`.

**If it ever says `no`, stop.** The UA did not get the crawler copy, and every other number
in that row is describing the wrong page. It is treated as a hard blocker for exactly that
reason — a row you cannot trust should not read as a clean pass.

### What it checks per URL

**Once, off the bot fetch:**

| Signal | Why it matters |
|---|---|
| Final HTTP status (after redirects) | A 404 cannot rank. This is the hard blocker. |
| Direct vs. via-redirect | Distinguishes "reached the page" from "reached it the long way" |
| `X-Robots-Tag` response header | Server-level `noindex`. Invisible in page source. |
| `<meta name="robots">` | Page-level `noindex` / `nofollow` |
| `<link rel="canonical">` | Self-referencing, or handing credit to another URL |
| `robots.txt` | Is the path `Disallow`'d for user-agent `*` |
| **Sitemap membership** | For a scratch page, *being in the sitemap is the defect* |
| `<title>`, meta description | The snippet |
| **`h2_count`** | Heading structure — most of what we used to eyeball by hand |
| **`og_image`** | Present or not. Drives the social and AI preview card. |

**Twice, against both bodies:**

| Signal | Why |
|---|---|
| **`bot_words` / `browser_words`** | Crawler-visible word count, scripts stripped. The pair is the diagnostic. |
| **`h1_bot` / `h1_browser`** | Text-aware `<h1>` state on each side |

**Derived from the pair:**

| Signal | Why |
|---|---|
| **`delivery`** | *Measured*, not inferred — see below |
| **`h1_match`** | `same` / `partial` / `differs` / `n/a`. `differs` means the crawler markup has drifted out of sync with what users see. |

### delivery — measured, not guessed

This column replaced an `embed` column that *inferred* "wix-embed?" from thin content plus a
missing `<h1>`. That inference misfired on `/getting-support`, which is not an embed at all.
The two word counts give the real answer:

| bot | browser | delivery | what it is |
|---|---|---|---|
| high | high | `native` | native Wix elements — present in both |
| high | low | `ssr-only` | custom element + `seoMarkup` — crawlable, invisible to a browser fetch. **Not a problem.** |
| low | high | `investigate` | shouldn't happen |
| low | low | `empty` (or `github-iframe` / `wix-iframe`) | the actual problem |

> **Note (2026-09-11):** the `github-iframe` and `wix-iframe` branches do not currently fire
> on this site. Neither `mytechnewark-pages` nor `filesusr.com/html/a2caaa_` appears in
> *either* response, and the served HTML contains **zero `<iframe>` tags** — Wix builds the
> frame client-side at runtime. Low/low pages therefore fall through to `empty`. The branches
> are kept because they would be meaningful if the markup changes. Re-check if it does.

**`delivery` measures plumbing, not quality.** Fifteen scratch and placeholder pages score
`native` — `/blank-1` returns 634 crawlable words of Accessibility Statement, and
`/finding-spaces` returns 382 words of *"This is a Paragraph. Click on 'Edit Text'"*. Native
delivery of boilerplate is still boilerplate.

### The verdict

**NOT INDEXABLE** if any hard blocker is present: non-200 final status, `X-Robots-Tag
noindex`, `meta robots noindex`, a `robots.txt` disallow, or `seo_render=no`.

**Warnings** — indexable but degraded: canonical elsewhere, thin bot content, empty or
missing `<h1>` in the crawler render, `h1` drift, or no `og:image`.

All of it keys off the **bot** response.

### Text-aware `<h1>`

Three states, not two:

- `present` — an `<h1>` with actual text
- `(empty)` — the tag exists but holds no text, because JavaScript fills it client-side
- `(missing)` — no `<h1>` at all

`(empty)` is the signature of a JS shell. A naive "does an `<h1>` exist" check reports
success on a page that serves crawlers nothing.

### Thin-content threshold — default 130 words

**Derived from a bot-UA run, not guessed.** Under Googlebot the embed-only pages cluster
tightly at **115–119** words (the nav menu); the next real page up is **146**. 130 sits in
that gap.

The previous default of 150 came from *browser*-response measurements and does not apply.
Override with `-m`. If the nav changes size, re-derive the boundary from data rather than
keeping 130 out of habit.

---

## 3. Running a check

```bash
cd "/Users/dowlin/Documents/Claude/Projects/MyTech Website"
./seo-indexability-check.sh -c -f urls.txt
```

| Flag | Effect |
|---|---|
| `-f <file>` | URL list, one per line; `#` comments allowed |
| `-c` | Also write `seo-indexability.csv` |
| `-m <n>` | Thin-content threshold in bot-visible words (default 130) |
| `--no-sitemap` | Skip the sitemap-membership crawl — **required for myRUN**, which has no XML sitemap |

**62 URLs takes roughly 6–7 minutes** — two fetches per URL now, plus the header request.
Run it in the background, never in a blocking foreground call.

### Then snapshot it

```bash
cp seo-indexability.csv "seo-snapshots/seo-indexability-$(date +%Y%m%d).csv"
```

Add a `-HHMM` suffix when re-running on a day that already has a snapshot, so you don't
overwrite the earlier baseline. Snapshots are what make progress provable; without them you
have an opinion, not a measurement.

### Sanity-check every run

```bash
python3 -c "import csv; r=list(csv.DictReader(open('seo-indexability.csv'))); \
print(len(r),'rows,',len({x['url'] for x in r}),'unique')"
```

**Row count must equal URL count.** A mismatch means something is wrong with the output, not
with the site. (Fixed 2026-09-11: the script used to write the CSV header only when the file
didn't already exist while always appending rows, so a second run stacked onto the first —
124 rows for 62 URLs. It now truncates each run. Any CSV produced before that date deserves
this check.)

### Keeping urls.txt current

`urls.txt` is generated from `pages-sitemap.xml` + `blog-posts-sitemap.xml`. Regenerate it
whenever pages are added, renamed, or deleted — a page missing from the list is a page
nobody is measuring.

---

## 4. Reading the results

**Check `seo_render` first.** Any `no` invalidates that row:

```bash
python3 -c "
import csv
from collections import Counter
r=list(csv.DictReader(open('seo-indexability.csv')))
print('seo_render:', Counter(x['seo_render'] for x in r))
print('delivery  :', Counter(x['delivery'] for x in r))
print('h1_match  :', Counter(x['h1_match'] for x in r))"
```

The pages that need architectural work are `delivery=empty`:

```bash
python3 -c "
import csv
for x in csv.DictReader(open('seo-indexability.csv')):
    if x['delivery']=='empty':
        print(x['url'], x['bot_words'])"
```

**Diff against a snapshot — this is the part that matters.** A single run tells you the state;
a diff tells you whether your work did anything:

```bash
python3 - <<'EOF'
import csv
load=lambda p:{r['url']:r for r in csv.DictReader(open(p))}
new=load('seo-indexability.csv')
old=load('seo-snapshots/seo-indexability-20260911-BOT-UA.csv')   # day zero
for u,r in new.items():
    o=old.get(u,{})
    d=[k for k in ('http_status','verdict','seo_render','delivery','bot_words',
                   'browser_words','meta_robots','canonical','meta_description',
                   'h1_bot','h1_match','h2_count','og_image','title')
       if (o.get(k) or '')!=(r.get(k) or '')]
    if d:
        print(u)
        for k in d: print(f"   {k}: {o.get(k)} -> {r.get(k)}")
EOF
```

**Diff only against bot-UA snapshots.** The two `-BROWSER-UA-invalid` files in
`seo-snapshots/` predate the UA fix and answer a different question; see the README there.

**Day-zero baseline — `seo-indexability-20260911-BOT-UA.csv`**, 62 URLs:

| | |
|---|---|
| `seo_render` | **62 yes, 0 no** — the UA earns the crawler render on every page |
| `delivery` | **32 native · 29 empty · 1 ssr-only** · 0 investigate |
| `h1_match` | 28 same · 34 n/a · **0 differs** — no cloaking drift |
| `og_image` | **53 missing**, 9 present (all blog posts) |
| HTTP | 0 × 404 |

---

## 5. The optimization workflow

### Order of operations

1. **Redirects for dead URLs that still rank.** Highest return per unit of effort. One
   redirect recovered 6,403 weekly impressions' worth of traffic that was hitting a 404.
2. **Index hygiene.** Remove scratch and placeholder pages from the index. Cheap, and it
   stops bad pages competing with good ones.
3. **Meta descriptions.** Without one, Google writes the snippet from whatever text it finds
   — on a shell page, that is the navigation menu.
4. **Crawler-visible content.** The architectural work. Everything above is preparation.

### Writing meta descriptions

- **Under 155 characters.** Longer gets truncated.
- **Unique per page.** Two pages sharing a description compete with each other — this site
  had exactly that between `/` and `/general-clean`.
- **Front-load the specifics.** Phone numbers, room numbers, tool names. `/getting-support`
  earned a good snippet by leading with "833-OIT-HELP".
- **Write from the page's real content**, not its title. If a page serves crawlers nothing
  and has no source file in the repo, mark the description as needing verification rather
  than inventing content.
- Follow the house style in `CLAUDE.md`: "Rutgers–Newark" with an en dash, audience labels
  (Faculty / Staff / Students), never "users".

Apply in the Wix Editor: **Pages → [page] → SEO Basics → Meta description**, or in bulk via
**Marketing → SEO & GEO → SEO Settings**.

### Before adding any redirect

**Check the destination's content, not just its status code.** A page can return a clean 200
and still be a Wix template with `<h1>` = "Page Title". Two redirects in our draft plan were
marked "confirmed live" on the strength of a 200 and pointed at exactly that. A redirect onto
boilerplate is worse than the 404 it replaces — it spends the legacy URL's accumulated
ranking on an empty page.

```bash
curl -s https://mytech.newark.rutgers.edu/<target> \
  | grep -c 'This is a Paragraph. Click on "Edit Text"'
```

Non-zero means stop.

### Finding placeholder pages

Wix boilerplate has stable fingerprints. Grep the raw HTML of every page for:

```
This is a Paragraph. Click on "Edit Text"
Every website has a story
I'm a paragraph. I'm connected to your collection
This is placeholder text
Describe the item and include any relevant details
Avenir Light is a clean and stylish font
```

Seven live, indexed, sitemap-submitted pages were found this way on 2026-09-11. Re-run the
sweep after any burst of page creation.

---

## 6. Verifying a change worked

1. Re-run the check and diff against the snapshot from before the change (§4).
2. Confirm the specific signal moved: word count up, `h1` `(empty)` → `present`, meta
   description no longer `(missing)`, status 404 → 301.
3. For redirects, confirm the **status code**, which a browser will not show you:
   ```bash
   curl -sI https://mytech.newark.rutgers.edu/<old-path> | head -3
   ```
   301, not 302. A 302 is temporary and does not pass ranking signal.
4. Save a new snapshot.
5. Google's index lags. Expect days to weeks before Search Console reflects the change —
   the tool tells you the page is *fixed*, not that Google has *noticed*.

---

## 7. Pitfalls

Each of these produced a wrong answer at least once on this project.

**The user-agent changes the response.** Wix serves its server-rendered crawler copy only to
recognised crawler UAs. A custom UA silently gets the client-side bundle — same URL, same
status code, 4× the bytes, a quarter of the words. This invalidated every measurement taken
before 2026-09-11. Use the Googlebot UA, and **verify you got the render** rather than
trusting that you did.

**`grep -q` in a pipeline lies under `set -o pipefail`.** This one is nasty enough to spell
out:

```bash
printf '%s' "$body" | grep -q PATTERN && flag=yes     # ← broken
```

`grep -q` exits the instant it matches, which sends SIGPIPE to `printf` (exit 141). With
`pipefail`, the pipeline reports **141**, so `&&` never fires. The failure is silent and
*inverted*: it breaks only when the pattern appears **early**, so the pages that most
obviously match are the ones reported as not matching. It produced a false
`seo_render=no` on `/getting-support` — the single page whose render mattered most — while
working correctly everywhere else. Use a helper that returns the result on **stdout**:

```bash
has_match() { RE="$1" perl -0777 -ne 'print /$ENV{RE}/ ? "yes" : "no";'; }
flag="$(printf '%s' "$body" | has_match 'PATTERN')"
```

**Rendered DOM ≠ server HTML.** A same-origin `fetch()` from the browser console returned 807
characters for pages whether or not they had native content. To distinguish a native page
from an embed-only one in the browser, check `document.querySelectorAll('h1')` after a pause
— but prefer raw `curl`.

**BSD `grep -E` fails on Wix HTML.** Wix minifies pages into 300KB+ single lines, and BSD grep
silently fails to match deep inside them. Use `perl -0777` for anything multiline or
long-line. This is why the script depends on perl.

**Capture headings greedily.** Use `([\s\S]*?)`, not a length-capped pattern. Wix wraps
heading text in long class attributes that overflow a small cap and make the match fail
silently — producing "no `<h1>`" on a page that has one.

**A cross-origin `fetch` cannot read a redirect's status code.** Use `curl -sI` to tell 301
from 302.

**`inurl:` is unreliable.** `inurl:copy-of` returned zero results for pages that were
demonstrably indexed. Use `site:mytech.newark.rutgers.edu/<exact-path>`.

**Google rate-limits repeated `site:` queries** and starts serving CAPTCHAs. Space them out.

**The parent page's HTML never contains embed content.** You cannot tell from the parent
whether an embed file deployed. Fetch the embed URL directly.

**Wix embeds have no clean static signature.** The iframe `src` is JS-injected, and the
`filesusr.com` asset host appears on every page including native ones. The script therefore
*infers* wix-embed vs. native from content (thin words + no real `<h1>`). On non-Wix sites
this column is meaningless — ignore it. It mislabeled a Linktree page as "wix-embed?".

**Don't link-crawl a site to enumerate it.** A navigation crawl only finds nav-linked pages.
On myRUN this missed 55 pages whose internal links use node IDs; the complete inventory came
from enumerating `/node/1`–`/node/1400` and reading each page's real URL from its
`<link rel="canonical">`. Different site, same lesson: a link crawl measures the navigation,
not the site.

**Verify the source URL, not just the destination.** A 301 whose *source* doesn't exist never
fires. Both redirect lists on this project had this defect, and in both cases the destinations
had been carefully verified while the sources had not.

---

## 8. Applying this to another site

**One script, two sites, kept byte-identical.** Site-specific behaviour is detected at
runtime rather than forked into two copies that drift:

```
~/Documents/Claude/Projects/MyTech Website/seo-indexability-check.sh
~/Documents/MyRUN/seo-indexability-check.sh
```

After editing either, copy it across and confirm:

```bash
shasum "/Users/dowlin/Documents/Claude/Projects/MyTech Website/seo-indexability-check.sh" \
       ~/Documents/MyRUN/seo-indexability-check.sh
```

### The `platform` column

Detected per URL from the bot response — `x-wix-request-id` / the Wix generator meta, or
`x-generator: Drupal`. It decides whether the `seo_render` assertion applies:

| platform | `seo_render` | why |
|---|---|---|
| `wix` | `yes` / `no` | The crawler copy must be earned. `no` = wrong response measured → hard blocker. |
| `drupal` (or other) | `n/a` | Server-rendered; every UA gets the same HTML. There is nothing to earn. |

**Assert only where the assertion is meaningful.** Applying the Wix check to Drupal would
report "no crawler render" on all 231 myRUN rows — a false alarm on every one.

### Running myRUN

```bash
cd ~/Documents/MyRUN
./seo-indexability-check.sh -c --no-sitemap -f myrun-urls.txt
mv seo-indexability.csv myrun-seo-indexability.csv
```

`--no-sitemap` is required — Drupal 7 serves no XML sitemap, and without the flag the
membership column is noise.

**myRUN's earlier data is still valid.** Drupal returns identical HTML to every UA (verified:
1,529 and 1,764 words, bot vs. the old custom UA), so the UA bug that invalidated the myTech
snapshots did not affect myRUN. Only the schema changed.

### Thresholds do not transfer between sites

| site | chrome-only floor | shortest real page | usable threshold |
|---|---|---|---|
| myTech (Wix) | 115–119 (nav shell) | 146 | **130** |
| myRUN (Drupal) | 64 (404 page) | 1,273 | 130 catches *empty*; see caveat |

On myRUN, 130 flags a genuinely empty response but **will not** catch a page that renders
full template chrome with an empty body — that would be ~1,273 words of navigation alone. We
have no confirmed example of such a page to calibrate against, so that threshold is
deliberately left underived rather than guessed. If one turns up, set `-m` from it.

Everything else transfers: bot response over browser, raw HTML over rendered,
snapshot-and-diff, verify sources as well as destinations, and check destination content
rather than status codes.

---

## Related files

| File | Contents |
|---|---|
| `mytech-search-visibility-report.md` | The three problems, measured, with Search Console figures |
| `mytech-meta-descriptions.csv` / `.md` | 43 paste-ready descriptions; 17 pages excluded, with reasons |
| `mytech-redirects-to-add.csv` | Draft redirect list, prioritized by measured impact |
| `seo-indexability-check.sh` | The tool |
| `urls.txt` | The URL list, generated from the sitemaps |
| `seo-snapshots/` | Dated baselines for diffing |
