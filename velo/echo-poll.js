/**
 * echo-poll.js — SEO markup for /echo-poll
 * Paste into: Wix Editor > Dev Mode > Page Code for this page.
 *
 * Generated from echo-poll.html by velo/build-seo-markup.py.
 * The visible page stays the custom element; this string is what Wix serves to
 * crawlers at the real URL. Keep the two materially consistent — if you edit the
 * embed, re-run the generator rather than editing this file by hand.
 *
 * Set ELEMENT_ID to the custom element's id in the editor if it differs.
 */

const ELEMENT_ID = '#echoPollElement';

const echoPollSeoMarkup = `
<article>
<p>Engage Your Students</p>
<h1>Increase Participation and Engagement with Real-Time Polling</h1>
<p>EchoPoll is Rutgers–Newark's enterprise classroom engagement tool. EchoPoll integrates seamlessly with Canvas so you can launch and manage polls before, during, and after class.</p>
<p><a href="https://rutgers.instructure.com/login/saml/"> Open in Canvas </a><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-getting-started">What's EchoPoll?</a></p>
<h2>What EchoPoll Can Do</h2>
<p>Live Polling</p>
<p>Attendance Tracking</p>
<p>Q&amp;A Sessions</p>
<p>Formative Activities</p>
<p>Pre-Class Insights</p>
<p>Grade Sync with Canvas</p>
<h2>What Are You Trying to Accomplish?</h2>
<p>Select a goal to find the right EchoPoll approach for your course.</p>
<h3>Increase Participation</h3>
<p>Give every student a voice during class with live polls, word clouds, and quick checks.</p>
<h3>Check Student Understanding</h3>
<p>Identify misconceptions in real time and adjust your teaching accordingly.</p>
<h3>Take Attendance</h3>
<p>Track attendance automatically using EchoPoll participation data.</p>
<h3>Encourage Discussion</h3>
<p>Use polling results to encourage student reflection and class discussion.</p>
<h3>Gather Feedback</h3>
<p>Collect anonymous feedback from students to inform your teaching.</p>
<h2>Why Faculty Use EchoPoll</h2>
<h3>Included with Canvas</h3>
<p>No additional licensing cost. Available to all RU-N and RBS instructors through Canvas — no extra setup required.</p>
<h3>No Additional Student Cost</h3>
<p>Students respond using any web-enabled device. No app download or account required.</p>
<h3>Supported by ATS</h3>
<p>Training, consultations, and implementation support available through Academic Technology Services.</p>
<h2>Getting Started with EchoPoll</h2>
<p>Four steps to your first poll.</p>
<p>1</p>
<h4>Access EchoPoll through Canvas</h4>
<p>Go to your Canvas course and open EchoPoll from the course navigation menu.</p>
<p>2</p>
<h4>Create Your First Activity</h4>
<p>Choose a question type and set up your first poll or engagement activity.</p>
<p>3</p>
<h4>Run Your Poll in Class</h4>
<p>Launch the poll during class and display results in real time for students to see.</p>
<p>4</p>
<h4>Review Results &amp; Participation</h4>
<p>View participation data and optionally sync grades to the Canvas Gradebook.</p>
<h2>Explore EchoPoll Resources</h2>
<p>Step-by-step guides for every stage of using EchoPoll.</p>
<h4>Getting Started</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-getting-started">Read guide →</a></p>
<h4>Increase Engagement</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-engage-students">Read guide →</a></p>
<h4>Attendance Tracking</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-attendance-tracking">Read guide →</a></p>
<h4>Knowledge Checks</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-knowledge-checks">Read guide →</a></p>
<h4>Activity Ideas</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-activity-ideas">Read guide →</a></p>
<h4>Troubleshooting</h4>
<p><a href="https://mytech.newark.rutgers.edu/kbarticles/echopoll-troubleshooting">Read guide →</a></p>
<p>Need Help?</p>
<p>Contact Academic Technology Services for support.</p>
<p><a href="https://mytech.newark.rutgers.edu/getting-support">Get Support →</a></p>
<p>Email ATS<a href="mailto:atshelp@newark.rutgers.edu">atshelp@newark.rutgers.edu</a><a href="tel:9733535083">973-353-5083</a></p>
<p>Schedule a Consultation</p>
<p>Work one-on-one with an instructional designer.</p>
<p><a href="https://go.rutgers.edu/bookats">Book a Session →</a></p>
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
    console.error(`seoMarkup: no element ${ELEMENT_ID} on /echo-poll — check the id in the editor.`);
    return;
  }
  if (!el || typeof el !== 'object') {
    console.error(`seoMarkup: $w(${ELEMENT_ID}) returned nothing on /echo-poll.`);
    return;
  }
  if (!('seoMarkup' in el)) {
    console.error(
      `seoMarkup: ${ELEMENT_ID} on /echo-poll has no seoMarkup property. ` +
      `That property belongs to a Custom Element — an HTML iframe embed does not have it.`
    );
    return;
  }
  el.seoMarkup = echoPollSeoMarkup;
});
