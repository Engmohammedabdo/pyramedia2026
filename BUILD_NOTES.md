# BUILD_NOTES.md — PyramediaX website build log

Pairs with `SPEC.md` v1.1. This file records placeholders, owner-dependent
inputs, implementation decisions, and the exact boundary of local QA evidence.
It does not replace the independent review reports.

## Placeholder registry (grep `TODO_` to locate all of them)

| Key | Where it lives | Current placeholder behavior | Swap procedure |
|---|---|---|---|
| `TODO_OFFICE_ADDRESS_EN` | `src/config/site.ts` → `addressEn` | Shows "Deira, Port Saeed — Dubai, UAE" | Replace the `addressEn` string |
| `TODO_OFFICE_ADDRESS_AR` | `src/config/site.ts` → `addressAr` | Shows «ديرة، بور سعيد — دبي، الإمارات» | Replace the `addressAr` string |
| `TODO_MAPS_EMBED_URL` | `src/config/site.ts` → `mapsEmbedUrl` | Empty → contact address card renders without the map block | Paste the approved Google Maps embed URL |
| `TODO_N8N_WEBHOOK` | `.env` → `PUBLIC_N8N_WEBHOOK_URL` | Form renders a disabled state plus WhatsApp fallback | Set the production URL and rebuild |
| `TODO_GA4_ID` | `.env` → `PUBLIC_GA4_ID` | GA4 is not injected | Set the production ID and rebuild |
| `TODO_META_PIXEL_ID` | `.env` → `PUBLIC_META_PIXEL_ID` | Meta Pixel is not injected | Set the production ID and rebuild |
| `TODO_FOUNDER_PHOTO` | `src/components/FounderPanel.astro` | On-brand placeholder panel; never a stock or generated face | Add the approved photo under `src/assets/founder/` and use `astro:assets` |
| `TODO_CLIENT_LOGO_1..5` | `src/components/pages/HomePage.astro` | Styled client names; never fabricated logos | Add approved files under `src/assets/clients/` and replace text with `<Image>` |
| FTP secrets | GitHub secrets `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` and optional `BLUEHOST_SITE_ROOT` | CI keeps the build artifact and skips FTPS when secrets are absent | Configure the real repository only after authorization |

## Decisions log

- **2026-07-17 — Arabic legal name; superseded 2026-07-18 (G2-RR-002).** The
  provisional Arabic transliteration was REMOVED entirely: `legalNameAr` no
  longer exists in `src/config/site.ts`, and Arabic pages render the approved
  English legal name inside LRI…PDI isolates via `licenseLine()`. If the
  owner supplies the registered Arabic name from the trade license, add it to
  `site.ts` and update `licenseLine()`.
- **2026-07-17 — URL format.** Astro uses `build.format: 'file'` with Apache
  extensionless rewrites so the live URLs can match SPEC §5.
- **2026-07-17 — Client names without approved Arabic renderings.** Only the
  two Arabic names supplied by SPEC are translated. The other three stay in
  their official Latin form until approved Arabic brand renderings arrive.
- **2026-07-17 — Legal-page date; updated 2026-07-18 (G2-RR-001).**
  `lastUpdated` must always equal the date of the last substantive change to
  that document. All four legal documents currently carry 2026-07-18 (the
  Instagram privacy disclosure and terms operator-wording changes). Any future
  substantive legal edit must bump the date in the same change.
- **2026-07-17 — Spam traps.** The form uses the `website` honeypot and a
  four-second minimum-time-on-page check. Bot-like submissions receive a silent
  local success state and are not forwarded.
- **2026-07-18 — Instagram reels box (SPEC Addendum A.1; founder decision:
  launch scope).** Muhammad approved a homepage section with three
  owner-curated Instagram reels using the hybrid model: curated links +
  official Instagram embeds. Links live in `src/content/instagram.json`
  (owner sends new links → swap → rebuild). Cover images are fetched at
  build time via Instagram's public media redirect and optimized into local
  assets — zero Instagram requests at page load; clicking a card loads the
  official embed (map-facade click-to-load pattern). CSP gained
  `www.instagram.com` in script-src + frame-src; privacy pages updated in
  both languages. A failed thumbnail fetch at build degrades to a branded
  panel and never breaks the build. Meta's June-2026 tokenless oEmbed change
  means no access token is needed for this feature.
