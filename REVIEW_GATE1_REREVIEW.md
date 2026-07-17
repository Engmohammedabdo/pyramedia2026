# PYRAMEDIA X — INDEPENDENT RE-REVIEW: GATE 1

- **Gate:** 1 — Foundation & Homepage
- **Review date:** 2026-07-17
- **Reviewed commit:** `2971422f7fc2e9ef32a9fa9bc8ec509b525d2211`
- **Branch:** `codex/gate1-remediation`
- **VERDICT: PASS**
- **Re-review summary:** 7 FIXED · 0 STILL OPEN · 0 REGRESSED · 0 NEW

The current production build succeeds, all mandatory GATE 1 scans are clean, the canonical Arabic homepage and the rendered EN→AR switcher work in production preview, and fresh mobile/keyboard/RTL checks confirm the prior user-facing failures are remediated. No BLOCKER or other active GATE 1 finding remains at this commit.

## Findings

| ID | Severity | SPEC ref | Location (file:line) | Evidence | Problem | Suggested fix |
|---|---|---|---|---|---|---|

No active findings at the reviewed HEAD. The prior findings are classified individually in Appendix C.

## Gate 1 checklist result

- **Truth and positioning — PASS.** Fresh built-page/browser inspection found the verbatim bilingual H1 and hero subheads, only the five approved client names, six services, six methodology stages, four approved differentiators, the approved founder scope, and the closing CTA. No counters, testimonials, awards, certifications, fabricated people, extra clients, or banned AI-positioning phrases were found.
- **Contact centralization — PASS.** The mandatory phone/email stray scan is clean. Homepage/layout contact links, socials, license line, address, and WhatsApp links render through `src/config/site.ts`; Arabic phone/email remain LTR-isolated (`src/components/Footer.astro:130-155`, `src/styles/global.css:132-136`).
- **i18n and RTL — PASS.** Fresh browser output reported `lang="en" dir="ltr"` on `/` and `lang="ar" dir="rtl"` on `/ar/`. The rendered switcher had `href="/ar/"` and landed on the Arabic homepage. At 390 CSS px, the RTL WhatsApp float was at `left: 20px`, the marquee direction was `reverse`, the card arrow transform was `matrix(-1, 0, 0, 1, 0, 0)`, phone direction was `ltr` with `unicode-bidi: isolate`, and there was no viewport overflow. A visual scroll pass covered the Arabic hero, services, methodology flow, differentiators/founder area, CTA/footer, and a 1024×768 desktop hero. Arabic copy read natively; the remaining Latin strings are the required brand mark, contact identities, and three official client names whose approved Arabic forms have not been supplied and are documented in `BUILD_NOTES.md:40-44`.
- **Design system — PASS.** The rogue-color scan now returns only the justified HTML `theme-color` literals. Component alpha paint values are tokenized. Fresh contrast calculations were 17.73:1 (text/background), 7.53:1 (muted/background), 6.98:1 (muted/surface), and 6.17:1 (button ink/orange), all above WCAG AA for normal text.
- **Homepage vs SPEC §7.1 — PASS.** All seven sections are present in source and browser output (`src/components/pages/HomePage.astro:35-211`); approved verbatim copy matches; placeholders remain explicit and logged.
- **Housekeeping — PASS for GATE 1.** `BUILD_NOTES.md` now distinguishes historical `/ar` Lighthouse evidence from current canonical-route evidence. Fresh browser warning/error logs were empty. Unknown EN and AR paths returned HTTP 404, and `dist/404.html` contained both “Page not found.” and “الصفحة غير موجودة.” The owner asset slot paths now exist.

## Appendix A — Evidence

### A1. Repository and review scope

```text
> git rev-parse HEAD
2971422f7fc2e9ef32a9fa9bc8ec509b525d2211

> git branch --show-current
codex/gate1-remediation

> git status --short          # before creating this report
<NO OUTPUT>

> git diff --check 3f9a5795b94d50eb6c445f6aae81d8733991dbfb..HEAD
<NO OUTPUT>

> SHA256 C:\xampp\htdocs\pyramedia2026\REVIEW_GATE1.md
F82E01347C1C6F8B00241623C78156A531BAD9D6BBACD314B45C684960C7E4F4
```

The original independent report was read but not edited. The implementation worktree was clean before this findings report was created.

### A2. Clean install, tests, and production build

The default npm cache was inaccessible inside the sandbox. The clean install was therefore rerun with the already-provided worktree cache; it succeeded. The first sandboxed build then hit the known esbuild directory-read denial, so the same installed tree was built with the approved build-only sandbox exception. That production build exited `0` with no Astro/Vite warnings or errors.

