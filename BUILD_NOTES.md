# BUILD_NOTES.md — PyramediaX website build log

Pairs with `SPEC.md` v1.1. Logs every placeholder used (SPEC §14) and every
build decision that needed founder input but was resolved with a placeholder
or a documented assumption. Nothing here changes site copy — it is a log.

## Placeholder registry (grep `TODO_` to locate all of them)

| Key | Where it lives | Current placeholder behavior | Swap procedure |
|---|---|---|---|
| `TODO_OFFICE_ADDRESS_EN` | `src/config/site.ts` → `addressEn` | Shows "Deira, Port Saeed — Dubai, UAE" | Replace the `addressEn` string |
| `TODO_OFFICE_ADDRESS_AR` | `src/config/site.ts` → `addressAr` | Shows «ديرة، بور سعيد — دبي، الإمارات» | Replace the `addressAr` string |
| `TODO_MAPS_EMBED_URL` | `src/config/site.ts` → `mapsEmbedUrl` | Empty → contact address card renders without the map block | Paste the Google Maps embed URL |
| `TODO_N8N_WEBHOOK` | `.env` → `PUBLIC_N8N_WEBHOOK_URL` | Form renders disabled state + WhatsApp fallback; console warning in dev | Set the env var and rebuild |
| `TODO_GA4_ID` | `.env` → `PUBLIC_GA4_ID` | GA4 not injected | Set the env var and rebuild |
| `TODO_META_PIXEL_ID` | `.env` → `PUBLIC_META_PIXEL_ID` | Meta Pixel not injected | Set the env var and rebuild |
| `TODO_FOUNDER_PHOTO` | `src/components/FounderPanel.astro` | On-brand dark panel with pyramid line-art + name/title (never a stock face) | Drop photo into `src/assets/founder/`, replace the panel body with an astro:assets `<Image>` |
| `TODO_CLIENT_LOGO_1..5` | `src/components/pages/HomePage.astro` (trusted-by marquee) | Styled text of client names in muted color — never fake logos | Drop SVG/PNG files into `src/assets/clients/`, replace the marquee `<li>` text with `<Image>` tags |
| FTP secrets | GitHub repo secrets `FTP_SERVER`/`FTP_USERNAME`/`FTP_PASSWORD` (+ `BLUEHOST_SITE_ROOT` variable) | CI builds and keeps the artifact; the FTPS deploy step is skipped with a clear log notice | Add the three secrets (and site-root variable if not `public_html/`) in GitHub Actions settings |

## Decisions log

- **2026-07-17 — Arabic legal name.** SPEC §4 gives the legal name only in
  English. The footer trust line on `/ar/` uses an Arabic-script
  transliteration («بيراميديا إكس ماركتينج مانجمنت ذ.م.م») rather than
  embedding a full English sentence inside Arabic UI. If the trade license
  shows a different registered Arabic name, swap `legalNameAr` in
  `src/config/site.ts` (single place).
- **2026-07-17 — URL format.** Astro `build.format: 'file'` + `.htaccess`
  extensionless rewrite so live URLs match SPEC §5 exactly (no trailing
  slashes) on Apache shared hosting.
- **2026-07-17 — Client names without approved Arabic renderings.** SPEC §4
  gives Arabic names for two clients only (مجموعة إنجازات، مركز إتمام). The
  other three (Mazaya Platinum Real Estate, Bashayer Real Estate, SynthCity
  DXB) appear in their original Latin form on `/ar/` — inventing Arabic
  renderings would risk fabricating brand names. Swap in
  `src/content/pages/ar/home.json` if the owner supplies official Arabic names.
- **2026-07-17 — Legal pages "Last updated".** Set to 2026-07-17 (the real
  build date), field `lastUpdated` in `src/content/pages/{en,ar}/{privacy,terms}.mdx`.
- **2026-07-17 — Spam traps.** Honeypot field (`website`) + 4-second
  minimum-time-on-page. Bot-like submissions get a silent success state and
  nothing is sent — standard practice so bots don't retry.

