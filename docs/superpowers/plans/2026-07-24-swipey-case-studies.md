# Swipey Case Studies Implementation Plan

> **For agentic workers:** Subagents are dispatched directly with the Agent tool on `model: fable`, in three phases with two review checkpoints (see Execution Model below) — *not* one review per task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Execution Model

Two review checkpoints, not eleven. Each subagent self-reviews before reporting.

| Phase | Tasks | Mode |
|---|---|---|
| **1 — Foundation + flagship** | 1, 2, 4, 6a, 7 | Sequential, one agent. Proves the embed pipeline and ships one complete case study. |
| **REVIEW 1** | — | Pramit reviews a real, finished case study before two more are built on the pattern. |
| **2 — The other two** | 3, 5, 6b in parallel; then 8, 9, 10 sequential | Parallel agents for vendoring/building/capture (isolated directories). JSON writes stay sequential. |
| **REVIEW 2** | 11 | Sanitisation audit + portfolio critique, then Pramit reviews the set. |

**Why the JSON writes are not parallel:** Tasks 7, 8 and 9 all append to `content/site-content.json`. Two agents editing one JSON array clobber each other and produce an unmergeable conflict. Appending an object takes a minute; the expensive work (npm install, CRA build, vendoring, capture) is what gets parallelised.

**Phase 2 parallel split:**
- Agent A → Task 3 (vendor Swipey Admin) + its cover capture
- Agent B → Task 5 (Demo App build) + Task 2's already-vendored rename + its cover capture

Neither writes `content/site-content.json`. A short sequential pass then does Tasks 8, 9 and 10.

**Self-review:** every agent, before reporting, re-reads its own diff against the Global Constraints below and states explicitly whether the sanitisation script exited 0 and whether anything it wrote could be an invented claim.

**Goal:** Ship three case studies from the Swipey internship — `swipey-fields`, `swipey-admin`, `side-by-side` — each with a live, interactive, sanitised embed of the original prototype.

**Architecture:** Case studies are pure content. `app/work/[slug]/page.tsx` already renders any slug found in `content/site-content.json` → `caseStudies[]`, so **no new route files are needed**. Prototypes are vendored as static files into `public/proto/<name>/` and embedded via the existing `solutionEmbedUrl` iframe path in `CaseStudyLayout`. Three prototypes need no build step; one (the Demo App) needs a one-time Create React App build.

**Tech Stack:** Next.js App Router (webpack dev), TypeScript, static content JSON, plain static HTML/JS prototypes, React 18 UMD (vendored), Create React App (Demo App only).

**Spec:** `docs/superpowers/specs/2026-07-24-swipey-case-studies-design.md` — read it before Task 1. It contains the approved narratives, the Alfie context, and the exact draft headline copy.

---

## Global Constraints

Every task's requirements implicitly include this section.

**Source of truth**
- `~/Swipey/PORTFOLIO-BRIEF.md` is **unreliable** — an agent wrote it and it embellishes. Two claims were verified false. **Never source a factual claim from it.** Verify against the artifact, or ask Pramit.
- Never invent metrics, users, outcomes, or testimonials. If evidence for a claim does not exist, cut the claim.

**Confidentiality — applies to vendored copies only, never to `~/Swipey/` originals**
- Replace every person name and merchant name per the name map in Task 1.
- No repo names, CI/CD image names, k8s labels, commit hashes, or vendor names (Auth0, LaunchDarkly, Mixpanel, Sentry).
- No real business metrics from any source. The Weekly Digest work stream is excluded entirely.
- Keep: "Swipey", the product context, design system tokens, "Alfie" as a feature name.
- **All three case studies ship with `"hidden": true`** until Pramit clears the embeds with Swipey. Do not remove this flag in any task.

**How `hidden` actually protects — and what it does not**
- Verified: `canSeeHiddenCaseStudies()` (`lib/site-content.ts:22`) returns `NODE_ENV !== 'production'`. In production, `getCaseStudyContent` cannot find a hidden entry and calls `notFound()`. **Hidden case study pages genuinely 404 in production.** Good.
- **But `public/` is served statically and is never gated.** Anything committed under `public/proto/` or `public/work/swipey-*` is fetchable by direct URL in production *regardless of the `hidden` flag*. The flag protects the page, not the assets.
- Therefore: **all work happens on a local branch that is never pushed until sign-off.** Pushing a branch can create a publicly reachable Vercel preview deployment, which would expose the prototypes just as surely as merging to main.
- Pramit pushes his own work. **No task in this plan pushes anything.** Local commits only.

**Alfie context (must appear before any Alfie mechanic is described)**
- Alfie is Swipey's in-product AI and it **predates** this work. Its original job was OCR receipt matching — the fifth tab in the admin app, subtitled "Smart receipt matching".
- Pramit deliberately **extended that existing, trusted name** to custom fields rather than inventing a second assistant, so user trust transferred.
- Never describe the fields work as "adding AI to a table".

**Voice**
- First person, plain declarative sentences, specific real numbers, one statement per section.
- `outcomesHeadline` reflects on what was learned, then says what he'd do next. `pullQuote` is the thesis.
- AI-assisted process is disclosed the way `albers` already does it. Do not claim Pramit hand-authored work an agent produced under his direction.

**Repo conventions**
- Images: `public/work/<slug>/<name>.png`, referenced as `/work/<slug>/<name>.png`.
- Content edits go in `content/site-content.json` only. `lib/site-content.ts` validates with the hand-rolled `isSiteContent` guard and **throws on malformed content** — a broken entry makes the page 500. Loading the page is the test.
- There is no test runner and no zod. Verification = dev server + browser + one type check.
- `useEmbedPreview` is **not read by `CaseStudyLayout`** (only the game layout). Do not set it on these.
- `CaseStudyLayout` drops `solution`-section media blocks when `solutionEmbedUrl` is set (`components/CaseStudyLayout.tsx:329`). Solution section = the embed. All other imagery goes in non-solution blocks.

**Subagent dispatch rules (from `~/agent-system/AGENTS.md`)**
- Every subagent prompt touching UI must say: **read `~/agent-system/core/TASTE.md` and `~/agent-system/core/CRAFT.md` before editing.** This repo has no `DESIGN.md`, so TASTE governs.
- For frontend code also name `~/agent-system/core/FRONTEND_RULES.md`.
- **Name the files by path, never installed skill names** — skills may not exist in the subagent's environment.
- Tell every code subagent: run **at most ONE** type check, at the very end, filtered — `npx tsc --noEmit 2>&1 | head -30`. Never after every edit, never a full build just to check types.
- Subagents inherit no context. Paste the relevant spec section into the prompt.

