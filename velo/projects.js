/**
 * projects.js — SEO markup for /projects
 * Paste into: Wix Editor > Dev Mode > Page Code for this page.
 *
 * Generated from projects.html by velo/build-seo-markup.py.
 * The visible page stays the custom element; this string is what Wix serves to
 * crawlers at the real URL. Keep the two materially consistent — if you edit the
 * embed, re-run the generator rather than editing this file by hand.
 *
 * Set ELEMENT_ID to the custom element's id in the editor if it differs.
 */

const ELEMENT_ID = '#projectsElement';

const projectsSeoMarkup = `
<article>
<p>myTech@Newark</p>
<h1>Projects &amp; Initiatives</h1>
<p>Rutgers–Newark IT manages a broad portfolio of projects, programs, pilots, and technology initiatives that support teaching, learning, student success, campus operations, and digital engagement.</p>
<p>This page highlights selected strategic initiatives and provides a searchable view of current, ongoing, and completed work across the Rutgers–Newark technology ecosystem.</p>
<h2>Featured Projects</h2>
<p>High-priority, high-visibility initiatives currently underway.</p>
<p>In Progress</p>
<h3>RaiderLink Expansion</h3>
<p>RaiderLink is Rutgers–Newark's student engagement platform, supporting events, student organizations, orientation activities, checklists, elections, and campus engagement workflows.</p>
<ul>
<li><strong>Area:</strong> Student Engagement &amp; Success</li>
<li><strong>Audience:</strong> Students, Staff, Campus Partners</li>
<li><strong>Impact:</strong> Expands the campus's ability to connect students with opportunities, services, organizations, and timely communications.</li>
</ul>
<p>In Progress</p>
<h3>RaiderBot</h3>
<p>AI-powered student support chatbot designed to help current students find answers and connect with the right services.</p>
<p>In Progress</p>
<h3>AI Fluency Program</h3>
<p>The AI Fluency Program helps students build practical, responsible, and creative AI skills through a badge-based learning experience. The program introduces foundational AI concepts, responsible use, productivity tools, and creative applications.</p>
<ul>
<li><strong>Area:</strong> AI &amp; Digital Fluency</li>
<li><strong>Audience:</strong> Students</li>
<li><strong>Impact:</strong> Supports student readiness for academic, professional, and creative uses of AI.</li>
</ul>
<p>In Progress</p>
<h3>Wix Enterprise Web Modernization</h3>
<p>Rutgers–Newark is modernizing websites for schools, centers, and programs through a shared Wix Enterprise platform. This effort supports improved design, accessibility, analytics, content workflows, and long-term sustainability.</p>
<ul>
<li><strong>Area:</strong> Web &amp; Digital Experience</li>
<li><strong>Audience:</strong> Schools, Centers, Programs, Campus Partners</li>
<li><strong>Impact:</strong> Helps campus units maintain modern, effective websites that better support enrollment, communications, and service delivery.</li>
</ul>
<p>In Progress</p>
<h3>Course Materials Access Project</h3>
<p>Work to improve course materials visibility, affordability, inclusive access, and integration with Canvas and student systems.</p>
<p>Ongoing Program</p>
<h3>Classroom Modernization Program</h3>
<p>Rutgers–Newark has made a sustained, campus-wide investment in modernizing centrally managed classrooms and learning spaces to support contemporary teaching, digital learning, student engagement, and instructional innovation.</p>
<ul>
<li><strong>Area:</strong> Learning Environments</li>
<li><strong>Audience:</strong> Faculty, Students, Academic Departments</li>
<li><strong>Impact:</strong> Improves classroom reliability, instructional technology, wireless connectivity, active learning, hybrid teaching capabilities, and the overall student learning experience.</li>
<li><strong>Last Updated:</strong> July 2026</li>
</ul>
<h2>Browse Projects</h2>
<p>Search and filter the full portfolio of current, ongoing, and completed work.</p>
<p>All Statuses</p>
<p>All Categories</p>
<p>All Types</p>
<p>No projects match those filters.</p>
<h2>Current Priorities</h2>
<p>A short, curated list of active strategic work.</p>
<ul>
<li>In ProgressRaiderLink ExpansionStudent Engagement &amp; Success</li>
<li>In ProgressRaiderBotStudent Engagement &amp; Success</li>
<li>In ProgressAI Fluency ProgramAI &amp; Digital Fluency</li>
<li>In ProgressWix Enterprise Web ModernizationWeb &amp; Digital Experience</li>
<li>In ProgressCourse Materials Access ProjectTeaching &amp; Learning</li>
<li>In ProgressClassroom Technology UpgradesLearning Environments — <a href="https://mytech.newark.rutgers.edu/teaching-in-our-classrooms">View classroom guide →</a></li>
</ul>
<h2>Recently Launched</h2>
<p>Initiatives that have shipped and moved into regular operation.</p>
<p>Project</p>
<p>Area</p>
<p>Status</p>
<p>Impact</p>
<p>Final Exam Portal</p>
<p>Student Engagement &amp; Success</p>
<p>Launched</p>
<p>Provides students with a personalized final exam schedule.</p>
<p>RaiderTxt</p>
<p>Student Engagement &amp; Success</p>
<p>Launched</p>
<p>Supports SMS outreach for student engagement and targeted communications.</p>
<p>MyTech@Newark</p>
<p>Web &amp; Digital Experience</p>
<p>Launched</p>
<p>Provides a modern entry point for Rutgers–Newark technology services and support.</p>
<p>Express Newark IT Support Transition</p>
<p>Infrastructure &amp; Operations</p>
<p>Completed</p>
<p>Integrated Express Newark into the RUN-IT support model.</p>
<h2>Ongoing Programs</h2>
<p>Standing work that continues year over year rather than reaching a single end date.</p>
<h3>Classroom Modernization Program</h3>
<p>A sustained, campus-wide investment in modernizing centrally managed classrooms and learning spaces to support contemporary teaching, digital learning, student engagement, and instructional innovation. Last updated July 2026.</p>
<h3>Classroom Wireless Improvements</h3>
<p>Continued work to improve wireless coverage and readiness in instructional spaces as part of the broader classroom infrastructure lifecycle.</p>
<h3>Have a technology project idea?</h3>
<p>Rutgers–Newark IT works with campus partners to evaluate, plan, and support technology initiatives that advance teaching, learning, student success, operations, and digital engagement. Contact RUN-IT to discuss a potential project or partnership.</p>
<p><a href="https://mytech.newark.rutgers.edu/getting-support">Contact RUN-IT →</a></p>
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
    console.error(`seoMarkup: no element ${ELEMENT_ID} on /projects — check the id in the editor.`);
    return;
  }
  if (!el || typeof el !== 'object') {
    console.error(`seoMarkup: $w(${ELEMENT_ID}) returned nothing on /projects.`);
    return;
  }
  if (!('seoMarkup' in el)) {
    console.error(
      `seoMarkup: ${ELEMENT_ID} on /projects has no seoMarkup property. ` +
      `That property belongs to a Custom Element — an HTML iframe embed does not have it.`
    );
    return;
  }
  el.seoMarkup = projectsSeoMarkup;
});
