---
name: glenolia-mirofish-review
description: Use MiroFish for synthetic Glenolia audience research and pair it with separately observed Glenolia website QA. Use when a Glenolia review explicitly involves MiroFish; this is a custom workflow adapter, not an upstream MiroFish skill.
---

# Glenolia MiroFish review

This custom Glenolia adapter connects two different kinds of evidence. MiroFish
is an audience/social simulation app; its output is not browser testing, a real
survey, a conversion forecast or a verified customer quote.

Locate the local fork: use the current Git root if it contains
`README_GLENOLIA.md`, otherwise look within the active Glenolia project at
`Website Testing/MiroFish`. Read that README and the three `glenolia-study/`
files before a run. The fork's `glenolia-website-test-setup` branch contains the
local launcher; do not replace the live website with this app.

Use `node scripts/glenolia.mjs preflight` to inspect runtime and configuration
without a provider call. The local profile binds only 127.0.0.1 on ports 3300/5501,
uses English by default and keeps `private.env` ignored with owner-only
permissions. Never print credentials, reuse another project's keys, enable
debug mode or expose this unauthenticated app publicly.

Before model/Zep work, confirm the intended study and the actual configured
accounts/allowance and owner-approved spending limit. Small agent/round defaults
are not a hard cost cap; graph creation and reports also cost. Do not create
accounts, accept provider terms, buy upgrades or start a paid run by inference.
After an ambiguous creation, reconcile saved project/job and provider state
before retrying. Never label setup/preflight as a successful simulation.

Refresh the seed from public pages only. Exclude teacher-only packs, subscriber
or pupil data, private notes and account details. Use synthetic adult roles,
qualified opening targets and dated planting facts; do not invent operations,
harvests, partnerships, endorsements or representative audience metrics.

For actual UI checks use the available native browser tool and the existing
website repository's checks. The supplied public-status script makes only five
allowlisted GETs. Do not submit production forms, create marketing contacts,
send email or change backend content unless that test was explicitly requested.
Never claim link/form/mobile success from a synthetic conversation.

Report **synthetic audience hypotheses**, **observed website checks**, and
**owner decisions/open questions** separately. Include the real URL/date,
viewport, steps and evidence for observed defects. Preserve the original brand
identity and the difference between planned and operating activities.
