# GATE 2 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all confirmed `REVIEW_GATE2.md` findings while preserving rich motion, locked GATE 1 behavior, bilingual quality, and the Astro static deployment contract.

**Architecture:** Split startup motion into a CSS-only hero layer and a dynamically imported GSAP runtime activated by genuine user intent. Keep claims/content in collections, UI labels in typed dictionaries, contact/company facts in `site.ts`, and analytics provider-aware at build and dispatch time. Every production change is preceded by a focused failing Node regression test and followed by source, build, browser, and Lighthouse verification.

**Tech Stack:** Astro 5 static output, TypeScript, Tailwind CSS v4, GSAP/ScrollTrigger, Lenis, Partytown, Node 22 built-in test runner.

## Global Constraints

- `SPEC.md` is the source of truth; only §4 facts and §7.3 service scopes may be published.
- Preserve canonical `/ar/`, static file output, Apache behavior, all seven GATE 1 contracts, and the exact banned-number clean scan.
- Arabic is native MSA with a light Gulf tone; the approved English tagline remains English.
- Animate transform, opacity, and SVG stroke/fill opacity only; keep one pinned section maximum.
- Hero H1 is SSR-visible, starts at opacity at least 0.4 with only a small translate, and never waits for JavaScript.
- Reduced motion disables non-essential motion and exposes a complete static client row.
- Total built JavaScript stays at or below 180 KiB gzip.
- Do not edit `REVIEW_GATE2.md`, push, deploy, contact external destinations, or insert owner secrets.
- Preserve user-owned `.claude/settings.local.json`, `REVIEW_GATE1.md`, and `REVIEW_GATE2.md` as untracked files.
- Git metadata is read-only in this environment; implementation remains unstaged unless Muhammad later requests Git operations.

---

### Task 1: Truth-safe bilingual content and Arabic quality

**Files:**
- Create: `scripts/tests/gate2-regression.test.mjs`
- Modify: `package.json`
- Modify: `src/content/pages/en/contact.json`
- Modify: `src/content/pages/ar/contact.json`
- Modify: `src/content/pages/{en,ar}/about.json`
- Modify: `src/content/pages/{en,ar}/privacy.mdx`
- Modify: `src/content/pages/{en,ar}/terms.mdx`
- Modify: affected `src/content/pages/ar/*.json`
- Modify: affected `src/content/services/{en,ar}/*.mdx`

**Interfaces:**
- Consumes: SPEC §2.1, §2.4, §4, §7.2, §7.3 and content-collection schemas.
- Produces: claim-safe paired content plus `npm run test:gate2`.

- [ ] **Step 1: Write failing truth/copy tests**

Create a Node test file with a `source(path)` helper and tests that:

```js
const unsupported = [
  /get back to you quickly/i,
  /get back to you shortly/i,
  /reply fast/i,
  /fastest way/i,
  /respond to every request/i,
  /full access.+at all times/i,
  /everything we produce.+remain yours/i,
  /team is trained.+refine/i,
  /CRM.+standard scope/i,
];

const colloquialArabic = /(?:^|[\s،؛؟])(?:اللي|مو|وش|وين|تبغى|تبغاه|عشان|بنرد|بنرجع|خلنا)(?=$|[\s،؛؟.])/u;
```

