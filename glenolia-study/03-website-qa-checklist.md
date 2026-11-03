# Actual website QA, separate from MiroFish simulation

MiroFish generates synthetic audience discussion. It does not prove that links,
forms, mobile layouts, accessibility, privacy controls or email delivery work.

## Read-only first pass

Run `node scripts/glenolia-public-status.mjs` for five explicit public GETs.
It checks response status and content presence, not visual quality, form
delivery, complete SEO or internal/private functionality. It does not crawl.

Use the available native browser tool (CUA in Codex) for the actual UI. Record
URL/date and viewport rather than claiming physical-device testing. Existing
repository checks can be run in the separate Glenolia website checkout.

- Read home, Teachers and Progress at 390 px, 768 px and a desktop width.
- Check horizontal overflow, touch targets, heading order, readable labels,
  keyboard focus and navigation; test the meaningful route back.
- Check the intended language choices and keep education's English scope clear.
- Confirm target/opening and planned/current wording remains consistent.
- Open a small representative set of published downloads and verify they match
  their labels, print notes and access level. Never copy teacher-only content
  into this public seed or the MiroFish fork.
- Inspect empty form labels and browser validation without submitting personal
  data or enrolling anyone. A visible success message is not email-delivery
  evidence unless the authorised delivery check was actually performed.
- Check newsletter and partner links for their intended destination; do not send
  a message or create a contact as part of this read-only pass.
- For authenticated teacher/staff functions, use only an existing authorised
  owner/test account and the currently authorised scope. Do not create pupils,
  alter class evidence, change audiences or republish content merely to audit.
- Confirm reduced-motion behaviour and text alternatives where the real page
  offers animation. Browser evidence is not formal WCAG certification.

Production form submissions, marketing contact creation, real email delivery
and backend writes require an explicitly requested test. Prefer a documented
staging/test route when one exists; record cleanup and actual side effects.

## Defect record

For each observed defect record: URL, timestamp, viewport/browser, exact steps,
expected behaviour, actual result, evidence path and severity. Recheck the exact
fix after publication. Keep synthetic hypotheses in a different section.
