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

**JS weight:** 89 KB gzip total across `dist/` (budget ≤ 180 KB), of which
~34 KB is Partytown workers that load only after analytics consent.

**Lighthouse 12, mobile emulation, local `npm run preview`
(reports committed under `reports/`):**

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

**Language switcher:** verified in built HTML on 8 sampled pages — always
lands on the equivalent page in the other language.

**Pending post-deploy verification (needs the live Apache host):**
`.htaccess` §5.1 redirect map via `curl -I`, HTTPS/non-www force, security
headers, 404 ErrorDocument; real-device iPhone Safari + Android Chrome pass;
`prefers-reduced-motion` on-device check (code path: motion module exits
before any setup; CSS media query stops marquee/transitions — verified by
inspection and present in built CSS).
