# GATE 2 Remediation Design

- **Date:** 2026-07-17
- **Approved by:** Muhammad
- **Source findings:** `REVIEW_GATE2.md` at commit `58fab48459b1a2405438900d35a8c7220bc36151`
- **Implementation boundary:** local repository only; no push, deploy, analytics destination, webhook destination, or owner secret is authorized.

## Goal

Close every confirmed GATE 2 finding while preserving the site's award-grade motion identity, the locked GATE 1 behavior, the static Astro/Apache architecture, and the zero-fabrication content boundary.

## Chosen approach

Use one cohesive remediation instead of 18 disconnected patches:

1. Remove unapproved operational and commercial promises and replace them with neutral copy that stays inside SPEC §4 and §7.3.
2. Rewrite non-verbatim Arabic as natural MSA with a light Gulf warmth, without changing approved verbatim strings or inventing Arabic client/product names.
3. Move remaining user-facing component strings into the bilingual dictionaries.
4. Preserve rich motion through a two-tier architecture:
   - an immediate, CSS-only hero entrance using transform, opacity, and SVG stroke;
   - the complete GSAP/ScrollTrigger/Lenis layer loaded after real user intent, so it does not contend with LCP.
5. Load Partytown only when at least one analytics provider is configured, and send each event only to configured providers.
6. Add regression coverage before implementation and retain the intent of all seven GATE 1 tests.

## Content and i18n design

### Claims

Response-time phrases such as “quickly,” “shortly,” “fastest,” and absolute response guarantees are replaced with receipt/channel wording. Service FAQs and process steps are rewritten using only the deliverables explicitly listed in SPEC §7.3. `SPEC.md` is not expanded: the remediation removes unsupported commitments rather than silently approving them.

### Arabic

The Arabic pass covers the complete Arabic content tree and UI dictionaries, not only the examples listed in the report. Colloquial forms such as «اللي»، «مو»، «وش»، «وين»، «تبغى»، «عشان»، and «بنرد» are replaced with MSA equivalents. Product names embedded in Arabic prose are written in Arabic; a required English legal value is displayed as a standalone LTR-isolated value sourced from `src/config/site.ts`, never embedded inside an Arabic sentence.

### UI strings

Navigation region labels, mobile menu state labels, consent-region label, legal-page labels, map button/title, and other exposed accessibility strings live under typed `nav`, `a11y`, `legal`, and `map` dictionary keys. Presentation components consume these values and contain no bilingual ternaries for user-facing copy.

## Motion and performance design

### Immediate hero layer

The homepage H1 remains server-rendered and fully visible without JavaScript. CSS applies a small (12% maximum) per-line translate with opacity no lower than 0.6. The authentic pyramid mark receives a CSS SVG-stroke draw using normalized `pathLength="1"`. Reduced motion disables both immediately.

### Deferred creative layer

A small `motion-loader.ts` listens once for genuine intent (`pointermove`, `pointerdown`, `wheel`, `touchstart`, `keydown`). On the first allowed event it dynamically imports the GSAP runtime. The runtime retains the pinned methodology, parallax, card tilt/glow, magnetic buttons, custom cursor, footer motion, ScrollTrigger cleanup, RTL mirroring, and Lenis. It does not own the LCP hero entrance.

The loader does not import the runtime when reduced motion is active. The runtime observes live preference changes and tears down non-essential motion if the user enables reduced motion after load.

### Animation law

All transitions and keyframes animate only transform, opacity, or approved SVG stroke/fill opacity. Color, background, border, and shadow hover states may change instantly; their visual motion comes from existing transform/opacity pseudo-elements and micro-interactions. Scroll reveals combine a clipped section container with translated/faded children and stagger; clip itself is static and therefore does not violate the animation-property law.

### Fonts

Arabic homepage preloads stay locked to Space Grotesk 700 plus Cairo Arabic 400. Interior Arabic pages preload Cairo Arabic 800 plus Cairo Arabic 400. Cairo Latin CSS is removed from Arabic loading; standalone Latin fragments use the existing Latin fallback/isolation treatment. English pages keep Space Grotesk 700 plus Inter 400.

### Analytics

`astro.config.mjs` reads public build variables through `loadEnv`. With neither analytics ID configured, the Partytown integration is omitted entirely. With one or both configured, only the relevant forward targets are installed. `analytics.ts` independently gates GA and Meta dispatch by configured ID and consent.

## Interaction and accessibility design

- The nav becomes genuinely sticky and the compensating main-content top padding is removed.
- Mobile menu `aria-label` changes between Open/Close in EN and AR with `aria-expanded`.
- The consent banner publishes its measured height through a root CSS variable. The WhatsApp float uses logical positioning and a transform-based offset, remaining fully visible and clickable above the sheet at narrow widths and returning to its normal corner after a decision.
- The phone placeholder uses the full muted token, meeting WCAG AA.
- Reduced motion turns the marquee into a real wrapping row: the surviving list shrinks, wraps, and is not clipped.

## Testing and verification

### Automated regression

Create `scripts/tests/gate2-regression.test.mjs` and `npm run test:gate2`. Tests guard:

- unsupported promise/ownership/training phrases and representative colloquialisms;
- paired EN/AR execution-stage sentence count;
- typed i18n consumption and absence of hardcoded bilingual UI ternaries;
- transform/opacity/SVG-only transitions;
- small hero entrance and deferred dynamic motion import;
- reduced-motion wrapping marquee;
- AA placeholder token;
- route-aware font preloads and removal of Cairo Latin imports;
- consent/float offset contract;
- conditional Partytown/provider dispatch;
- stateful mobile-menu label and sticky nav;
- removal of the unused orange-clear token.

Update the two affected GATE 1 assertions so they preserve, rather than weaken, their locked intent: the Arabic homepage still preloads its exact brand/body fonts, and component alpha colors remain centralized without requiring a dead token.

### Completion checks

Run both Node suites, a production build, mandatory content scans, route/language/H1/switch matrix, gzip measurement, contrast calculation, reduced-motion/mobile interaction checks, console checks, and fresh Lighthouse mobile runs for `/` and `/ar/`. Update `BUILD_NOTES.md` with measured results only. Do not edit `REVIEW_GATE2.md`; a later independent re-review owns the gate verdict.

## Error and fallback behavior

- Missing webhook behavior remains unchanged and WhatsApp-first.
- Missing analytics IDs produce no analytics worker, vendor injection, event dispatch, or console error.
- Reduced-motion and no-JavaScript users retain visible content and naturally scrollable methodology.
- If fresh Lighthouse still misses the provisional budget, report the measured miss and continue root-cause profiling; never attribute it to machine load without comparative evidence.

## Out of scope

Owner-supplied founder/client assets, exact address/map URL, webhook, analytics IDs, FTP credentials, live Apache behavior, deployment, and real-device production verification remain external inputs/boundaries. The missing `AGENT-ONBOARDING.md` is not recreated in this remediation because `CLAUDE.md` and `docs/CLAUDE_CODE_HANDOFF.md` are the repository's actual entry/handoff contract; changing that documentation architecture is a separate owner decision.
