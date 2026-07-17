# GATE 1 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every finding in `REVIEW_GATE1.md` with regression coverage while preserving the approved public URL contract and static Apache deployment architecture.

**Architecture:** Keep Astro file-format static output and Apache canonical rewrites. Relax Astro route matching only for local production preview, fix each UI/accessibility defect at its source, centralize component paint colors in the existing token file, and add a dependency-free Node regression suite for durable structural guards. Browser behavior remains verified against the real production build with Playwright.

**Tech Stack:** Astro 5, Tailwind CSS 4, Node.js 22 built-in test runner, GSAP/Lenis, Apache `.htaccess`, Playwright CLI for browser verification.

## Global Constraints

- Astro remains `output: 'static'` with `build.format: 'file'`.
- `/ar/` remains the canonical Arabic homepage; other page URLs remain extensionless without trailing slashes.
- The old number `+971567249440` must never appear in source or built output.
- Homepage copy and the five approved client names remain unchanged.
- No counters, testimonials, invented facts, generated people, or fake client logos.
- Arabic remains `lang="ar" dir="rtl"`; directional UI continues to mirror through logical properties.
- Total JavaScript remains at or below 180 KB gzip.
- No new runtime or development dependency is introduced.
- `REVIEW_GATE1.md` remains unchanged; its verdict changes only in an independent re-review.

---

### Task 1: Add the regression harness and repair canonical Arabic preview routing

**Files:**
- Create: `scripts/tests/gate1-regression.test.mjs`
- Modify: `package.json:9-14`
- Modify: `astro.config.mjs:12-15`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: repository files through `source(relativePath): Promise<string>`.
- Produces: `npm run test:gate1` and the shared `source()` helper used by later tasks.

- [ ] **Step 1: Write the failing route-configuration test and expose the test command**

Create `scripts/tests/gate1-regression.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../../', import.meta.url);

async function source(relativePath) {
  return readFile(new URL(relativePath, projectRoot), 'utf8');
}

test('Astro preview accepts the canonical Arabic homepage trailing slash', async () => {
  const config = await source('astro.config.mjs');

  assert.match(config, /build:\s*\{\s*format:\s*'file'\s*\}/);
  assert.match(config, /trailingSlash:\s*'ignore'/);
});
```

Add the script to `package.json` after `build`:

```json
"test:gate1": "node --test scripts/tests/gate1-regression.test.mjs",
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
npm run test:gate1
```

Expected: one failing test because `astro.config.mjs` contains `trailingSlash: 'never'`, not `ignore`.

- [ ] **Step 3: Implement the minimal route-matching fix**

Change the relevant `astro.config.mjs` block to:

```js
// File output keeps extensionless Apache URLs. Preview accepts both forms so
// the canonical Arabic root /ar/ can be exercised before deployment.
build: { format: 'file' },
trailingSlash: 'ignore',
```

Do not change `public/.htaccess` or `scripts/postbuild.mjs`.

- [ ] **Step 4: Run the regression test and verify GREEN**

Run:

```powershell
npm run test:gate1
```

Expected: `1` test passed, `0` failed.

- [ ] **Step 5: Commit the routing fix and harness**

```powershell
git add package.json astro.config.mjs scripts/tests/gate1-regression.test.mjs
git commit -m "fix: serve canonical Arabic home in preview"
```

### Task 2: Keep the mobile-menu control inside the viewport

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Modify: `src/components/Nav.astro:69-91`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: `source()` from Task 1 and the existing `.btn-primary` primitive.
- Produces: a wrapper-owned `hidden sm:block` responsive boundary around the desktop nav CTA.

- [ ] **Step 1: Append the failing mobile-nav structure test**

Append:

```js
test('desktop nav CTA is hidden by a responsive wrapper on mobile', async () => {
  const nav = await source('src/components/Nav.astro');

  assert.match(
    nav,
    /<div class="hidden sm:block">\s*<a[\s\S]*?data-placement="nav"[\s\S]*?<\/a>\s*<\/div>/
  );
  assert.doesNotMatch(nav, /class="btn-primary hidden/);
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

```powershell
node --test --test-name-pattern="desktop nav CTA" scripts/tests/gate1-regression.test.mjs
```

Expected: failure because the `hidden` class is on the `.btn-primary` anchor and no responsive wrapper exists.

- [ ] **Step 3: Move responsive hiding to a wrapper**

Replace the current nav CTA anchor block with:

```astro
<div class="hidden sm:block">
  <a
    href={waLink(lang)}
    target="_blank"
    rel="noopener"
    class="btn-primary !px-5 !py-2.5 text-sm"
    data-event="whatsapp_click"
    data-placement="nav"
  >
    <Icon name="whatsapp" size={17} />
    {t.cta.whatsapp}
  </a>