```text
> npm.cmd ci --cache .superpowers\sdd\npm-cache --prefer-offline
npm warn deprecated tsconfck@3.1.6: unmaintained

added 366 packages, and audited 367 packages in 46s

197 packages are looking for funding
  run `npm fund` for details

3 vulnerabilities (2 low, 1 high)

> npm.cmd run test:gate1
TAP version 13
ok 1 - Astro preview accepts the canonical Arabic homepage trailing slash
ok 2 - desktop nav CTA is hidden by a responsive wrapper on mobile
ok 3 - skip-link target is programmatically focusable
ok 4 - Arabic pages preload the brand H1 and Arabic body fonts
ok 5 - component alpha colors come from the token file
ok 6 - owner asset swap slots exist and reject fabricated assets
ok 7 - BUILD_NOTES labels historical Arabic evidence and current remediation accurately
1..7
# tests 7
# pass 7
# fail 0
# duration_ms 125.3709

> npm.cmd run build
> astro build && node scripts/postbuild.mjs

17:09:37 [content] Syncing content
17:09:37 [content] Synced content
17:09:37 [types] Generated 2.99s
17:09:37 [build] output: "static"
17:09:37 [build] mode: "static"
17:09:37 [build] Collecting build info...
17:09:37 [build] ✓ Completed in 3.08s.
17:09:37 [build] Building static entrypoints...
17:09:43 [vite] ✓ built in 6.04s
17:09:43 [build] ✓ Completed in 6.14s.
17:09:45 [vite] ✓ 25 modules transformed.
17:09:45 [vite] computing gzip size...
17:09:45 [vite] dist/_astro/ClientRouter.astro_astro_type_script_index_0_lang.CDGfc0hd.js   15.36 kB │ gzip:  5.28 kB
17:09:45 [vite] dist/_astro/BaseLayout.astro_astro_type_script_index_0_lang.CdnLG-pr.js    138.67 kB │ gzip: 52.26 kB
17:09:45 [vite] ✓ built in 1.69s
17:09:45 [build] 25 page(s) built in 11.82s
17:09:45 [build] Complete!
sitemap normalized (/ar → /ar/)
```

The transitive deprecation/audit output is preserved but is not promoted to a GATE 1 finding because SPEC defines no npm-audit budget and the Astro/Vite production build itself was warning-free.

### A3. Mandatory evidence toolkit

Each clean grep produced no match; Git grep exit code `1` means no matches.

```text
> grep -rn "567249440" src/ dist/
<NO OUTPUT>
exit=1

> grep -rni "lorem" src/ dist/
<NO OUTPUT>
exit=1

> grep -rn "971565799505\|info@pyramedia" src/ --include="*.astro" --include="*.ts" --include="*.tsx" | grep -v "site.ts\|company.ts"
<NO OUTPUT>
exit=1

> grep -rnE "\b(ml-|mr-|pl-|pr-|left-[0-9]|right-[0-9]|text-left|text-right)" src/
<NO OUTPUT>
exit=1

> grep -rniE "counter|countup|count-up" src/
<NO OUTPUT>
exit=1

> grep -rniE "AI-powered|AI-first|AI agency|Initializing" src/ dist/
<NO OUTPUT>
exit=1

> Windows equivalent: enumerate dist/**/*.js; gzip -k each file; du -cb the generated *.js.gz files; select the total
92010  total
```

The six generated `.js.gz` files were removed immediately after measurement; `gzip_remaining=0`. Total JavaScript is **92,010 bytes gzipped**, below the 180 KiB ceiling.

Fresh rogue-color scan outside `src/styles/global.css`:

```text
src/components/Seo.astro:86:<meta name="theme-color" content="#0E0E0F" />
src/pages/404.astro:28:    <meta name="theme-color" content="#0E0E0F" />
```

These are HTML metadata values and cannot consume CSS custom properties. No component-local paint literal remains.

### A4. Production preview and browser evidence

Fresh route output from `npm.cmd run preview -- --host 127.0.0.1 --port 4321`:

```text
/ -> HTTP 200
/ar/ -> HTTP 200
/ar -> HTTP 200
/does-not-exist -> HTTP 404
/ar/does-not-exist -> HTTP 404
```

Fresh EN mobile result at 390×844:

```json
{
  "url": "http://127.0.0.1:4321/",
  "lang": "en",
  "dir": "ltr",
  "requestedViewportWidth": 390,
  "documentClientWidth": 375,
  "documentScrollWidth": 375,
  "desktopCtaVisible": false,
  "desktopCtaWrapperDisplay": "none",
  "menu": { "left": 242.390625, "right": 282.390625, "width": 40 },
  "h1Text": "Less Talk. More Performance.",
  "h1Opacity": "1"
}
```

Rendered switcher interaction:

