# Portfolio Improvement Plan — 2026-11-15
Status: **Draft PR only — no approval to publish.**
Public baseline: `main`. Existing unmerged PR #7 is a reference, not an approved change.

## Objective
Help employers understand and verify Michael Steurer's marketing operations, CRM, web publishing, automation and coordination experience without losing factual nuance or adding decorative complexity.

## Evidence hierarchy
1. Direct user corrections and approved Master Resume and Cover Letter Source Pack v5.12.7.
2. Documented confirmed professional contributions; team responsibilities identified.
3. Existing published site for navigation, URLs, accessibility and style baseline.
4. Prior draft PR for selectively reusable copy only.
Do not commit the private career pack to the public repository.

## Decisions implemented in this branch
- Kept single-page site and existing design identity.
- Replaced duplicate PR #7 preview links with four visible editorial case studies.
- Preserved individual tool tags on cases and detailed optional workflow explanations.
- Put campaign execution and Sales/CRM QA first but retained web, operations and training.
- Restored 50+ Engagement Studio workflows within Experience as well as in the hero.
- Restored event logistics and 500+ event leads, and gave Travel Hotline video/training their correct attribution.
- Removed a specific six-month no-reply fallback from the published description because it was not established in the maintained claim register.
- Added confirmed tools relevant to operations roles (Jira, Microsoft Excel, PowerPoint).
- Kept existing routes, privacy preferences, and analytics events unchanged. Replaced the outdated public résumé PDF with the visually reviewed one-page PR #7 version (same existing download URL).

## Acceptance checks
- No incorrect Travel Hotline blog or website attribution.
- Dates and metrics match the source pack.
- No duplicated IDs, missing in-page anchors, malformed disclosure counts.
- No external work claims without accurate personal/team attribution.
- All navigation and resume URLs continue to work.
- Browser compare at 320, 390, 768, 1024 and 1440 CSS px; check zoom and expanded details.
- Keyboard, reduced-motion and manual WCAG 2.2 AA checks.
- Visual and textual public résumé review; one-page PR #7 version copied by matching Git blob SHA.
- Approve before merging.

## Verified results and remaining validation
- GitHub Actions Chromium CI passed at 320, 390, 768, 1024, and 1440 CSS px: no horizontal overflow, disclosures opened successfully, and no automated WCAG A/AA findings. Published-versus-draft desktop and mobile screenshots were generated and visually compared. Automated tests are not comprehensive accessibility certification.
- Both one-page résumé versions were rendered and their text inspected; the chosen draft corrects the Travel Hotline blog misattribution and restores confirmed training and creative tools. The new branch contains the unchanged binary candidate (Git blob SHA `5a6e2646e5f2b94f3241a6082ca73aa2c25d3e2a`).
- A manual keyboard, text zoom, browser compatibility and employer-comprehension check is still recommended before merging.
- Manual check of PDF hyperlink destinations in a standard viewer, and any future updates to the general public résumé.
- Employer-oriented comprehension testing using a few concrete tasks.
- Optional work samples only if they add authentic evidence; no synthetic screenshots presented as original employer assets.

## Review and release
Compare current production with draft PR side by side; correct material issues; merge only on explicit approval. Keep production commit as rollback.