**Dev server**
- Start with the preview tool using the existing config: `preview_start {name: "dev"}` (from `.claude/launch.json`, port 3000, autoPort). **Never run `npm run dev` via Bash.**

---

## File Structure

**Created**
- `PROJECT.md` — repo state file required by `~/agent-system/AGENTS.md`; currently missing.
- `scripts/sanitise-proto.mjs` — one-shot name-map replacer run over vendored prototypes. Single responsibility: string replacement across a directory.
- `public/proto/card-rename/` — vendored Card Rename prototype (no build).
- `public/proto/swipey-admin/` — vendored admin prototype (no build).
- `public/proto/custom-fields/` — vendored Model C prototype (pre-transpiled).
- `public/proto/swipey-demo/` — built Demo App static bundle.
- `public/work/<slug>/cover.png` — one cover image per case study, for the `/work` grid card. Nothing else; these are embed-driven.

**Modified**
- `content/site-content.json` — three new entries in `caseStudies[]`, **three matching entries in `workPage.projects[]`** (the listing is a separate array; a case study missing from it is unreachable from `/work`), and `prev`/`next` links between the three.

**Not touched**
- `components/CaseStudyLayout.tsx` — the embed path already does everything needed.
- `app/work/**` — no new routes. `[slug]` handles these.
- `lib/site-content-schema.ts` — entries use the schema as-is.

---

### Task 1: Repo scaffolding and the sanitisation tool

Creates the missing `PROJECT.md` and the one tool every vendoring task depends on.

**Files:**
- Create: `PROJECT.md`
- Create: `scripts/sanitise-proto.mjs`

**Interfaces:**
- Produces: `node scripts/sanitise-proto.mjs <dir>` — walks `<dir>` recursively, rewrites text files in place using `NAME_MAP`, prints a per-file replacement count, and exits non-zero if any banned term survives. Tasks 2–5 all call it.
- Produces: the working branch every later task commits to.

- [ ] **Step 0: Create the working branch**

Everything Swipey-derived stays off `main` until sign-off, because `public/` assets are served regardless of the `hidden` flag.

```bash
git checkout -b swipey-case-studies && git branch --show-current
```

Expected: `swipey-case-studies`

- [ ] **Step 1: Write `scripts/sanitise-proto.mjs`**

```js
#!/usr/bin/env node
// Rewrites person/merchant names in a vendored prototype directory.
// Usage: node scripts/sanitise-proto.mjs public/proto/swipey-admin
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

// Real -> fictional. Longest keys first so substrings don't corrupt longer matches.
const NAME_MAP = {
  'GOH YU HAN': 'TAN WEI LING',
  'Goh Yu Han': 'Tan Wei Ling',
  'Suresh Kumar': 'Rajesh Nair',
  'Suresh Mastercard': 'Rajesh Mastercard',
  'New Suresh': 'New Rajesh',
  'Aisyah Rahman': 'Nurul Hakim',
  'Marcus Lim': 'Daniel Ong',
  'Big Boss HSP': 'Corner Cafe KL',
  'Simulate Merchant KL': 'Demo Merchant KL',
  'Test Merchant': 'Sample Merchant',
  'Kopi Labs Sdn Bhd': 'Bright Labs Sdn Bhd',
  'Kopi Labs': 'Bright Labs',
  'john@': 'aaron@',
  'sam@': 'mei@',
}

// Terms that must not survive anywhere in a vendored prototype.
const BANNED = ['r-swipey', 'GOH YU HAN', 'Suresh', 'Big Boss HSP', 'LaunchDarkly', 'Mixpanel']

const TEXT_EXT = new Set(['.html', '.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.txt', '.map'])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const root = process.argv[2]
if (!root) {
  console.error('usage: node scripts/sanitise-proto.mjs <dir>')
  process.exit(2)
}

const keys = Object.keys(NAME_MAP).sort((a, b) => b.length - a.length)
let totalHits = 0

for (const file of walk(root)) {
  if (!TEXT_EXT.has(extname(file))) continue
  const before = readFileSync(file, 'utf8')
  let after = before
  let hits = 0
  for (const key of keys) {
    const parts = after.split(key)
    if (parts.length > 1) {
      hits += parts.length - 1
      after = parts.join(NAME_MAP[key])
    }
  }
  if (hits > 0) {
    writeFileSync(file, after)
    console.log(`${hits.toString().padStart(4)}  ${file}`)
    totalHits += hits
  }
}

console.log(`\ntotal replacements: ${totalHits}`)

// Verify nothing banned survived.
const survivors = []
for (const file of walk(root)) {
  if (!TEXT_EXT.has(extname(file))) continue
  const text = readFileSync(file, 'utf8')
  for (const term of BANNED) if (text.includes(term)) survivors.push(`${term} in ${file}`)
}

if (survivors.length) {
  console.error('\nBANNED TERMS SURVIVED:')
  for (const s of survivors) console.error('  ' + s)
  process.exit(1)
}
console.log('clean: no banned terms remain')
```

- [ ] **Step 2: Verify the script fails loudly on unsanitised input**

```bash
mkdir -p /tmp/sanitise-check && printf 'cardholder: GOH YU HAN\n' > /tmp/sanitise-check/a.html
node scripts/sanitise-proto.mjs /tmp/sanitise-check
```

Expected: prints `1  /tmp/sanitise-check/a.html`, then `clean: no banned terms remain`, exit 0. Confirm the file now reads `TAN WEI LING`:

```bash
cat /tmp/sanitise-check/a.html && rm -rf /tmp/sanitise-check
```

Expected: `cardholder: TAN WEI LING`

- [ ] **Step 3: Create `PROJECT.md`**

Use the template at `~/agent-system/templates/PROJECT.md` as the shape. Content must state: this is Pramit's portfolio (Next.js App Router, content-driven via `content/site-content.json`); case studies render through `app/work/[slug]/page.tsx` from that JSON; the current in-flight work is the three Swipey case studies (spec path); and the open thread is that they are `hidden: true` pending Swipey sign-off on the interactive embeds.