## Asset arrivals

- **2026-07-17 — Official logo files received** (`logo/png` + `logo/svg`,
  10 color variants, committed to the repo as brand source-of-truth).
  Integrated as follows:
  - The mark (twin peaks + diamond apex) was extracted verbatim from
    variant 06 and inlined in `src/components/PyramidMark.astro` — it now
    drives the nav/footer lockup, hero draw-in, section backgrounds,
    founder panel and 404. `public/favicon.svg` and the OG image were
    regenerated from the same authentic paths.
  - Colors are mapped to the SPEC §6.1 tokens (`--orange: #F26E24`,
    `--text: #F7F5F2`). The logo source uses `#f16e25` — a 1/255 rounding
    difference from the spec token; the spec token wins on the site.
  - The lockup text stays typeset ("PYRAMEDIA X" per SPEC §4) rather than
    using the outlined text from the logo files — crisper at nav size,
    accessible, and it avoids baking in the sub-line "FOR MARKETING
    MANAGMENT" from the asset (not in the §4 whitelist; contains a
    spelling issue — flag to owner).
  - Hero motion updated: the mark's outline draws in (~1.2 s) and its fill
    fades up — same §8 vocabulary, now on the authentic geometry. On RTL
    the mark mirrors to the start side at reduced opacity and the English
    brand H1 aligns to the page's reading start.
  - `TODO_` registry unchanged: founder photo, client logos, exact address,
    maps URL, analytics IDs, webhook and FTP secrets are still pending.

## QA evidence (2026-07-17, production build via `npm run preview`)

**Grep gates (SPEC §15 DoD):**

- `grep -r "567249440" src/ dist/ public/` → 0 matches (the sequence exists
  only inside SPEC.md itself; the CI guard assembles the pattern at runtime
  so it never appears literally in the codebase).
- `grep -ri "lorem" src/ dist/` → 0. Counters grep → 0. Banned positioning
  phrases ("AI-powered" etc.) → 0. Contact data outside `site.ts` → 0.
  Physical-direction Tailwind utilities → 0.

**JS weight:** ~91 KB gzip total across `dist/` (92,873 bytes measured
2026-07-17 after the GATE 2 motion pass; budget ≤ 180 KB), of which ~34 KB is
Partytown workers that load only after analytics consent.

**Historical Lighthouse 12, mobile emulation, local `npm run preview`
(reports committed under `reports/`; `/ar` was measured; this did not verify canonical `/ar/`):**

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 1.87 s | 0.000 | 18 ms |
| `/ar/` | 97 | 100 | 100 | 100 | 2.15 s | 0.001 | 24 ms |

- **`/ar/` LCP note:** the simulated (Lantern) LCP reads ~2.15 s vs the
  < 2.0 s budget. The *observed* trace shows LCP = first paint (~0.3 s) with
  no late repaint: fonts are preloaded and metric-matched fallbacks prevent
  any layout/paint delta on swap. The overshoot is Lantern's 4× CPU model of
  Arabic text shaping, not a loading defect. Re-measure on the production
  host at GATE 3; if it still reads over, the remaining lever is server TTFB
  (hosting), not the page.

**Form E2E (SPEC §7.4):** tested against a live local webhook — payload
matched the contract exactly (incl. `utm` object, `lang`, ISO `submitted_at`,
empty `website` honeypot). Honeypot-filled submission produced a silent
success and sent nothing. Bilingual validation errors verified with
`aria-invalid` + `aria-live` announcements; success/error states verified in
both languages.

**Analytics:** consent-gated injection verified (0 Partytown scripts before
accept, 3 after; decline stores choice and injects nothing). Click on the nav
WhatsApp CTA pushed `['event','whatsapp_click',{placement:'nav'}]` into the
forwarded `dataLayer`, `fbq` stub present.

**RTL audit:** page-by-page visual pass on `/ar/` (nav mirroring, marquee
direction, floating button side, breadcrumb/button arrows, pinned-section
direction (+x translation), form alignment) — all mirrored correctly.

