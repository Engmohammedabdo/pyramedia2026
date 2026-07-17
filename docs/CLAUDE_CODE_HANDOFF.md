# Claude Code handoff — PyramediaX website

- **Handoff date:** 2026-07-17
- **Verified implementation baseline:** `b8fd840abbb3` on local `main`
- **Current release status:** GATE 1 passed locally; no push or deployment was
  performed or verified during the remediation session, and external state is
  unverified.
- **Next default boundary:** execute Muhammad's explicit authorized task. If no
  next task is stated, recommend the highest-value boundary among GATE 2,
  GATE 3, owner inputs, production integration, or deployment verification.

This document transfers the current operational state to Claude Code. It is a
snapshot, not a substitute for `SPEC.md`. If code, reports, or Git state have
changed since the handoff date, re-run the verification commands below before
relying on this snapshot.

The PASS applies to the implementation tree verified at `b8fd840abbb3`. The
seven automated regression tests protect the seven repaired failures; they do
not repeat the entire independent GATE 1 content, claims, RTL, design, and
browser audit. Any later source, content, configuration, or dependency change
must be assessed for GATE 1 impact and may require a fresh scope-appropriate
independent review in addition to tests and build.

## 1. Executive state

- The project is an Astro 5 static bilingual marketing site: English at `/` and
  Arabic at canonical `/ar/`.
- The independent GATE 1 re-review verdict is **PASS**: 7 fixed, 0 open,
  0 regressed, and 0 new findings.
- The verified baseline builds 25 static pages and passes all 7 GATE 1 regression
  tests.
- Fresh production-preview checks returned HTTP 200 for `/` and `/ar/`, and the
  rendered EN language switcher reached Arabic content at `/ar/`.
- GATE 1 approval is not a whole-site launch approval. Live Apache behavior,
  GATE 2, GATE 3, production integrations, real devices, and owner inputs remain
  outside the completed boundary.

## 2. GATE 1 resolution ledger

| Finding | Final status | Locked resolution |
|---|---|---|
| G1-001 canonical Arabic preview route | Fixed | Keep static `build.format: 'file'` and `trailingSlash: 'ignore'`; `/ar/` must work in production preview. |
| G1-002 mobile navigation collision | Fixed | The desktop WhatsApp CTA remains inside the responsive `hidden sm:block` wrapper; verify the wrapper's rendered visibility, not only the child anchor's computed `display`. |
| G1-003 skip-link focus | Fixed | Keep `<main id="main" tabindex="-1">` so keyboard activation transfers focus to the main content. |
| G1-004 Arabic LCP fonts | Fixed | Arabic pages preload Space Grotesk 700 for the English brand H1 and Cairo Arabic 400 for body copy. |
| G1-005 inaccurate QA evidence | Fixed | Historical Lighthouse evidence is explicitly historical and did not prove canonical `/ar/`; do not restore broader claims. |
| G1-006 component alpha colors | Fixed | Component alpha paint values use tokens centralized in `src/styles/global.css`. |
| G1-007 missing owner asset slots | Fixed | Preserve `src/assets/clients/README.md` and `src/assets/founder/README.md`; only approved real assets may replace placeholders. |

Do not reopen these decisions because of preference alone. A change needs new
evidence, SPEC compatibility, regression coverage, and Muhammad's approval.

## 3. Verified evidence at the baseline

The final local verification recorded the following:

```text
npm.cmd run test:gate1  -> 7 tests, 7 passed, 0 failed
npm.cmd run build       -> exit 0, 25 pages, no Astro/Vite warnings
GET /                   -> HTTP 200
GET /ar/                -> HTTP 200
Total JavaScript        -> 92,010 gzip bytes (budget <= 180 KiB)
Independent verdict     -> PASS; 7 fixed, 0 open, 0 regressed, 0 new
```

Browser evidence covered EN and AR at 320, 375, and 390 CSS px. In every case,
the mobile-menu control stayed inside the viewport, there was no horizontal
document overflow, and the desktop CTA wrapper was hidden. Keyboard checks
confirmed skip-link focus, Enter-to-open mobile navigation, and Escape-to-close.
Fresh RTL checks confirmed Arabic direction, logical placement, phone isolation,
mirrored arrows/marquee behavior, and the correct font preloads.

