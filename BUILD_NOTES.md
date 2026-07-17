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

(Entries for `TODO_FOUNDER_PHOTO` and `TODO_CLIENT_LOGO_1..5` are added in the
phases that introduce those components.)

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
