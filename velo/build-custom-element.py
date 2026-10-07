#!/usr/bin/env python3
"""Build a self-contained Wix custom element from a landing-page HTML file.

    python3 velo/build-custom-element.py oer            # one page
    python3 velo/build-custom-element.py                # every page in PAGES

Writes velo/custom-elements/<slug>.js, to be pasted into
Wix Editor > Dev Mode > Public/custom-elements/<slug>.js.

Why this exists: public/mytech-page.js fetches the page HTML from GitHub Pages at
runtime, and in practice that renders nothing inside Wix. The pattern that does
work (Public/custom-elements/getting-help.js) inlines the CSS and HTML and writes
them straight into a shadow root. This generator produces that pattern from the
same source file build-seo-markup.py reads, so the visible element and the
crawler copy (velo/<slug>.js, seoMarkup) cannot drift apart.

Two files per page, two different places in Wix — do not swap them:
  velo/custom-elements/<slug>.js  -> Public/custom-elements/<slug>.js  (visible page)
  velo/<slug>.js                  -> that page's own Page Code panel   (crawler copy)

Shadow-DOM conversions applied to the CSS (works on minified CSS too):
  :root { ... }  ->  :host { ... }   custom properties must live on the host
  body  { ... }  ->  :host { ... }   there is no body inside a shadow root
  plus :host { display:block; width:100%; min-width:0 } so Wix sizes it

Page scripts: document.getElementById / querySelector cannot see into a shadow
root. A source <script> is therefore run inside a function whose `document` is a
small shim that resolves lookups against the shadow root and creates nodes on the
real document. Any other document.* use stops the build rather than failing
silently in the browser. Pages with no script get in-page #anchor scrolling.

Refuses to build if the output would publish the ATS office (Blumenthal Hall):
faculty are not to drop by; walk-in help is the IT Service Center, Hill Hall 109.
"""
import importlib.util, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "custom-elements")

# Source files come from build-seo-markup.py's PAGES, so both generators read the
# same file for a page. Element ids come from the generated page code velo/<slug>.js,
# so the element id and the $w() selector cannot disagree.
_spec = importlib.util.spec_from_file_location("seo", os.path.join(HERE, "build-seo-markup.py"))
_seo = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_seo)

# Pages this generator builds. Tag convention is mytech-<page> (reference doc 4.5).
# Not listed: pages already converted and live from other sources (raiderlink,
# technology-resource-centers, getting-support) — regenerating would fork them.
PAGES = [
    "oer",
    "classroom-support",
    "course-materials",
    "echo-poll",
    "engage-students",
    "finish-your-course",
    "getting-started-with-canvas",
    "projects",
    "teaching-in-auditoriums",
    "teaching-in-classrooms",
    "teaching-in-our-classrooms",
    "teaching-with-technology",
]

# Tag overrides. On two publishes (2026-10-07) the tag for this page was saved
# truncated in the editor ("mytech-getting", then "mytech-getting-started-with").
# Not a Wix length limit: mytech-technology-resource-centers (34) works live.
# A shorter tag is simply harder to mistype. After publishing, confirm the live
# tag matches the file's customElements.define() name exactly.
TAG_OVERRIDE = {"getting-started-with-canvas": "mytech-getting-started"}

FONT = ("@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:"
        "wght@400;500;600;700;800&display=swap');")
BANNED = re.compile(r"blumenthal", re.I)
DOC_OK = {"getElementById", "querySelector", "querySelectorAll", "createElement",
          "createTextNode", "createDocumentFragment"}

# A selector "body"/"html"/":root" at the start of a selector: after start of
# text, a brace, a semicolon, a comma or whitespace — never ".page-body" or "#body".
def _sel(name):
    return r"(^|[{};,\s])(" + name + r")(?=\s*[{,])"


def js_template_escape(s):
    # Content goes inside a JS template literal: escape \ first, then ` and ${
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def convert_css(slug, css):
    css, n_root = re.subn(_sel(r":root"), r"\1:host", css, flags=re.M)
    css, n_body = re.subn(_sel(r"body"), r"\1:host", css, flags=re.M)
    left = re.findall(_sel(r"html|body"), css, flags=re.M)
    if left:
        sys.exit(f"{slug}: html/body selectors left that match nothing in a shadow root: {left}")
    if n_root < 1:
        sys.exit(f"{slug}: no :root block found — colour variables would be lost")
    host = ":host { display: block; width: 100%; min-width: 0; }"
    return f"{FONT}\n\n{host}\n{css.strip()}\n", n_root, n_body


def class_name(tag):
    return "".join(p.capitalize() for p in tag.split("-"))


def element_id(slug):
    page_code = os.path.join(HERE, f"{slug}.js")
    m = re.search(r"const ELEMENT_ID = '#([A-Za-z0-9_]+)'", open(page_code, encoding="utf-8").read())
    if not m:
        sys.exit(f"{slug}: no ELEMENT_ID in velo/{slug}.js — run build-seo-markup.py first")
    return m.group(1)


