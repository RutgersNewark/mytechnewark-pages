#!/usr/bin/env python3
"""
build-seo-markup.py — turn an embed HTML file into a Velo seoMarkup page-code file.

Why: pages whose content lives in a cross-origin iframe serve crawlers nothing at the
real URL. A Wix custom element can be handed a server-rendered HTML string via
`$w('#el').seoMarkup = ...`, which Wix injects into the SEO response. This script
converts the existing embed markup into that string so the two stay in sync.

Usage:
    python3 velo/build-seo-markup.py                 # build everything in PAGES
    python3 velo/build-seo-markup.py classroom-support

Output: velo/<slug>.js — paste into Wix Editor > Dev Mode > Page Code.
Set ELEMENT_ID at the top of each generated file to the custom element's id.
"""
import html as htmllib
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "velo")
SITE = "https://mytech.newark.rutgers.edu"

# slug -> (source file, custom element id)
PAGES = {
    "classroom-support":           ("classroom-support.html",                    "classroomSupportElement"),
    "course-materials":            ("course-materials.html",                     "courseMaterialsElement"),
    "echo-poll":                   ("echo-poll.html",                            "echoPollElement"),
    "engage-students":             ("engage-students.html",                      "engageStudentsElement"),
    "finish-your-course":          ("finish-your-course.html",                   "finishYourCourseElement"),
    "oer":                         ("oer.html",                                  "oerElement"),
    "projects":                    ("projects.html",                             "projectsElement"),
    "raiderlink":                  ("raiderlink.html",                           "raiderlinkElement"),
    "teaching-in-our-classrooms":  ("teaching-in-our-classrooms.html",           "teachingInOurClassroomsElement"),
    "teaching-with-technology":    ("teaching-with-technology.html",             "teachingWithTechnologyElement"),
    "technology-resource-centers": ("technology-resource-centers.html",          "technologyResourceCentersElement"),
    "teaching-in-auditoriums":     ("kbas/teaching-in-auditoriums-kba.html",     "teachingInAuditoriumsElement"),
    "teaching-in-classrooms":      ("kbas/teaching-in-digital-classrooms.html",  "teachingInClassroomsElement"),
    "getting-started-with-canvas": ("getting-started-canvas.html",               "gettingStartedCanvasElement"),
}

# Content that must never be published. ATS sits in Blumenthal Hall, Room 100, but
# faculty are not to drop by; walk-in help is the IT Service Center, Hill Hall Room 109.
BANNED = re.compile(r"blumenthal", re.I)

# Pages whose <h1> (and opening sections) are native Wix content above the element.
# The element holds only the lower sections, so its crawler copy must not add an <h1>.
NATIVE_H1 = set()  # getting-started-with-canvas is now one full-page element (2026-10-07)

# Layout placeholders meant for whoever builds the page, not for readers. They must never
# reach a crawler — a search snippet reading "App screenshot placeholder" is worse than
# no snippet. Any line matching this is dropped and reported.
PLACEHOLDER = re.compile(
    r"placeholder|suggested image|replace this (area|image|text)|lorem ipsum|"
    r"image goes here|tbd|coming soon",
    re.I,
)

# Wrapper elements (article/section/header) carry no weight for a crawler — headings and
# paragraphs do — but they nest deeply in the source and any dropped close tag corrupts
# the whole string. They are deliberately not kept; the template supplies one <article>.
KEEP = {"h1","h2","h3","h4","p","ul","ol","li","a","strong","em"}
DROP_TREE = {"style","script","svg","noscript","head","title","path","circle","polyline","rect","line","g"}
BLOCK = {"h1","h2","h3","h4","p","ul","ol","li"}