</div>
```

- [ ] **Step 4: Run all current GATE 1 tests**

```powershell
npm run test:gate1
```

Expected: `2` tests passed, `0` failed.

- [ ] **Step 5: Commit the mobile navigation fix**

```powershell
git add scripts/tests/gate1-regression.test.mjs src/components/Nav.astro
git commit -m "fix: keep mobile navigation control visible"
```

### Task 3: Make the skip link transfer keyboard focus

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Modify: `src/layouts/BaseLayout.astro:59-64`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: existing `href="#main"` skip link.
- Produces: programmatically focusable `<main id="main" tabindex="-1">`.

- [ ] **Step 1: Append the failing focus-target test**

```js
test('skip-link target is programmatically focusable', async () => {
  const layout = await source('src/layouts/BaseLayout.astro');

  assert.match(layout, /<main\s+id="main"\s+tabindex="-1"/);
});
```

- [ ] **Step 2: Verify RED**

```powershell
node --test --test-name-pattern="skip-link target" scripts/tests/gate1-regression.test.mjs
```

Expected: failure because `<main>` has no `tabindex`.

- [ ] **Step 3: Add the focusability contract**

Change the opening main element to:

```astro
<main id="main" tabindex="-1" class="pt-16 md:pt-[4.5rem]">
```

- [ ] **Step 4: Verify GREEN**

```powershell
npm run test:gate1
```

Expected: `3` tests passed, `0` failed.

- [ ] **Step 5: Commit the accessibility fix**

```powershell
git add scripts/tests/gate1-regression.test.mjs src/layouts/BaseLayout.astro
git commit -m "fix: focus main content from skip link"
```

### Task 4: Preload the actual Arabic-homepage LCP font

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Modify: `src/layouts/BaseLayout.astro:43-45`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: `spaceGrotesk700Url`, `cairo400Url`, and `inter400Url` already imported by `BaseLayout.astro`.
- Produces: AR preloads `[spaceGrotesk700Url, cairo400Url]`; EN preloads remain `[spaceGrotesk700Url, inter400Url]`.

- [ ] **Step 1: Append the failing bilingual-preload test**

```js
test('Arabic pages preload the brand H1 and Arabic body fonts', async () => {
  const layout = await source('src/layouts/BaseLayout.astro');

  assert.match(layout, /\?\s*\[spaceGrotesk700Url,\s*cairo400Url\]/);
  assert.match(layout, /:\s*\[spaceGrotesk700Url,\s*inter400Url\]/);
});
```

- [ ] **Step 2: Verify RED**

```powershell
node --test --test-name-pattern="Arabic pages preload" scripts/tests/gate1-regression.test.mjs
```

Expected: failure because the Arabic branch contains only `cairo400Url`.

- [ ] **Step 3: Correct the preload list and its comment**

Use:

```astro
// Preload the fonts used above the fold. The Arabic homepage keeps the
// English Space Grotesk brand H1 and uses Cairo for its Arabic body copy.
const preloads =
  lang === 'ar'
    ? [spaceGrotesk700Url, cairo400Url]
    : [spaceGrotesk700Url, inter400Url];