def build(slug):
    src = _seo.PAGES[slug][0]
    tag, elem_id = TAG_OVERRIDE.get(slug, f"mytech-{slug}"), element_id(slug)
    html = open(os.path.join(ROOT, src), encoding="utf-8").read()
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    title = re.sub(r"\s*\|.*$", "", title.group(1)).strip() if title else slug

    styles = re.findall(r"<style[^>]*>(.*?)</style>", html, re.S)
    if len(styles) != 1:
        sys.exit(f"{slug}: expected 1 <style> block, found {len(styles)}")
    body = re.search(r"<body[^>]*>(.*?)</body>", html, re.S)
    if not body:
        sys.exit(f"{slug}: no <body>")
    scripts = [s.strip() for s in re.findall(r"<script\b[^>]*>(.*?)</script>", body.group(1), re.S)]
    body_html = re.sub(r"<script\b.*?</script>", "", body.group(1), flags=re.S).strip()

    if BANNED.search(body_html):
        sys.exit(f"{slug}: source names Blumenthal Hall (ATS office) — fix {src} before publishing")
    for s in scripts:
        bad = set(re.findall(r"\bdocument\.(\w+)", s)) - DOC_OK
        if bad or "window.document" in s:
            sys.exit(f"{slug}: script uses document.{sorted(bad)} — port it by hand")
        if "`" in s:
            sys.exit(f"{slug}: script contains a backtick — port it by hand")

    css, n_root, n_body = convert_css(slug, styles[0])
    cls = class_name(tag)

    if scripts:
        behaviour = (
            "      this.runPageScripts(root);\n")
        method = """
  // The source page's own script, run against the shadow root. Inside it,
  // `document` is a shim: lookups resolve in the shadow root, node creation
  // happens on the real document.
  runPageScripts(root) {
    const shim = {
      getElementById: (id) => root.getElementById(id),
      querySelector: (sel) => root.querySelector(sel),
      querySelectorAll: (sel) => root.querySelectorAll(sel),
      createElement: (name, opts) => window.document.createElement(name, opts),
      createTextNode: (text) => window.document.createTextNode(text),
      createDocumentFragment: () => window.document.createDocumentFragment(),
    };
""" + "".join(
            f"    (function (document) {{\n{s}\n    }}).call(this, shim);\n" for s in scripts
        ) + "  }\n"
    else:
        behaviour = "      this.initializeAnchorLinks(root);\n"
        method = """
  // In-page "#section" links: document.getElementById cannot see into a shadow
  // root, so resolve the target against the root itself.
  initializeAnchorLinks(root) {
    root.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = (link.getAttribute('href') || '').slice(1);
        const target = id && root.getElementById(id);
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
"""

    js = f"""// FILE: Public/custom-elements/{slug}.js
// PAGE: {title} (mytech.newark.rutgers.edu/{slug})
// WIX SETUP: Add panel, Embed Code, Custom Element. Source = this Velo file. Tag name = {tag}
// ELEMENT ID: {elem_id} in Properties and Events. Hidden and Collapsed must be unchecked.
// CRAWLER COPY: velo/{slug}.js goes in THIS PAGE's Page Code panel — not this file.
// GENERATED by velo/build-custom-element.py from {src}. Edit {src} and regenerate; do not hand-edit.
// COPY EVERYTHING BELOW THIS LINE INTO THE FILE

const CSS = `
{js_template_escape(css)}`;

const HTML = `
{js_template_escape(body_html)}
`;

class {cls} extends HTMLElement {{
  constructor() {{
    super();
    this._initialized = false;
  }}

  connectedCallback() {{
    if (this._initialized) {{
      return;
    }}
    this._initialized = true;

    try {{
      const root = this.attachShadow({{ mode: 'open' }});
      root.innerHTML = `<style>${{CSS}}</style>${{HTML}}`;
{behaviour}      console.info('[myTech] {tag} initialized');
    }} catch (error) {{
      console.error('[myTech] Failed to initialize {tag}', error);
      this.innerHTML = `
        <div style="padding:20px;font-family:Arial,sans-serif;border:1px solid #CC0033;color:#222;">
          The {title} component could not be loaded. Check the browser console for details.
        </div>`;
    }}
  }}
{method}}}

if (!customElements.get('{tag}')) {{
  customElements.define('{tag}', {cls});
}}
"""
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{slug}.js")
    open(out, "w", encoding="utf-8").write(js)
    words = len(re.sub(r"<[^>]+>", " ", body_html).split())
    print(f"  ok {slug:28s} {os.path.getsize(out)/1024:5.1f} KB  ~{words:4d} words  "
          f"tag {tag:36s} id {elem_id:34s} scripts {len(scripts)}")


if __name__ == "__main__":
    for slug in (sys.argv[1:] or PAGES):
        if slug not in _seo.PAGES:
            sys.exit(f"unknown slug {slug!r}; add it to build-seo-markup.py PAGES first")
        build(slug)