class Extract(HTMLParser):
    """Pull readable structure out of an embed file.

    Text inside a kept block element stays inline in that block. Text that sits in a
    bare div or span — stat cards, button labels, eyebrows — would otherwise run
    together into one unreadable line, so every non-kept tag acts as a separator and
    each loose run is flushed into a paragraph of its own.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.pending = []
        self.skip = 0
        self.block_depth = 0
        self.stack = []
        self.anchor_buf = []

    def flush(self):
        text = "".join(self.pending).strip()
        self.pending = []
        if not text:
            return
        if not re.search(r"[A-Za-z0-9]", re.sub(r"<[^>]+>", "", text)):
            return
        self.out.append(f"<p>{text}</p>")

    def handle_starttag(self, tag, attrs):
        if tag in DROP_TREE:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "br":
            (self.out if self.block_depth else self.pending).append(" ")
            return
        if tag not in KEEP:
            self.flush()
            return
        if tag == "a":
            href = dict(attrs).get("href", "")
            if not href or href.startswith(("#", "javascript:")):
                return
            if href.startswith("/"):
                href = SITE + href
            open_tag = f'<a href="{htmllib.escape(href, quote=True)}">'
            in_block = self.block_depth > 0
            (self.out if in_block else self.pending).append(open_tag)
            self.stack.append("a")
            self.anchor_buf.append(in_block)
            return
        self.flush()
        self.out.append(f"<{tag}>")
        self.stack.append(tag)
        if tag in BLOCK:
            self.block_depth += 1

    def handle_endtag(self, tag):
        if tag in DROP_TREE:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag == "br":
            return
        if tag not in KEEP:
            self.flush()
            return
        if not (self.stack and self.stack[-1] == tag):
            return
        self.stack.pop()
        if tag == "a":
            # close the anchor in whichever buffer its opening tag went to
            in_block = self.anchor_buf.pop() if self.anchor_buf else self.block_depth > 0
            (self.out if in_block else self.pending).append("</a>")
            return
        self.out.append(f"</{tag}>")
        if tag in BLOCK:
            self.block_depth -= 1
            self.flush()

    def handle_data(self, data):
        if self.skip:
            return
        text = re.sub(r"\s+", " ", data)
        if not text.strip():
            return
        esc = htmllib.escape(text, quote=False)
        if self.block_depth:
            self.out.append(esc)
        else:
            self.pending.append(esc)

    def close(self):
        super().close()
        self.flush()


def tidy(markup: str) -> str:
    markup = re.sub(r"\s+", " ", markup)
    markup = re.sub(r"<(\w+)>\s*</\1>", "", markup)          # empty elements
    markup = re.sub(r"<(\w+)>\s*</\1>", "", markup)          # again, for nesting
    for tag in BLOCK:
        markup = markup.replace(f"<{tag}>", f"\n<{tag}>")
        markup = markup.replace(f"</{tag}>", f"</{tag}>\n")
    lines = [ln.strip() for ln in markup.split("\n")]
    return "\n".join(ln for ln in lines if ln)


def build(slug, src, element_id):
    path = os.path.join(ROOT, src)
    raw = open(path, encoding="utf-8").read()
    tm = re.search(r"<title>(.*?)</title>", raw, re.S | re.I)
    page_title = htmllib.unescape(tm.group(1)).strip() if tm else ""
    page_title = re.split(r"\s*\|\s*", page_title)[0].strip()
    p = Extract()
    p.feed(raw)
    p.close()
    body = tidy("".join(p.out))

    warnings = []
    if BANNED.search(body):
        warnings.append("Removed a line naming the ATS office address.")
        body = "\n".join(ln for ln in body.split("\n") if not BANNED.search(ln))

    dropped = [ln for ln in body.split("\n") if PLACEHOLDER.search(ln)]
    if dropped:
        n = len(dropped)
        warnings.append(
            f"Dropped {n} layout placeholder line{'s' if n > 1 else ''} "
            f"(e.g. {re.sub(r'<[^>]+>', '', dropped[0]).strip()[:60]!r}) — "
            "still visible on the page itself; replace them there."
        )
        body = "\n".join(ln for ln in body.split("\n") if not PLACEHOLDER.search(ln))

    # Several embeds style their page title as a plain div, so the extracted markup has
    # no <h1>. A crawler reading this string needs one, so promote the first line if it
    # matches the source's <title>, otherwise insert the title as the heading.
    # Pages in NATIVE_H1 already carry their <h1> in native Wix content outside the
    # element; inserting another would give the page two.
    if slug in NATIVE_H1:
        warnings.append("No <h1> inserted — this page's <h1> is native Wix content outside the element.")
    elif "<h1>" not in body and page_title:
        lines = body.split("\n")
        for i, ln in enumerate(lines[:4]):
            if re.sub(r"<[^>]+>", "", ln).strip().lower() == page_title.lower():
                lines[i] = f"<h1>{htmllib.escape(page_title)}</h1>"
                warnings.append(f'Promoted "{page_title}" to the <h1> (the embed styles it as a div).')
                break
        else:
            lines.insert(0, f"<h1>{htmllib.escape(page_title)}</h1>")
            warnings.append(f'Inserted <h1>{page_title}</h1> — the embed has no heading element for its title.')
        body = "\n".join(lines)

    # A jump from h1 straight to h3 is a structure a crawler reads as a broken outline.
    if "<h3>" in body and "<h2>" not in body:
        body = body.replace("<h3>", "<h2>").replace("</h3>", "</h2>")
        warnings.append("Promoted h3 to h2 — the source skipped a heading level.")

    # Same for h2 straight to h4 (card titles styled as h4 under a section h2).
    if "<h4>" in body and "<h2>" in body and "<h3>" not in body:
        body = body.replace("<h4>", "<h3>").replace("</h4>", "</h3>")
        warnings.append("Promoted h4 to h3 — the source skipped a heading level.")

    if "<h1>" not in body and slug not in NATIVE_H1:
        warnings.append("No <h1> and no usable <title> — add one before publishing.")

    # safe inside a JS template literal
    body = body.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

    var = re.sub(r"-(\w)", lambda m: m.group(1).upper(), slug) + "SeoMarkup"
    warn_block = ""
    if warnings:
        warn_block = " *\n" + "\n".join(f" * REVIEW: {w}" for w in warnings) + "\n"

    js = f"""/**
 * {slug}.js — SEO markup for /{slug}
 * Paste into: Wix Editor > Dev Mode > Page Code for this page.
 *
 * Generated from {src} by velo/build-seo-markup.py.
 * The visible page stays the custom element; this string is what Wix serves to
 * crawlers at the real URL. Keep the two materially consistent — if you edit the
 * embed, re-run the generator rather than editing this file by hand.
{warn_block} *
 * Set ELEMENT_ID to the custom element's id in the editor if it differs.
 */

