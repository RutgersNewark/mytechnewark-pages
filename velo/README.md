# Velo custom elements and seoMarkup

## What this is

Most myTech pages used to deliver their content inside a cross-origin iframe (a Wix
HTML embed), so a crawler fetching `mytech.newark.rutgers.edu/<page>` saw a navigation
menu and nothing else. The content was real, but it lived at a different address on a
different domain, and iframed content is not attributed to the page that frames it.

Each converted page now has **two generated files**, built from the same source HTML:

| File | Goes in Wix | What it does |
|---|---|---|
| `custom-elements/<slug>.js` | **Public → custom-elements → `<slug>.js`** | The visible page: a custom element that renders the page's HTML and CSS in a shadow root |
| `<slug>.js` | **That page's own Page Code panel** | The crawler copy: sets the element's `seoMarkup`, which Wix serves to search and AI crawlers at the real URL |

`/getting-support` was the first page built this way (its element predates the
generator). The generators extend the same pattern to the other pages.

`public/mytech-page.js` is an earlier approach that fetched page HTML from GitHub
Pages at runtime. It rendered nothing inside Wix. Don't use it for new pages.

## Files

- `build-custom-element.py`: converts a source HTML file into `custom-elements/<slug>.js`
- `build-seo-markup.py`: converts the same source into the page-code file `<slug>.js`
- `custom-elements/<slug>.js`, `<slug>.js`: generated, one pair per page
- `tools/pull-element-ids.js`: reads live Velo element IDs from the published site

## Installing a page

Every generated element file lists its tag name and element ID in its header.

1. **Public file.** Dev Mode → Public → `custom-elements/<slug>.js`. Paste
   `custom-elements/<slug>.js`. It starts `// FILE: Public/custom-elements/...` and
   ends with `customElements.define(...)`.
2. **Element.** On the page: Add → Embed Code → Custom Element. Settings: Source =
   Velo file `custom-elements/<slug>.js`, Tag name = the tag from the file header.
   Stretch to full width, 0 margins.
3. **ID.** Properties and Events → ID = the ID from the file header. Hidden and
   Collapsed unchecked.
4. **Page code.** The page's own Page Code panel (not `masterPage.js`). Paste
   `<slug>.js`. It starts `/** <slug>.js — SEO markup` and contains `$w.onReady`.
5. **Remove the old HTML embed only**, then Publish.

Quickest way to avoid picking the wrong file: `pbcopy < velo/custom-elements/<slug>.js`
puts the exact file on the clipboard.

### Mistakes seen on real installs, and their symptoms

| Mistake | Symptom on the live page | Console message |
|---|---|---|
| Page code pasted into the Public file | Blank page for visitors; crawlers fine | `Uncaught ReferenceError: $w is not defined` from `public/custom-elements/...` |
| Element file pasted into Page Code | Visitors fine; crawlers get the menu only | none from our code; the page bundle has no `seoMarkup` |
| Tag name not set | Blank page; tag is `wix-default-custom-element` | none |
| Tag name truncated on save | Blank page; tag is a prefix of the real one | none. Not a length limit (34-char tags work); re-enter it and click out of the field |
| ID misspelled or not set | Visitors fine; crawlers get the menu only | `seoMarkup: #<id> on /<slug> has no seoMarkup property` |
| Whole section deleted with the embed | Native Wix content above or below the embed is gone | none. Recover from Wix Site History or git |

## Verifying

Check the live page, not the editor. A browser shows the visible element; the crawler
copy is only served to recognised crawler user agents.

- **Crawlers:** request the page with a Googlebot UA and look inside the element's
  tag (`<mytech-<slug>>...</mytech-<slug>>`) for the markup, outside `<script>` blocks.
  `../seo-indexability-check.sh` reports words, `<h1>` and verdict.
- **Visitors:** headless Chrome with `--enable-logging=stderr` shows
  `[myTech] <tag> initialized` when the element runs.

## Regenerating

```
python3 velo/build-seo-markup.py                     # every page code file
python3 velo/build-seo-markup.py oer                 # one page
python3 velo/build-custom-element.py                 # every element in its PAGES list
python3 velo/build-custom-element.py oer             # one element
```

`build-seo-markup.py` has the `PAGES` table (slug, source file, element ID).
`build-custom-element.py` reads source files from it and element IDs from the
generated `<slug>.js`, so the element and its page code always agree. Add a page to
`build-seo-markup.py` first, then to `build-custom-element.py`'s `PAGES` list.

**Edit the source HTML, not the generated files.** The two outputs must stay in sync,
and a hand-edit to a `.js` file is lost the next time a generator runs.

## What the generators enforce

**The ATS office address is never published.** ATS is in Blumenthal Hall, Room 100, but
faculty are not to drop by. ATS is reachable by email, phone and the consultation
booking link; walk-in help is the IT Service Center, Hill Hall Room 109. The page-code
generator strips any line naming Blumenthal and notes it in the file header. The
element generator refuses to build until the source is fixed.

**Every page gets exactly one `<h1>`.** Several sources style their page title as a
plain div. Where that happens the page-code generator promotes or inserts the title
from the source's `<title>` tag and says so in the header. It also fixes skipped
heading levels (h1 → h3, h2 → h4). Pages whose `<h1>` is native Wix content go in
`NATIVE_H1` so no second one is added.

**Shadow-DOM conversion.** `:root` and `body` selectors become `:host` (they match
nothing inside a shadow root). Page scripts run with a `document` shim that resolves
lookups inside the shadow root; a script using any other `document` API stops the
build rather than failing silently in the browser.

## Keep it honest

`seoMarkup` must stay **materially consistent with the visible page**. Serving crawlers
content that differs from what a visitor sees is cloaking, and search engines penalize
it. Generating both files from the same source is what keeps this safe. If you ever
find yourself adding text to a `.js` file that is not on the page, stop.

## Status (2026-10-07)

Live and verified for visitors and crawlers: oer, teaching-with-technology,
course-materials, getting-started-with-canvas (tag `mytech-getting-started`).

Generated, not yet installed: classroom-support, echo-poll, engage-students,
finish-your-course, projects, teaching-in-auditoriums, teaching-in-classrooms,
teaching-in-our-classrooms.

No source in the repo: assessments-and-grading, teaching-with-canvas.
