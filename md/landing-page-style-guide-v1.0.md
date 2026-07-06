# myTech@Newark Landing Page Style Guide v1.1
**myTech@Newark — Innovation at Rutgers University–Newark**

---

## Purpose

This guide defines the design, content, and structural standards for all myTech@Newark landing pages. It ensures consistency across pages and alignment with the myTech@Newark brand.

Landing pages are distinct from Knowledge Base Articles (KBAs). They serve as navigation hubs and audience entry points — they orient users and route them to the right tools, articles, or support. See the KBA Style Guide for article-specific standards.

---

## Identity Bar

> **Delivered by Wix — do not include in landing page HTML files.** The Identity Bar is injected automatically at the top of every page on the myTech@Newark site.

The Identity Bar appears at the very top of the page content area (below the Wix site header).

| Property | Value |
|----------|-------|
| Site name | **MyTech@Newark** |
| Tagline | *Innovation at Rutgers University–Newark* |
| Background | Scarlet `#CC0033` |
| Text | White `#FFFFFF` |
| Font size | 11px eyebrow / 13px tagline |

The full tagline **"MyTech@Newark — Innovation at Rutgers University–Newark"** must appear on every landing page. Do not abbreviate, split, or omit it.

In the HTML, the tagline is rendered as:
- An eyebrow label: `myTech@Newark` (uppercase, letter-spaced, Scarlet `#CC0033`)
- A hero title or sub-heading: `Innovation at Rutgers University–Newark`

---

## Brand

### Typography

All landing pages use **Libre Franklin** loaded from Google Fonts. Include the following in every page `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Body | Libre Franklin | 400 | 15px |
| Page title / hero | Libre Franklin | 800 | clamp(26px, 3.5vw, 38px) |
| Section heading | Libre Franklin | 800 | 20px |
| Card heading | Libre Franklin | 700 | 13px |
| Eyebrow label | Libre Franklin | 700 | 11px, uppercase, letter-spacing .1em |
| Small/meta | Libre Franklin | 400 | 11–12px |

Line height: **1.6** for body, **1.1** for large titles.

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Scarlet | `#CC0033` | Primary CTA, links, accent borders, icons |
| Scarlet Dark | `#9E0025` | Scarlet hover state |
| Scarlet BG | `#FDF2F4` | Scarlet tinted background |
| Navy | `#1B3A6B` | Identity bar, secondary accent |
| Navy BG | `#EEF2F8` | Navy tinted background |
| Teal | `#00626D` | Classroom / engagement accent |
| Teal BG | `#E3F3F0` | Teal tinted background |
| Gold | `#A35500` | Course materials / semester accent |
| Gold BG | `#FFF4E6` | Gold tinted background |
| Green | `#1A7A4A` | Library / course materials accent |
| Green BG | `#E6F4ED` | Green tinted background |
| Black | `#1A1A1A` | Headings |
| Gray Dark | `#333333` | Body text |
| Gray Mid | `#666666` | Secondary text, meta |
| Gray Light | `#F5F5F5` | Page backgrounds, card hover |
| Gray Border | `#E0E0E0` | Dividers, card borders |
| White | `#FFFFFF` | Backgrounds, button text |

### CSS Variables

All landing pages must define and use these CSS custom properties:

```css
:root {
  --scarlet: #CC0033;
  --scarlet-dk: #9E0025;
  --scarlet-bg: #FDF2F4;
  --navy: #1B3A6B;
  --navy-bg: #EEF2F8;
  --teal: #00626D;
  --teal-bg: #E3F3F0;
  --gold: #A35500;
  --gold-bg: #FFF4E6;
  --green: #1A7A4A;
  --green-bg: #E6F4ED;
  --black: #1A1A1A;
  --gray-dark: #333333;
  --gray-mid: #666666;
  --gray-light: #F5F5F5;
  --gray-border: #E0E0E0;
  --white: #FFFFFF;
  --font: 'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --max: 964px;
  --radius: 6px;
}
```

Do not use hard-coded hex values in page CSS — always reference a variable.

---

## Layout

### Max Width & Padding

| Property | Value |
|----------|-------|
| Max content width | `calc(var(--max) + 64px)` = ~1028px |
| Horizontal page padding | `32px` left and right |
| Section vertical spacing | `28px` top, `16px` bottom for section headers |
| Card/grid margin bottom | `32px` |

