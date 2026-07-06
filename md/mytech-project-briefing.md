# myTech@Newark — Project Briefing
**For:** Claude Cowork / new session context  
**Project:** myTech@Newark website (Rutgers University–Newark, Academic Technology Services)  
**Last updated:** May 2026

---

## What This Is

myTech@Newark is a faculty-facing technology support website for Rutgers University–Newark, built in Wix. It serves as the **discovery layer** for instructional technology — faculty find information here and are referred to ServiceNow for full KB articles. The site is managed by Technology & Learning Spaces (TLS), also referred to as Academic Technology Services (ATS).

**Live site:** https://account577280.wixsite.com/mytechnewark  
**Support email:** atshelp@newark.rutgers.edu  
**Phone:** 973-353-1713  
**Location:** Blumenthal Hall, Room 100

---

## Architecture Overview

The site has two content layers:

**1. Wix (myTech@Newark)** — Discovery and navigation  
- Category landing pages  
- Topic/sub-category landing pages  
- KB stub pages (dynamic, redirect to ServiceNow)  

**2. ServiceNow** — Full KB article content  
- Base URL: `https://rutgers.service-now.com/kb_view.do?sysparm_article=`  
- Articles identified by ID e.g. `KB0012345`

Faculty find articles on Wix via search or browsing → stub page shows title, summary, tags → auto-redirects to ServiceNow after 5 seconds.

---

## KB Content Structure

### Categories (7)
| Category | Color |
|---|---|
| Build Your Course | Red `#CC0033` |
| Teach in the Classroom | Teal `#00626D` |
| Engage Your Students | Gold `#C96A00` |
| Assess & Grade | Navy `#1B3A6B` |
| Manage Course Materials | Green `#1A7A4A` |
| Teach with AI | Red `#CC0033` |
| Accessibility & Inclusion | Navy `#1B3A6B` |

### Tiers (3)
| Tier | Description | Color |
|---|---|---|
| How To | Step-by-step task instructions | Teal `#E3F3F0 / #00626D` |
| What's Possible | Exploratory — what a tool can do | Navy `#EEF2F8 / #1B3A6B` |
| Best Practice | Pedagogical guidance | Gold `#FFF4E6 / #C96A00` |

---

## Wix CMS Collections

### KBArticles
| Field | Type | Notes |
|---|---|---|
| title | Text | Article title |
| slug | Text | URL path e.g. `setup-rubric-speedgrader` |
| summary | Long Text | 2–3 sentence description |
| tier | Text | How To / What's Possible / Best Practice |
| category | Reference → KBCategories | |
| categoryName | Text | Denormalized for display |
| tags | Tags | Canvas, SpeedGrader, Grading, etc. |
| serviceNowArticleId | Text | e.g. `KB0012345` |
| featured | Boolean | Surface on KB homepage |
| semesterPhase | Text | Getting Started / Mid-Semester / End of Semester |
| lastReviewed | Date | Content freshness tracking |

### KBCategories
| Field | Type |
|---|---|
| title | Text |
| slug | Text |
| description | Text |
| icon | Text (SVG or emoji) |
| color | Text (hex) |
| sortOrder | Number |

### KBAnalytics
| Field | Type | Notes |
|---|---|---|
| articleId | Text | |
| articleTitle | Text | |
| articleSlug | Text | |
| category | Text | |
| tier | Text | |
| eventType | Text | `view` or `clickthrough` |
| timestamp | Date | |

**Permissions:** KBAnalytics must be set to "Anyone can write" so the Velo code can insert records from the browser.

---

## KB Stub Page (Dynamic Page)

**Wix page URL pattern:** `/kbarticles/{slug}`  
**Connected to:** KBArticles CMS collection  
**Page type:** Single Item dynamic page

### What the stub page does
- Shows article title, tier badge, category breadcrumb, summary, tags
- Starts a **5-second countdown** with animated progress bar
- Auto-redirects to ServiceNow in a new tab
- Faculty can click "Read Full Article" to go immediately
- "Cancel redirect" button stops countdown and hides the strip
- Loads 3 related articles from the same category
- Logs every view and click-through to KBAnalytics

