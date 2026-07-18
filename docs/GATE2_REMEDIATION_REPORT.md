# GATE 2 remediation report

**Date:** 2026-07-18  
**Repository:** `C:\xampp\htdocs\pyramedia2026`  
**Base:** local `main` at `58fab48459b1a2405438900d35a8c7220bc36151`  
**Scope:** implementation response to all findings in `REVIEW_GATE2.md`

## Verdict boundary

All 18 GATE 2 findings have been remediated locally and protected by regression
tests.

This is an implementation report, not an independent re-review. The original
`REVIEW_GATE2.md` remains unchanged and keeps its FAIL verdict for the baseline
it reviewed. A fresh formal independent GATE 2 re-review is pending and is the
only step that can issue a new gate verdict.

No commit, remote, push, deployment, real lead delivery, map configuration, or
real GA4/Meta provider verification was performed.

## Verification evidence

| Check | Result |
|---|---|
| `npm.cmd run test:gate1` | 7/7 passed |
| `npm.cmd run test:gate2` | 34/34 passed |
| `npm.cmd run build` | 25 static pages; no Astro/Vite warnings or errors |
| `git diff --check` | Clean; Windows LF/CRLF advisories only |
| Local preview `/` and `/ar/` | HTTP 200 |
| Generated JavaScript | 59,363 gzip bytes without analytics IDs |

The JavaScript total comprises 6,413 bytes of initial layout/router code and a
52,950-byte GSAP/Lenis chunk deferred until trusted visitor intent. Partytown is
not present in the missing-ID build and must be remeasured with production IDs.

### Lighthouse 13.4.0 — mobile local production preview

| Route | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 1.063 s | 1.363 s | 0.00024 | 0 ms |
| `/ar/` | 96 | 100 | 100 | 100 | 1.311 s | 1.594 s | 0.00029 | 219 ms |

Both runs returned HTTP 200 and had no run warnings. INP was unavailable from
the lab runs, so it remains a GATE 3 / field measurement.

### Real Chrome 150/CDP runtime matrix

- On normal motion, the initial network contained ClientRouter and BaseLayout
  only. A real trusted mouse move then requested the deferred motion chunk.
- The settled homepage contained exactly one cursor dot, one cursor ring, two
  pyramid shimmers, one pin spacer, and 16 tilt-enabled cards. Repeated input,
  Astro `/` → `/about` → `/` navigation, reload, and retrigger did not duplicate
  any owned runtime node. Console/runtime errors were zero.
- With `prefers-reduced-motion: reduce` forced before navigation, all four
  combinations of EN/AR × 320/390 px had zero horizontal overflow, zero active
  Web Animations, no requested motion chunk, and zero cursor/ring/shimmer/tilt/
  pin/glow nodes.
- Every reduced-motion case displayed exactly five unique client names, hid the
  duplicate marquee list, and left the 1,964 px methodology track naturally
  scrollable inside the 305 px or 375 px viewport.
- Arabic 320 px consent geometry: 155 px banner, 171 px reserved offset,
  WhatsApp rect y=653–709 versus banner y=745–900, no overlap, and the button
  center hit-tested to the WhatsApp link. Arabic 390 px and mirrored English
  placement also passed.

## Finding ledger

| Finding | Result and guard |
|---|---|
| G2-001 | Removed response-speed/SLA and absolute-response promises from contact, privacy, and UI copy. Content scanner rejects the reported patterns. |
| G2-002 | Removed unsupported training, permanent access/ownership, ongoing-refinement, and standard CRM-integration commitments. Service-scope regression checks cover EN/AR. |
| G2-003 | Removed paint/layout transitions. The scanner parses CSS lists, arbitrary Tailwind transitions, multiline static classes, and bare `transition` utilities; only transform/opacity/SVG stroke are permitted. |
| G2-004 | Kept LCP content CSS-first and moved GSAP/Lenis behind trusted input. Initial JS is 6,413 gzip bytes; fresh Lighthouse now passes the GATE 2 lab score/LCP/CLS budgets. INP remains unverified. |
| G2-005 | Rewrote reported Gulf/Saudi colloquialisms into warm native MSA while keeping owner/SPEC-supplied verbatim content intact. |
| G2-006 | Localized Google Analytics/Meta wording and isolated the official English legal name as one standalone LTR value. |
| G2-007 | Expanded Execution/التنفيذ to two paired, factual sentences. |
| G2-008 | Moved UI/accessibility labels into typed EN/AR dictionaries, kept company/contact values in `site.ts`, and corrected README's content map. |
| G2-009 | Replaced the H1 takeover with a CSS-first 0.72-opacity, 10%-translate entrance; normalized SVG draw paths; removed the GSAP H1 tween. |
| G2-010 | Reduced motion exposes a wrapping, unclipped primary client list and hides the duplicate list at 320px. |
| G2-011 | Reveal groups use static clipping plus transform/opacity-only stagger without hiding the server-rendered LCP content. |
| G2-012 | Form placeholders now use the full compliant muted token. |
| G2-013 | Arabic home preloads Space Grotesk 700 + Cairo 400; Arabic interiors preload Cairo 800 + Cairo 400; Cairo Latin subsets were removed. |
| G2-014 | Consent uses one ResizeObserver to publish its live height; the WhatsApp float composes the offset with hover scale and safe-area/logical positioning. |
| G2-015 | Astro enables Partytown only for configured providers and event dispatch is provider-aware for GA-only, Meta-only, both, or neither. |
| G2-016 | The mobile-menu accessible name changes between open/close state in EN/AR; Escape restores the closed label and focus. |
| G2-017 | Navigation is sticky and the obsolete fixed-header content compensation is gone. |
| G2-018 | Removed the unused orange-clear design token. |