### Page Structure

Every landing page follows this section order:

1. **Identity Bar** — brand + tagline (Navy background) — *delivered by Wix; do not include in HTML files*
2. **Hero** — page title, tagline, CTA buttons, supporting image or panel
3. **Action Bar** *(optional)* — 4-column quick-access tiles
4. **Page Body** — section-headed content blocks
5. **Footer Bar** — contact, location, email columns — *delivered by Wix; do not include in HTML files*

> **Note:** The Identity Bar and Footer Bar are injected automatically by Wix for all pages on the myTech@Newark site. Landing page HTML files should begin with the Hero and end after the page body content.

---

## Components

### Hero

The hero establishes the page purpose and primary call to action.

**Layout:** Two-column grid — text left, image or panel right. Collapses to single column below 860px.

| Element | Spec |
|---------|------|
| Eyebrow | 11px, uppercase, Scarlet, letter-spacing .1em |
| Title | 800 weight, clamp(26px – 38px), Black `#1A1A1A`, letter-spacing -.02em |
| Tagline | 14–15px, Gray Mid `#666666`, max-width 420–560px |
| CTA buttons | Primary (Scarlet fill) + Secondary (Scarlet outline) |
| Right element | Hero image (object-fit: cover) or info panel |
| Min height | 240–260px |

**Writing:** The hero title names the page purpose concisely (e.g., "Teaching with Technology"). The tagline adds one sentence of context — who it's for and what they'll find.

---

### CTA Buttons

| Type | Style |
|------|-------|
| Primary | Scarlet fill, White text, 10px/18px padding, 6px radius, 700 weight |
| Secondary / Outline | White fill, Scarlet border (1.5px), Scarlet text |
| Hover (primary) | Scarlet Dark `#9E0025` |
| Hover (secondary) | Scarlet BG `#FDF2F4` |
| Font size | 13px |
| Icon | 15×15px SVG, inline with 7px gap |

CTA label format: **Action → Destination** (e.g., "Get Help →", "Explore Services →"). Always include the arrow character `→`. Never use "Click here."

---

### Action Bar

A horizontal strip of 4 equal-width tiles for top-level navigation. Sits between the hero and page body.

| Element | Spec |
|---------|------|
| Layout | 4-column grid, full bleed |
| Borders | Top/bottom: 1px `#E0E0E0`; right divider between tiles |
| Tile padding | 18px 16px 14px |
| Icon | 26×26px SVG, Scarlet |
| Title | 13px, 700 weight, Black |
| Description | 11px, Gray Mid, line-height 1.4 |
| Arrow | `→`, Gray Mid |
| Hover | Gray Light `#F5F5F5` background |

Responsive: collapses to 2 columns below 720px, 1 column below 480px.

---

### Section Headers

Introduce each content section within the page body.

| Element | Spec |
|---------|------|
| Heading | 20px, 800 weight, Black |
| Section number | Scarlet, `margin-right: 2px` (e.g., "1.", "2.") |
| Subtext | 13px, Gray Mid |
| Padding | 28px top, 16px bottom |

---

### Card Grids

Used for task cards, semester stage cards, and tool cards. All card grids share these rules:

| Property | Value |
|----------|-------|
| Border | 1px `#E0E0E0`, 6px radius |
| Top accent | 3px solid, color matches the card's category color |
| Hover | Gray Light `#F5F5F5` background |
| Card padding | 18–20px |
| Icon container | 38–46px circle, tinted background matching accent color |
| Icon size | 18–22px SVG |
| Card heading | 13px, 700 weight, Black |
| Body text | 11–12px, Gray Mid, line-height 1.45–1.55 |
| Link | 12px, 600 weight, accent color, `→` suffix |

**Category color mapping for cards:**

| Category | Accent Color |
|----------|-------------|
| Build Your Course / Canvas | Scarlet `#CC0033` |
| Teach in the Classroom | Teal `#00626D` |
| Engage Students | Gold `#A35500` |
| Assess & Grade | Navy `#1B3A6B` |
| Manage Course Materials | Green `#1A7A4A` |
| Getting Started | Green `#1A7A4A` |
| End of Semester | Scarlet `#CC0033` |

