# Michael Steurer Portfolio

Personal career portfolio published with GitHub Pages at https://mickeysteurer.github.io/.

Static HTML, CSS, and JavaScript. No build or package installation is required. Preview by serving this directory with a local HTTP server.

## Content rules

- Employment facts and claims follow master resume source pack v5.8, maintained separately from this public repository.
- The four expandable projects describe user-confirmed workflows. Sales replies are human-written; deferred outreach is scheduled automatically. Tracked-budget updates are automated only after human confirmation.
- Historical files in `examples/` remain available at their existing URLs but are not linked from the page. Any fabricated records displayed in future must carry an “Illustrative example” label.
- Do not infer extraction technology, duplicate-matching keys, polling intervals, named distance formulas, or road-distance APIs. Unresolved details are recorded in the private source pack.
- Preserve the public `Michael_Steurer_Resume.pdf` path when replacing the resume. Keep the file aligned with the approved current resume.
- Credential validity dates must come from issuer-hosted verification pages. Do not restore an unverified HubSpot expiration date or the under-contextualized SEO headline metric.

## Publishing checks

Validate local links and anchors, JavaScript syntax, structured metadata, example-file consistency, and the resume file. GitHub Pages publishes the root of `main`. After publishing, confirm the live HTML and resume match the intended files.

## Portfolio analytics

Analytics is prepared in `script.js` and remains disabled until
`measurementId` contains the portfolio's real GA4 web-stream ID (`G-...`).
Collection is limited to `mickeysteurer.github.io`; local previews do not send data.

- GA4's automatic page views, visitors, and sessions measure site traffic.
- `resume_click` measures clicks on the navigation, hero, and contact resume links.
  `link_location` identifies placement; `resume_action` distinguishes open/download.
  This does not confirm a completed download or PDF read.
- `project_open` measures openings of all seven project details controls.
  `project_id` and `project_title` identify the project. Closing does not count;
  reopening counts again. Use user metrics for distinct visitors.

Before merging, obtain the real measurement ID, activate it in `script.js`,
and verify collection in GA4 Realtime or DebugView. Register event-scoped custom
dimensions for `project_id`, `project_title`, `link_location`, and
`resume_action` to use these parameters in standard reports.

No UTM links are required. Enhanced measurement may also emit `file_download`;
do not add it to `resume_click` counts. Direct visits to the PDF bypass webpage
tracking. Historical visits cannot be recovered, and browser blocking can reduce
counts. Advertising personalization and Google signals are disabled in the tag.
