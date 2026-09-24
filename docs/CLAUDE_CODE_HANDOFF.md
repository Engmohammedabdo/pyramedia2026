# Claude Code handoff — PyramediaX website

- **Handoff date:** 2026-07-18
- **Working branch:** local `main`
- **Base HEAD:** the commit containing the second re-review remediation
  (successor of `3b3f511`; run `git rev-parse HEAD` — Git is the authority,
  this document is not).
- **Review state:** `REVIEW_GATE2.md` (base `58fab48`),
  `REVIEW_GATE2_REREVIEW.md` (base `7c244df`) and
  `REVIEW_GATE2_REREVIEW2.md` (base `3b3f511`) are all independent FAIL
  records for the baselines they reviewed. The second re-review confirmed
  16/18 original and 8/10 first-re-review findings FIXED; its 10 findings
  were remediated in the current HEAD. A fresh independent pass is required
  for any new verdict.
- **Working-tree state:** verified with gate1 7/7, gate2 51/51, clean
  typecheck, clean 25-page build and clean diff check. The user-owned
  untracked files (`REVIEW_GATE1.md`, `REVIEW_GATE2.md`,
  `REVIEW_GATE2_REREVIEW.md`, `REVIEW_GATE2_REREVIEW2.md`,
  `.claude/settings.local.json`) remain uncommitted by design.
- **Release state:** no remote, push, deployment, production provider, or live
  Apache verification was performed in this remediation.

> **Update 2026-09-24 — supersedes the release state above.** `origin` is
> `github.com/Engmohammedabdo/pyramedia2026` and a push to `main` deploys to
> Bluehost via `.github/workflows/deploy.yml` (vars/secrets configured). The
> site is live. Analytics: four consent-gated providers (GA4, Meta, TikTok,
> OpenAI Ads), all on the main thread; Partytown was removed (SPEC Addendum
> A.10–A.12). Details and live evidence: `BUILD_NOTES.md`, entries dated
> 2026-09-22 and 2026-09-24.

This is the operational handoff for the current local tree. Read `SPEC.md` and
`REVIEWER.md` before changing a locked behavior or conducting a new gate review.
Always inspect fresh Git state and rerun the verification commands; this
document is evidence for a dated tree, not a substitute for verification.

## 1. Executive state

- The project is an Astro 5 static bilingual marketing site: English at `/`
  and Arabic at canonical `/ar/`.
- The independent GATE 1 re-review is **PASS**: 7 fixed, 0 open, 0 regressed,
  and 0 new findings for its reviewed baseline.
- The original independent `REVIEW_GATE2.md` verdict is **FAIL** with 18
  findings for the baseline it reviewed.
- All 18 GATE 2 findings have been remediated locally and protected by
  regression tests — and that claim was then independently tested: the formal
  re-review `REVIEW_GATE2_REREVIEW.md` (commit `7c244df`) returned **FAIL**,
  confirming 15 FIXED, finding G2-001/G2-005/G2-008 STILL OPEN, and adding
  ten re-review findings (G2-RR-001..010).
- All 13 first-re-review findings were remediated in a second local pass
  (commit `3b3f511`). The second independent re-review
  (`REVIEW_GATE2_REREVIEW2.md`, base `3b3f511`, verdict FAIL) confirmed
  16/18 original and 8/10 first-re-review findings FIXED and raised 10
  findings; all 10 were remediated in a third local pass (the commit that
  updated this line). Treat that as an implementation claim.
- A fresh formal independent GATE 2 re-review is still pending for the
  current tree; do not relabel the earlier reports or claim an independent
  PASS before that review occurs.
- The current production build generates 25 static pages. The latest
  INDEPENDENT mobile Lighthouse evidence (second re-review, commit
  `3b3f511`) is Perf 98 EN / 96 AR with A11y/BP/SEO 100 for both; earlier
  local builder runs measured EN 100. Both sets pass every available GATE 2
  budget.

## 2. Verification commands

Run from the repository root:

```powershell
git status --short --branch
git rev-parse HEAD
git remote -v
node --version
npm.cmd run test:gate1
npm.cmd run test:gate2
npm.cmd run build
git diff --check
```

Expected Node major: 22. The evidence recorded for this handoff is:

```text
npm.cmd run test:gate1  -> 7/7 passed
npm.cmd run test:gate2  -> 51/51 passed
npm.cmd run typecheck   -> clean (astro sync && tsc --noEmit)
npm.cmd run build       -> 25 pages; no Astro/Vite warnings or errors
git diff --check        -> clean; Windows LF/CRLF advisories only
```

The receiving session must still rerun every command because this snapshot can
become stale after any source, content, configuration, or dependency change.