---

### Support Panel

A highlighted panel promoting ATS consultation and support, used alongside tool card grids.

| Property | Value |
|----------|-------|
| Background | Gold BG `#FFF4E6` |
| Top border | 3px solid Gold `#A35500` |
| Border | 1px `#F0D9A0` |
| Heading | 15px, 700 weight |
| Body | 12px, Gray Dark, line-height 1.5 |
| Checklist icon | 15×15px SVG, Gold |
| CTAs | Solid Scarlet primary + Scarlet outline secondaries |

---

### Quick Strip

A dark band of quick-access links, typically placed at the bottom of the page body.

| Property | Value |
|----------|-------|
| Background | Black `#1A1A1A` |
| Bottom border | 2px solid Scarlet |
| Label | 10px, uppercase, Gray `#AAAAAA`, letter-spacing .1em |
| Pills | 11px, 600 weight, White, 1px border `rgba(255,255,255,.25)`, 20px border-radius |
| Pill hover | Scarlet fill and border |

---

### Footer Bar

> **Delivered by Wix — do not include in landing page HTML files.** The Footer Bar is injected automatically at the bottom of every page on the myTech@Newark site.

Four-column contact block at the bottom of every landing page.

| Property | Value |
|----------|-------|
| Background | Gray Light `#F5F5F5` |
| Top border | 1px `#E0E0E0` |
| Padding | 20px 32px |
| Column heading | 12px, 700 weight, Black |
| Column icon | 17×17px SVG, Scarlet |
| Body / links | 11px, Gray Mid |
| Link hover | Scarlet, underline |

**Standard footer columns:**

1. Need Help? — link to Getting Support page
2. IT Service Desk — phone number
3. Visit Us — Blumenthal Hall, Room 100, Newark NJ 07102
4. Email Us — atshelp@newark.rutgers.edu

---

## Writing Standards

### Voice & Tone

- **Direct and task-focused.** Faculty and staff are busy. Lead with what they can do, not what we do.
- **Accessible, not technical.** Avoid jargon. Write for first-time users.
- **Rutgers–Newark specific.** Prefer "Rutgers–Newark" over generic "Rutgers" when the content is campus-specific.

### Page Titles

- Short, noun-phrase format: "Teaching with Technology", "Teaching in Our Classrooms"
- Sentence case only — capitalize only the first word and proper nouns
- No punctuation at end

### Section Headings

- Use second-person questions or task-framing when possible: "What do you need to do?", "Where are you in the semester?"
- Keep under 8 words

### Card & Tile Headings

- Action-first or tool-name format: "Manage Your Course (Canvas)", "Fix a Problem"
- 13px, bold — treat as a label, not a sentence

### Body Text (Cards)

- 1–2 sentences max
- Describe what the user can do, not what the feature is
- End without a period only when the text is a fragment label; full sentences take periods

### CTA Link Text

| Do | Don't |
|----|-------|
| Get IT Help → | Click here |
| Explore Canvas → | Learn more |
| Schedule a Consultation → | Submit |
| View Classroom Support → | Go |

Always end with `→`. Use specific verbs: Get, Explore, View, Schedule, Find, Build, Submit.

### Audience References

| Term | Use when |
|------|----------|
| Rutgers–Newark | Newark-specific content or services |
| Rutgers University–Newark | Formal/brand contexts |
| All Rutgers | Content that applies across all campuses |
| Faculty / Staff / Students | Audience labels — never "users" in body copy |

---

## Responsive Breakpoints

| Breakpoint | Change |
|------------|--------|
| ≤ 860px | Hero collapses to 1 column; 4-col grids → 2 col |
| ≤ 720px | Action bar → 2 col; 3-col audience panel → 1 col |
| ≤ 540px | Card grids → 1 col |
| ≤ 480px | Action bar → 1 col; footer → 1 col |

---

## File Naming

Landing page HTML files follow this convention:

`[topic-slug]-v[version].html`

Examples: `faculty-landing-page-v2.html`, `teaching-in-our-classrooms-v1.1.html`, `home-page-v1.html`

Use lowercase, hyphens only, no spaces.

---

*Last updated: June 2026 — v1.1: Updated font from system stack to Libre Franklin*