Read the relevant EN/AR content trees, assert every unsupported pattern is absent, assert the representative Arabic colloquialisms are absent, assert Arabic privacy/terms no longer contain `Google Analytics`, `Meta Pixel`, or the full English legal name inside prose, and parse both About JSON files to require 2–3 sentences in every expanded methodology body.

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test scripts/tests/gate2-regression.test.mjs
```

Expected: failures naming the current response promises, service commitments, colloquial Arabic, embedded English values, and one-sentence Execution bodies.

- [ ] **Step 3: Replace unsupported claims with approved scope**

Use neutral contact wording: invite the visitor to choose WhatsApp/form without promising speed or a response. Change the privacy request ending to an instruction to email the address, not a response guarantee.

Use only these approved-scope FAQ/process meanings:

```text
AI & Automation: the selected automation connects the approved workflow, lead routing, internal process, and selected channels; no training or ongoing-refinement promise.
Performance Ads: replace ownership/access guarantees with an FAQ about Google Ads and Meta Ads channel selection.
Social Media: replace asset-ownership guarantees with an FAQ about monthly performance reporting, which is explicitly in scope.
Web Development: state only that analytics and lead-capture wiring are included; do not promise connection to the client's CRM as standard scope.
```

- [ ] **Step 4: Complete the Arabic MSA pass**

Rewrite all matched colloquial forms across `src/content/pages/ar`, `src/content/services/ar`, and the content portions of legal pages. Preserve the exact tagline, approved names, official client names, and factual scope. Translate analytics product references as Arabic prose. In Arabic Terms, refer to the centrally displayed legal operator as «الشركة الموضحة أعلاه» rather than embedding the English name in an Arabic sentence.

Add a second factual sentence to Execution in both About files. It may state that the coordinated plan keeps creative, media, and technical work aligned with the agreed priorities; it must not add a delivery or result guarantee.

- [ ] **Step 5: Verify GREEN for Task 1**

Run:

```powershell
npm.cmd run test:gate2
npm.cmd run test:gate1
```

Expected: the Task 1 tests pass; all seven GATE 1 tests still pass.

### Task 2: Typed UI copy, consent geometry, provider-aware analytics, and nav state

**Files:**
- Modify: `scripts/tests/gate2-regression.test.mjs`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ar.ts`
- Modify: `src/components/Nav.astro`
- Modify: `src/components/ConsentBanner.astro`
- Modify: `src/components/WhatsAppFloat.astro`
- Modify: `src/components/pages/LegalPage.astro`
- Modify: `src/components/pages/ContactPage.astro`
- Modify: `src/components/Analytics.astro`
- Modify: `src/scripts/analytics.ts`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: the `Dictionary` shape exported by `src/i18n/en.ts`, `SITE` environment values, and consent event `pyx:consent`.
- Produces: typed labels, dynamic consent offset `--consent-banner-offset`, and independent GA/Meta provider gates.

- [ ] **Step 1: Append failing UI/integration tests**

Add tests that require:

```js
assert.match(nav, /data-label-open=\{t\.nav\.menuOpen\}/);
assert.match(nav, /data-label-close=\{t\.nav\.menuClose\}/);
assert.match(nav, /setAttribute\('aria-label',\s*open/);
assert.match(nav, /class="sticky\s+inset-inline-0\s+top-0/);
assert.doesNotMatch(nav, /aria-label=\{lang === 'ar'/);
assert.match(consent, /--consent-banner-offset/);
assert.match(float, /var\(--consent-banner-offset/);
assert.match(config, /loadEnv/);
assert.match(config, /analyticsEnabled/);
assert.match(analytics, /SITE\.ga4Id/);
assert.match(analytics, /SITE\.metaPixelId/);
```

Also require that Legal, Contact, Consent, and Nav use dictionary keys instead of visible `lang === 'ar' ? ... : ...` strings, and that the contact placeholder class is not `placeholder:text-muted/50`.

- [ ] **Step 2: Verify RED**

Run only the new test names with Node's `--test-name-pattern`; require failures caused by missing labels, consent geometry, provider gates, and sticky nav.

- [ ] **Step 3: Extend the dictionaries and remove component copy**

Add exact paired keys:

```ts
nav.primaryLabel
nav.mobileLabel
a11y.privacyChoices
legal.updated
legal.contactRequests
legal.operator
map.load
map.frameTitle
```

Use neutral MSA in Arabic. Emit `data-label-open` and `data-label-close` on the mobile toggle; update `aria-label` inside `setOpen(open)` together with `aria-expanded`.

Render the legal operator label and `SITE.legalName` as a standalone `dir="ltr"` isolated row on Terms. Move all listed legal/map/consent/nav labels to dictionaries. Pass the localized map frame title through a data attribute to the client script.

- [ ] **Step 4: Keep WhatsApp above the measured consent sheet**