## Motion and reduced-motion contract

- `src/scripts/motion-loader.ts` waits for trusted pointer, wheel, touch, or
  keyboard intent before dynamically importing the heavy runtime.
- Import success is memoized; import failure silently rearms the intent
  listeners.
- `src/scripts/motion.ts` retains the requested rich creative system: authentic
  pyramid shimmer/breathe, ScrollTrigger reveals, parallax, one methodology
  pin, card tilt/glow, magnetic buttons, cursor, Lenis, and footer motion.
- Astro swaps and live reduced-motion changes tear down listeners, tickers,
  contexts, cursor/shimmer/glow nodes, inline card transforms, methodology
  overflow, and active-stage state.
- Reduced motion disables decorative animation, finishes the SVG mark, exposes
  reveal content immediately, wraps the client list, and leaves methodology
  naturally scrollable.

## Review trail

- Content/scope, UI/consent/analytics, and motion/performance work each received
  separate adversarial code review rounds.
- Follow-up fixes covered two residual unsupported phrases, stale structured
  data naming, supported Astro configuration, transition-scanner false passes,
  live reduced-motion cleanup, card-tilt ownership, loader retry behavior, and
  stale handoff documentation.
- The final focused reviewers reported no remaining Critical, Important, or
  Minor code issue. This review trail still does not replace the formal gate
  procedure in `REVIEWER.md`.

## Remaining boundaries

1. Fresh independent GATE 2 re-review of the current working tree.
2. GATE 3 INP/field evidence and production-host Lighthouse.
3. iPhone Safari and Android Chrome checks, including live preference changes.
4. Live Apache redirects, HTTPS/non-www canonicalization, headers,
   cache/compression behavior, and bilingual 404.
5. Real n8n, Maps, GA4, and Meta validation after owner destinations are
   supplied.
6. Explicitly authorized Git/remote/deployment handling.

---

## Postscript — after the independent re-review (2026-07-18, second pass)

The independent re-review `REVIEW_GATE2_REREVIEW.md` (commit `7c244df`)
tested this report's claims and returned **FAIL**: 15 of the 18 original
findings were confirmed FIXED; G2-001, G2-005, and G2-008 were STILL OPEN;
and ten new findings (G2-RR-001..G2-RR-010) were recorded. The claims in
this report that all 18 findings were fully fixed, that founder-verbatim
Arabic was preserved, that all copy was centralized, and that Escape
restored mobile-menu focus were contradicted by that fresh evidence.

A second remediation pass in the follow-up commit addressed all 13
re-review findings and adjusted the regression suite so it protects the
SPEC §7.1 founder-verbatim Arabic strings instead of rewriting them. That
second pass is itself an implementation claim until the next independent
review.

## Postscript 2 — response to REVIEW_GATE2_REREVIEW2.md (2026-07-18)

The second independent re-review (FAIL, commit `3b3f511`, 3 BLOCKER /
4 MAJOR / 3 MINOR) confirmed 16/18 original and 8/10 first-re-review findings
FIXED. All ten of its findings were remediated in the commit that follows
`3b3f511`:

- **G2-RR2-001** — removed "on schedule", "compounds month over month",
  "measured in months, not days" and the universal "every client" wording
  from home/About/SEO copy in both languages; replacements stay inside the
  approved qualitative scope.
- **G2-002** — branding rollout ends at social and print; the rebrand FAQ was
  replaced with a strategy-phase FAQ inside the §7.3 deliverables.
- **G2-RR2-002** — the consent banner renders only when an analytics provider
  is configured, and both privacy policies now generate provider-aware
  analytics disclosures from the same build state.
- **G2-005** — remaining colloquial/calqued Arabic rewritten; Instagram
  standardized to «إنستجرام».
- **G2-008** — social platform labels moved to `SOCIAL_LINKS` in `site.ts`.
- **G2-RR-005** — interior heroes and the legal page now use grouped,
  staggered reveals.
- **G2-RR2-003** — the md-breakpoint overlay close hands focus to a visible
  desktop nav target when the keyboard user was inside the overlay.
- **G2-RR2-004** — regression-test fixtures are excluded from Tailwind source
  scanning (no dead transition CSS in the build) and the placeholder GSAP
  context was removed.
- **G2-RR2-005** — the source tree is `tsc --noEmit`-clean and `npm run
  typecheck` joined the verification commands.
- Gate-3-forward `.htaccess` notes applied early: hardcoded canonical host in
  the HTTPS/non-www redirect and year-long immutable caching for hashed
  AVIF/WebP.

Guarded by five new gate2 regression tests (51 total). This postscript is an
implementation claim; only a fresh independent review can issue a verdict.