- [ ] **Step 4: Commit**

```bash
git add PROJECT.md scripts/sanitise-proto.mjs
git commit -m "chore: add PROJECT.md and prototype sanitisation script"
```

---

### Task 2: Vendor Card Rename and prove the embed pipeline

The simplest prototype, used to prove the whole embed approach before three case studies depend on it. **If this task fails, stop and re-plan** — do not proceed to Tasks 3–5.

**Files:**
- Create: `public/proto/card-rename/` (copied from `~/Swipey/Card Rename/`)

**Interfaces:**
- Produces: a working embed at `/proto/card-rename/index.html`, proven to render inside an iframe. Tasks 3–5 copy this pattern.

- [ ] **Step 1: Copy the prototype into public**

```bash
mkdir -p public/proto/card-rename
cp -R "$HOME/Swipey/Card Rename/." public/proto/card-rename/
rm -rf public/proto/card-rename/_ds
ls public/proto/card-rename/
```

Expected: `Card Panel Rename.dc.html`, `FamiliarBody.dc.html`, `PanelBody.dc.html`, `SwipeyCardArt.dc.html`, `support.js`, `assets/`

- [ ] **Step 2: Rename the entry file to `index.html`**

The sibling `.dc.html` components must keep their exact filenames — the entry file references them by name. Only the entry is renamed.

```bash
cd public/proto/card-rename && mv "Card Panel Rename.dc.html" index.html && ls
```

- [ ] **Step 3: Sanitise**

```bash
node scripts/sanitise-proto.mjs public/proto/card-rename
```

Expected: ends with `clean: no banned terms remain`, exit 0.

- [ ] **Step 4: Start the dev server and load the prototype directly**

Start it with the preview tool: `preview_start {name: "dev"}`. Then navigate to `/proto/card-rename/index.html`.

Verify with `read_page`: the page shows "Card detail panel", "Rename UX — finalists", and both finalist panels ("Refreshed panel", "Familiar layout"). Check `read_console_messages` for errors — a failed `support.js` or missing sibling component shows up here.

Expected: panels render; no 404s in `read_network_requests`.

- [ ] **Step 5: Prove it works inside an iframe**

The embed renders in an iframe, which can break differently than a direct load. Confirm with `javascript_tool` while the prototype page is open:

```js
(() => {
  const f = document.createElement('iframe')
  f.src = '/proto/card-rename/index.html'
  f.style.cssText = 'width:900px;height:600px'
  document.body.appendChild(f)
  return new Promise(res => {
    f.onload = () => res({ ok: true, title: f.contentDocument.title, bodyLen: f.contentDocument.body.innerHTML.length })
    setTimeout(() => res({ ok: false, reason: 'timeout' }), 5000)
  })
})()
```

Expected: `{ok: true, ...}` with `bodyLen` in the thousands. If `ok:false` or `bodyLen` is near zero, the prototype does not survive iframing — **stop and report**.

- [ ] **Step 6: Commit**

```bash
git add public/proto/card-rename
git commit -m "feat: vendor sanitised card rename prototype for embedding"
```

---

### Task 3: Vendor the Swipey Admin prototype

**Files:**
- Create: `public/proto/swipey-admin/` (copied from `~/Swipey/Swipey Admin/`)

**Interfaces:**
- Consumes: `scripts/sanitise-proto.mjs` from Task 1; the iframe-verification method from Task 2 Step 5.
- Produces: a working embed at `/proto/swipey-admin/index.html`.

- [ ] **Step 1: Copy, dropping local-only directories**

`_ds/`, `docs/`, `MEMORY.md`, `PROJECT.md` are local working files, never committed upstream and not needed to run.

```bash
mkdir -p public/proto/swipey-admin
cp -R "$HOME/Swipey/Swipey Admin/." public/proto/swipey-admin/
cd public/proto/swipey-admin && rm -rf _ds docs MEMORY.md PROJECT.md "Design Review - Swipey Admin Mobile.md"
mv "Swipey Admin.dc.html" index.html && ls
```

Expected: `index.html`, `support.js`, `assets/`

- [ ] **Step 2: Sanitise**

```bash
node scripts/sanitise-proto.mjs public/proto/swipey-admin
```

Expected: exits 0 with `clean: no banned terms remain`.

- [ ] **Step 3: Verify it loads and the login flow works**

With the dev server running, navigate to `/proto/swipey-admin/index.html`.

The prototype gates on login. Using `read_page` to get refs, then `form_input` and `computer` clicks: enter any 9+ digit number (e.g. `123456789`), submit; enter any 6-digit code (e.g. `123456`), submit; choose the first workspace; choose the Admin role.

Expected: lands on the Overview screen showing "Quick look", the stat tiles, "Quick actions", and a five-tab bar ending in "Alfie".

- [ ] **Step 4: Confirm the sanitised names took effect**

Navigate to the Team tab and use `get_page_text`.

Expected: no occurrence of `Suresh`, `GOH YU HAN`, `john@`, or `sam@`. Emails read `@pramitscoffee.com` (already fictional — leave them).

- [ ] **Step 5: Verify it survives iframing**

Repeat Task 2 Step 5's `javascript_tool` snippet with `src = '/proto/swipey-admin/index.html'`.

Expected: `{ok: true}` with a non-trivial `bodyLen`.

- [ ] **Step 6: Commit**

```bash
git add public/proto/swipey-admin
git commit -m "feat: vendor sanitised swipey admin prototype for embedding"
```

---

### Task 4: Vendor Custom Fields with pre-transpiled JSX

The Model C prototype currently loads React, ReactDOM and Babel-standalone from unpkg and transpiles JSX in the browser (~3MB, slow, and a runtime dependency on a CDN). Pre-transpile once and vendor React's **production** UMD locally.

**Files:**
- Create: `public/proto/custom-fields/` (from `~/Swipey/Transactions Custom Fields/.superpowers/brainstorm/64917-1784290761/content/`)

**Interfaces:**
- Consumes: `scripts/sanitise-proto.mjs` from Task 1.
- Produces: a working embed at `/proto/custom-fields/index.html` with no external network dependency.

- [ ] **Step 1: Copy the canonical exploration**

`64917-1784290761` is the canonical session per the spec — not the other two brainstorm directories.

