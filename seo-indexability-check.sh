#!/usr/bin/env bash
#
# seo-indexability-check.sh — check whether pages are indexable for SEO.
#
# Shared by myTech@Newark (Wix) and myRUN (Drupal 7). Keep the two copies identical:
#   ~/Documents/Claude/Projects/MyTech Website/seo-indexability-check.sh
#   ~/Documents/MyRUN/seo-indexability-check.sh
# Site-specific behaviour is detected at runtime (see `platform`), not forked.
#
# ── The principle ────────────────────────────────────────────────────────────
# There are TWO responses, and they answer different questions.
#
#   * The BOT response (Googlebot UA) is what Google indexes. Every verdict keys
#     off this one.
#   * The BROWSER response (Chrome UA) is only useful as a comparison. The GAP
#     between the two is the most diagnostic thing we can measure.
#
# Wix serves a server-rendered copy to recognised crawler user-agents. A custom
# UA does NOT earn that render — it gets the client-side bundle instead. Versions
# of this script before 2026-09-11 used a custom UA and therefore measured the
# browser response while reporting it as what Google sees. Every number produced
# before that date describes the wrong response.
#
# Hence the seo_render self-check: we assert we got the response we think we got,
# rather than assuming the request worked. If seo_render=no, the UA didn't earn
# the crawler render and every other number in that row is describing the wrong
# page — so it is treated as a hard blocker.
#
# That assertion only makes sense on Wix. Server-rendered platforms (Drupal) return
# the same HTML to every UA; there is nothing to earn, so seo_render reports n/a
# there rather than a misleading "no". The `platform` column records which case
# applies. Assert only where the assertion is meaningful.
#
# ── What it checks ───────────────────────────────────────────────────────────
# Once, off the BOT fetch:
#   1. Final HTTP status (after following redirects)
#   2. Reached direct vs via-redirect (requested URL vs final URL)
#   3. X-Robots-Tag response header  (noindex / nofollow)
#   4. <meta name="robots"> in the HTML  (noindex / nofollow)
#   5. <link rel="canonical">  (self-referencing vs pointing elsewhere)
#   6. robots.txt  (is the path Disallow'd for user-agent *)
#   7. Sitemap membership — for a scratch page, being *in* the sitemap is the defect
#   8. seo_render  — did we actually get the crawler render? (the self-check)
#   9. <title>, meta description, <h2> count, og:image
#
# Twice, against BOTH bodies:
#  10. Crawler-visible word count (scripts stripped)
#  11. Text-aware <h1> (present / empty / missing) and its text
#
# Derived from the pair:
#  12. delivery — MEASURED, not inferred (see the table below)
#  13. h1_match — do the bot and browser <h1>s agree? Drift means the crawler
#      markup has fallen out of sync with what users see.
#
# ── delivery ─────────────────────────────────────────────────────────────────
#   bot    browser   delivery        what it is
#   high   high      native          native Wix elements — present in both
#   high   low       ssr-only        custom element + seoMarkup — crawlable,
#                                    invisible to a browser fetch. NOT a problem.
#   low    high      investigate     shouldn't happen
#   low    low       iframe/empty    the actual problem
#
# A page is reported NOT INDEXABLE if any hard blocker is present:
#   non-200 final status, X-Robots-Tag noindex, meta robots noindex,
#   or a robots.txt disallow. Canonical-elsewhere and thin content are WARNINGS.
#
# Usage:
#   ./seo-indexability-check.sh https://mytech.newark.rutgers.edu/oer ...
#   ./seo-indexability-check.sh -f urls.txt           # one URL per line (# comments ok)
#   ./seo-indexability-check.sh -c -f urls.txt        # also write CSV to seo-indexability.csv
#   ./seo-indexability-check.sh -m 130 -f urls.txt    # thin-content threshold (default 130)
#   ./seo-indexability-check.sh --no-sitemap -f urls.txt   # skip sitemap membership crawl
#
# Requires: curl and perl (both standard on macOS).

set -uo pipefail

# Googlebot's UA earns the server-rendered crawler copy from Wix. Do not change
# this to something custom without re-checking the seo_render column.
UA_BOT="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
UA_HUMAN="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

CSV_OUT=""
URLS=()