```text
count: 1
href: /ar/
result URL: http://127.0.0.1:4321/ar/
result title: بيراميديا إكس — وكالة تسويق رقمي في دبي
```

Fresh AR mobile/RTL/font result at 390×844:

```json
{
  "url": "http://127.0.0.1:4321/ar/",
  "lang": "ar",
  "dir": "rtl",
  "innerWidth": 390,
  "desktopCtaVisible": false,
  "desktopCtaWrapperDisplay": "none",
  "menu": { "left": 92.609375, "right": 132.609375, "width": 40 },
  "float": { "left": "20px", "right": "299px" },
  "marqueeDirection": "reverse",
  "cardArrowTransform": "matrix(-1, 0, 0, 1, 0, 0)",
  "phoneDirection": "ltr",
  "phoneUnicodeBidi": "isolate",
  "h1FontFamily": "\"Space Grotesk\", \"Space Grotesk Fallback\", Inter, ui-sans-serif, system-ui, sans-serif",
  "bodyCopyFontFamily": "Cairo, \"Cairo Fallback\", Tajawal, ui-sans-serif, system-ui, sans-serif",
  "preloads": [
    "/_astro/space-grotesk-latin-700-normal.RjhwGPKo.woff2",
    "/_astro/cairo-arabic-400-normal.DN15VWMM.woff2"
  ]
}
```

Fresh narrow-mobile matrix (in-app Browser production preview; each requested
viewport height was 844 CSS px):

```json
{
  "en320": {
    "url": "http://127.0.0.1:4321/",
    "innerWidth": 320,
    "documentClientWidth": 305,
    "documentScrollWidth": 305,
    "dir": "ltr",
    "menu": { "left": 242.390625, "right": 282.390625, "width": 40 },
    "desktopCtaVisible": false,
    "desktopCtaWrapperDisplay": "none"
  },
  "ar320": {
    "url": "http://127.0.0.1:4321/ar/",
    "innerWidth": 320,
    "documentClientWidth": 305,
    "documentScrollWidth": 305,
    "dir": "rtl",
    "menu": { "left": 22.609375, "right": 62.609375, "width": 40 },
    "desktopCtaVisible": false,
    "desktopCtaWrapperDisplay": "none"
  },
  "en375": {
    "url": "http://127.0.0.1:4321/",
    "innerWidth": 375,
    "documentClientWidth": 360,
    "documentScrollWidth": 360,
    "dir": "ltr",
    "menu": { "left": 242.390625, "right": 282.390625, "width": 40 },
    "desktopCtaVisible": false,
    "desktopCtaWrapperDisplay": "none"
  },
  "ar375": {
    "url": "http://127.0.0.1:4321/ar/",
    "innerWidth": 375,
    "documentClientWidth": 360,
    "documentScrollWidth": 360,
    "dir": "rtl",
    "menu": { "left": 77.609375, "right": 117.609375, "width": 40 },
    "desktopCtaVisible": false,
    "desktopCtaWrapperDisplay": "none"
  }
}
```

All four narrow-mobile cases PASS: the menu bounds are within the respective
viewport, `documentScrollWidth <= documentClientWidth`, the desktop CTA has no
client rects, its responsive wrapper computes to `display: none`, and the EN/AR
document directions are respectively `ltr`/`rtl`.

Keyboard-only checks:

```json
{
  "skipAfterTab": { "activeTag": "A", "activeText": "Skip to content", "activeHref": "#main" },
  "skipAfterEnter": { "hash": "#main", "activeTag": "MAIN", "activeId": "main", "scrollY": 0 },
  "menuOpenByEnter": { "display": "flex", "expanded": "true", "hiddenClass": false },
  "menuClosedByEscape": { "display": "none", "expanded": "false", "hiddenClass": true }
}
```

Desktop AR at 1024×768 reported `menuDisplay: none`, `navCtaVisible: true`, and no document overflow. Browser warning/error logs were empty. The temporary review tab was closed, the viewport override was reset, and the preview listener was stopped.

### A5. Source and content inspection

- Canonical preview compatibility: `astro.config.mjs:14-15` retains static file output and uses `trailingSlash: 'ignore'`; the switcher maps English `/` to `/ar/` at `src/i18n/index.ts:47-51`.
- Mobile CTA boundary: the responsive wrapper is at `src/components/Nav.astro:69-82`; the menu control is at `src/components/Nav.astro:84-92`.
- Skip target: `src/layouts/BaseLayout.astro:65`.
- Arabic H1/body preloads: `src/layouts/BaseLayout.astro:45-48`, emitted at line 57.
- Alpha tokens: `src/styles/global.css:17-20`, consumed by `src/components/Footer.astro:57` and `src/components/WhatsAppFloat.astro:38-52`.
- Asset slots: `src/assets/clients/README.md:1-5` and `src/assets/founder/README.md:1-5`.
- QA accuracy: `BUILD_NOTES.md:83-84` explicitly says historical `/ar` was measured and did not verify `/ar/`; fresh remediation evidence is recorded at `BUILD_NOTES.md:115-122` and matches this re-review.