**GATE 1 remediation verification (2026-07-17):**

- `npm run test:gate1` passed all 7 regression checks.
- `npm run build` completed successfully and generated 25 static pages.
- Production preview returned HTTP 200 for `/` and canonical `/ar/`; clicking the rendered EN language switcher reached `/ar/` with Arabic content.
- At 390 CSS px in both languages, the desktop WhatsApp CTA was hidden and the mobile-menu button remained inside the viewport.
- Activating the skip link moved keyboard focus to `main#main`.
- The Arabic homepage preloaded Space Grotesk 700 for the brand H1 and Cairo Arabic 400 for Arabic body copy.

**GATE 2 self-verification (2026-07-17, local production preview — not an
independent review and not live-host evidence):**

- **Motion elevation shipped:** hero line reveal with rotation settle, mark
  outline shimmer loop + breathe (deferred past idle), pointer-tilt cards
  with tracking glow (lazy-built on first hover, fine pointers only),
  methodology progress rail (traveling dot + fill + active-stage pop +
  stage-number depth, fully RTL-mirrored), button shine sweep (RTL-mirrored),
  trailing cursor ring, footer wordmark rise, contact success check-draw.
- **§8 law compliance audited and repaired:** the floating WhatsApp ripple
  was rewritten from an animated `box-shadow` to a transform/opacity ring —
  the one confirmed law violation. All other per-frame animation is
  transform/opacity/SVG-stroke.
- **Multi-agent self-audit:** 6 audit dimensions (motion laws, EN pages vs
  §7, AR pages vs §7 + Arabic quality, truth/contact/design, forms,
  housekeeping) with adversarial verification; 15 reported → 8 confirmed →
  all fixed except one accepted note (below); 7 refuted as false positives.
  Fixed: WhatsApp ripple law violation; Arabic typo on AR About stage 5
  («ما ننخفيه» → «ما نخفيه»); contact-form in-flight guard (double-click
  sent duplicate webhook POSTs + duplicate `form_submit` events); dead
  exports removed from `src/i18n/index.ts`; this file's registry table and
  stale JS figure corrected, FTP row added.
- **Accepted note (documented, not fixed):** the deferred boot switches
  `.method-viewport` from `overflow-x:auto` (no-JS/reduced-motion fallback)
  to `hidden` when the pin takes over; on classic-scrollbar platforms this
  removes a scrollbar ~1 s after load, a one-time below-the-fold reflow.
  Measured CLS stayed 0.000–0.001. The scrollable fallback is required for
  no-JS/reduced-motion users, so this trade-off stands.
- **Rapid-navigation leak check:** four fast View-Transition swaps →
  exactly 1 pin-spacer, 1 cursor dot, 1 ring, 1 glow per card. Mobile
  375 px EN+AR: no horizontal overflow, rail visible and scrub-synced,
  menu control in-viewport.
- **Lighthouse (mobile emulation) on this loaded dev machine:** A11y/BP/SEO
  100/100/100 both languages. Performance fluctuated 79–93 across runs; a
  same-conditions A/B against the pre-GATE-2 baseline measured baseline
  87–95 vs GATE 2 90–93 — i.e. the motion pass shows **no measurable
  regression**; the sub-95 numbers are machine load (user Chrome + XAMPP
  running), not the page. The committed 99/97 reports under `reports/`
  remain the quiet-machine reference. Re-measure at GATE 3 on the
  production host before treating §12 as passed — GATE 2 budgets are
  provisional by design (REVIEWER.md §4-I).
- `npm run test:gate1` 7/7 and `npm run build` (25 pages, clean) re-run
  after every fix above.

**Pending post-deploy verification (needs the live Apache host):**
`.htaccess` §5.1 redirect map via `curl -I`, HTTPS/non-www force, security
headers, 404 ErrorDocument; real-device iPhone Safari + Android Chrome pass;
`prefers-reduced-motion` on-device check (code path: motion module exits
before any setup; CSS media query stops marquee/transitions — verified by
inspection and present in built CSS).
