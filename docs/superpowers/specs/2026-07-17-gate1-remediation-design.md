# GATE 1 Remediation Design

**Date:** 2026-07-17

**Status:** Approved for implementation planning

## Goal

Close every finding in `REVIEW_GATE1.md` without changing the public URL contract, approved copy, static-hosting architecture, or visual direction defined by `SPEC.md`.

## Constraints

- Keep Astro static output and `build.format: 'file'` for Bluehost Apache hosting.
- Keep `/ar/` as the canonical Arabic homepage URL.
- Keep all non-home page URLs extensionless and without a trailing slash.
- Keep the existing `.htaccess` canonicalization and `/ar/` rewrite behavior.
- Add no runtime dependency for the remediation.
- Preserve the independent review report; fixes are implemented in source and verified separately.
- Do not change approved English or Arabic homepage copy.

## Selected Approach

Use a targeted compatibility fix. Change Astro route matching from strict `trailingSlash: 'never'` to `trailingSlash: 'ignore'` while retaining file-format build output and Apache canonical redirects. Astro documents `ignore` as matching a route with or without a trailing slash. This lets the required production-preview workflow serve `/ar/`, while Apache remains responsible for the live canonical redirect policy.

Changing the whole build to directory output was rejected because it would produce trailing-slash directory URLs for every page. A custom preview server was rejected because it would add maintenance and obscure the required `npm run preview` workflow.

## Remediation Units

### 1. Canonical Arabic route

- Change `astro.config.mjs` to `trailingSlash: 'ignore'`.
- Retain `build.format: 'file'`, sitemap normalization, and the Apache rules that redirect `/ar` to `/ar/` and internally serve `ar.html`.
- Verify that Astro preview returns HTTP 200 for `/ar/`, that the homepage switcher lands there, and that `/ar` remains available only as a preview compatibility route. Live canonical redirect behavior stays an Apache responsibility.

### 2. Mobile navigation

- Move the desktop WhatsApp CTA inside a responsive wrapper that owns `hidden sm:block`.
- Keep `.btn-primary` on the inner anchor so its shared `display: inline-flex` rule cannot override the wrapper's mobile hiding.
- Preserve the language switcher and mobile-menu button order in LTR and RTL.
- Verify the menu button is inside the viewport at 320, 375, and 390 CSS pixels.

### 3. Keyboard bypass

- Add `tabindex="-1"` to `<main id="main">`.
- Retain the visible skip-link styling and fragment target.
- Verify that activating the skip link moves `document.activeElement` to `#main`.

### 4. Arabic homepage font preload

- Preload both Space Grotesk 700 and Cairo Arabic 400 on Arabic pages.
- Retain Space Grotesk 700 and Inter 400 preloads on English pages.
- Verify that the built Arabic homepage preloads the font used by the English brand H1 and the Arabic body font.

### 5. QA notes accuracy

- Correct `BUILD_NOTES.md` so it distinguishes the earlier `/ar` Lighthouse run from the required `/ar/` check.
- Replace the invalid blanket switcher-pass claim with fresh evidence after remediation.
- Record the new route, mobile, keyboard, preload, and build checks without changing historical measurements.

### 6. Design-token centralization

- Add alpha color tokens for the muted footer wordmark and WhatsApp pulse states in `src/styles/global.css`.
- Consume those variables in `Footer.astro` and `WhatsAppFloat.astro`.
- Keep literal HTML `theme-color` values because metadata cannot consume CSS custom properties.

### 7. Asset swap slots

- Create `src/assets/clients/README.md` and `src/assets/founder/README.md`.
- Document accepted asset purpose and the single-file swap path without adding fake logos or people.
- Keep the current on-brand text and line-art placeholders until the owner supplies real assets.

## Regression Strategy

Add a dependency-free Node test under `scripts/tests/` and expose it as `npm run test:gate1`. The test will assert the route configuration, mobile CTA wrapper structure, focusable main target, bilingual font preload declaration, absence of component-level rogue alpha literals, required asset slots, and corrected QA wording. Each assertion must be observed failing against the current code before the corresponding source fix is applied.

Behavior that requires layout or browser navigation will also be verified with headed Playwright against a production build:

- `/` and `/ar/` return HTTP 200.
- Clicking the EN language switcher reaches `/ar/`.
- Mobile menu bounds are visible in both directions.
- Skip-link activation focuses `#main`.
- RTL float, marquee, and arrows remain mirrored.

## Verification

Run, in order:

1. `npm run test:gate1`
2. `npm run build`
3. The mandatory GATE 1 grep toolkit from `REVIEWER.md`
4. JavaScript gzip measurement
5. `npm run preview` with HTTP route checks
6. Playwright desktop, mobile, RTL, and keyboard checks
7. `git diff --check` and a worktree-scope audit

The remediation is complete only when every previous finding is demonstrably fixed and no new GATE 1 regression appears. The independent report verdict changes only during a separate re-review.