const ELEMENT_ID = '#{element_id}';

const {var} = `
<article>
{body}
</article>
`;

$w.onReady(function () {{
  // seoMarkup exists on a Custom Element. If this page's content is still an HTML
  // (iframe) embed, or the id below is wrong, there is nothing to assign to and the
  // page keeps serving crawlers an empty shell. Fail loudly rather than silently.
  let el;
  try {{
    el = $w(ELEMENT_ID);
  }} catch (e) {{
    console.error(`seoMarkup: no element ${{ELEMENT_ID}} on /{slug} — check the id in the editor.`);
    return;
  }}
  if (!el || typeof el !== 'object') {{
    console.error(`seoMarkup: $w(${{ELEMENT_ID}}) returned nothing on /{slug}.`);
    return;
  }}
  if (!('seoMarkup' in el)) {{
    console.error(
      `seoMarkup: ${{ELEMENT_ID}} on /{slug} has no seoMarkup property. ` +
      `That property belongs to a Custom Element — an HTML iframe embed does not have it.`
    );
    return;
  }}
  el.seoMarkup = {var};
}});
"""
    dest = os.path.join(OUT, f"{slug}.js")
    open(dest, "w", encoding="utf-8").write(js)
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return slug, words, warnings


if __name__ == "__main__":
    targets = sys.argv[1:] or list(PAGES)
    os.makedirs(OUT, exist_ok=True)
    for slug in targets:
        if slug not in PAGES:
            print(f"  ?  {slug}: not in PAGES"); continue
        src, eid = PAGES[slug]
        if not os.path.exists(os.path.join(ROOT, src)):
            print(f"  !  {slug}: missing source {src}"); continue
        s, w, warns = build(slug, src, eid)
        flag = "  <-- " + " ".join(warns) if warns else ""
        print(f"  ok {s:<30} {w:>5} words{flag}")
