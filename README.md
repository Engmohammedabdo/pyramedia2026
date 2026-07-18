# PyramediaX — Official Website

Bilingual (EN `/` + AR `/ar/`) static marketing site for **PyramediaX**
(PYRAMEDIAX MARKETING MANAGEMENT L.L.C, Dubai). Built with Astro 5,
Tailwind CSS v4, GSAP + Lenis. Deploys as pure static files to Bluehost
shared hosting.

> `SPEC.md` is the single source of truth for what this site may and may not
> say. `BUILD_NOTES.md` logs every placeholder still awaiting owner input.

## Local development

```bash
nvm use            # Node 22 (.nvmrc)
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

Copy `.env.example` to `.env` to set analytics IDs and the form webhook.
Everything degrades gracefully while unset (see BUILD_NOTES.md).

## Content editing map — which file is which section

Page copy lives in `src/content`, UI strings live in `src/i18n`, and
company/contact data lives in `src/config/site.ts`. Components consume those
sources instead of duplicating factual values.

| You want to change… | Edit this file |
|---|---|
| Phone, WhatsApp, email, address, socials, license line | `src/config/site.ts` (the ONLY place contact data exists) |
| Homepage sections (hero, clients, methodology, why, founder) | `src/content/pages/en/home.json` + `ar/home.json` |
| About page (story, values, methodology, founder bio) | `src/content/pages/{en,ar}/about.json` |
| Contact page copy | `src/content/pages/{en,ar}/contact.json` |
| A service (name, deliverables, process, tools, FAQ, meta) | `src/content/services/{en,ar}/<slug>.mdx` |
| Privacy / Terms | `src/content/pages/{en,ar}/{privacy,terms}.mdx` |
| UI strings (nav, buttons, form labels/errors, consent) | `src/i18n/en.ts` + `src/i18n/ar.ts` |

Rules when editing:

- **English and Arabic are separate native texts** — edit both files, never
  machine-translate (SPEC §2.4).
- **No new factual claims.** Numbers, awards, testimonials and stats are
  banned unless added to SPEC §4 first (SPEC §2.1).
- The tagline "Less Talk. More Performance." stays in English everywhere.

## Owner-supplied assets still pending

Run `grep -rn "TODO_" src/` to list them. Swap procedure for each is in
`BUILD_NOTES.md` (founder photo, 5 client logos, exact office address,
Google Maps embed URL, analytics IDs, n8n webhook, FTP secrets).

## Deployment

**Automatic:** every push to `main` runs `.github/workflows/deploy.yml`:
build → CI guard (fails if the banned legacy number or lorem ipsum appears
in `dist/`) → artifact upload → FTPS deploy to Bluehost.

GitHub configuration:

- Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- Variables (optional): `BLUEHOST_SITE_ROOT` (default `public_html/`),
  `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_N8N_WEBHOOK_URL`

While the FTP secrets are missing the deploy step is skipped with a clear
log message — the build and guard still run.

**Rollback:** each run stores `dist/` as an artifact for 30 days. Re-run the
deploy job of a previous (good) workflow run from the GitHub Actions UI.

**Manual fallback:** `npm run build`, then upload the *contents* of `dist/`
(including the hidden `.htaccess`) to `public_html/` via Bluehost's file
manager or FTPS client. Never upload the repository itself.

## Structure notes

- URLs are extensionless (`/about`, `/ar/about`); Apache serves the
  prebuilt `.html` files via `public/.htaccess`, which also carries the
  legacy 301 map from the old site (SPEC §5.1), HTTPS/non-www canonical,
  caching and security headers.
- Analytics (GA4 + Meta Pixel) load via Partytown **only after** the
  visitor accepts the consent banner. Conversion events: `whatsapp_click`
  `{placement}`, `form_submit`, `form_success`, `call_click`, `email_click`.
- The contact form POSTs JSON to `PUBLIC_N8N_WEBHOOK_URL` per the SPEC §7.4
  contract (honeypot `website` field + 4s minimum-time-on-page spam traps).
- Blog-ready, not blog-built: add a `blog` collection in
  `src/content.config.ts` and routes under `src/pages/blog/` in v1.1 — no
  refactor needed (SPEC §9).