To inspect the built site:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4321
```

Then open:

- `http://127.0.0.1:4321/`
- `http://127.0.0.1:4321/ar/`

A preview was running at handoff time, but process state is transient.

## 3. Performance evidence and limits

The current missing-analytics-ID build contains 59,363 gzip bytes of generated
JavaScript:

- initial layout/router: 6,413 bytes;
- deferred GSAP/Lenis motion: 52,950 bytes.

Partytown is absent because GA4 and Meta IDs are unset. Re-measure a production
build after either ID is configured.

Fresh Lighthouse 13.4.0 mobile runs against local production preview:

| Route | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 1.063 s | 1.363 s | 0.00024 | 0 ms |
| `/ar/` | 96 | 100 | 100 | 100 | 1.311 s | 1.594 s | 0.00029 | 219 ms |

Both routes returned HTTP 200 and Lighthouse reported no run warnings. INP was
not available from the lab runs and remains a GATE 3 / field boundary.

Real Chrome 150/CDP verification also confirmed that normal motion requests the
heavy chunk only after trusted input and never duplicates its cursor, shimmer,
or single pin across Astro navigation/reload. With reduced motion forced at 320
and 390 CSS px in EN/AR, the chunk was never requested, active animations and
runtime motion nodes stayed at zero, all five client names remained visible,
the methodology stayed naturally scrollable, and the consent sheet did not
cover the hit-testable WhatsApp float.

## 4. Locked GATE 1 decisions

| Finding | Locked resolution |
|---|---|
| G1-001 canonical Arabic preview route | Keep static `build.format: 'file'` and `trailingSlash: 'ignore'`; canonical `/ar/` must work in production preview. |
| G1-002 mobile navigation collision | Keep the desktop WhatsApp CTA inside its responsive wrapper and verify the wrapper, not only the child anchor. |
| G1-003 skip-link focus | Keep `<main id="main" tabindex="-1">`. |
| G1-004 Arabic LCP fonts | Arabic home: Space Grotesk 700 + Cairo Arabic 400. Arabic interiors: Cairo Arabic 800 + Cairo Arabic 400. |
| G1-005 inaccurate QA evidence | Historical Lighthouse evidence stays labelled historical and must not be promoted to canonical/live proof. |
| G1-006 alpha colors | Keep component alpha paint values centralized in design tokens. |
| G1-007 owner asset slots | Preserve `src/assets/clients/README.md` and `src/assets/founder/README.md`; use only approved real assets. |

Do not reopen these decisions for preference alone. A change needs new evidence,
SPEC compatibility, regression coverage, and Muhammad's approval.

## 5. GATE 2 remediation ledger

| Finding | Local remediation |
|---|---|
| G2-001 | Contact/privacy copy is neutral and contains no response-speed or SLA promise. |
| G2-002 | Unsupported training, ownership, access, and CRM-scope commitments were removed. |
| G2-003 | Transitions are restricted to transform, opacity, and SVG stroke; source scanners reject paint/layout transitions and bare Tailwind `transition`. |
| G2-004 | Heavy GSAP/Lenis startup was moved behind trusted visitor intent; CSS-first LCP content remains visible. Fresh lab performance is recorded above; INP remains pending. |
| G2-005 | Arabic content was rewritten into warm native MSA. |
| G2-006 | Tool/product references were localized and the English legal name is isolated LTR where required. |
| G2-007 | The Execution methodology stage now contains two matched real sentences in both languages. |
| G2-008 | UI strings live in typed EN/AR dictionaries and company/contact values stay centralized. |
| G2-009 | Hero entrance is CSS-first at opacity 0.72 and 10% translation; SVG draw has a normalized path length; GSAP does not tween the H1. |
| G2-010 | Reduced-motion marquee wraps, hides the duplicate list, and exposes every client at narrow widths. |
| G2-011 | Reveal containers use static clipping plus transform/opacity-only stagger. |
| G2-012 | Contact placeholder styling uses the compliant muted token. |
| G2-013 | Font imports/preloads are route-aware and Cairo Latin subsets are removed. |
| G2-014 | ResizeObserver-driven consent offset lifts the WhatsApp float without breaking hover transform composition. |
| G2-015 | Partytown and event dispatch honor GA4-only, Meta-only, both, or neither; real accounts remain unverified until IDs are supplied. |
| G2-016 | Mobile-menu accessible name changes between open and close state in both languages. |
| G2-017 | Navigation is sticky and obsolete fixed-header compensation was removed. |
| G2-018 | The dead orange-clear token was removed. |

The implementation report is `docs/GATE2_REMEDIATION_REPORT.md`. The original
independent report remains unchanged.