- **2026-07-18 — No like/view counters on the reels cards (owner decision).**
  Muhammad asked about showing like/view counts on the facade cards and,
  after review, accepted the recommendation to keep them off: SPEC §2.1 bans
  counter components outright and Addendum A.1 explicitly commits to "no
  counters", and small live numbers on the agency's own homepage would
  undercut the "Honesty over hype" positioning. Live like/comment numbers
  remain visible inside the official Instagram player after a card is
  clicked — Instagram's UI, not site copy. §2.1 stays fully intact.

- **2026-07-18 — Careers link (SPEC Addendum A.2; founder decision).**
  Muhammad asked for an "Apply to Jobs/Internships" button and chose both
  placements: the homepage hero and the footer. Implemented as a **tertiary**
  action in the hero (borderless text + external-link icon) so the WhatsApp
  and services CTAs keep their weight — the homepage's §1 job is closing a
  B2B credibility gap for prospects, and a recruiting CTA must not compete
  with that — plus a footer navigation entry that appears on all 24 pages.
  The Airtable form URL lives only in `site.ts` (`careersUrl`): one edit
  moves every link. The label states no hiring volume, team size, or growth
  claim, so §2.1 is unaffected, and no careers page is added (§5 intact).
  No analytics event was attached: SPEC §10 names the five conversion events
  exactly, and Airtable already records submissions — say the word if a
  `careers_click` event is wanted and it will be added to §10 first.

- **2026-07-29 — Hero gateways + two engagement events (SPEC Addendum A.3;
  founder decision).** Muhammad asked for a "Become Our Client" button
  alongside the careers one, both with a distinctive look and animation in
  the hero, and approved removing the `Explore services` secondary CTA.
  Implemented as a pair of **gateway pills** under the WhatsApp primary:
  icon badge that breathes, a slow sheen that travels across the pill
  (staggered 2.4 s apart so they never fire together), hover lift and a
  direction-aware arrow. All of it is `transform`/`opacity` only and the
  whole treatment is switched off under `prefers-reduced-motion`, so §8 is
  unchanged; measured mobile Lighthouse after the change is 99 EN / 97 AR
  with CLS 0.0002–0.0003.
  - `Explore services` removal is a real §7.1 amendment, recorded in
    Addendum A.3 — the services grid is the very next section and Services
    stays in the nav, so nothing became unreachable.
  - Tracking: `client_apply_click` and `careers_click`, both `{placement}`,
    added as **engagement** events in Addendum A.3. The five §10 conversion
    events keep their exact names and remain the only ones Meta optimises
    on. The analytics module needed no change — it already dispatches any
    `[data-event]` element — only its doc comment was updated.
  - **`TODO_CLIENT_FORM_URL` is CLOSED (2026-07-29).** The owner created the
    form and supplied its URL; `clientFormUrl` now points at
    `appVJGpxA8KzwVjPY/paghHJDi2GVpoTZB0`. The `/contact` fallback remains in
    the code for the case where the value is ever emptied. Verified against
    the live form schema: **no Country field**; Business Name, Your Name and
    Phone Number required; Instagram required; TikTok/Facebook and "Where
    Did You Hear About Us" optional.
    - **Open item for the owner:** on that form `Submission Date` is
      currently `isRequired: true, isReadOnly: false`, so every applicant is
      asked to type a date. The reference form had it read-only with a
      current-date prefill. Either mirror that, or remove the field from the
      form — Airtable stores a created time regardless.
    - `About The Business` is optional on this form where the reference had
      it required. Recorded as an owner choice, not a defect.
  - **Privacy pages updated (both languages, `lastUpdated` → 2026-07-29).**
    A new "Application forms" disclosure states that the two gateway buttons
    open Airtable-hosted forms, that nothing reaches Airtable unless the
    visitor opens and submits one, and that Airtable processes what they
    enter as the forms provider. Routing personal data to a third party has
    to be disclosed for §7.5 to stay accurate.
  - **Base prepared for the owner (2026-07-29, with his approval):**
    `PyramediaX Clients` — base `appVJGpxA8KzwVjPY`, table
    `Client Applications` (`tbldrlSDimBrgtEzE`) in workspace
    `wspmJLu81QsjBJ5tl`. Fields mirror the owner's reference form
    (`app9vu99FNclhXxIV/pagEYrGXpEo0ZyMzz`, "Experience The Reel Recipe")
    **without Country**: Business Name (primary), Your Name, Phone Number,
    About The Business (rich text), Business Instagram / TikTok / Facebook
    Link, Where Did You Hear About Us, Submission Date (dateTime,
    Asia/Dubai). Each field carries a description noting whether the
    reference form marked it required. Remaining owner steps: open the
    table → Create form → mark the required fields → set Submission Date to
    prefill the current date and read-only → share the form → send the URL
    for `clientFormUrl`.
  - Field names were kept plain (no emoji) so they read as database columns;
    the reference form's emoji live in form labels/helper text, which the
    owner can set in the form builder. No pipeline/status field was added —
    say the word if a `Status` single-select is wanted.