## Appendix B — Unverified and remaining boundary

### U1. Live Apache/deployment behavior

**Why unverified:** This re-review exercised Astro's production preview, not the Bluehost/Apache runtime. No deploy, merge, push, DNS, Apache, or external system was changed.

**Exact owner/deployment verification after the reviewed commit reaches a staging/live Apache host:**

1. Merge the approved branch into the intended release branch and deploy the resulting `dist/` through the repository's real pipeline.
2. Run `curl -I` and `curl -L -I` for `/ar/`, every SPEC §5.1 legacy URL, HTTP→HTTPS, and www→non-www; require the specified final URL/status.
3. Confirm `.htaccess` security/cache/compression headers and the bilingual `ErrorDocument 404` on the host.
4. Open the live `/`, click the rendered Arabic switcher, and require a final canonical `/ar/` page with Arabic content.

### U2. Performance/motion/release gates outside GATE 1

Fresh Lighthouse was not run because Reviewer checklist I begins at GATE 2 and is blocking at GATE 3; the committed reports are explicitly historical and were not used to pass GATE 1. Reduced-motion, complete motion cleanup, all-page performance, iPhone Safari, Android Chrome, forms/integrations, SEO/structured data, analytics consent, redirects, CI/CD, and launch budgets remain GATE 2/GATE 3 work. The owner must run the exact SPEC §12 mobile Lighthouse checks on `/` and `/ar/` and the complete device/deployment checklist at their applicable gates.

### U3. Owner-supplied inputs

The real founder photo, five client logos, exact bilingual office address, map URL, n8n webhook, GA4/Meta IDs, and FTP secrets are still owner-supplied per SPEC §14. Their current explicit fallbacks are compliant with GATE 1 and are not a waiver for later integration/deployment gates.

### Precise remaining owner/deployment boundary

- This verdict approves **only GATE 1 at commit `2971422` in the local remediation worktree**.
- The branch has not been staged, committed further, merged to the release branch, pushed, or deployed by this reviewer.
- The owner/builder still owns the asset/secrets inputs, branch integration, deployment, live Apache verification, and every GATE 2/GATE 3 requirement.
- A GATE 1 PASS does **not** declare the full site complete or launch-ready.

## Appendix C — Re-review log

| Prior ID | Prior severity | Status | Fresh evidence |
|---|---|---|---|
| G1-001 | BLOCKER | **FIXED** | `astro.config.mjs:14-15` now permits the canonical preview form. Fresh HTTP: `/ar/` → 200. A unique rendered `href="/ar/"` switcher click landed at `http://127.0.0.1:4321/ar/` with the Arabic homepage title/content. |
| G1-002 | MAJOR | **FIXED** | The desktop CTA is inside `hidden sm:block` at `src/components/Nav.astro:69-82`. At 390px, CTA visible=false/wrapper display=none; menu bounds were EN `242.39..282.39` and AR `92.61..132.61`, both inside the 390px viewport. Enter opened the overlay and Escape closed it. |
| G1-003 | MAJOR | **FIXED** | `main#main` has `tabindex="-1"` at `src/layouts/BaseLayout.astro:65`. Fresh Tab→Enter left `activeTag=MAIN`, `activeId=main`, `hash=#main`. |
| G1-004 | MAJOR | **FIXED** | Arabic preloads are Space Grotesk 700 + Cairo Arabic 400 at `src/layouts/BaseLayout.astro:45-48`. Fresh built-page evidence showed both WOFF2 preloads, Space Grotesk on the H1, and Cairo on Arabic body copy. |
| G1-005 | MAJOR | **FIXED** | `BUILD_NOTES.md:83-84` labels the report historical and states that `/ar` was measured, not `/ar/`; the prior blanket switcher claim is gone. The current remediation claims at lines 115-122 match fresh build, route, click, mobile, skip, and preload evidence. |
| G1-006 | MINOR | **FIXED** | Component alpha values are tokens at `src/styles/global.css:17-20` and are consumed at `Footer.astro:57` and `WhatsAppFloat.astro:38-52`. Fresh rogue-color scan found only justified `theme-color` metadata literals. |
| G1-007 | MINOR | **FIXED** | `src/assets/clients/README.md` and `src/assets/founder/README.md` now exist as committed swap slots and explicitly prohibit generated/reconstructed logos and stock/AI-generated people. Fresh filesystem checks returned true for both. |