```bash
SRC="$HOME/Swipey/Transactions Custom Fields/.superpowers/brainstorm/64917-1784290761/content"
mkdir -p public/proto/custom-fields
cp "$SRC"/model-c.html "$SRC"/model-c.jsx "$SRC"/tweaks-panel.jsx "$SRC"/colors_and_type.css public/proto/custom-fields/
cp "$SRC"/Quicksand-*.ttf public/proto/custom-fields/
ls public/proto/custom-fields/
```

- [ ] **Step 2: Fix the companion-server asset paths**

The HTML references assets at `/files/...`, a convention of the preview server it was built against.

```bash
cd public/proto/custom-fields && sed -i '' 's|/files/|./|g' model-c.html && grep -c '/files/' model-c.html || true
```

Expected: `0` occurrences remain.

- [ ] **Step 3: Vendor React production UMD**

```bash
cd public/proto/custom-fields
curl -sSLo react.production.min.js https://unpkg.com/react@18.3.1/umd/react.production.min.js
curl -sSLo react-dom.production.min.js https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
ls -la react*.js
```

Expected: two files, roughly 10KB and 130KB.

- [ ] **Step 4: Pre-transpile the JSX**

```bash
cd public/proto/custom-fields
npx --yes @babel/cli@7 --presets @babel/preset-react model-c.jsx -o model-c.js
npx --yes @babel/cli@7 --presets @babel/preset-react tweaks-panel.jsx -o tweaks-panel.js
ls -la model-c.js tweaks-panel.js
```

Expected: both `.js` files exist and are non-empty. If `@babel/cli` cannot resolve `@babel/preset-react`, install both explicitly: `npx --yes -p @babel/cli@7 -p @babel/preset-react@7 babel --presets @babel/preset-react model-c.jsx -o model-c.js`

- [ ] **Step 5: Rewrite the HTML to use local production scripts**

Edit `public/proto/custom-fields/model-c.html`. Replace the three unpkg `<script src=...>` tags and the two `type="text/babel"` JSX script tags with:

```html
<script src="./react.production.min.js"></script>
<script src="./react-dom.production.min.js"></script>
<script src="./tweaks-panel.js"></script>
<script src="./model-c.js"></script>
```

Remove the Babel-standalone script tag entirely. The transpiled files are plain JS, so no `type="text/babel"` attribute should remain.

```bash
cd public/proto/custom-fields && grep -c 'unpkg.com\|text/babel' model-c.html || true
```

Expected: `0`.

- [ ] **Step 6: Rename entry to `index.html` and sanitise**

```bash
cd public/proto/custom-fields && mv model-c.html index.html
cd /Users/pramitranjan/portfolio && node scripts/sanitise-proto.mjs public/proto/custom-fields
```

Expected: replacements reported (this prototype has the most), then `clean: no banned terms remain`.

- [ ] **Step 7: Verify it renders and the Alfie flow works**

With the dev server running, navigate to `/proto/custom-fields/index.html`.

Using `read_page` for refs, click the "Create 'Project' field" button in the Alfie nudge banner.

Expected: an accept bar appears reading `Alfie filled 8 values in 'Project' from your transaction notes` with "Accept all" and "Review later". `read_console_messages` shows no errors. `read_network_requests` shows **no requests to unpkg.com**.

- [ ] **Step 8: Confirm names are sanitised**

`get_page_text` on the same page.

Expected: `TAN WEI LING` appears; `GOH YU HAN` and `Suresh` do not.

- [ ] **Step 9: Verify iframing, then commit**

Repeat Task 2 Step 5 with `src = '/proto/custom-fields/index.html'`.

```bash
git add public/proto/custom-fields
git commit -m "feat: vendor custom fields prototype, pre-transpiled with local React"
```

---

### Task 5: Build the Demo App static bundle

**Time-box this task.** It is the only prototype needing a toolchain, on a Create React App project of unknown age. If it fights back for more than a reasonable effort, **stop, report, and fall back** to screenshots for the onboarding half of `side-by-side` — Task 9 already handles that case.

**Files:**
- Create: `public/proto/swipey-demo/` (CRA production build output)

**Interfaces:**
- Consumes: `scripts/sanitise-proto.mjs` from Task 1.
- Produces: either a working embed at `/proto/swipey-demo/index.html`, or a documented failure that routes Task 9 to the screenshot fallback.

- [ ] **Step 1: Install dependencies**

```bash
cd "$HOME/Swipey/Demo App" && npm install 2>&1 | tail -20
```

If peer-dependency resolution fails, retry once with `npm install --legacy-peer-deps`. Report the outcome either way.

- [ ] **Step 2: Set the served subpath**

CRA resolves asset URLs against `homepage`. Without it the bundle requests assets from the domain root and 404s under `/proto/swipey-demo/`.

```bash
cd "$HOME/Swipey/Demo App" && node -e "
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.homepage='/proto/swipey-demo/';
fs.writeFileSync('package.json',JSON.stringify(p,null,2));
console.log('homepage =',p.homepage);
"
```

Expected: `homepage = /proto/swipey-demo/`

- [ ] **Step 3: Build**

```bash
cd "$HOME/Swipey/Demo App" && npm run build 2>&1 | tail -25
```

Expected: `Compiled successfully` (warnings are acceptable) and a `build/` directory. If it fails, capture the error, revert the `package.json` edit, and report — this is the documented fallback point.

- [ ] **Step 4: Copy the build into public and sanitise**

```bash
cd /Users/pramitranjan/portfolio
mkdir -p public/proto/swipey-demo
cp -R "$HOME/Swipey/Demo App/build/." public/proto/swipey-demo/
node scripts/sanitise-proto.mjs public/proto/swipey-demo
du -sh public/proto/swipey-demo
```

Expected: `clean: no banned terms remain`. Report the size.

- [ ] **Step 5: Revert the source repo change**

The `homepage` edit was for our build only; leave Pramit's source as we found it.

```bash
cd "$HOME/Swipey/Demo App" && git checkout package.json 2>/dev/null || node -e "
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));
delete p.homepage; fs.writeFileSync('package.json',JSON.stringify(p,null,2));
console.log('homepage removed');
"
```

- [ ] **Step 6: Verify the demo and its onboarding render**

With the dev server running, navigate to `/proto/swipey-demo/index.html` and then to the get-started route (`/proto/swipey-demo/index.html#/get-started` or `/proto/swipey-demo/get-started` — try both; CRA may use browser routing that needs the hash form under a subpath).