```

- [ ] **Step 4: Verify GREEN**

```powershell
npm run test:gate1
```

Expected: `4` tests passed, `0` failed.

- [ ] **Step 5: Commit the font fix**

```powershell
git add scripts/tests/gate1-regression.test.mjs src/layouts/BaseLayout.astro
git commit -m "fix: preload Arabic homepage LCP font"
```

### Task 5: Centralize component alpha colors

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Modify: `src/styles/global.css:6-20`
- Modify: `src/components/Footer.astro:50-58`
- Modify: `src/components/WhatsAppFloat.astro:32-55`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: the existing `@theme` color namespace.
- Produces: `--color-text-faint`, `--color-orange-pulse-50`, `--color-orange-pulse-45`, and `--color-orange-clear`.

- [ ] **Step 1: Append the failing token-centralization test**

```js
test('component alpha colors come from the token file', async () => {
  const [css, footer, whatsapp] = await Promise.all([
    source('src/styles/global.css'),
    source('src/components/Footer.astro'),
    source('src/components/WhatsAppFloat.astro'),
  ]);

  assert.match(css, /--color-text-faint:\s*rgb\(247 245 242 \/ 0\.08\);/);
  assert.match(css, /--color-orange-pulse-50:\s*rgb\(242 110 36 \/ 0\.5\);/);
  assert.match(css, /--color-orange-pulse-45:\s*rgb\(242 110 36 \/ 0\.45\);/);
  assert.match(css, /--color-orange-clear:\s*rgb\(242 110 36 \/ 0\);/);
  assert.doesNotMatch(footer, /rgba\(247, 245, 242/);
  assert.doesNotMatch(whatsapp, /rgba\(242, 110, 36/);
});
```

- [ ] **Step 2: Verify RED**

```powershell
node --test --test-name-pattern="component alpha colors" scripts/tests/gate1-regression.test.mjs
```

Expected: failure because the tokens are absent and component literals remain.

- [ ] **Step 3: Add the four alpha tokens**

Add inside `@theme` after `--color-text` and `--color-muted`:

```css
--color-text-faint: rgb(247 245 242 / 0.08);
--color-orange-pulse-50: rgb(242 110 36 / 0.5);
--color-orange-pulse-45: rgb(242 110 36 / 0.45);
--color-orange-clear: rgb(242 110 36 / 0);
```

- [ ] **Step 4: Replace the component paint literals**

In `Footer.astro`:

```astro
fill="var(--color-text-faint)"
```

In `WhatsAppFloat.astro`, use:

```css
box-shadow: 0 0 0 0 var(--color-orange-pulse-50);
```

for the base rule, then:

```css
box-shadow: 0 0 0 0 var(--color-orange-pulse-45);
```

at `0%`, and `var(--color-orange-clear)` for the `70%` and `100%` shadow colors.

- [ ] **Step 5: Verify GREEN and build CSS processing**

```powershell
npm run test:gate1
npm run build
```

Expected: `5` tests passed, `0` failed; Astro build exits `0` with no Astro/Vite warnings.

- [ ] **Step 6: Commit the token fix**

```powershell
git add scripts/tests/gate1-regression.test.mjs src/styles/global.css src/components/Footer.astro src/components/WhatsAppFloat.astro
git commit -m "fix: centralize component alpha colors"
```

### Task 6: Create real owner asset swap slots

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Create: `src/assets/clients/README.md`
- Create: `src/assets/founder/README.md`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: the asset paths documented by `BUILD_NOTES.md`.
- Produces: committed, owner-readable client-logo and founder-photo slots.

- [ ] **Step 1: Extend the filesystem import and append the failing slot test**

Change the test-file import to:

```js
import { readFile, stat } from 'node:fs/promises';
```

Append:

```js
test('owner asset swap slots exist and reject fabricated assets', async () => {
  const paths = ['src/assets/clients/README.md', 'src/assets/founder/README.md'];

  for (const relativePath of paths) {
    const entry = await stat(new URL(relativePath, projectRoot));
    assert.equal(entry.isFile(), true);
  }

  const clients = await source(paths[0]);
  const founder = await source(paths[1]);
  assert.match(clients, /owner-approved real client logos/i);
  assert.match(clients, /Do not add generated or reconstructed logos/i);
  assert.match(founder, /real photo supplied by Mohamed Abdou/i);
  assert.match(founder, /Do not add stock or AI-generated people/i);
});
```

- [ ] **Step 2: Verify RED**

```powershell
node --test --test-name-pattern="owner asset swap slots" scripts/tests/gate1-regression.test.mjs
```

Expected: failure with `ENOENT` because both directories/files are absent.

- [ ] **Step 3: Create the client logo slot**

Create `src/assets/clients/README.md`:

```markdown
# Client logo assets

Place only the five owner-approved real client logos in this directory. Prefer SVG; use a transparent PNG only when an SVG is unavailable.

Do not add generated or reconstructed logos. Until official files arrive, the homepage must keep the approved text-name treatment documented in `BUILD_NOTES.md`.
```

- [ ] **Step 4: Create the founder photo slot**

Create `src/assets/founder/README.md`:

```markdown
# Founder photo asset

Place the real photo supplied by Mohamed Abdou in this directory, then replace the line-art panel through the single swap described in `BUILD_NOTES.md`.

Do not add stock or AI-generated people. The current on-brand line-art panel remains the approved fallback until the real photo arrives.
```

- [ ] **Step 5: Verify GREEN**

```powershell
npm run test:gate1
```

Expected: `6` tests passed, `0` failed.

- [ ] **Step 6: Commit the asset slots**

```powershell
git add scripts/tests/gate1-regression.test.mjs src/assets/clients/README.md src/assets/founder/README.md
git commit -m "docs: add owner asset swap slots"
```

### Task 7: Correct the QA evidence after fresh verification

**Files:**
- Modify: `scripts/tests/gate1-regression.test.mjs`
- Modify: `BUILD_NOTES.md:69-123`
- Test: `scripts/tests/gate1-regression.test.mjs`

**Interfaces:**
- Consumes: fresh build, route, Playwright, preload, and regression outputs from Tasks 1-6.
- Produces: accurately labeled historical Lighthouse evidence plus a new GATE 1 remediation verification section.

- [ ] **Step 1: Append the failing QA-accuracy test**

```js
test('BUILD_NOTES labels historical Arabic evidence and current remediation accurately', async () => {
  const notes = await source('BUILD_NOTES.md');

  assert.match(notes, /Historical Lighthouse 12[\s\S]*`\/ar` was measured; this did not verify canonical `\/ar\/`/);
  assert.match(notes, /GATE 1 remediation verification \(2026-07-17\)/);
  assert.doesNotMatch(notes, /verified in built HTML on 8 sampled pages — always/);
});
```

- [ ] **Step 2: Verify RED**

```powershell
node --test --test-name-pattern="BUILD_NOTES labels" scripts/tests/gate1-regression.test.mjs
```

Expected: failure because the historical table is labeled `/ar/` and the invalid blanket switcher claim remains.

- [ ] **Step 3: Generate fresh prerequisite evidence before editing the notes**

Run:

```powershell
npm run test:gate1
npm run build
```

At this point, exactly the QA-notes test is expected to fail; the build must exit `0`. Then start preview:

```powershell
npm run preview -- --host 127.0.0.1 --port 4321
```

In a second terminal:

```powershell
curl.exe -s -o NUL -w "/ -> HTTP %{http_code}`n" http://127.0.0.1:4321/
curl.exe -s -o NUL -w "/ar/ -> HTTP %{http_code}`n" http://127.0.0.1:4321/ar/
```

Required output:

```text
/ -> HTTP 200
/ar/ -> HTTP 200
```

Complete the Playwright checks from Task 8 before writing the new evidence paragraph. Do not edit `BUILD_NOTES.md` if any required browser check fails.

- [ ] **Step 4: Replace the misleading Lighthouse heading and switcher claim**

Change the Lighthouse heading and note to:

```markdown
**Historical Lighthouse 12, mobile emulation, local `npm run preview`
(reports committed under `reports/`; `/ar` was measured; this did not verify canonical `/ar/`):**
```

Keep the historical scores and LCP explanation unchanged. Replace the old language-switcher paragraph with:

```markdown
**GATE 1 remediation verification (2026-07-17):**

- `npm run test:gate1` passed all 7 regression checks.
- `npm run build` completed successfully and generated 25 static pages.
- Production preview returned HTTP 200 for `/` and canonical `/ar/`; clicking the rendered EN language switcher reached `/ar/` with Arabic content.
- At 390 CSS px in both languages, the desktop WhatsApp CTA was hidden and the mobile-menu button remained inside the viewport.
- Activating the skip link moved keyboard focus to `main#main`.
- The Arabic homepage preloaded Space Grotesk 700 for the brand H1 and Cairo Arabic 400 for Arabic body copy.
```

- [ ] **Step 5: Verify GREEN**

```powershell
npm run test:gate1
```

Expected: `7` tests passed, `0` failed.

- [ ] **Step 6: Commit the corrected QA record**

```powershell
git add scripts/tests/gate1-regression.test.mjs BUILD_NOTES.md
git commit -m "docs: record verified gate 1 remediation"
```

### Task 8: Run complete production and browser verification

**Files:**
- Verify only: all files changed in Tasks 1-7
- Preserve: `REVIEW_GATE1.md`

**Interfaces:**
- Consumes: `npm run test:gate1`, production `dist/`, and the Playwright CLI wrapper.
- Produces: fresh completion evidence suitable for an independent GATE 1 re-review.

- [ ] **Step 1: Run automated regression and production build**

```powershell
npm run test:gate1
npm run build
```

Required: `7` tests pass; build exits `0`; no Astro/Vite errors or warnings.

- [ ] **Step 2: Run the mandatory GATE 1 scan toolkit**

Use Git Bash with Git Unix tools on `PATH`:

```bash
export PATH="/c/Program Files/Git/usr/bin:$PATH"
grep -rn "567249440" src/ dist/ ; grep -rni "lorem" src/ dist/
grep -rn "971565799505\|info@pyramedia" src/ --include="*.astro" --include="*.ts" --include="*.tsx" | grep -v "site.ts\|company.ts"
grep -rnE "\b(ml-|mr-|pl-|pr-|left-[0-9]|right-[0-9]|text-left|text-right)" src/
grep -rniE "counter|countup|count-up" src/
grep -rniE "AI-powered|AI-first|AI agency|Initializing" src/ dist/
find dist -name "*.js" -exec gzip -k {} \; && du -cb $(find dist -name "*.js.gz") | tail -1
```

Required: every grep produces no matches; total gzip bytes are at or below `184320`.

- [ ] **Step 3: Start production preview and verify HTTP routes**

```powershell
npm run preview -- --host 127.0.0.1 --port 4321
```

In another terminal:

```powershell
curl.exe -s -o NUL -w "/ -> HTTP %{http_code}`n" http://127.0.0.1:4321/
curl.exe -s -o NUL -w "/ar/ -> HTTP %{http_code}`n" http://127.0.0.1:4321/ar/
curl.exe -s -o NUL -w "/ar -> HTTP %{http_code}`n" http://127.0.0.1:4321/ar
```

Required: all three return HTTP 200 in preview; Apache remains responsible for redirecting live `/ar` to canonical `/ar/`.

- [ ] **Step 4: Verify language switching, mobile bounds, RTL, and focus with Playwright**

Set the wrapper path in Git Bash:

```bash
export PATH="/c/Program Files/nodejs:/c/Program Files/Git/usr/bin:$PATH"
PWCLI="/c/Users/engmo/.codex/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" -s=gate1fix open http://127.0.0.1:4321/ --headed
"$PWCLI" -s=gate1fix localstorage-set pyx-consent declined
"$PWCLI" -s=gate1fix resize 390 844
"$PWCLI" -s=gate1fix eval "() => { const a=document.querySelector('[data-lang-switch]'); const href=a?.getAttribute('href'); a?.click(); return href; }"
"$PWCLI" -s=gate1fix snapshot
```

Required: evaluated href is `/ar/`; the next snapshot shows Arabic homepage title/content at `/ar/`, not a 404.

Measure mobile bounds on `/ar/`:

```bash
"$PWCLI" -s=gate1fix eval "() => { const e=document.querySelector('[data-menu-toggle]'); const r=e.getBoundingClientRect(); const c=document.querySelector('[data-placement=nav]'); return {dir:document.documentElement.dir, menu:{left:r.left,right:r.right,width:r.width}, desktopCtaDisplay:getComputedStyle(c).display, viewport:innerWidth}; }"
```

Required: `dir` is `rtl`; menu `left >= 0`; menu `right <= viewport`; desktop CTA display is `none`.

Return to English and verify focus:

```bash
"$PWCLI" -s=gate1fix goto http://127.0.0.1:4321/
"$PWCLI" -s=gate1fix press Tab
"$PWCLI" -s=gate1fix press Enter
"$PWCLI" -s=gate1fix eval "() => ({hash:location.hash,activeTag:document.activeElement?.tagName,activeId:document.activeElement?.id})"
```

Required:

```json
{"hash":"#main","activeTag":"MAIN","activeId":"main"}
```

Inspect RTL mirroring and preloads:

```bash
"$PWCLI" -s=gate1fix goto http://127.0.0.1:4321/ar/
"$PWCLI" -s=gate1fix eval "() => ({dir:document.documentElement.dir,floatLeft:getComputedStyle(document.querySelector('.wa-float')).left,marqueeDirection:getComputedStyle(document.querySelector('.marquee-track')).animationDirection,cardArrowTransform:getComputedStyle(document.querySelector('.card-arrow')).transform,preloads:[...document.querySelectorAll('link[rel=preload][as=font]')].map(x=>x.getAttribute('href'))})"
"$PWCLI" -s=gate1fix close
```

Required: `dir="rtl"`; float is positioned from the left; marquee direction is `reverse`; card arrow transform contains horizontal mirroring; preload URLs include Space Grotesk 700 and Cairo Arabic 400.

- [ ] **Step 5: Verify repository scope and formatting**

```powershell
git diff --check HEAD~7..HEAD
git status --short
git log -8 --oneline
```

Required: no whitespace errors; only the pre-existing untracked `.claude/settings.local.json` and independent `REVIEW_GATE1.md` remain; the seven remediation commits are present after the design/plan commits.

- [ ] **Step 6: Request independent GATE 1 re-review**

Use the exact owner prompt from `REVIEWER.md` for GATE 1. The re-review must classify G1-001 through G1-007 as `FIXED`, `STILL OPEN`, or `REGRESSED` with fresh evidence before the gate can be declared PASS.