The full independent evidence is in `REVIEW_GATE1_REREVIEW.md`. Its reviewed
implementation commit is earlier than this handoff baseline because the later
commits only completed/corrected the review evidence and regression notes.

## 4. Commands for a receiving session

Run from the repository root:

```powershell
git status --short --branch
git rev-parse --short=12 HEAD
git remote -v
git branch -vv
node --version
npm.cmd run test:gate1
npm.cmd run build
git diff --check
```

Expected Node major version: 22. To inspect the built site:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4321
```

Then check both `http://127.0.0.1:4321/` and
`http://127.0.0.1:4321/ar/`. A preview process was running at handoff time, but
that is transient state; detect the listener or start a fresh process instead of
assuming it survived.

If the receiving environment enforces a sandbox and the build fails only with
an esbuild directory-read/permission error, obtain Muhammad's approval when the
environment requires it, then re-run with only the narrow build permission
needed. Do not classify that denial as an application defect without reproducing
it outside the sandbox.

## 5. High-value code and evidence map

| Area | Primary files |
|---|---|
| Product and allowed claims | `SPEC.md` |
| Content/contact editing map | `README.md`, `src/config/site.ts`, `src/content/`, `src/i18n/` |
| Current placeholders and decisions | `BUILD_NOTES.md` |
| Static routing and integrations | `astro.config.mjs`, `public/.htaccess` |
| GATE 1 navigation fix | `src/components/Nav.astro` |
| Skip target and font preloads | `src/layouts/BaseLayout.astro` |
| Design tokens | `src/styles/global.css` |
| Token consumers | `src/components/Footer.astro`, `src/components/WhatsAppFloat.astro` |
| Approved asset drop locations | `src/assets/clients/`, `src/assets/founder/` |
| Automated regression guard | `scripts/tests/gate1-regression.test.mjs`, `package.json` |
| Independent final evidence | `REVIEW_GATE1_REREVIEW.md` |
| Historical completed GATE 1 remediation design/plan | `docs/superpowers/specs/2026-07-17-gate1-remediation-design.md`, `docs/superpowers/plans/2026-07-17-gate1-remediation.md` |
| Build/deploy pipeline | `.github/workflows/deploy.yml` |

## 6. Git and local-state boundary

At the verified baseline:

- Branch: local `main` at `b8fd840abbb3`.
- No Git remote or upstream is configured in this checkout.
- The remediation session did not perform or verify a push or deployment.
  External repositories, manual uploads, DNS, and live-host state were not
  inspected, so their state must be treated as unverified rather than absent.
- `.claude/settings.local.json` and `REVIEW_GATE1.md` were pre-existing,
  user-owned untracked files. Do not delete, overwrite, stage, or commit them
  unless Muhammad explicitly requests it.
- A receiving agent must inspect fresh Git status. Do not assume only the above
  files remain untracked after this document is created.

## 7. Owner inputs still required

The current fallbacks are intentional and GATE 1-compliant, but these inputs are
still required before the corresponding production functionality is complete:

1. Real founder photo.
2. Five approved client logo files.
3. Exact bilingual office address and Google Maps embed URL.
4. Production n8n webhook URL.
5. GA4 and Meta Pixel IDs.
6. Bluehost/FTPS credentials and, if needed, the site-root variable.

Follow the exact swap procedures in `BUILD_NOTES.md`. Do not create plausible
substitutes. Three client names remain in official Latin form on Arabic pages
until the owner supplies approved Arabic brand renderings. The Arabic legal name
is a documented transliteration and must be checked against the trade license
when the owner supplies it.

Other completed decisions recorded in `BUILD_NOTES.md` must not be silently
redesigned:

- Spam protection is the `website` honeypot plus a 4-second minimum-time-on-page
  check; bot-like submissions receive silent success and are not sent.
- The current legal-page update date is 2026-07-17.
- The site mark uses the authentic geometry from the supplied official logo
  files. Do not restore the source asset's misspelled English sub-line.