In consent initialization, maintain one `ResizeObserver` per current banner, write its measured block size plus spacing to `--consent-banner-offset`, and set a root pending attribute while the banner is visible. Clear the attribute and variable only after the close transition completes. Add safe-area bottom padding to the sheet.

In the float component, keep logical inline-end positioning and express the pending lift with `transform: translateY(calc(-1 * var(--consent-banner-offset, 0px)))`. Compose hover scale through CSS individual `scale` or a pseudo-element so the offset is never overwritten.

- [ ] **Step 5: Make analytics provider-aware**

Convert `astro.config.mjs` to `defineConfig(({ mode }) => { ... })`, call `loadEnv(mode, process.cwd(), 'PUBLIC_')`, build `forward` from configured IDs, and include Partytown only when at least one ID is present.

In `analytics.ts`, derive `hasGa4` and `hasPixel` from `SITE`; push to `dataLayer` only for GA and call `fbq` only for Meta. Consent remains a separate mandatory gate. Keep `Analytics.astro` responsible for post-consent vendor injection.

- [ ] **Step 6: Make the nav sticky and preserve layout**

Replace fixed header positioning with sticky positioning. Remove the compensating top padding from `main#main`; preserve its `tabindex="-1"`, mobile overlay top inset, responsive CTA wrapper, canonical switcher, and Escape behavior.

- [ ] **Step 7: Verify GREEN for Task 2**

Run:

```powershell
npm.cmd run test:gate2
npm.cmd run test:gate1
```

Expected: all Task 1–2 tests and all seven GATE 1 tests pass.

### Task 3: LCP-safe creative motion, reveal clipping, reduced motion, and fonts

**Files:**
- Create: `src/scripts/motion-loader.ts`
- Modify: `scripts/tests/gate2-regression.test.mjs`
- Modify: `src/scripts/motion.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/pages/HomePage.astro`
- Modify: `src/components/PyramidMark.astro`
- Modify: `src/styles/global.css`
- Modify: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: browser intent events and the existing `astro:page-load`/`astro:before-swap` lifecycle.
- Produces: `armMotionLoader()`, dynamically imported motion runtime, CSS hero entrance, route-aware font preloads, static reveal clips, and compliant transitions.

- [ ] **Step 1: Append failing motion/performance tests**

Require all of the following:

```js
assert.match(layout, /import '@\/scripts\/motion-loader'/);
assert.doesNotMatch(layout, /import '@\/scripts\/motion';/);
assert.match(loader, /import\(['"]\.\/motion['"]\)/);
assert.match(loader, /prefers-reduced-motion/);
assert.doesNotMatch(motion, /yPercent:\s*55/);
assert.match(css, /\.reveal-clip\s*\{[^}]*overflow:\s*clip/s);
assert.match(css, /\.hero-line-inner[^}]*animation/s);
assert.match(home, /class="marquee-list/);
assert.match(css, /prefers-reduced-motion[\s\S]*\.marquee-list[\s\S]*flex-wrap:\s*wrap/);
assert.doesNotMatch(layout, /@fontsource\/cairo\/latin-/);
assert.match(layout, /cairo800Url/);
assert.doesNotMatch(css, /--color-orange-clear/);
```

Parse CSS `transition` declarations and fail if a transitioned property is not `transform` or `opacity`. Scan Astro classes and fail on `transition-colors`, `transition-shadow`, or `transition-all`.

- [ ] **Step 2: Verify RED**

Run the targeted motion test names and require failures caused by static heavy imports, paint-property transitions, absent reveal clip, reduced marquee layout, old font imports/preloads, and the dead token.

- [ ] **Step 3: Implement the lightweight loader and CSS hero**

Export/execute an idempotent loader that dynamically imports `./motion` on the first allowed `pointermove`, `pointerdown`, `wheel`, `touchstart`, or `keydown`. Do not import while reduced motion is active. Re-arm after View Transition page loads until the runtime has loaded.

Remove `heroIntro()` and direct initial `boot()` work that owns the hero from `motion.ts`. Add CSS hero-line/CTA entrances starting at opacity 0.6 and translate no greater than 12%. Add `pathLength="1"` to hero line paths and animate normalized SVG stroke/fill opacity in CSS. Disable these animations under reduced motion.

