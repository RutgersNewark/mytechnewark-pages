/**
 * classroom-support.js — SEO markup for /classroom-support
 * Paste into: Wix Editor > Dev Mode > Page Code for this page.
 *
 * Generated from classroom-support.html by velo/build-seo-markup.py.
 * The visible page stays the custom element; this string is what Wix serves to
 * crawlers at the real URL. Keep the two materially consistent — if you edit the
 * embed, re-run the generator rather than editing this file by hand.
 *
 * REVIEW: Promoted h3 to h2 — the source skipped a heading level.
 *
 * Set ELEMENT_ID to the custom element's id in the editor if it differs.
 */

const ELEMENT_ID = '#classroomSupportElement';

const classroomSupportSeoMarkup = `
<article>
<p>Teach in the Classroom</p>
<h1>Classroom Support</h1>
<p>Having an issue with classroom technology, or need help preparing for a session? Reach the team that supports Rutgers–Newark classrooms directly.</p>
<h2>Call for In-Class Help</h2>
<p>Need someone in the room right now? Call ATS during a live session for immediate classroom technology assistance.</p>
<p><a href="tel:9733531713">973-353-1713</a></p>
<h2>Email Classroom Support</h2>
<p>For non-urgent questions, setup requests, or general classroom technology help.</p>
<p><a href="mailto:atshelp@newark.rutgers.edu">atshelp@newark.rutgers.edu</a></p>
<h2>Visit Us</h2>
<p>IT Service Center Hill Hall, Room 109</p>
<p><a href="https://mytech.newark.rutgers.edu/it-service-center">View Location →</a></p>
<p><a href="https://go.rutgers.edu/bookats">Schedule a Consultation →</a><a href="https://mytech.newark.rutgers.edu/getting-support">Submit a Support Ticket →</a></p>
</article>
`;

$w.onReady(function () {
  // seoMarkup exists on a Custom Element. If this page's content is still an HTML
  // (iframe) embed, or the id below is wrong, there is nothing to assign to and the
  // page keeps serving crawlers an empty shell. Fail loudly rather than silently.
  let el;
  try {
    el = $w(ELEMENT_ID);
  } catch (e) {
    console.error(`seoMarkup: no element ${ELEMENT_ID} on /classroom-support — check the id in the editor.`);
    return;
  }
  if (!el || typeof el !== 'object') {
    console.error(`seoMarkup: $w(${ELEMENT_ID}) returned nothing on /classroom-support.`);
    return;
  }
  if (!('seoMarkup' in el)) {
    console.error(
      `seoMarkup: ${ELEMENT_ID} on /classroom-support has no seoMarkup property. ` +
      `That property belongs to a Custom Element — an HTML iframe embed does not have it.`
    );
    return;
  }
  el.seoMarkup = classroomSupportSeoMarkup;
});