Expected: the demo workspace loads. `read_console_messages` shows no fatal errors; `read_network_requests` shows no 404s on `/static/`.

- [ ] **Step 7: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add public/proto/swipey-demo
git commit -m "feat: vendor built swipey demo app bundle for embedding"
```

---

### Task 6: Capture cover images

**One image per case study. That is all.**

These case studies are embed-driven. `CaseStudyLayout:329` drops every `section: "solution"` media block when `solutionEmbedUrl` is set, and `albers` — the existing embed case study — ships with no rendered section imagery at all. Follow that pattern: **no `mediaBlocks` on any of these three.**

The one thing that genuinely cannot be an iframe is the project card on `/work` and the home page, which needs a static `cover`. Hence exactly three images.

**Task 6a (Phase 1):** `public/work/swipey-fields/cover.png`
**Task 6b (Phase 2):** `public/work/swipey-admin/cover.png`, `public/work/side-by-side/cover.png`

**Files:**
- Create: `public/work/swipey-fields/cover.png`
- Create: `public/work/swipey-admin/cover.png`
- Create: `public/work/side-by-side/cover.png`

**Interfaces:**
- Consumes: the working prototypes from Tasks 2–5.
- Produces: three cover images, referenced as `heroImage` and `cover` by Tasks 7–9.

- [ ] **Step 1 (6a): Capture the Custom Fields cover**

Dev server running. `resize_window {width: 1440, height: 900}`, navigate to `/proto/custom-fields/index.html`.

Click the "Create 'Project' field" button so the Alfie accept bar is visible — that bar is the single most legible frame of the whole story. Then `computer {action: "screenshot"}` and save to `public/work/swipey-fields/cover.png`.

- [ ] **Step 2 (6b): Capture the Swipey Admin cover**

`resize_window {width: 430, height: 932}`, navigate to `/proto/swipey-admin/index.html`, log in per Task 3 Step 3, land on Overview. Screenshot → `public/work/swipey-admin/cover.png`.

- [ ] **Step 3 (6b): Capture the explorations cover**

`resize_window {width: 1440, height: 900}`, navigate to `/proto/card-rename/index.html`, framing both finalist panels together. Screenshot → `public/work/side-by-side/cover.png`.

- [ ] **Step 4: Confirm no unsanitised name is visible in any capture**

Re-read each saved image. A frame showing a real name must be recaptured after fixing the name map in `scripts/sanitise-proto.mjs`. Do not ship it.

- [ ] **Step 5: Commit**

```bash
git add public/work/swipey-fields public/work/swipey-admin public/work/side-by-side
git commit -m "feat: add swipey case study cover images"
```

---

### Task 7: `swipey-fields` case study content

**Files:**
- Modify: `content/site-content.json` — append one object to `caseStudies[]`

**Interfaces:**
- Consumes: `/proto/custom-fields/index.html` (Task 4), `public/work/swipey-fields/*.png` (Task 6).
- Produces: the `swipey-fields` entry; Task 10 links `prev`/`next` to it.

**Read first:** the `swipey-fields` section of the spec, and the "Who Alfie is" section. The Alfie-predates-this-work context is non-negotiable and must land before any mechanic.

- [ ] **Step 1: Append the entry**

Insert into `content/site-content.json` → `caseStudies[]`, after the last `section: "work"` entry:

```json
{
  "slug": "swipey-fields",
  "section": "work",
  "hidden": true,
  "title": "Custom Fields",
  "oneliner": "People were already tracking projects. Just not anywhere the software could see.",
  "type": "PRODUCT DESIGN · 2026",
  "tags": ["Product Design", "Data UX", "AI Interaction", "Design Systems", "Accessibility", "React"],
  "prev": null,
  "next": null,
  "heroImage": "/work/swipey-fields/cover.png",
  "problemHeadline": "Finance teams needed columns Swipey didn't have: Project, Client, Billable. So they improvised in the notes field, where nothing can be filtered, grouped, or reported on.",
  "roleHeadline": "Design intern at Swipey, a corporate card and spend platform for Malaysian SMEs. I owned this exploration end to end: the interaction model, the AI layer, and the prototype it ran in.",
  "researchHeadline": "Two things already existed. Project names sitting in the notes field, and Alfie, the receipt reader people already trusted to file their expenses. The work was connecting them.",
  "challengeHeadline": "Custom fields are org-wide. One person deleting a column destroys everyone's reporting, so management is admin-gated and deletion is something you have to type your way through.",
  "processHeadline": "I extended the assistant people already knew instead of introducing a second one. Alfie read receipts; now it reads notes too. Suggestions land as dashed pills carrying the note they came from, so accepting eight at once is still an informed decision.",
  "solutionHeadline": "A field you create in one click from a nudge that cites its own evidence, filled by Alfie, confirmed by a human, and filterable the moment it exists.",
  "outcomesHeadline": "Then I used my own prototype as the admin who'd live in it, and found eleven things wrong — three of them blocking. Creating a column scrolled it off screen. Next I'd take the same lens to the mobile table.",
  "pullQuote": "The structure was already there. It was just sitting in a text box where nothing could reach it.",
  "solutionEmbedUrl": "/proto/custom-fields/index.html",
  "solutionEmbedTitle": "Custom Fields prototype",
  "solutionEmbedAspectRatio": "16 / 10",
  "solutionEmbedWidth": "min(100%, 1325px)",
  "solutionEmbedCalloutLabel": "LIVE PROTOTYPE_",
  "solutionEmbedCalloutTitle": "The working prototype is embedded below.",
  "solutionEmbedCalloutBody": "This is the real exploration, not a mockup. Open the Alfie nudge to create a Project field, then accept or edit what it fills in.",
  "solutionEmbedCtaLabel": "OPEN FULLSCREEN"
}
```

No `mediaBlocks`. The embed carries the solution section, and this follows `albers`.

- [ ] **Step 1b: Add the `/work` listing entry**

**A case study in `caseStudies[]` alone does not appear on `/work`.** `workPage.projects[]` is a separate array and is what the listing renders — `designathon-02` is a live example of a case study that exists at its URL but is listed nowhere.

Append to `content/site-content.json` → `workPage.projects[]`:

```json
{
  "title": "Custom Fields",
  "oneliner": "People were already tracking projects. Just not anywhere the software could see.",
  "tags": ["PRODUCT", "AI"],
  "href": "/work/swipey-fields",
  "cover": "/work/swipey-fields/cover.png",
  "coverPosition": "center"
}
```

`filterWorkProjectsByVisibleCaseStudies` (`lib/site-content.ts:36`) strips this entry automatically in production while the case study is `hidden`, so adding it now is safe.

- [ ] **Step 2: Verify the JSON parses**

The content guard throws on malformed input, so a syntax error takes the whole site down.

```bash
node -e "const d=require('./content/site-content.json');console.log('entries:',d.caseStudies.length);console.log('found:',!!d.caseStudies.find(c=>c.slug==='swipey-fields'))"
```

Expected: `found: true`

- [ ] **Step 3: Load the page**

With the dev server running, navigate to `/work/swipey-fields`.

Expected: the page renders with all seven section headlines, the pull quote, and the live embed in the solution section. `read_console_messages` shows no errors.

- [ ] **Step 4: Confirm the embed is interactive in place**

Inside the embedded iframe on the case study page, confirm the prototype is live — not a static image. Use `read_page` and look for the prototype's own controls ("Manage fields", "Filters").

Expected: prototype controls are present inside the iframe.

- [ ] **Step 5: Commit**

```bash
git add content/site-content.json
git commit -m "feat: add swipey-fields case study"
```

---

### Task 8: `swipey-admin` case study content

**Files:**
- Modify: `content/site-content.json` — append one object to `caseStudies[]`

**Interfaces:**
- Consumes: `/proto/swipey-admin/index.html` (Task 3), `public/work/swipey-admin/*.png` (Task 6).
- Produces: the `swipey-admin` entry.

**Read first:** the `swipey-admin` section of the spec. Note this case study is where Alfie appears in its **original** receipt-matching role, setting up `swipey-fields`.

- [ ] **Step 1: Append the entry**

```json
{
  "slug": "swipey-admin",
  "section": "work",
  "hidden": true,
  "title": "Swipey Admin",
  "oneliner": "Proven on desktop. Unusable in a pocket.",
  "type": "PRODUCT DESIGN · 2026",
  "tags": ["Product Design", "Mobile UX", "Accessibility", "Design QA", "Design Systems"],
  "prev": null,
  "next": null,
  "heroImage": "/work/swipey-admin/cover.png",
  "problemHeadline": "Every admin flow already worked on desktop: deposit, top up, clawback, issue card, invite, approve. None of it was reachable from a phone, and the people who needed it most were the ones away from their desks.",
  "roleHeadline": "Design and design QA on the first admin-facing mobile release, built as a stakeholder-ready prototype for an audience aged 30 to 60.",
  "researchHeadline": "The desktop product was the research. Every rule, status and edge case already had a proven answer, so the job was translation, not invention.",
  "challengeHeadline": "Port the business rules, don't reinvent them. Writing new validation for flows that already worked would have been risk with extra steps.",
  "processHeadline": "I reviewed it screen by screen with stable finding IDs and severity tiers, so fixes could be referenced across sessions without collisions, and tagged the ones engineering needed as requirements rather than visual edits.",
  "solutionHeadline": "Every admin flow on a phone, with a legibility floor, 44px targets, an AA contrast system, and one status vocabulary instead of two.",
  "outcomesHeadline": "The audit found three blockers that seventy-four findings of review had walked straight past, which is the argument for auditing separately from reviewing. Next I'd test it with actual sixty-year-olds instead of designing for them.",
  "pullQuote": "Grey doesn't read as \"done\" to someone who's sixty. It reads as something went wrong.",
  "solutionEmbedUrl": "/proto/swipey-admin/index.html",
  "solutionEmbedTitle": "Swipey Admin mobile prototype",
  "solutionEmbedAspectRatio": "430 / 932",
  "solutionEmbedWidth": "min(100%, 430px)",
  "solutionEmbedCalloutLabel": "LIVE PROTOTYPE_",
  "solutionEmbedCalloutTitle": "The mobile prototype is embedded below.",
  "solutionEmbedCalloutBody": "Log in with any nine-digit number and any six-digit code, then pick the Admin role. Every flow is clickable.",
  "solutionEmbedCtaLabel": "OPEN FULLSCREEN"
}
```

No `mediaBlocks` — the live embed lets a reader reach the Alfie receipt-matching tab themselves, which is stronger than a screenshot of it.

- [ ] **Step 1b: Add the `/work` listing entry**

Append to `workPage.projects[]`:

```json
{
  "title": "Swipey Admin",
  "oneliner": "Proven on desktop. Unusable in a pocket.",
  "tags": ["PRODUCT", "MOBILE"],
  "href": "/work/swipey-admin",
  "cover": "/work/swipey-admin/cover.png",
  "coverPosition": "center"
}
```

- [ ] **Step 2: Verify JSON and load the page**

```bash
node -e "const d=require('./content/site-content.json');console.log('found:',!!d.caseStudies.find(c=>c.slug==='swipey-admin'))"
```

Expected: `found: true`. Then navigate to `/work/swipey-admin` and confirm it renders.

- [ ] **Step 3: Check the phone-shaped embed on a narrow viewport**

The embed is a fixed phone frame at a `430 / 932` aspect ratio, which is the riskiest layout case. `resize_window {preset: "mobile"}` and reload `/work/swipey-admin`.

Expected: the embed fits within the viewport and the page does **not** scroll horizontally. Confirm with `javascript_tool`:

```js
({ bodyScrollW: document.body.scrollWidth, clientW: document.documentElement.clientWidth })
```

Expected: `bodyScrollW` is not greater than `clientW`. If it overflows, reduce `solutionEmbedWidth` until it fits — do not ship a horizontally scrolling page.

- [ ] **Step 4: Commit**

```bash
git add content/site-content.json
git commit -m "feat: add swipey-admin case study"
```

---

### Task 9: `side-by-side` case study content

**Files:**
- Modify: `content/site-content.json` — append one object to `caseStudies[]`

**Interfaces:**
- Consumes: `/proto/card-rename/index.html` (Task 2), optionally `/proto/swipey-demo/` (Task 5), `public/work/side-by-side/*.png` (Task 6).
- Produces: the `side-by-side` entry.

**Read first:** the `side-by-side` section of the spec. The title is **provisional** — Pramit is not settled on it. Do not treat it as final; if he renames it, the slug, the folder `public/work/side-by-side/`, and the image paths all move together.

**Embed choice:** if Task 5 succeeded, embed the demo app (it is the richer artifact) and show the rename work through images. If Task 5 failed, embed the card-rename prototype and show the onboarding through images. Use whichever is true — do not claim an embed that does not exist.

- [ ] **Step 1: Append the entry**

Set `solutionEmbedUrl` to `/proto/swipey-demo/index.html` if Task 5 succeeded, otherwise `/proto/card-rename/index.html`, and adjust the callout body to match what is actually embedded.

```json
{
  "slug": "side-by-side",
  "section": "work",
  "hidden": true,
  "title": "Side by Side",
  "oneliner": "Every option kept where you can compare them.",
  "type": "UI DESIGN · 2026",
  "tags": ["Interaction Design", "Onboarding", "Conversion", "Prototyping", "React"],
  "prev": null,
  "next": null,
  "heroImage": "/work/side-by-side/cover.png",
  "problemHeadline": "Two problems, worked the same way. A demo that had to qualify a prospect without ever feeling like a form, and a rename that nobody could find.",
  "roleHeadline": "Design and front-end on the get-started demo, and the interaction exploration for renaming a card.",
  "researchHeadline": "People skip the sign-up ask when the demo is explorable anyway. So the questions had to stop being a toll gate and start being part of the thing they came to try.",
  "challengeHeadline": "How much affordance does a rename need? Too subtle and nobody finds it. Too loud and it takes over a panel that's meant to be about the card, not its name.",
  "processHeadline": "I kept every version side by side instead of deleting the losers. Comparing six panels at once makes the argument for one of them much faster than describing it.",
  "solutionHeadline": "Questions disguised as setup, an identity you fill in like a sentence, a demo that re-seeds itself around your industry, and a rename that leads the panel as its headline.",
  "outcomesHeadline": "Keeping the discarded options visible turned out to be the useful part; the reasoning is legible in a way a single final screen never is. Next I'd put the variants in front of real prospects instead of picking by argument.",
  "pullQuote": "The best question doesn't feel like a question. It feels like the thing you came to do.",
  "solutionEmbedUrl": "/proto/card-rename/index.html",
  "solutionEmbedTitle": "Rename explorations",
  "solutionEmbedAspectRatio": "16 / 10",
  "solutionEmbedWidth": "min(100%, 1325px)",
  "solutionEmbedCalloutLabel": "LIVE PROTOTYPE_",
  "solutionEmbedCalloutTitle": "Every rename variant is embedded below.",
  "solutionEmbedCalloutBody": "Both finalists sit up top and the four earlier explorations are kept underneath. Click any card name to rename it — the card art updates as you type.",
  "solutionEmbedCtaLabel": "OPEN FULLSCREEN"
}
```

No `mediaBlocks`.

**If Task 5 succeeded**, this case study has two things worth embedding but only one embed slot. Embed the demo app (the richer artifact), and change the callout body to describe the onboarding rather than the rename. The rename half then lives in the headlines only. Do not claim an embed that is not there.

- [ ] **Step 1b: Add the `/work` listing entry**

Append to `workPage.projects[]`:

```json
{
  "title": "Side by Side",
  "oneliner": "Every option kept where you can compare them.",
  "tags": ["INTERACTION", "ONBOARDING"],
  "href": "/work/side-by-side",
  "cover": "/work/side-by-side/cover.png",
  "coverPosition": "center"
}
```

- [ ] **Step 2: Verify JSON and confirm every referenced image exists**

```bash
node -e "
const d=require('./content/site-content.json');const fs=require('fs');
for(const s of ['swipey-fields','swipey-admin','side-by-side']){
  const c=d.caseStudies.find(x=>x.slug===s);
  const listed=d.workPage.projects.find(p=>p.href==='/work/'+s);
  console.log(s,
    '| hero',fs.existsSync('public'+c.heroImage)?'ok':'MISS',
    '| listed',listed?'yes':'NO',
    '| cover',listed&&fs.existsSync('public'+listed.cover)?'ok':'MISS');
}
"
```

Expected: every case study reads `hero ok | listed yes | cover ok`.

- [ ] **Step 3: Load `/work/side-by-side` and confirm it renders**

Expected: all sections render, the embed is live, no console errors.

- [ ] **Step 4: Commit**

```bash
git add content/site-content.json
git commit -m "feat: add side-by-side case study"
```

---

### Task 10: Cross-link, verify the set, and type check

**Files:**
- Modify: `content/site-content.json` — `prev`/`next` on the three new entries

**Interfaces:**
- Consumes: all three entries from Tasks 7–9.
- Produces: a navigable, type-clean set.

- [ ] **Step 1: Wire `prev`/`next` so Admin precedes Fields**

The ordering carries meaning: `swipey-admin` shows Alfie reading receipts, `swipey-fields` shows it extended to reading notes.

`ProjectLink` is `{ slug, title }` (`lib/site-content-schema.ts:357`) — **not** a label/href pair. `getCaseStudyContent` reads `caseStudy.prev.slug` and nulls the link if that slug is not visible (`lib/site-content.ts:109`). Set exactly:

- `swipey-admin` → `"next": { "slug": "swipey-fields", "title": "Custom Fields" }`
- `swipey-fields` → `"prev": { "slug": "swipey-admin", "title": "Swipey Admin" }` and `"next": { "slug": "side-by-side", "title": "Side by Side" }`
- `side-by-side` → `"prev": { "slug": "swipey-fields", "title": "Custom Fields" }`

**Note:** while all three are `hidden`, these links resolve to `null` in production by design — that is correct behaviour, not a bug. They light up when the hidden flags come off together.

Confirm the shape against a real entry first:

```bash
node -e "const d=require('./content/site-content.json');console.log(JSON.stringify(d.caseStudies.find(c=>c.slug==='albers').next))"
```

Expected: `{"slug":"wander","title":"Wander"}`

- [ ] **Step 2: Confirm all three are still hidden**

```bash
node -e "
const d=require('./content/site-content.json');
for(const s of ['swipey-fields','swipey-admin','side-by-side']){
  const c=d.caseStudies.find(x=>x.slug===s);
  console.log(s, 'hidden =', c.hidden);
}
"
```

Expected: all three print `hidden = true`. **If any prints `false`, set it back to `true`** — publishing is gated on Swipey sign-off.

- [ ] **Step 3: Walk all three pages and both links**

With the dev server running, load `/work/swipey-admin`, follow `next` to `/work/swipey-fields`, follow `next` to `/work/side-by-side`, then follow `prev` back. Confirm each embed loads.

Expected: no 404s, no console errors, every embed interactive.

- [ ] **Step 4: One type check, at the end, filtered**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors. Content is JSON so this mainly guards the guard in `lib/site-content.ts`.

- [ ] **Step 5: Commit**

```bash
git add content/site-content.json
git commit -m "feat: cross-link swipey case studies"
```

---

### Task 11: Sanitisation audit and portfolio critique gate

The last line of defence before Pramit takes this to Swipey. Two independent checks: nothing confidential leaked, and nothing invented survived.

**Files:**
- Modify: `PROJECT.md` — record final state and the open sign-off thread

- [ ] **Step 1: Sweep every vendored prototype for banned terms**

```bash
for d in public/proto/*/; do echo "--- $d"; node scripts/sanitise-proto.mjs "$d"; done
```

Expected: every directory reports `clean: no banned terms remain` and exits 0.

- [ ] **Step 2: Grep the whole shipped surface for leaks**

```bash
grep -ril "r-swipey\|GOH YU HAN\|Suresh\|LaunchDarkly\|Mixpanel\|launchdarkly" public/proto public/work content/site-content.json 2>/dev/null | head
```

Expected: no output. Any hit must be fixed before proceeding.

- [ ] **Step 3: Run the portfolio critique**

Apply `~/agent-system/skills/portfolio.md` in **critique mode** to each of the three case studies, loading each page in the browser first. That file's job is catching invented or inflated claims and judging whether the first screen carries the story — exactly the failure mode this project already hit once.

For each case study record its output format verbatim: the 90-second read, real problem, real decisions shown, real evidence available, **invented or inflated claims to cut**, verdict, strongest and weakest decision, highest-leverage change.

Any claim flagged as invented or inflated must be **cut or corrected**, not softened.

- [ ] **Step 4: Verify the Alfie context actually landed**

Reread the rendered `swipey-fields` page. Confirm a reader who has never heard of Alfie learns, before any mechanic is described, that Alfie already existed as the receipt reader and that extending it was the decision.

Expected: the `researchHeadline` carries it. If it reads as "I added AI to a table", rewrite before shipping.

- [ ] **Step 5: Update `PROJECT.md` and commit**

Record: three case studies built and hidden; prototypes vendored under `public/proto/`; the open thread is Swipey sign-off on **interactive embeds** (a larger ask than screenshots); and that `side-by-side` has a provisional title.

```bash
git add PROJECT.md
git commit -m "docs: record swipey case study state and sign-off thread"
```

- [ ] **Step 6: Confirm nothing has been pushed**

```bash
git branch --show-current && git log origin/main..HEAD --oneline | wc -l && git status -sb | head -1
```

Expected: branch is `swipey-case-studies`, several unpushed commits, and the status line shows no upstream tracking. If an upstream exists or commits are already pushed, **say so immediately and prominently** — the prototypes may already be publicly reachable via a Vercel preview.

- [ ] **Step 7: Report to Pramit**

State plainly: what shipped, what the critique flagged and what was cut, whether Task 5 succeeded or fell back to screenshots, the total size added to the repo, and the blocking action.

Then give him the exact release procedure, and be explicit that these are two separate gates:

1. **Do not push this branch yet.** Pushing can create a public Vercel preview, which exposes the prototypes just as much as merging. Everything under `public/` is served statically and is *not* protected by the `hidden` flag — that flag only 404s the case study pages.
2. Clear **interactive embeds of the Swipey prototypes** with Swipey. That is a bigger ask than "some screenshots"; say it in those words.
3. Once cleared: set `"hidden": false` on all three entries in one commit, then push and merge.

---

## Subagent Dispatch Template

**Model:** dispatch these subagents with `model: fable` (Fable 5), per Pramit's instruction.

**One subagent per task**, fresh each time, reviewed between tasks. Subagents inherit no context — every prompt must carry the preamble below plus the full text of its own task.

Every task dispatched to a subagent must include this preamble, with the files named by path:

```
Read these before editing anything:
- ~/agent-system/core/TASTE.md and ~/agent-system/core/CRAFT.md (the design bar and exact mechanics — non-negotiable for any UI work)
- ~/agent-system/core/FRONTEND_RULES.md (frontend implementation rules)
- docs/superpowers/specs/2026-07-24-swipey-case-studies-design.md (the approved narratives and Alfie context)