- [ ] **Step 4: Preserve the rich runtime and live reduced-motion cleanup**

Retain methodology pin/progress, Lenis, parallax, card tilt/glow, magnetic buttons, custom cursor/ring, hero ambient shimmer/breathe, footer skew, RTL transforms, and View Transition cleanup. Store ticker callbacks so teardown can remove them. On reduced-motion preference change, cancel deferred boot, revert contexts, stop/destroy Lenis, remove cursor nodes, and leave all content visible/naturally scrollable.

- [ ] **Step 5: Add compliant reveal clipping and transitions**

Mark each reveal section/container with `.reveal-clip { overflow: clip; }`; keep actual reveal animation on translated/faded children with stagger and card scale-settle. Remove color/background/border/shadow transition properties and every `transition-colors` class. Leave hover paint changes instantaneous and preserve transform/opacity micro-interactions.

- [ ] **Step 6: Fix reduced marquee and route-aware fonts**

Give the real/duplicate lists explicit `.marquee-list` classes. Under reduced motion, hide the duplicate, remove outer clipping, set the track/list to available width, wrap the real list, allow item wrapping, and center all five names.

Import Cairo Arabic 800 URL. Add a boolean BaseLayout prop identifying the brand-display homepage. Arabic home preloads Space Grotesk 700 + Cairo 400; other Arabic pages preload Cairo 800 + Cairo 400. Remove Cairo Latin imports. Update the GATE 1 preload test to assert the exact homepage contract plus the new interior contract.

Remove `--color-orange-clear` and update the GATE 1 token test so it still requires every consumed alpha token but no longer requires a dead value.

- [ ] **Step 7: Verify GREEN for Task 3**

Run:

```powershell
npm.cmd run test:gate2
npm.cmd run test:gate1
npm.cmd run build
```

Expected: all tests pass; 25 pages build with no Astro/Vite error or warning.

### Task 4: QA record and full local verification

**Files:**
- Modify: `BUILD_NOTES.md`
- Modify: `docs/CLAUDE_CODE_HANDOFF.md`
- Verify: all changed source/content/test files

**Interfaces:**
- Consumes: fresh test, build, scan, route, browser, gzip, contrast, and Lighthouse outputs.
- Produces: an accurate local remediation record that explicitly remains pending independent GATE 2 re-review.

- [ ] **Step 1: Run automated and source gates**

Run both test suites, production build, `git diff --check`, mandatory banned-content/contact/physical-direction/counter/positioning scans, unsupported-claim and colloquial scans, transition-property scan, and built JavaScript gzip measurement. Every scan must be clean and JS must be at most 184,320 bytes.

- [ ] **Step 2: Run production-preview behavior checks**

Verify all 24 content routes return 200, correct `lang/dir`, one H1, and equivalent switch targets. At 320/390 desktop-mobile EN/AR, verify sticky nav, menu accessible name/state, consent/float non-overlap and hit target, reduced-motion complete marquee, visible focus, no horizontal overflow, and no console errors with empty analytics IDs.

- [ ] **Step 3: Run fresh Lighthouse**

Run mobile Lighthouse on `/` and `/ar/` from the fresh production build. Record category scores, FCP, LCP, CLS, TBT, and INP availability exactly. Required target: category scores at least 95, LCP below 2,000 ms, CLS below 0.05, INP below 200 ms when available.

- [ ] **Step 4: Update documentation with measured evidence**

Correct the prior GATE 2 self-verification claims in `BUILD_NOTES.md`, add the final remediation ledger for G2-001 through G2-018, and include only freshly measured outputs. Update the handoff baseline/status to say implementation is locally remediated but GATE 2 remains pending independent re-review; preserve all owner/deployment boundaries.

- [ ] **Step 5: Final independent-quality review**

Review the complete diff against `SPEC.md` and `REVIEW_GATE2.md`; fix any Critical/Important issue, rerun its covering tests, then rerun both full suites and build. Confirm Git status contains only the intended modified/new files plus the three preserved user-owned untracked files.
