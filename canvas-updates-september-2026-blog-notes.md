# Wix Blog build sheet — Canvas Updates: September 2026

Companion to `canvas-updates-september-2026-blog.html` (paste source).
Same pattern as `get-tech-ready-fall-2026-blog.html`: native blog post, no HTML embed.

---

## How to paste

1. Open `canvas-updates-september-2026-blog.html` in a browser.
2. Select from the H1 through the last line, copy.
3. In the Wix Blog editor, create a new post and paste into the body.
4. Delete the pasted H1 — Wix uses the post **Title** field as the `<h1>`. Put the title there instead.
5. Spot-check that headings came through as Heading 2 / Heading 3 (not bold paragraphs) and that every link is live.

Only block types your existing posts already use — H2, H3, paragraphs, bulleted lists, bold, links.

---

## Post fields

**Title**

> Canvas Updates: September 2026

Alternates if you prefer a benefit-first headline:
> Canvas Updates: Microsoft Education LTI, Portfolio Changes, and Respondus Training

**URL slug**

> `canvas-updates-september-2026`

**Excerpt / SEO description** (152 characters)

> Microsoft Education LTI replaces the legacy Office 365 integration, legacy portfolio content must be exported by December 31, and new Canvas Portfolio features.

**Category**

> News and Announcements

**Tags**

> Canvas, Faculty, Microsoft 365, OneDrive, LTI, Canvas Portfolio, ePortfolios, Folio, Respondus, LockDown Browser, Academic Technology Services

**Cover image** — needed for the blog listing card. Suggested alt text:

> Rutgers–Newark instructor working in Canvas on a laptop

Don't put dates or contact details in the image; text in images isn't indexable.

---

## Editorial decisions made

- **"In This Update"** replaces the bare four-bullet summary, matching the "At a Glance" pattern from the Fall 2026 post. Key phrases bolded so the list scans.
- **Deadline bullets kept as text, not a card.** If you want the December 31 deadline to stand out visually, add a Wix **Divider** above and below that section, or a **Button** to the portfolio post.
- **Closing block rewritten as a "Questions?" section** rather than a signature blob. Contact details follow `project_contacts.md`: Academic Technology Services, **atshelp@newark.rutgers.edu · 973-353-1713**, plus the `go.rutgers.edu/bookats` consultation link. Phone and booking link are additions to your draft — drop them if you want email only. **No Blumenthal Hall address** (walk-ins go to the IT Service Center, Hill Hall 109).
- **Respondus session times** left as "12 p.m. EDT" house style. No registration links in the draft — the series page carries them.

---

## Verified before publishing (18 Sep 2026)

| Item | Result |
|---|---|
| `canvas.rutgers.edu/2026/09/10/microsoft-education-lti/` | Live — "Feature Release: Microsoft Education LTI" |
| `.../09/09/export-your-legacy-portfolio-content-before-december-31-2026/` | Live — title matches |
| `.../09/01/september-2026-respondus-lockdown-training-series/` | Live — Sep 22 12pm, Sep 30 1pm, Sep 24 2pm all confirmed on the source page |
| Sep 22 / 24 / 30, 2026 weekdays | Tuesday / Thursday / Wednesday — all correct |
| Sep 19, 2026 (Portfolio features) | Saturday — correct as written, but it's tomorrow, so publish soon or change to "beginning September 19" past tense after the weekend |
| Dec 31, 2026 | Thursday |

Note: the Respondus series page also lists Sept 10, 15, and 17 sessions. Those have passed as of publication, so they're correctly omitted.

---

## Verify after publishing

Open the published post and run this in the browser console — it fetches the raw server HTML, the way a crawler sees it:

```js
const raw = await fetch(location.href).then(r => r.text());
({
  hasH1:     /<h1[^>]*>/i.test(raw),
  hasSchema: raw.includes('BlogPosting'),
  bodyChars: (raw.split('<body')[1] || '')
               .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
               .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length,
  lti:       raw.includes('Microsoft Education LTI'),
  portfolio: raw.includes('Canvas Portfolio'),
  respondus: raw.includes('Respondus'),
})
```

All six should come back `true` / a body length in the low thousands. If `lti`, `portfolio`, or `respondus` is `false`, the content landed in an embed rather than in the post body.
