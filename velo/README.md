# Velo seoMarkup blocks

## What this is

Most myTech pages deliver their content inside a cross-origin iframe, so a crawler
fetching `mytech.newark.rutgers.edu/<page>` sees a navigation menu and nothing else.
The content is real, but it lives at a different address on a different domain, and
iframed content is not attributed to the page that frames it.

A Wix **custom element** can be handed an HTML string through `seoMarkup`. Wix injects
that string into the response it serves crawlers, at the real URL. `/getting-support`
already works this way. These files extend the same pattern to the other pages.

## Files

- `build-seo-markup.py` — converts an embed HTML file into a ready-to-paste page-code file
- `<slug>.js` — one generated file per page

## Using a generated file

1. Open the page in the Wix Editor, turn on Dev Mode.
2. Confirm the custom element's id. Each file declares it at the top as `ELEMENT_ID`;
   the generator guesses from the slug, so it will usually need correcting once.
3. Paste the file's contents into the Page Code panel for that page.
4. Publish, then check the result — not the PATCH response, the page. The SEO response
   is only visible to a crawler user-agent, so use the Wix SEO panel's preview or a
   request with a Googlebot UA. A normal browser fetch will not show it.

## Regenerating

```
python3 velo/build-seo-markup.py                 # everything
python3 velo/build-seo-markup.py oer             # one page
```

The generator reads `PAGES` at the top of the script — slug, source file, element id.
Add a row there to cover a new page.

**Edit the embed, not the generated file.** The whole point is that the two stay in
sync; a hand-edit to a `.js` file is lost the next time the generator runs.

## Two things the generator enforces

**The ATS office address is never published.** ATS is in Blumenthal Hall, Room 100, but
faculty are not to drop by — ATS is reachable by email, phone, and the consultation
booking link. Walk-in help is the IT Service Center, Hill Hall Room 109. Any line
naming Blumenthal is stripped and the removal is noted in the file's header comment.

**Every page gets exactly one `<h1>`.** Several embeds style their page title as a plain
div. Where that happens the generator promotes or inserts the title from the source's
`<title>` tag, and says so in the header. It also promotes `h3` to `h2` where a source
skipped a level.

## Keep it honest

`seoMarkup` must stay **materially consistent with the visible page**. Serving crawlers
content that differs from what a visitor sees is cloaking, and search engines penalize
it. Generating from the embed is what keeps this safe: the string is a plain-HTML
rendering of the same content, not a different message. If you ever find yourself
adding text to a `.js` file that is not on the page, stop.