# Pages with fewer crawler-visible words than this (in the BOT response) are
# flagged thin.
#
# Derived 2026-09-11 from a full bot-UA run, NOT guessed. Under the Googlebot UA
# the myTech embed-only pages cluster tightly at 115-119 words (the nav menu); the
# next real page up is 146. 130 sits in that gap. The previous default of 150 came
# from browser-response measurements and does not apply here.
#
# Site profiles (re-derive from data, don't carry numbers over):
#   myTech (Wix)     shell = 115-119, shortest real page = 146  -> 130 splits them
#   myRUN  (Drupal)  404 chrome = 64, shortest real page = 1273 -> 130 is a safe
#                    "genuinely empty" floor. NOTE it will NOT catch a myRUN page
#                    that renders full template chrome with an empty body (~1273
#                    words of nav alone). We have no confirmed example of one to
#                    calibrate against, so that threshold is deliberately not
#                    guessed. If one turns up, set -m from it.
VIS_MIN=130

# Sitemap membership: a URL being *in* the sitemap is indexing intent. For scratch/
# duplicate pages that is the actual defect. At startup we crawl the site's sitemap
# index (and child sitemaps) once and record every listed URL, then flag membership.
# Disable with --no-sitemap.
SITEMAP_CHECK=1
SITEMAP_TMP=""

# ---- parse args -------------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    -f|--file)
      [ -r "${2:-}" ] || { echo "Cannot read file: ${2:-}" >&2; exit 1; }
      while IFS= read -r line; do
        line="${line%%#*}"; line="$(echo "$line" | xargs)"   # strip comments/whitespace
        [ -n "$line" ] && URLS+=("$line")
      done < "$2"
      shift 2 ;;
    -c|--csv)
      CSV_OUT="seo-indexability.csv"; shift ;;
    -m|--min-words)
      VIS_MIN="${2:-130}"; shift 2 ;;
    --no-sitemap)
      SITEMAP_CHECK=0; shift ;;
    -h|--help)
      sed -n '2,80p' "$0"; exit 0 ;;
    -*)
      echo "Unknown option: $1" >&2; exit 1 ;;
    *)
      URLS+=("$1"); shift ;;
  esac
done