### Required page element IDs
| ID | Type | Purpose |
|---|---|---|
| `#articleTitle` | Text | Article heading |
| `#tierBadge` | Text | Tier label |
| `#categoryName` | Text (link) | Category label + link |
| `#articleSummary` | Text | Summary paragraph |
| `#breadcrumbCategory` | Text (link) | Breadcrumb |
| `#countdownNum` | Text | Countdown number |
| `#redirectStatus` | Box | Full countdown strip |
| `#redirectComplete` | Box | Success state (hidden initially) |
| `#progressBar` | Box | Animated bar (initial width: 0%) |
| `#ctaBtn` | Button | "View Full Article" → ServiceNow |
| `#cancelBtn` | Button/link | "Stay on this page" |
| `#tagsRepeater` | Repeater | Tag pills |
| `#tagText` | Text (inside repeater) | Individual tag |
| `#relatedRepeater` | Repeater | Related articles |
| `#relatedTitle` | Text (inside repeater) | Related article title |
| `#relatedMeta` | Text (inside repeater) | Tier · Category |
| `#relatedIcon` | Box (inside repeater) | Color icon |
| `#relatedSection` | Box | Wraps related section (hideable) |

### Velo code
File: `kb-stub-velo.js` (in project files)  
Paste into: **Page Code** panel (bottom of Wix Editor, Dev Mode on) for the KB dynamic page only.

Key config constants at top of file:
```js
const COUNTDOWN_SECONDS = 5;
const KB_BASE_URL = 'https://rutgers.service-now.com/kb_view.do?sysparm_article=';
```

---

## KB Article HTML Template

File: `sn-kb-article-example.html` (in project files)  
This is the **completed example article** — "How to Set Up a Rubric in Canvas SpeedGrader" — showing the full HTML/CSS design system for ServiceNow KB articles.

### Article structure
- Institution header (Rutgers R mark, myTech@Newark branding)
- Tier badge + RU-N Specific flag
- H1 title + summary + meta row + tags
- Body sections using `.kb-h2`, `.kb-h3`, `.kb-p`
- Numbered steps: `.kb-steps ol`
- Callout boxes: `.kb-callout` with variants: `software`, `policy`, `building`, `support`, `workflow`
- Tips: `.kb-tip`
- Related articles grid
- Footer

### Callout label suffix
All `.kb-callout-label` elements append "Rutgers–Newark Only" via CSS `::after` — this is intentional.

---

## File Naming Convention

KB article HTML files follow: `kb-[topic-slug]-[status].html`  
Examples: `kb-rubric-speedgrader-approved.html`, `kb-akindi-draft.html`

---

## Content Tracker

An Excel workbook was built with two tabs:
- **Landing Pages** — page name, URL, type, status, SME, notes
- **KB Articles** — title, slug, category, tier, ServiceNow ID, tags, status, SME, review date

Status stages: Draft → Ready for Review → SME Review → Revisions Needed → Approved

SME review workflow uses Word (Track Changes) + Teams for handoff.

---

## SEO & Search

- Wix dynamic pages are server-side rendered — Google can index them
- SEO set dynamically via `wixSeo.setTitle()` and `wixSeo.setDescription()` in Velo code
- For Wix site search: connect a Custom Index to KBArticles collection (Search → Customize Search Results → Add Custom Index)
- Fields to index: `title`, `summary`, `categoryName`, `tags`

---

## Known Issues / Open Items

- **CMS import order matters:** import KBCategories first, then KBArticles, then KBAnalytics
- **KBAnalytics permissions** must be set to "Anyone can write" — easy to miss
- `#progressBar` initial width must be set to **0%** in the Editor or it won't animate correctly
- `wixWindow.openModal()` is used for the redirect (external URL in new tab) — fallback is `wixLocation.to()`
- Open Graph meta tags (`og:title`, `og:description`) not yet added to Velo code — worth adding for Teams/email link previews
- Article content in ServiceNow is not indexed by Wix search — only stub content (title, summary, tags) is searchable on myTech

---

## Articles Drafted So Far

| Title | Slug | Category | Status |
|---|---|---|---|
| How to Set Up a Rubric in Canvas SpeedGrader | setup-rubric-speedgrader | Assess & Grade | Example / Approved |
| Respondus LockDown Browser: Student Guide | lockdown-browser-student | Assess & Grade | Draft |
| Akindi Bubble Sheet Scanning | akindi-bubble-sheet | Assess & Grade | Draft |
| Canvas Announcements | canvas-announcements | Engage Your Students | Draft |
| Qwickly Attendance | qwickly-attendance | Teach in the Classroom | Draft |
| First Day Course Materials (Barnes & Noble) | first-day-course-materials | Manage Course Materials | Draft |

---

## Contacts

| Role | Name/Info |
|---|---|
| TLS/ATS support email | atshelp@newark.rutgers.edu |
| TLS phone | 973-353-1713 |
| TLS location | Blumenthal Hall, Room 100 |
| Canvas login | rutgers.instructure.com |
| ServiceNow portal | rutgers.service-now.com |
| myTech site | account577280.wixsite.com/mytechnewark |