## 6. Motion architecture

- `src/scripts/motion-loader.ts` is the lightweight gateway. It listens for a
  trusted pointer, wheel, touch, or keyboard event and memoizes the dynamic
  import. A failed import silently rearms the listeners.
- `src/scripts/motion.ts` owns GSAP, ScrollTrigger, Lenis, shimmer, parallax,
  card tilt/glow, magnetic buttons, custom cursor, footer motion, and the single
  methodology pin.
- `src/styles/global.css` owns the CSS-first hero and complete reduced-motion
  final state.
- Astro `before-swap` and live reduced-motion changes tear down tickers,
  contexts, listeners, runtime nodes, inline transforms, and pin state.
- Rich motion is intentional. Do not remove it as a blanket performance fix;
  preserve the deferred boundary and the reduced-motion contract.

## 7. High-value file map

| Area | Primary files |
|---|---|
| Product truth and gate rules | `SPEC.md`, `REVIEWER.md` |
| Placeholders and dated QA | `BUILD_NOTES.md` |
| Content and contact edit map | `README.md`, `src/config/site.ts`, `src/content/`, `src/i18n/` |
| Routing and provider config | `astro.config.mjs` |
| Layout/font preload boundary | `src/layouts/BaseLayout.astro` |
| Consent and analytics | `src/components/ConsentBanner.astro`, `src/components/Analytics.astro`, `src/scripts/analytics.ts` |
| Navigation/floating CTA | `src/components/Nav.astro`, `src/components/WhatsAppFloat.astro` |
| Motion | `src/scripts/motion-loader.ts`, `src/scripts/motion.ts`, `src/styles/global.css` |
| Regression guards | `scripts/tests/gate1-regression.test.mjs`, `scripts/tests/gate2-regression.test.mjs` |
| Remediation design/plan | `docs/superpowers/specs/2026-07-17-gate2-remediation-design.md`, `docs/superpowers/plans/2026-07-17-gate2-remediation.md` |
| Build/deploy pipeline | `.github/workflows/deploy.yml` |

## 8. Git and user-owned state

- Branch: local `main`. The first (18-finding) remediation is committed as
  `1a434e4`; the Instagram reels box as `c451e70`; the first re-review
  baseline is `7c244df`; the second (13-finding) remediation as `3b3f511`,
  which is also the second re-review baseline. The third (10-finding)
  remediation lands in the commit that contains this updated line.
- No Git remote or upstream is configured in this checkout.
- No push, pull request, or deployment has been performed at any point.
- These pre-existing untracked files are user-owned and must not be deleted,
  overwritten, staged, or committed without explicit instruction:
  - `.claude/settings.local.json`
  - `REVIEW_GATE1.md`
  - `REVIEW_GATE2.md`
  - `REVIEW_GATE2_REREVIEW.md`
  - `REVIEW_GATE2_REREVIEW2.md`
- Every `REVIEW_GATE*` report must remain the independent record of its
  reviewed baseline. A new review creates a new verdict/report;
  implementation docs do not rewrite an old verdict.

## 9. Owner and release boundaries

Still required from the owner:

1. Approved founder photo.
2. Five approved client logos.
3. Exact bilingual office address and Google Maps embed URL.
4. Production n8n webhook URL.
5. GA4 and Meta Pixel IDs.
6. Real repository/FTPS configuration and deployment authorization.

Still required before launch approval:

- fresh formal independent GATE 2 re-review;
- GATE 3 including INP/field evidence and dependency audit;
- iPhone Safari and Android Chrome checks;
- live Apache legacy redirects, HTTPS/non-www canonicalization, headers,
  compression/cache behavior, and bilingual 404;
- real webhook delivery and real GA4/Meta provider verification after the
  owner supplies the destinations.

## 10. Receiving-agent rules

**Do**

- Start with fresh Git status, both regression suites, build, and diff check.
- Keep EN/AR changes paired and treat Arabic as native RTL content.
- Ground claims in SPEC or owner-provided evidence.
- Preserve rich motion while keeping the trusted-intent and reduced-motion
  boundaries.
- State whether evidence is local, CI, staging, or live.

**Do not**

- Do not claim an independent GATE 2 PASS from this implementation handoff.
- Do not edit the independent reports to change a verdict.
- Do not fabricate assets, translations, metrics, testimonials, integrations,
  addresses, or delivery success.
- Do not stage the five user-owned files listed in §8.
- Do not push, deploy, send real leads, or configure external providers without
  explicit authorization and a named destination.

If Muhammad has already supplied a clear authorized task, execute it without
asking him to choose a boundary again. Otherwise, the recommended next boundary
is a fresh independent GATE 2 re-review of the current tree.
