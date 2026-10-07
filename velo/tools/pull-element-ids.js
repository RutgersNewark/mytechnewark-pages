/* ---------------------------------------------------------------------------
 * pull-element-ids.js — read live Velo element IDs (nicknames) from the
 * published myTech site, without opening the Wix Editor.
 *
 * HOW TO USE
 *   1. Open https://mytech.newark.rutgers.edu/ in Chrome.
 *   2. Open DevTools -> Console.
 *   3. Paste this whole file and press Enter.
 *
 * WHY THIS WORKS
 *   Wix does NOT put the Velo nickname in the rendered DOM. The DOM only
 *   carries the custom element's tag name and a Wix wrapper id (comp-xxxxxxx),
 *   neither of which is what $w('#...') takes.
 *
 *   But the published Velo page code IS shipped to the browser, because the
 *   Wix client worker has to execute it. Its URLs live in
 *     window.viewerModel.siteFeaturesConfigs.platform
 *   as bundler-velo.parastorage.com/.../pages_delimiter_<pageId>.js
 *
 *   Fetching those bundles and regexing out the $w("#...") selectors gives the
 *   real nicknames straight from the source of truth. The bundler inlines
 *   const ELEMENT_ID = '#foo', so generated files show up as $w("#foo").
 *
 *   window.viewerModel.siteFeaturesConfigs.router.routes maps each URL path to
 *   its pageId, so the nicknames can be attributed to pages.
 *
 * LIMITATION — READ THIS
 *   This can only find IDs for elements a page's code already references.
 *   A page with no Velo code has no bundle, and an element that was never
 *   added in the editor has no ID to read. For those, the ID has to be SET in
 *   the Wix Editor (select the element -> Properties panel -> ID), not pulled.
 *
 * Verified 18 Sep 2026 against the known-good /getting-support page, whose
 * nickname gettingHelpElement was already documented.
 * ------------------------------------------------------------------------- */

(async () => {
  const plat = window.viewerModel?.siteFeaturesConfigs?.platform;
  const router = window.viewerModel?.siteFeaturesConfigs?.router;
  if (!plat || !router) {
    console.error('Not a Wix Thunderbolt page, or viewerModel is not exposed here.');
    return;
  }

  // pageId -> URL path (invert the router's route table)
  const pageIdToPath = {};
  for (const [path, v] of Object.entries(router.routes || {})) {
    for (const id of [].concat(v)) {
      if (typeof id === 'string') (pageIdToPath[id] ||= []).push(path.replace(/^\.\//, '/'));
    }
  }

  // Velo page-code bundle URLs, keyed by pageId
  const blob = JSON.stringify(plat);
  const byPage = {};
  for (const url of new Set(blob.match(/https:\/\/bundler-velo\.parastorage\.com\/[^"',\\]+/g) || [])) {
    const m = url.match(/pages_delimiter_([a-z0-9]+)\.js/i);
    if (m) byPage[m[1]] = url;
  }

  const rows = [];
  for (const [pageId, url] of Object.entries(byPage)) {
    let selectors = [], seoMarkup = 0, note = '';
    try {
      const txt = await (await fetch(url, { credentials: 'omit' })).text();
      selectors = [...new Set(txt.match(/\$w\(\s*["']#[^"']{1,60}["']/g) || [])]
        .map(s => s.replace(/^\$w\(\s*["']#/, '').replace(/["']$/, ''));
      seoMarkup = (txt.match(/seoMarkup/g) || []).length;
    } catch (e) {
      note = 'fetch failed: ' + e;
    }
    rows.push({
      page: (pageIdToPath[pageId] || ['(unrouted)']).join(' , '),
      pageId,
      elementIds: selectors.join(', ') || '(none)',
      usesSeoMarkup: seoMarkup > 0 ? 'yes' : '',
      note
    });
  }

  rows.sort((a, b) => a.page.localeCompare(b.page));
  console.table(rows);
  console.log(
    `${rows.length} page(s) carry Velo code out of ${Object.keys(router.routes || {}).length} routes. ` +
    `Every other page needs its element created and named in the Wix Editor.`
  );
  return rows;
})();