## AI-search / answer-engine readiness (2026-07-18)

Owner question: will the site be found by AI search (ChatGPT, Perplexity,
Google AI Overviews / AI Mode, Copilot) as well as classic Google?

Added in the commit containing this entry — all inside SPEC §2.1 (no new
factual claims; every value traces to §4 or the §7.3 service scopes):

- **Entity graph completed.** `Organization`/`LocalBusiness` now carries
  `founder` (linked `Person` node for Mohamed Abdou — §4 role only),
  `contactPoint` (phone/email, `availableLanguage` en+ar), `knowsAbout`
  (the six approved service names, per language), and `hasOfferCatalog`
  (the six services with their one-liners and URLs). This is what answer
  engines read to state *what the agency does* and *who runs it*.
- **`WebPage` node per route**, binding each canonical URL to the site and
  organization entities with `inLanguage`. No `dateModified` is emitted:
  a build timestamp is not an editorial revision date, and asserting one
  would be exactly the kind of unverifiable claim §2.1 bans. Real dates
  remain on the legal pages, which have genuine `lastUpdated` values.
- **`robots.txt` names the AI crawlers explicitly** — OAI-SearchBot,
  ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot,
  Claude-User, Google-Extended, Applebot-Extended, meta-externalagent, plus
  the training crawlers GPTBot and ClaudeBot. `User-agent: *` already
  allowed them; naming them removes any dependency on a host or platform
  default, and each line is a one-word opt-out if the owner changes his
  mind about training crawlers.
- **`llms.txt`** published with the approved company facts, the six
  services, the page map, and an explicit statement that this site
  publishes no statistics, testimonials, awards, or certifications — so a
  model quoting the domain cannot attribute invented results to it. Google
  has stated publicly that llms.txt does not influence AI Overviews; it is
  included because the cost is one static file, not because it is a proven
  ranking factor.

