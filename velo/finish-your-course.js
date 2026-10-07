/**
 * finish-your-course.js — SEO markup for /finish-your-course
 * Paste into: Wix Editor > Dev Mode > Page Code for this page.
 *
 * Generated from finish-your-course.html by velo/build-seo-markup.py.
 * The visible page stays the custom element; this string is what Wix serves to
 * crawlers at the real URL. Keep the two materially consistent — if you edit the
 * embed, re-run the generator rather than editing this file by hand.
 *
 * REVIEW: Dropped 8 layout placeholder lines (e.g. 'Guide coming soon') — still visible on the page itself; replace them there.
 *
 * Set ELEMENT_ID to the custom element's id in the editor if it differs.
 */

const ELEMENT_ID = '#finishYourCourseElement';

const finishYourCourseSeoMarkup = `
<article>
<p>For Faculty</p>
<p>Semester wrap-up guide</p>
<h1>End-of-Semester Course Checklist</h1>
<p>Use this page as your end-of-term command center. Review final grades, submit grades through REGIS or GradeSync, save important course records, clean up Canvas, and capture updates for the next time you teach the course.</p>
<p><a href="https://prodregis.rutgers.edu">Submit Grades in REGIS</a><a href="mailto:atshelp@newark.rutgers.edu">Contact ATS</a></p>
<p>Grade deadline reminder</p>
<p>Final grades must be submitted by the posted Registrar deadline.</p>
<p>Grades in Canvas are not official until they are submitted through REGIS or through GradeSync when GradeSync is available. GradeSync also requires REGIS access; if you do not have access to your course in REGIS, GradeSync will not work and you should contact your department for assistance.</p>
<p><a href="https://prodregis.rutgers.edu">Open REGIS →</a></p>
<h2>Choose what you need to do</h2>
<p>Start with the task that matches where you are in the end-of-semester process.</p>
<h3>Submit final grades</h3>
<p>Use REGIS as the official system of record. GradeSync in RU Faculty Tools is an alternative when the grading window is open and your Canvas final grades are ready to send.</p>
<p><a href="https://prodregis.rutgers.edu">Open REGIS →</a></p>
<h3>Check your Canvas gradebook</h3>
<p>Confirm assignment weights, missing grades, grading schemes, hidden grades, and final letter grades before submitting official grades.</p>
<h3>Save course records</h3>
<p>Export your gradebook and course content before you make major changes or prepare the course for reuse.</p>
<h3>Prepare for next term</h3>
<p>Copy the course, clean up outdated content, update due dates, revise the syllabus, and submit course materials early.</p>
<h2>End-of-semester workflow</h2>
<p>Use this checklist to move from the last class meeting to a clean, reusable course shell.</p>
<p>Before last class</p>
<ul>
<li>Confirm final assignment due dates and exam expectations.</li>
<li>Post a Canvas announcement with end-of-semester instructions.</li>
<li>Remind students how to ask final questions or request help.</li>
<li>Review missing, excused, or unresolved work before final grading begins.</li>
</ul>
<p>Goal: reduce last-minute confusion before final work is due.</p>
<p>After last class</p>
<ul>
<li>Grade remaining submissions and review SpeedGrader comments.</li>
<li>Check the Canvas gradebook for missing grades, hidden grades, and calculation issues.</li>
<li>Confirm final letter grades before using GradeSync or entering grades in REGIS.</li>
</ul>
<p>Goal: make sure your grade records match the final grades you intend to submit.</p>
<p>Submit grades</p>
<ul>
<li>Submit grades directly in REGIS, or use GradeSync from RU Faculty Tools when available and you have REGIS access.</li>
<li>If you do not have access to your course in REGIS, GradeSync will not work; contact your department for assistance.</li>
<li>Follow Registrar or departmental guidance for incompletes, pass/no credit, withdrawals, or other special grade situations.</li>
<li>Verify submitted grades before closing your records.</li>
</ul>
<p>REGIS is the official system of record. Canvas grades are not official until submitted.</p>
<p>Archive and reuse</p>
<ul>
<li>Export your Canvas gradebook and save any course records you need.</li>
<li>Export course content if you need a local backup.</li>
<li>Clean up outdated files, announcements, dates, links, and copied content.</li>
<li>Copy the course into the next term shell when it is available.</li>
</ul>
<p>Most Canvas courses conclude automatically based on term settings. Check with ATS before manually concluding a course.</p>
<h2>Focused guides and resources</h2>
<p>Use this page as the hub, then move into the specific guide for the task you are completing.</p>
<p>Grades</p>
<h3>Submit Grades in REGIS</h3>
<p>Use REGIS to enter official final grades, upload a grade roster, or review submitted grades. If your course is missing or you do not have REGIS access, contact your department.</p>
<p><a href="https://prodregis.rutgers.edu">Open REGIS →</a></p>
<p>Canvas</p>
<h3>Use GradeSync in Canvas</h3>
<p>Send final grades from Canvas to REGIS through RU Faculty Tools when the grading window is open and your Canvas final grades are ready.</p>
<p>Canvas</p>
<h3>Prepare Your Gradebook for Final Grades</h3>
<p>Check assignment groups, missing work, grading schemes, grade posting, and final letter grade calculations.</p>
<p>Records</p>
<h3>Export Your Canvas Gradebook</h3>
<p>Download a final CSV copy of your Canvas gradebook for local recordkeeping before making course changes.</p>
<p>Course reuse</p>
<h3>Copy a Canvas Course</h3>
<p>Bring modules, assignments, pages, files, quizzes, and settings into a new course shell for the next term.</p>
<p>Course materials</p>
<h3>Submit Course Materials Early</h3>
<p>Submit textbooks, First Day materials, OER, or publisher content early so students have access on day one.</p>
<h2>Get help</h2>
<p>For the fastest support, contact the group that owns the system or process you are working in.</p>
<h3>Academic Technology Services</h3>
<p>For help with Canvas, GradeSync, course copy, exporting course materials, or end-of-semester course cleanup, contact ATS.</p>
<p><a href="mailto:atshelp@newark.rutgers.edu">atshelp@newark.rutgers.edu →</a></p>
<h3>Registrar or department support</h3>
<p>For REGIS access issues, missing courses in REGIS, GradeSync access issues related to REGIS permissions, official grading policy, grade deadlines, grade changes, incompletes, withdrawals, or special grade situations, contact your department or follow Registrar guidance.</p>
<p><a href="https://prodregis.rutgers.edu">Open REGIS →</a></p>
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
    console.error(`seoMarkup: no element ${ELEMENT_ID} on /finish-your-course — check the id in the editor.`);
    return;
  }
  if (!el || typeof el !== 'object') {
    console.error(`seoMarkup: $w(${ELEMENT_ID}) returned nothing on /finish-your-course.`);
    return;
  }
  if (!('seoMarkup' in el)) {
    console.error(
      `seoMarkup: ${ELEMENT_ID} on /finish-your-course has no seoMarkup property. ` +
      `That property belongs to a Custom Element — an HTML iframe embed does not have it.`
    );
    return;
  }
  el.seoMarkup = finishYourCourseSeoMarkup;
});
