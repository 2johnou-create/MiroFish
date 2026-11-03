# The Glenolia local MiroFish test workspace

Fork: <https://github.com/2johnou-create/MiroFish>

Setup branch: `glenolia-website-test-setup`

Upstream baseline: `666ghj/MiroFish` at `7657031ac01184afe2cb220f5ee3545573b5e843`.

This is a separate research application. It does not alter or host
<https://theglenolia.com.au/>. MiroFish creates **synthetic audience discussion**;
actual link, form, mobile and backend checks must be carried out separately.
The included Codex skill is our custom Glenolia workflow adapter, not a skill
provided by the upstream MiroFish project. Upstream AGPL-3.0 licensing remains.

## What is ready

- Root/frontend npm dependencies can be installed from their existing lockfiles;
  the Python 3.11/3.12 environment uses the existing `backend/uv.lock`.
- A loopback-only launcher uses **127.0.0.1:3300** for the frontend and
  **127.0.0.1:5501** for the API, with debug off and an English default. A stored
  language choice is respected. It refuses occupied ports instead of stopping
  another process. No public hosting or automatic launch is configured.
- The local home panel says Local sandbox, asks for a setup check and gives no
  fixed simulation-price estimate. It is not a provider-readiness indicator.
- The private config is separate from parent `.env` files and unrelated inherited
  credentials. The local backend rejects remote browser origins/rebound hosts.
- `glenolia-study/` contains a public-only fact seed, an adult audience study and
  a separate real-site QA checklist. No private learning packs or pupil/contact
  records belong in this repository.

**A real simulation has not been run by this setup.** It needs an owner-selected
OpenAI-compatible model endpoint/key/model and a Zep Cloud key, plus an approved
study allowance/budget. This does not imply the providers are free. Upstream
graph extraction, agent setup, rounds, reports and retries can all consume quota.
Do not create accounts, accept terms or buy upgrades as part of a preflight.

## Install on another machine

Use a Node release supported by the locked Vite version (Node 20.19+ or 22.12+)
and Python 3.11 or3.12. Install [uv](https://docs.astral.sh/uv/getting-started/installation/)
using its official instructions if unavailable. From this fork:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm --prefix frontend ci --ignore-scripts --no-audit --no-fund
uv sync --project backend --frozen --no-dev --python 3.12
node scripts/glenolia.mjs init
node scripts/glenolia.mjs preflight
```

The npm install hooks are deliberately disabled. The lockfile's native hooks are
esbuild/fsevents; the supported prebuilt optional binaries are installed by the
lockfile and the frontend build is checked. Do not enable unknown new hooks just
to suppress an installation error. The local bootstrap used an isolated official
npm CLI package and uv wheel when system tools were absent; those local tools
and machine-specific evidence are ignored, not committed or required globally.

## Configure locally

`init` creates `private.env` once, with permissions 0600 and a random app secret.
It leaves provider keys blank and never overwrites an existing config. Open the
file locally and enter `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL_NAME` and
`ZEP_API_KEY`. Do not paste keys into chat or commit them. Do not copy credentials
from an unrelated project. This upstream release connects to Zep Cloud; an
alternative `ZEP_API_URL` is not supported.

The preflight prints only key names/presence and runtime checks. Exit 2 means
configuration or dependencies are incomplete; no simulation has been attempted.
It does not verify provider authentication, credits, model compatibility or a
future run's cost. Review those in the actual provider accounts before a run.

## Start and stop

```sh
node scripts/glenolia.mjs frontend   # UI preview only; no backend/provider
node scripts/glenolia.mjs start      # requires completed private configuration
```

Open <http://127.0.0.1:3300/>. On macOS, `scripts/start-glenolia.command` is an
additional launcher. Stop with Ctrl+C. Do not use upstream `npm run dev` for this
local profile: its generic defaults expose Vite/Flask to other interfaces.
Starting the app is separate from uploading/building a graph or launching a
simulation. Those actions need a confirmed owner budget and study first.

## Run the study when accounts and budget are ready

1. Recheck the dated public facts and current website; keep private materials out.
2. Upload `glenolia-study/01-public-facts.md` as the seed. Use the copy-ready
   requirement in `02-audience-study.md`; begin small after checking the current
   UI controls and real account allowances.
3. Record job/project IDs and usage. If creation times out ambiguously, inspect
   the saved/provider state before retrying; avoid duplicate jobs.
4. Label output as synthetic hypotheses. No real survey, testimonial, measured
   conversion rate or forecast is established by model role-play.
5. Follow `03-website-qa-checklist.md` with the actual native browser and existing
   website checks. Keep observed defects and model suggestions separate.

## Verification commands

```sh
node --test scripts/glenolia.test.mjs
backend/.venv/bin/python scripts/test_glenolia_backend.py
VITE_DEFAULT_LOCALE=en VITE_API_BASE_URL=/ npm --prefix frontend run build -- --config vite.glenolia.config.js
node scripts/glenolia-public-status.mjs
```

The backend tests block network connections and exercise real Flask local-host
and origin boundaries. The public status command sends only five allowlisted
GETs, never submits forms, and is not a complete SEO/mobile/email audit. Use the
native browser for UI evidence. Production submissions, contact creation, email
and backend writes require an explicitly requested test.

The workflow adapter can be installed from this branch at
`skills/glenolia-mirofish-review`. It requires no credentials during installation.
Keep generated results in ignored `glenolia-results/`; do not upload private
provider logs, credentials or personal information to this public fork.