Verified: 132 JSON-LD blocks across 25 pages parse, every `@id` reference
resolves, no empty values; gate1 7/7; gate2 51/51; mobile Lighthouse on `/`
99/100/100/**100 SEO** with zero SEO audit failures.

Also fixed here: the `gate2` transition scanner failed on the current HEAD
because the `@source not inline("transition-colors")` exclusion directives
added for G2-RR2-004 name the banned utilities inside `global.css`. The
scanner now strips those exclusion directives before scanning for usage and
separately asserts they remain present.

**Not code — owner actions that dominate AI-search visibility:** a complete
Google Business Profile, consistent NAP across directories, and third-party
brand presence. Published research on 2026 AI search consistently finds
brand search volume and off-site presence to be stronger citation
predictors than on-page work; the on-page layer above is the prerequisite,
not the whole job.

## Asset arrivals

- **2026-07-17 — Official logo files received.** The authentic twin-peak mark
  was extracted from the supplied vector source and reused by the nav, footer,
  hero, section art, founder placeholder, favicon, OG art, and 404 page.
- SPEC color tokens remain authoritative: `--orange: #F26E24` and
  `--text: #F7F5F2`.
- The lockup is typeset as `PYRAMEDIA X`. The misspelled source sub-line is not
  used.
- Founder photo, client logos, exact address, map, analytics IDs, webhook, and
  FTP secrets remain owner inputs.

## QA evidence — current local tree (2026-07-18)

### Status trail (implementation claims vs independent verification)

- The first GATE 2 remediation (18 findings) was committed on local `main` as
  `1a434e4`; the Instagram reels box followed as `c451e70`/`7c244df`.
- The independent re-review `REVIEW_GATE2_REREVIEW.md` (verdict FAIL, commit
  `7c244df`) confirmed 15 of the original 18 findings FIXED and found 3 STILL
  OPEN (G2-001, G2-005, G2-008) plus 10 new findings. Earlier claims in this
  file and the handoff that "all 18 were fixed" were implementation claims,
  not independent results — the re-review is the authoritative record.
- All 13 re-review findings were remediated in the commit that contains this
  entry; that remediation is again an implementation claim until the next
  independent pass.

### Automated verification

Rerun after any additional edit:

```powershell
npm.cmd run test:gate1
npm.cmd run test:gate2
npm.cmd run build
git diff --check
```

Latest completed results (after the second re-review remediation):

- GATE 1 regression suite: 7/7 passed.
- GATE 2 regression suite: 51/51 passed (46 from the prior pass + 5 new
  guards covering the second re-review findings).
- `npm run typecheck` (`astro sync && tsc --noEmit`): clean — new
  verification step added per G2-RR2-005.
- Production build: 25 static pages, with no Astro/Vite warnings or errors.
- `git diff --check`: clean apart from Windows LF/CRLF conversion advisories.

### JavaScript boundary

The current build has no analytics IDs configured, so Partytown is omitted.
Measured with `.NET GZipStream` using the same method as the independent review:

| Boundary | Gzip bytes |
|---|---:|
| Initial layout + router JavaScript | 6,413 |
| Deferred GSAP/Lenis motion chunk | 52,950 |
| Total generated JavaScript | 59,363 |

This is below the 180 KiB budget. A production build containing GA4 and/or Meta
IDs must be measured separately because it adds the relevant Partytown assets.

### Fresh Lighthouse 13.4.0 — mobile, local production preview

Both routes returned HTTP 200. No Lighthouse run warnings were reported.

| Route | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 1.063 s | 1.363 s | 0.00024 | 0 ms |
| `/ar/` | 96 | 100 | 100 | 100 | 1.311 s | 1.594 s | 0.00029 | 219 ms |

INP is unavailable from these lab runs and remains a GATE 3 / field boundary.
The local HTML/JSON Lighthouse artifacts were written under `C:\tmp` and are
not represented as production-host evidence.

### Real-Chrome motion and responsive verification

An isolated Chrome 150/CDP pass used actual trusted input and forced
`prefers-reduced-motion: reduce` at 320 and 390 CSS px on `/` and `/ar/`:

- Normal motion requested the heavy motion chunk only after trusted input.
  Repeated input, Astro navigation, return navigation, and reload/retrigger
  produced one cursor/ring, two pyramid shimmers, one pin spacer, and no
  duplicate runtime nodes or console/runtime errors.
- All four reduced-motion cases requested no motion chunk, reported zero active
  Web Animations, no viewport overflow, no cursor/shimmer/tilt/pin/glow nodes,
  five visible unique client names, and a naturally scrollable methodology.
- At Arabic 320 px, the 155 px consent sheet published a 171 px offset; the
  WhatsApp float did not overlap it and hit-testing resolved to the link. EN
  mirrors the same behavior on the inline end.

### Historical evidence retained for traceability

**Historical Lighthouse 12, mobile emulation, local `npm run preview`
(reports committed under `reports/`; `/ar` was measured; this did not verify canonical `/ar/`):**

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 99 | 100 | 100 | 100 | 1.87 s | 0.000 | 18 ms |
| `/ar/` | 97 | 100 | 100 | 100 | 2.15 s | 0.001 | 24 ms |

These rows are historical only. They are not used to explain current
performance or to prove the canonical Arabic route.

Earlier form and analytics exercises were also local controlled simulations:

- The form payload matched the SPEC contract against a local capture endpoint;
  no production webhook or real external lead was verified.
- Consent/provider permutations are protected by regression tests. The current
  missing-ID build injects no provider. No real GA4 or Meta account received a
  verification event in this remediation.

### GATE 1 remediation verification (2026-07-17)

- `npm run test:gate1` passed all 7 regression checks.
- `npm run build` generated 25 static pages.
- Production preview returned HTTP 200 for `/` and canonical `/ar/`.
- Mobile navigation, skip-link focus, logical RTL placement, and route-aware
  font preloads were verified for the GATE 1 reviewed baseline.
- Arabic home preloads Space Grotesk 700 plus Cairo Arabic 400; Arabic interior
  routes preload Cairo Arabic 800 plus Cairo Arabic 400.

### GATE 2 remediation state

All 18 GATE 2 findings have been remediated locally and protected by regression
tests — an implementation claim that was then independently tested: the formal
re-review `REVIEW_GATE2_REREVIEW.md` (commit `7c244df`) returned a FAIL,
confirming 15 of 18 FIXED and finding G2-001/G2-005/G2-008 STILL OPEN plus ten
new findings (G2-RR-001..010). All 13 re-review findings were remediated in a
second pass (this tree): neutral EN form copy, true legal revision dates,
English-only legal identity LTR-isolated on Arabic pages, restored §7.1
founder-verbatim strings, MSA fixes at the cited spots, wordmark/handle/label
centralization, address and legal-name injection from `site.ts`, reveal
coverage for interior heroes and legal pages, mobile-menu focus containment
and restoration, focus handoff for form states and Instagram embeds, a ≥3:1
form-control boundary token, and shared Instagram build assets across locales.
`REVIEW_GATE2.md` and `REVIEW_GATE2_REREVIEW.md` both remain FAIL verdicts for
the baselines they reviewed; only the next independent pass can issue a new
verdict.

**Second re-review response (2026-07-18).** `REVIEW_GATE2_REREVIEW2.md`
(FAIL, commit `3b3f511`, 3 BLOCKER / 4 MAJOR / 3 MINOR) confirmed 16 of the
18 original findings and 8 of the 10 first-re-review findings FIXED. All 10
of its findings were remediated in the commit containing this entry:
unapproved timing/outcome/universal claims removed from home, About and SEO
copy in both languages (G2-RR2-001); the branding rollout and FAQ constrained
to the exact §7.3 scope (G2-002); consent UI now renders only when an
analytics provider is configured and both privacy policies generate
provider-aware analytics disclosures (G2-RR2-002); remaining Arabic
colloquialisms/calques rewritten and the Instagram rendering standardized to
«إنستجرام» (G2-005); footer social labels centralized in `SOCIAL_LINKS`
(G2-008); interior heroes and legal pages joined grouped stagger reveals
(G2-RR-005); the md-breakpoint overlay close now hands keyboard focus to a
desktop nav target (G2-RR2-003); test fixtures excluded from Tailwind source
scanning and the placeholder GSAP context removed (G2-RR2-004); the source is
now `tsc --noEmit`-clean with a `typecheck` script added to verification
(G2-RR2-005). One additional same-class claim found during this pass was also
removed: social-media "publishing runs on schedule" / «وفق جدول ثابت» and
"steady rhythm" / «بإيقاع منتظم» became system-framed wording, and the
forbidden-promise scanner now covers those patterns.

*Verification boundary for G2-RR2-003:* the embedded preview browser does not
dispatch matchMedia change events on emulated resize and parks dropped focus
on the skip link rather than `<body>`, so the fix was verified by direct
callback invocation (menu closes, `aria-expanded` clears, handoff guard
evaluates correctly) plus source inspection. The full resize-event path —
including the real-Chrome focus-to-`<body>` drop that the continuous
`focusin` tracker exists for — needs confirmation in real Chrome at the next
independent pass. The reviewer's two Gate-3-forward `.htaccess` notes were also
applied early: hardcoded canonical-host redirect target and year-long
immutable caching for hashed AVIF/WebP assets. These are implementation
claims until the next independent pass.

The implementation includes:

- scope-safe EN/AR copy, native warm MSA, paired methodology content, and
  centralized legal/UI strings;
- transform/opacity/SVG-stroke-only transition guards;
- a CSS-first hero plus rich GSAP/ScrollTrigger/Lenis motion loaded only after
  trusted visitor intent;
- one pinned methodology section, teardown across Astro swaps and live
  reduced-motion changes, and a fully readable reduced-motion fallback;
- route-aware font preloads, sticky navigation, stateful mobile-menu labels,
  consent-safe WhatsApp placement, and provider-aware analytics dispatch.

The detailed finding ledger, commands, and review boundary are in
`docs/GATE2_REMEDIATION_REPORT.md`.

## Pending external and release boundaries

- Fresh formal independent GATE 2 re-review.
- GATE 3: INP/field data, real-device iPhone Safari and Android Chrome, and
  production-host performance.
- Live Apache redirects, canonicalization, headers, cache/compression rules,
  and bilingual 404 behavior.
- Real n8n lead delivery, Google Maps embed, and real GA4/Meta provider matrix
  after owner IDs/URLs are supplied.
- Authorized remote configuration, push, and deployment. None was performed in
  this remediation.