This repo has no DESIGN.md, so TASTE.md governs.

Rules:
- Run at most ONE type check, at the very end, filtered: npx tsc --noEmit 2>&1 | head -30
  Never after every edit. Never a full build just to check types.
- Never run a dev server via Bash. Use the preview tool: preview_start {name: "dev"}.
- Never source a factual claim from ~/Swipey/PORTFOLIO-BRIEF.md — it embellishes and has been
  caught inventing details. Verify against the artifact.
- Never invent metrics, users, or outcomes.
- All three case studies stay "hidden": true. Do not remove that flag.
```

---

## Risks

1. **Confidentiality is the dominant risk.** Interactive embeds expose every screen, not a curated few. Two independent gates are needed because they protect different things: `hidden: true` 404s the *case study pages* in production, but **everything under `public/` is served statically and is not gated at all**. So the prototypes are protected only by not being pushed. Work stays on an unpushed local branch; Task 11 audits both.
2. **Task 5 (CRA build) may fail** on a project of unknown age. Time-boxed with a documented screenshot fallback in Task 9. Do not sink hours.
3. **`.dc.html` iframing is unproven** until Task 2 Step 5. That step is the gate — if it fails, stop and re-plan rather than building three case studies on a broken pipeline.
4. **Repo weight** grows by roughly 3MB plus the CRA bundle. Acceptable; report the real number in Task 11.
5. **`side-by-side` title is provisional.** A rename moves the slug, the image folder, and every image path together.
6. **The phone-frame embed** (`430 / 932`) is the riskiest layout case. Task 8 Step 3 explicitly checks for horizontal overflow.