- The SPEC color tokens win over the one-step rounding difference in the logo
  source files.

## 8. Remaining quality and release work

### GATE 2 and GATE 3

The following are not completed merely because GATE 1 passed:

- fresh required Lighthouse/performance runs at their applicable gate;
- reduced-motion and complete motion-cleanup verification;
- all-page responsive, SEO, structured-data, form, analytics-consent, and
  integration verification;
- iPhone Safari and Android Chrome checks;
- GATE 3 validation of release budgets, the existing CI/CD workflow, and the
  launch checklist.

Preserve these motion/performance constraints while completing GATE 2:

- Animate only `transform`, `opacity`, and SVG stroke properties.
- Keep at most one pinned section site-wide: the methodology section.
- Keep the hero H1 visible before JavaScript runs.
- `prefers-reduced-motion: reduce` must disable all non-essential motion,
  including marquee movement and delayed reveals.
- Keep total JavaScript at or below 180 KiB gzip.

Read the active gate in `SPEC.md` and apply `REVIEWER.md` only if Muhammad asks
for an independent review. Do not promote historical Lighthouse reports into
fresh evidence.

### Live deployment boundary

The local Astro preview cannot verify Bluehost/Apache behavior. After an
authorized deployment, the owner or receiving agent must:

1. Verify every SPEC §5.1 legacy URL with `curl -I` and `curl -L -I`.
2. Verify HTTP-to-HTTPS and www-to-non-www canonicalization.
3. Verify `.htaccess` security, cache, and compression headers.
4. Verify the bilingual `ErrorDocument 404` on the live host.
5. Open live `/`, use the rendered language switcher, and confirm final `/ar/`
   Arabic content.
6. Smoke-test consent, analytics, webhook/form delivery, and real-device UI with
   the production configuration.

The GitHub workflow builds and uploads an artifact on pushes to `main` and on a
manual `workflow_dispatch` run. FTPS is skipped if any one of its three required
secrets is absent. Because this checkout has no remote, configure/confirm the
real repository and obtain explicit authorization before any push or deployment.

The clean review install reported the transitive `tsconfck` deprecation warning
and `npm audit` reported 3 dependency vulnerabilities (2 low, 1 high). They were
not GATE 1 findings because the SPEC defines no GATE 1 audit budget and the
production build was warning-free. Re-run and assess the current dependency
audit before the GATE 3 launch decision; do not assume this dated snapshot is
still current.

## 9. Do / do not

**Do**

- Ground every claim in `SPEC.md` or owner-provided evidence.
- Keep EN/AR changes paired and review Arabic as native RTL content.
- Add regression coverage for any repaired behavior.
- Update `BUILD_NOTES.md` when an assumption, placeholder, or QA boundary changes.
- Report the exact local, CI, staging, or live boundary of every verification.

**Do not**

- Do not claim the site is launch-ready from the GATE 1 PASS.
- Do not fabricate metrics, testimonials, awards, clients, people, addresses,
  translations, logos, or integration success.
- Do not replace the canonical `/ar/` contract or the Apache static-file model
  without explicit approval and a new design decision.
- Do not edit the independent review report to make an implementation look
  successful; create a new review record when a new review is commissioned.
- Do not stage the two user-owned untracked files named above.
- Do not push, deploy, send real leads, or configure analytics without explicit
  authorization and a clearly stated external destination.

## 10. Recommended first response from Claude Code

If Muhammad has not already supplied a clear next task, then after reading the
required files and checking Git state, Claude Code should briefly tell him:

1. the actual branch/HEAD and whether it matches or descends only by handoff
   documentation from the verified baseline;
2. whether the GATE 1 tests/build still pass;
3. that GATE 1 passed for the verified baseline and the site is not yet
   launch-approved;
4. which single next boundary Muhammad wants: GATE 2, owner inputs, production
   integration, or deployment/live verification;
5. a recommendation based on current evidence, without reopening locked GATE 1
   decisions.

If Muhammad has already supplied a clear authorized task, do not ask him to
choose a boundary again. Confirm the evidence and assumptions needed for that
task, then execute it within scope while preserving the verified baseline.