[ ${#URLS[@]} -eq 0 ] && { echo "No URLs given. Try -h for help." >&2; exit 1; }

# ---- colors (only if stdout is a tty) --------------------------------------
if [ -t 1 ]; then
  RED=$'\e[31m'; GRN=$'\e[32m'; YEL=$'\e[33m'; DIM=$'\e[2m'; BLD=$'\e[1m'; RST=$'\e[0m'
else
  RED=""; GRN=""; YEL=""; DIM=""; BLD=""; RST=""
fi

# ---- csv header -------------------------------------------------------------
# Always truncate: rows are appended per URL below, so reusing an existing file
# would stack this run's results on top of the previous run's.
if [ -n "$CSV_OUT" ]; then
  echo "url,verdict,http_status,redirect,final_url,in_sitemap,platform,seo_render,delivery,bot_words,browser_words,x_robots_tag,meta_robots,canonical,robots_txt,h1_bot,h1_browser,h1_match,h2_count,og_image,title,meta_description" > "$CSV_OUT"
fi

csv_escape() { printf '"%s"' "$(printf '%s' "$1" | sed 's/"/""/g')"; }

# Regex test over a body, safe under `set -o pipefail`.
#   usage: x="$(printf '%s' "$body" | has_match 'pattern')"   -> yes / no
#
# Do NOT write `printf '%s' "$body" | grep -q PAT && flag=yes` here. grep -q exits
# the instant it matches, which SIGPIPEs printf (exit 141); with pipefail the
# pipeline then reports 141 and the && never fires. The bug is silent and
# *inverted* — it fails only when the pattern is found EARLY, so the pages most
# obviously matching are the ones reported as not matching. It produced a false
# "no crawler render" on /getting-support, the one page whose render mattered most.
# perl reads to EOF, so there is no SIGPIPE, and the result comes back on stdout
# rather than through a pipeline exit status.
has_match() {
  RE="$1" perl -0777 -ne 'print /$ENV{RE}/ ? "yes" : "no";' 2>/dev/null
}

# ---- body-level extractors --------------------------------------------------
# Each takes an HTML body on stdin so it can run against either response.
# Uses perl, not grep: Wix minifies HTML into 300KB+ single lines and BSD grep -E
# silently fails to match deep inside such lines.

# Crawler-visible words: strip <script>/<style>/<noscript>, then tags, then count.
# Roughly what a non-JS crawler (and most AI assistants) actually read.
extract_words() {
  local w
  w="$(perl -0777 -pe '
    s/<(script|style|noscript)\b[^>]*>.*?<\/\1>/ /gis;
    s/<[^>]+>/ /g;
    s/\s+/ /g;
  ' 2>/dev/null | wc -w | tr -d ' ')"
  [ -z "$w" ] && w=0
  printf '%s' "$w"
}

# Text-aware <h1> state:
#   present   = <h1> tag with actual text
#   (empty)   = <h1> exists but has no text (content injected client-side)
#   (missing) = no <h1> at all
extract_h1_state() {
  local h
  h="$(perl -0777 -ne '
    my @h = /(<h1\b[^>]*>.*?<\/h1>)/gis;
    if (!@h) { print "(missing)"; exit }
    for my $x (@h) { (my $t=$x)=~s/<[^>]+>//g; $t=~s/\s+//g; if (length $t) { print "present"; exit } }
    print "(empty)";
  ' 2>/dev/null)"
  [ -z "$h" ] && h="(missing)"
  printf '%s' "$h"
}

# The <h1> text itself, all headings joined — used for the bot/browser drift check.
extract_h1_text() {
  perl -0777 -ne '
    my @out;
    for my $x (/(<h1\b[^>]*>.*?<\/h1>)/gis) {
      (my $t=$x)=~s/<[^>]+>//g; $t=~s/\s+/ /g; $t=~s/^\s+|\s+$//g;
      push @out,$t if length $t;
    }
    print join(" | ",@out);
  ' 2>/dev/null
}

# Heading structure: how many <h2>s. Most of what we have been eyeballing by hand.
extract_h2_count() {
  local n
  n="$(perl -0777 -ne 'my $c=()=/<h2\b/gi; print $c;' 2>/dev/null)"
  [ -z "$n" ] && n=0
  printf '%s' "$n"
}

# og:image present? (social/AI preview card)
extract_og_image() {
  perl -0777 -ne 'print /<meta[^>]+property=["\x27]og:image["\x27]/i ? "yes" : "no";' 2>/dev/null
}

# Read a quoted HTML attribute, honouring the quote character that opened it.
#
# Do NOT match attributes with `content=["\x27][^"\x27]*`. That stops at the first
# quote of EITHER type, so a straight apostrophe inside a double-quoted value
# silently truncates it: /echo-poll's real description
#   "EchoPoll is Rutgers-Newark's classroom polling tool. Run live polls, ..."
# was recorded as "EchoPoll is Rutgers-Newark". The value looked plausible, so the
# truncation was invisible — and it under-reports length, which matters when the
# whole point is staying under 155 characters. Use a backreference to the opening
# quote instead.

# The content of <meta name="description">, or "(missing)".
extract_meta_desc() {
  perl -0777 -ne '
    while (/<meta\b[^>]*>/gis) {
      my $t = $&;
      next unless $t =~ /\bname\s*=\s*(["\x27])description\1/i;
      if ($t =~ /\bcontent\s*=\s*(["\x27])(.*?)\1/is) { my $v=$2; $v=~s/\s+/ /g; print $v; exit }
    }
    print "(missing)";
  ' 2>/dev/null
}

# The href of <link rel="canonical">, or "(none)".
extract_canonical() {
  perl -0777 -ne '
    while (/<link\b[^>]*>/gis) {
      my $t = $&;
      next unless $t =~ /\brel\s*=\s*(["\x27])canonical\1/i;
      if ($t =~ /\bhref\s*=\s*(["\x27])(.*?)\1/is) { print $2; exit }
    }
    print "(none)";
  ' 2>/dev/null
}

# All <meta name="robots"> contents joined, or "(none)".
extract_meta_robots() {
  perl -0777 -ne '
    my @v;
    while (/<meta\b[^>]*>/gis) {
      my $t = $&;
      next unless $t =~ /\bname\s*=\s*(["\x27])robots\1/i;
      push @v, $2 if $t =~ /\bcontent\s*=\s*(["\x27])(.*?)\1/is;
    }
    print @v ? join("; ", @v) : "(none)";
  ' 2>/dev/null
}

# The <title> text, or "(missing)". Greedy-safe capture: Wix wraps heading and
# title text in long attributes that overflow a length-capped pattern.
extract_title() {
  perl -0777 -ne '
    if (/<title\b[^>]*>([\s\S]*?)<\/title>/i) {
      my $v=$1; $v=~s/<[^>]+>//g; $v=~s/\s+/ /g; $v=~s/^ | $//g;
      print length($v) ? $v : "(missing)"; exit
    }
    print "(missing)";
  ' 2>/dev/null
}

# Rough agreement between the bot and browser <h1> text.
#   same      identical once normalised
#   partial   one contains the other, or they share most words
#   differs   materially different — crawler markup has drifted from the live page
#   n/a       one side has no <h1> text
h1_similarity() {
  A="$1" B="$2" perl -e '
    my ($a,$b) = ($ENV{A}, $ENV{B});
    for ($a,$b) { $_=lc; s/[^a-z0-9 ]+/ /g; s/\s+/ /g; s/^ | $//g; }
    if (!length $a || !length $b) { print "n/a"; exit }
    if ($a eq $b) { print "same"; exit }
    if (index($a,$b)>=0 || index($b,$a)>=0) { print "partial"; exit }
    my %x = map {$_=>1} split / /,$a;
    my @y = split / /,$b;
    my $hit = grep { $x{$_} } @y;
    my $ratio = @y ? $hit/scalar(@y) : 0;
    print $ratio >= 0.6 ? "partial" : "differs";
  ' 2>/dev/null
}

# ---- robots.txt check -------------------------------------------------------
# Returns "DISALLOWED (rule)" if the path is blocked for user-agent *, else "OK".
# Pragmatic parser: reads the "User-agent: *" group and its Disallow rules.
robots_check() {
  local url="$1"
  local scheme host path robots body
  scheme="$(printf '%s' "$url" | sed -E 's#^(https?)://.*#\1#')"
  host="$(printf '%s' "$url" | sed -E 's#^https?://([^/]+).*#\1#')"
  path="/$(printf '%s' "$url" | sed -E 's#^https?://[^/]+/?##')"
  robots="${scheme}://${host}/robots.txt"

  body="$(curl -sS -L --max-time 15 -A "$UA_BOT" "$robots" 2>/dev/null)" || { echo "OK (no robots.txt)"; return; }
  [ -z "$body" ] && { echo "OK (no robots.txt)"; return; }

  local group
  group="$(printf '%s\n' "$body" | awk '
    BEGIN{IGNORECASE=1; inblk=0}
    /^[[:space:]]*user-agent:[[:space:]]*\*/ {inblk=1; next}
    /^[[:space:]]*user-agent:/ {if(inblk)inblk=0}
    inblk==1 {print}
  ')"
  [ -z "$group" ] && { echo "OK"; return; }

  local rule matched="OK"
  while IFS= read -r rule; do
    rule="$(printf '%s' "$rule" | sed -E 's/^[[:space:]]*[Dd]isallow:[[:space:]]*//; s/[[:space:]]*$//')"
    [ -z "$rule" ] && continue
    case "$path" in
      "$rule"*) matched="DISALLOWED ($rule)"; break ;;
    esac
  done < <(printf '%s\n' "$group" | grep -iE '^[[:space:]]*disallow:')
  echo "$matched"
}

# ---- sitemap index ----------------------------------------------------------
build_sitemap_index() {
  local seed="$1"
  local scheme host root body locs
  scheme="$(printf '%s' "$seed" | sed -E 's#^(https?)://.*#\1#')"
  host="$(printf '%s' "$seed" | sed -E 's#^https?://([^/]+).*#\1#')"
  root="${scheme}://${host}/sitemap.xml"

  SITEMAP_TMP="$(mktemp -t seo-sitemap.XXXXXX)"

  body="$(curl -sS -L --max-time 20 -A "$UA_BOT" "$root" 2>/dev/null)"
  [ -z "$body" ] && { echo "  ${DIM}(no sitemap at $root — membership check disabled)${RST}" >&2; SITEMAP_CHECK=0; return; }

  locs="$(printf '%s' "$body" | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g')"

  if printf '%s' "$locs" | grep -qiE '\.xml($|\?)'; then
    local sm
    while IFS= read -r sm; do
      [ -z "$sm" ] && continue
      curl -sS -L --max-time 20 -A "$UA_BOT" "$sm" 2>/dev/null \
        | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g'
    done <<< "$locs"
  else
    printf '%s\n' "$locs"
  fi | sed -E 's#/$##' | sort -u > "$SITEMAP_TMP"

  echo "  ${DIM}sitemap: $(wc -l < "$SITEMAP_TMP" | tr -d ' ') URLs indexed${RST}" >&2
}

sitemap_member() {
  [ "$SITEMAP_CHECK" -eq 1 ] && [ -n "$SITEMAP_TMP" ] || { echo "n/a"; return; }
  if grep -qxF "${1%/}" "$SITEMAP_TMP"; then echo "yes"; else echo "no"; fi
}

# ---- per-URL check ----------------------------------------------------------
check_url() {
  local url="$1"

  # Headers, off the bot fetch (follow redirects).
  local hdr status final_url
  hdr="$(curl -sS -L --max-time 25 -A "$UA_BOT" -D - -o /dev/null -w 'FINAL_URL:%{url_effective}\nFINAL_CODE:%{http_code}\n' "$url" 2>/dev/null)"
  status="$(printf '%s' "$hdr" | sed -n 's/^FINAL_CODE://p' | tail -1)"
  final_url="$(printf '%s' "$hdr" | sed -n 's/^FINAL_URL://p' | tail -1)"
  [ -z "$status" ] && status="000"

  local xrobots
  xrobots="$(printf '%s' "$hdr" | grep -iE '^x-robots-tag:' | sed -E 's/^[Xx]-[Rr]obots-[Tt]ag:[[:space:]]*//' | tr -d '\r' | paste -sd'; ' -)"
  [ -z "$xrobots" ] && xrobots="(none)"

  # ---- the two fetches ----
  local body_bot body_human
  body_bot="$(curl -sS -L --max-time 25 -A "$UA_BOT" "$url" 2>/dev/null)"
  body_human="$(curl -sS -L --max-time 25 -A "$UA_HUMAN" "$url" 2>/dev/null)"

  # ---- platform ----
  # The crawler-render assertion below is Wix-specific, so first work out what we
  # are talking to. Assert only where the assertion is meaningful: claiming
  # "no crawler render" on a server-rendered Drupal site would be a false alarm on
  # every row.
  local platform="other"
  if [ "$(printf '%s' "$hdr" | has_match '(?i)x-wix-request-id')" = "yes" ] \
  || [ "$(printf '%s' "$body_bot" | has_match '(?i)content=["\x27]Wix\.com Website Builder')" = "yes" ]; then
    platform="wix"
  elif [ "$(printf '%s' "$hdr" | has_match '(?i)x-generator:[[:space:]]*Drupal')" = "yes" ] \
    || [ "$(printf '%s' "$body_bot" | has_match '(?i)content=["\x27]Drupal')" = "yes" ]; then
    platform="drupal"
  fi

  # ---- self-check: did we actually get the crawler render? ----
  # Assert we got the response we think we got, rather than assuming the request
  # worked. If this is "no", every other number in this row describes the wrong page.
  #
  # Wix serves its server-rendered copy only to recognised crawler UAs, so on Wix
  # the absence of the marker means we measured the wrong response. Server-rendered
  # platforms (Drupal) return the same HTML to every UA — there is nothing to earn,
  # so the check reports n/a rather than a misleading "no".
  #
  # The marker is Wix's own "isSEO":true flag in the viewer model — an explicit
  # statement that it served the crawler render, true for the bot UA and false for
  # a browser UA on every page type. Until 2026-10 this checked for the
  # seoSsrOnly / thunderbolt-seo-isolated-renderer markup instead; Wix removed
  # seoSsrOnly site-wide and 55 of 166 rows read "no" while their word counts were
  # unchanged. Those two are kept as fallbacks only. A side effect, not a flag, is
  # what broke last time — prefer the flag.
  local seo_render seo_render_human="no"
  if [ "$platform" = "wix" ]; then
    seo_render="$(printf '%s' "$body_bot" | has_match '"isSEO":\s*true|seoSsrOnly|thunderbolt-seo-isolated-renderer')"
    # The comparison only works if the browser fetch did NOT also get the crawler
    # render. If it did, delivery and h1_match compare the bot copy with itself.
    seo_render_human="$(printf '%s' "$body_human" | has_match '"isSEO":\s*true')"
  else
    seo_render="n/a"
  fi

  # ---- extraction, run against both bodies ----
  local bot_words browser_words h1_bot h1_human h1_bot_txt h1_human_txt h1_match h2_count og_image
  bot_words="$(printf '%s' "$body_bot"   | extract_words)"
  browser_words="$(printf '%s' "$body_human" | extract_words)"
  h1_bot="$(printf '%s' "$body_bot"      | extract_h1_state)"
  h1_human="$(printf '%s' "$body_human"  | extract_h1_state)"
  h1_bot_txt="$(printf '%s' "$body_bot"     | extract_h1_text)"
  h1_human_txt="$(printf '%s' "$body_human" | extract_h1_text)"
  h1_match="$(h1_similarity "$h1_bot_txt" "$h1_human_txt")"
  h2_count="$(printf '%s' "$body_bot" | extract_h2_count)"
  og_image="$(printf '%s' "$body_bot" | extract_og_image)"

  # ---- everything else, once, off the bot body ----
  local meta_robots canonical title desc robots insitemap
  meta_robots="$(printf '%s' "$body_bot" | extract_meta_robots)"
  canonical="$(printf '%s' "$body_bot"   | extract_canonical)"
  title="$(printf '%s' "$body_bot"       | extract_title)"
  desc="$(printf '%s' "$body_bot"        | extract_meta_desc)"
  [ -z "$meta_robots" ] && meta_robots="(none)"
  [ -z "$canonical" ]   && canonical="(none)"
  [ -z "$title" ]       && title="(missing)"
  [ -z "$desc" ]        && desc="(missing)"

  robots="$(robots_check "$url")"
  insitemap="$(sitemap_member "$url")"

  # ---- delivery: measured from the two word counts, not inferred ----
  # The iframe branches are checked against the BOT html, where they would be
  # meaningful. NOTE (2026-09-11): on this site neither marker appears in either
  # response — Wix builds the iframe client-side, so there is no <iframe> tag and
  # no embed host in the served HTML. Low/low pages therefore fall through to
  # "empty". Re-check these two patterns if the page markup changes.
  local delivery
  if   [ "$bot_words" -ge "$VIS_MIN" ] && [ "$browser_words" -ge "$VIS_MIN" ]; then delivery="native"
  elif [ "$bot_words" -ge "$VIS_MIN" ]; then delivery="ssr-only"
  elif [ "$browser_words" -ge "$VIS_MIN" ]; then delivery="investigate"
  elif [ "$(printf '%s' "$body_bot" | has_match 'mytechnewark-pages')" = "yes" ]; then delivery="github-iframe"
  elif [ "$(printf '%s' "$body_bot" | has_match 'filesusr\.com/html/a2caaa_')" = "yes" ]; then delivery="wix-iframe"
  else delivery="empty"; fi

  # ---- verdict: keys off the BOT response throughout ----
  local -a blockers=()
  [ "$status" != "200" ] && blockers+=("status $status")
  [ "$(printf '%s' "$xrobots"     | has_match '(?i)noindex')"   = "yes" ] && blockers+=("X-Robots noindex")
  [ "$(printf '%s' "$meta_robots" | has_match '(?i)noindex')"   = "yes" ] && blockers+=("meta noindex")
  [ "$(printf '%s' "$robots"      | has_match 'DISALLOWED')"    = "yes" ] && blockers+=("robots.txt disallow")
  [ "$seo_render" = "no" ] && blockers+=("NO CRAWLER RENDER — results unreliable")

  local n_canon n_url n_final
  n_canon="${canonical%/}"; n_url="${url%/}"; n_final="${final_url%/}"

  local reached redirect
  if [ "$n_final" != "$n_url" ]; then reached="redirected"; redirect="yes"; else reached="direct"; redirect="no"; fi

  local -a warns=()
  if [ "$canonical" != "(none)" ] && [ "$n_canon" != "$n_url" ] && [ "$n_canon" != "$n_final" ]; then
    warns+=("canonical → elsewhere")
  fi
  if [ "$bot_words" -lt "$VIS_MIN" ]; then
    warns+=("thin content: ${bot_words} bot-visible words")
  fi
  [ "$h1_bot" = "(empty)" ]  && warns+=("empty <h1> in crawler render")
  [ "$h1_bot" = "(missing)" ] && warns+=("no <h1> in crawler render")
  [ "$h1_match" = "differs" ] && warns+=("h1 drift: crawler markup ≠ live page")
  [ "$og_image" = "no" ]     && warns+=("no og:image")
  [ "$seo_render_human" = "yes" ] && warns+=("browser UA also got crawler render — delivery/h1 comparison invalid")

  local verdict
  if [ ${#blockers[@]} -gt 0 ]; then
    verdict="NOT INDEXABLE ($reached)"
  elif [ ${#warns[@]} -gt 0 ]; then
    verdict="INDEXABLE ($reached; warn: $(IFS='; '; echo "${warns[*]}"))"
  else
    verdict="INDEXABLE ($reached)"
  fi

  # ---- print ----
  local vcolor="$GRN"
  case "$verdict" in
    NOT*) vcolor="$RED" ;;
    *warn*) vcolor="$YEL" ;;
  esac
  local scolor="$GRN"
  [ "$seo_render" = "no" ]  && scolor="$RED"
  [ "$seo_render" = "n/a" ] && scolor="$DIM"
  local dcolor="$GRN"
  case "$delivery" in
    empty|*iframe) dcolor="$RED" ;;
    investigate)   dcolor="$YEL" ;;
  esac

  echo "${BLD}${url}${RST}"
  echo "  verdict        : ${vcolor}${verdict}${RST}"
  [ ${#blockers[@]} -gt 0 ] && echo "  blockers       : ${RED}$(IFS=', '; echo "${blockers[*]}")${RST}"
  echo "  platform       : $platform"
  echo "  seo render     : ${scolor}${seo_render}${RST} ${DIM}(did the UA earn the crawler copy?)${RST}"
  echo "  delivery       : ${dcolor}${delivery}${RST}"
  echo "  words bot/brow : ${bot_words} / ${browser_words} ${DIM}(bot is what Google indexes)${RST}"
  echo "  http status    : $status"
  [ "$final_url" != "$url" ] && echo "  ${DIM}redirected → $final_url${RST}"
  echo "  x-robots-tag   : $xrobots"
  echo "  meta robots    : $meta_robots"
  echo "  canonical      : $canonical"
  echo "  robots.txt     : $robots"
  echo "  in sitemap     : $insitemap"
  echo "  h1 bot/brow    : ${h1_bot} / ${h1_human} ${DIM}(match: ${h1_match})${RST}"
  echo "  h2 count       : $h2_count"
  echo "  og:image       : $og_image"
  echo "  title          : $title"
  echo "  meta descr.    : $desc"
  echo

  # ---- csv ----
  if [ -n "$CSV_OUT" ]; then
    {
      csv_escape "$url";            printf ','
      csv_escape "$verdict";        printf ','
      csv_escape "$status";         printf ','
      csv_escape "$redirect";       printf ','
      csv_escape "$final_url";      printf ','
      csv_escape "$insitemap";      printf ','
      csv_escape "$platform";       printf ','
      csv_escape "$seo_render";     printf ','
      csv_escape "$delivery";       printf ','
      csv_escape "$bot_words";      printf ','
      csv_escape "$browser_words";  printf ','
      csv_escape "$xrobots";        printf ','
      csv_escape "$meta_robots";    printf ','
      csv_escape "$canonical";      printf ','
      csv_escape "$robots";         printf ','
      csv_escape "$h1_bot";         printf ','
      csv_escape "$h1_human";       printf ','
      csv_escape "$h1_match";       printf ','
      csv_escape "$h2_count";       printf ','
      csv_escape "$og_image";       printf ','
      csv_escape "$title";          printf ','
      csv_escape "$desc";           printf '\n'
    } >> "$CSV_OUT"
  fi
}

echo "Checking ${#URLS[@]} URL(s)..."
echo "  ${DIM}bot UA     : $UA_BOT${RST}"
echo "  ${DIM}browser UA : $UA_HUMAN${RST}"
echo "  ${DIM}thin threshold: $VIS_MIN bot-visible words${RST}"
[ "$SITEMAP_CHECK" -eq 1 ] && build_sitemap_index "${URLS[0]}"
echo
for u in "${URLS[@]}"; do
  check_url "$u"
done
[ -n "$SITEMAP_TMP" ] && rm -f "$SITEMAP_TMP"
[ -n "$CSV_OUT" ] && echo "Wrote $CSV_OUT"
exit 0
