# PyramediaX Engagement Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn pyramedia.info from a brochure into a qualification machine by adding five features the visitor can *use*, each one demonstrating a capability PyramediaX actually sells.

**Architecture:** The site is static Astro on shared Apache — there is no backend and none is being added. Every dynamic feature is a browser `fetch` to an n8n webhook on `n8n.pyramedia.info`, exactly the pattern the contact form already proves in production. The first n8n-consuming part extracts that inline logic into one shared client module; the rest reuse it. Two features (Parts A and B) need no network at all and ship first.

**Tech Stack:** Astro 5 (`output: 'static'`, `build.format: 'file'`), Tailwind v4 with `@theme` tokens, TypeScript, n8n (webhook → nodes → Respond to Webhook), Airtable (base `appVJGpxA8KzwVjPY`), Gemini via n8n AI Agent, Google PageSpeed Insights API, Apify (Instagram scraping).

---

## Global Constraints

Every task's requirements implicitly include this section.

- **SPEC §2.1 zero fabrication.** No invented numbers, statistics, counters, client results, testimonials, awards, or "years of experience". Only §4 approved facts may be published. A *measurement of the visitor's own property* (their PageSpeed score, their posting cadence) is not a claim about PyramediaX and is permitted. A *live reading of PyramediaX's own systems* is a fact, not a claim, and is permitted. Anything else needs owner approval first.
- **SPEC §2.3.** The banned legacy number `567249440` must never appear in `src/`, `dist/`, or public output.
- **SPEC §2.4.** Arabic is native content, never machine-translated. Every user-facing string ships in both `src/i18n/en.ts` and `src/i18n/ar.ts`. The tagline "Less Talk. More Performance." stays English in both.
- **SPEC §8 motion laws.** Animate `transform`/`opacity`/SVG-stroke only. Never transition `border-color`, `background-color`, `box-shadow`, `width`, `height`, or `top/left`. Everything must collapse under `prefers-reduced-motion: reduce`. There is exactly ONE pinned section on the site (homepage methodology) — do not add another.
- **SPEC §12 budgets.** No layout shift: every async panel reserves its space before it fills. New JavaScript loads lazily, never render-blocking, and never on first paint.
- **RTL.** Use logical CSS properties (`padding-inline`, `inset-inline-start`, `margin-block`) and logical Tailwind utilities (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`). Never `pl-`, `pr-`, `left-`, `right-`.
- **Config single source.** Contact data, URLs and IDs live only in `src/config/site.ts`. Page copy lives in `src/content/`. UI strings live in `src/i18n/`. Never hardcode any of them in a component.
- **Fail safe.** Every feature that depends on an env var must degrade to a working state when that var is empty — the way the contact form falls back to WhatsApp. A missing config value never renders a dead control.
- **Gates.** `npm.cmd run typecheck`, `npm.cmd run test:gate1` (7 tests) and `npm.cmd run test:gate2` (60 tests) must all pass before every commit. Add new tests to `scripts/tests/gate2-regression.test.mjs`; never weaken an existing one.
- **Windows.** Use `npm.cmd`, not `npm`.
- **Privacy.** Any feature that sends visitor input to a third party must be disclosed in `src/content/pages/en/privacy.mdx` AND `src/content/pages/ar/privacy.mdx`, and `lastUpdated` must be bumped in the same change.

## Owner Inputs Required

**Blocking — the part cannot ship without it:**

| Input | Blocks | Why |
| --- | --- | --- |
| Playbook content (both languages) | Part C | §2.1 — cannot be written by the agency's tooling without owner-approved substance |
| Approved answer set for the assistant | Part E | §2.1 — the model must be fenced to facts the owner has approved |

**Non-blocking — a documented default is used until supplied:**

| Input | Part | Default until supplied |
| --- | --- | --- |
| Apify Instagram actor budget | Part D | Instagram audit disabled; website audit ships alone |
| PageSpeed API key | Part D | Keyless quota (rate-limited, adequate for launch traffic) |

---

# PART A — Live Speed Proof (Feature 9)

Smallest feature, ships alone, no network. Makes "Less Talk. More Performance." literal on the one page where speed *is* the product.

### Task 1: Speed proof widget

**Files:**
- Create: `src/components/SpeedProof.astro`
- Modify: `src/i18n/en.ts` (add `speed` block), `src/i18n/ar.ts` (add `speed` block)
- Modify: `src/components/pages/ServicePage.astro` (render for `web-development` only)
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `<SpeedProof lang={lang} />`, an Astro component taking a single `lang: Lang` prop.

- [ ] **Step 1: Write the failing test**

Append to `scripts/tests/gate2-regression.test.mjs`:

```js
test('speed proof reports a real measurement and cannot shift layout', async () => {
  const [component, servicePage, en, ar] = await Promise.all([
    source('src/components/SpeedProof.astro'),
    source('src/components/pages/ServicePage.astro'),
    source('src/i18n/en.ts'),
    source('src/i18n/ar.ts'),
  ]);

  // The number must come from the Navigation Timing API — never a constant.
  assert.match(component, /performance\.getEntriesByType\('navigation'\)/);
  assert.doesNotMatch(component, /\b(0\.\d|[0-9]{2,4})\s*(ms|s)\b/, 'no hardcoded timing may ship (§2.1)');

  // Space is reserved before the number arrives, so it cannot cause CLS (§12).
  assert.match(component, /min-block-size:/);

  // Only the web-development service shows it.
  assert.match(servicePage, /s\.slug === 'web-development' && <SpeedProof/);

  for (const dict of [en, ar]) {
    assert.match(dict, /speed: \{/, 'both dictionaries need the speed block');
    assert.match(dict, /measuredNow:/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` reading `src/components/SpeedProof.astro`.

- [ ] **Step 3: Add the dictionary strings**

In `src/i18n/en.ts`, insert before `service: {`:

```ts
  speed: {
    eyebrow: 'Measured, not claimed',
    label: 'This page finished loading in',
    unit: 'seconds',
    measuredNow: 'Measured in your browser, on this visit.',
    prompt: 'How long does yours take?',
  },
```

In `src/i18n/ar.ts`, insert before `service: {`:

```ts
  speed: {
    eyebrow: 'قياس، لا ادعاء',
    label: 'هذه الصفحة اكتمل تحميلها في',
    unit: 'ثانية',
    measuredNow: 'قياس تم في متصفحك أنت، في هذه الزيارة.',
    prompt: 'وموقعك، كم يستغرق؟',
  },
```

- [ ] **Step 4: Create the component**

Create `src/components/SpeedProof.astro`:

```astro
---
/**
 * Live page-load proof (Feature 9). The number is read from this visitor's
 * own Navigation Timing entry — it is a measurement, never a stored claim,
 * so §2.1 is satisfied by construction.
 *
 * The slot is sized before the number exists, so filling it cannot shift
 * layout (§12). No motion is used: a number appearing is enough.
 */
import type { Lang } from '@/config/site';
import { useTranslations } from '@/i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
---

<aside class="mt-10 rounded-2xl border border-line bg-surface/40 p-6" data-speed-proof>
  <p class="eyebrow">{t.speed.eyebrow}</p>
  <p class="mt-3 text-lg text-text/90">
    {t.speed.label}
    <span
      class="font-display mx-2 font-bold text-orange"
      style="min-block-size: 1.6em; display: inline-block; min-inline-size: 3.5ch;"
      data-speed-value
      dir="ltr">—</span
    >
    {t.speed.unit}
  </p>
  <p class="mt-2 text-sm text-muted">{t.speed.measuredNow}</p>
  <p class="mt-1 text-sm font-semibold text-text/80">{t.speed.prompt}</p>
</aside>

<script>
  function paintSpeed() {
    const slot = document.querySelector<HTMLElement>('[data-speed-value]');
    if (!slot || slot.dataset.filled === 'true') return;

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;

    // loadEventEnd is 0 until the load event has actually fired.
    const finish = () => {
      const ms = nav.loadEventEnd - nav.startTime;
      if (ms <= 0) return;
      slot.textContent = (ms / 1000).toFixed(2);
      slot.dataset.filled = 'true';
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', () => requestAnimationFrame(finish), { once: true });
  }

  paintSpeed();
  document.addEventListener('astro:page-load', paintSpeed);
</script>
```

- [ ] **Step 5: Render it on the web-development page only**

In `src/components/pages/ServicePage.astro`, add the import beside the others:

```astro
import SpeedProof from '@/components/SpeedProof.astro';
```

Then directly after the closing `</ol>` of the "How it runs" section, add:

```astro
  {s.slug === 'web-development' && <SpeedProof lang={lang} />}
```

- [ ] **Step 6: Run the gates**

Run: `npm.cmd run typecheck && npm.cmd run test:gate1 && npm.cmd run test:gate2 && npm.cmd run build`
Expected: typecheck clean, 7/7, 61/61, 25 pages built.

- [ ] **Step 7: Verify in the browser**

Start the preview and open `http://localhost:4321/services/web-development.html`. Read the value:

```js
document.querySelector('[data-speed-value]').textContent
```

Expected: a number like `0.42`, not `—`. Then check `/services/seo.html` has no `[data-speed-proof]` element.

- [ ] **Step 8: Commit**

```bash
git add src/components/SpeedProof.astro src/components/pages/ServicePage.astro src/i18n scripts/tests/gate2-regression.test.mjs
git commit -m "feat: live page-speed proof on the web-development page"
```

---

# PART B — Context-Aware WhatsApp (Feature 6)

Every WhatsApp link on the site currently opens the same generic message. This makes the message carry where the visitor was. Speed-to-lead is a 21x qualification multiplier, and this removes the first two questions from every conversation.

**Design decision:** page context is known at **build time**, so the enrichment is prerendered — zero JavaScript, zero runtime cost. Only the floating button, which follows the visitor down the page, gets a small script for section-level context.

### Task 2: Context-aware `waLink`

**Files:**
- Modify: `src/config/site.ts:82-93`
- Modify: `src/components/CtaBand.astro`, `src/components/Nav.astro`, `src/components/WhatsAppFloat.astro`, `src/components/pages/HomePage.astro`, `src/components/pages/ServicePage.astro`, `src/components/pages/ContactPage.astro`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `waLink(lang: Lang, context?: string): string`. `context` is a short human-readable label already in the visitor's language, e.g. `"SEO"` / `"تحسين محركات البحث"`. Called with one argument it behaves exactly as before, so no existing call site breaks.

- [ ] **Step 1: Write the failing test**

```js
test('WhatsApp links carry where the visitor was (Feature 6)', async () => {
  const [site, service, nav, float] = await Promise.all([
    source('src/config/site.ts'),
    source('src/components/pages/ServicePage.astro'),
    source('src/components/Nav.astro'),
    source('src/components/WhatsAppFloat.astro'),
  ]);

  assert.match(site, /export function waLink\(lang: Lang = 'en', context\?: string\): string/);
  // Backwards compatible: a context-free call must still produce the plain message.
  assert.match(site, /if \(!context\) return/);

  // Service pages name the service they are on.
  assert.match(service, /waLink\(lang, s\.name\)/);
  // The nav is site-wide and stays generic — it has no single context.
  assert.match(nav, /waLink\(lang\)/);
  // The float reads its context at runtime from the section in view.
  assert.match(float, /data-wa-float/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `waLink` signature does not match.

- [ ] **Step 3: Extend `waLink`**

Replace lines 82–93 of `src/config/site.ts`:

```ts
/** Prefilled WhatsApp messages per language (SPEC §7.4, verbatim). */
export const WA_MESSAGE: Record<Lang, string> = {
  en: "Hello PyramediaX, I'd like to discuss your services.",
  ar: 'مرحباً بيراميديا إكس، حابب أستفسر عن خدماتكم.',
};

/**
 * Context-aware variant (Feature 6). `context` is a label already in the
 * visitor's language — the service they were reading, for example — so the
 * chat opens with the subject already stated and the first two questions of
 * every conversation are gone.
 */
const WA_MESSAGE_WITH_CONTEXT: Record<Lang, (context: string) => string> = {
  en: (context) => `Hello PyramediaX, I'd like to discuss ${context}.`,
  ar: (context) => `مرحباً بيراميديا إكس، حابب أستفسر عن ${context}.`,
};

/**
 * wa.me deep-link builder — the only allowed WhatsApp URL constructor.
 * Called with one argument it is byte-identical to the previous behaviour,
 * so no existing call site changes meaning.
 */
export function waLink(lang: Lang = 'en', context?: string): string {
  if (!context) return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(WA_MESSAGE[lang])}`;
  const text = WA_MESSAGE_WITH_CONTEXT[lang](context.trim());
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Plain wa.me link without a prefilled message. */
export const WA_BASE = `https://wa.me/${SITE.whatsappNumber}`;
```

- [ ] **Step 4: Pass context at the call sites that have one**

In `src/components/pages/ServicePage.astro`, change the hero WhatsApp button:

```astro
<Button href={waLink(lang, s.name)} variant="primary" event="whatsapp_click" placement={`service-${s.slug}`}>
```

In `src/components/CtaBand.astro`, add an optional prop and use it. Add to the `Props` interface:

```ts
  /** Human-readable subject already in `lang`, e.g. the service name. */
  context?: string;
```

Destructure it (`const { lang, placement, context } = Astro.props;`) and change the button:

```astro
<Button href={waLink(lang, context)} variant="primary" event="whatsapp_click" placement={placement}>
```

Then in `src/components/pages/ServicePage.astro`, pass it down:

```astro
<CtaBand lang={lang} placement={`service-${s.slug}-cta`} context={s.name} />
```

Leave `Nav.astro`, `HomePage.astro` and `ContactPage.astro` on the plain `waLink(lang)` — they are site-wide or already the contact surface, so there is no single honest context to state.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm.cmd run test:gate2`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/config/site.ts src/components scripts/tests/gate2-regression.test.mjs
git commit -m "feat: WhatsApp links carry the service the visitor was reading"
```

### Task 3: Floating button follows the section in view

**Files:**
- Modify: `src/components/WhatsAppFloat.astro`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: `waLink(lang, context)` from Task 2.
- Produces: nothing further.

- [ ] **Step 1: Write the failing test**

```js
test('the floating WhatsApp button re-targets to the section in view', async () => {
  const float = await source('src/components/WhatsAppFloat.astro');
  assert.match(float, /IntersectionObserver/);
  // Sections opt in by declaring their own label — no scraping of headings.
  assert.match(float, /data-wa-context/);
  // The base link must stay valid if no section is in view.
  assert.match(float, /dataset\.waBase/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — no `IntersectionObserver` in the component.

- [ ] **Step 3: Make the float context-aware**

In `src/components/WhatsAppFloat.astro`, add `data-wa-float` and a base-link dataset attribute to the anchor:

```astro
<a
  href={waLink(lang)}
  data-wa-float
  data-wa-base={waLink(lang)}
  data-wa-lang={lang}
  ...
```

Append this script to the same file:

```astro
<script>
  /**
   * Re-targets the floating WhatsApp button to whichever labelled section is
   * currently in view, so a chat opened from halfway down the page arrives
   * with that subject already stated. Sections opt in with data-wa-context;
   * nothing is scraped from headings, so a copy change can never leak an
   * unapproved string into the message (§2.1).
   */
  function bindWhatsAppContext() {
    const float = document.querySelector<HTMLAnchorElement>('[data-wa-float]');
    if (!float || float.dataset.bound === 'true') return;

    const sections = document.querySelectorAll<HTMLElement>('[data-wa-context]');
    if (!sections.length) return;
    float.dataset.bound = 'true';

    const base = float.dataset.waBase!;
    const lang = float.dataset.waLang === 'ar' ? 'ar' : 'en';
    const phrase = (context: string) =>
      lang === 'ar'
        ? `مرحباً بيراميديا إكس، حابب أستفسر عن ${context}.`
        : `Hello PyramediaX, I'd like to discuss ${context}.`;

    const number = new URL(base).pathname.replace('/', '');
    let active = '';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const context = (entry.target as HTMLElement).dataset.waContext ?? '';
          if (!context || context === active) continue;
          active = context;
          float.href = `https://wa.me/${number}?text=${encodeURIComponent(phrase(context))}`;
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
  }

  bindWhatsAppContext();
  document.addEventListener('astro:page-load', bindWhatsAppContext);
</script>
```

- [ ] **Step 4: Label the homepage sections**

In `src/components/pages/HomePage.astro`, add `data-wa-context` to the services grid section and the showcase strip, sourcing the label from existing approved copy:

```astro
<section class="cv-auto mx-auto max-w-6xl px-5 py-24 md:py-32" data-reveal-group data-wa-context={c.services.eyebrow}>
```

- [ ] **Step 5: Run the gates and verify live behaviour**

Run: `npm.cmd run typecheck && npm.cmd run test:gate2 && npm.cmd run build`

Then in the preview, scroll to the services grid and read:

```js
document.querySelector('[data-wa-float]').href
```

Expected: the URL's `text=` parameter now contains the services eyebrow.

- [ ] **Step 6: Commit**

```bash
git add src/components scripts/tests/gate2-regression.test.mjs
git commit -m "feat: floating WhatsApp button follows the section in view"
```

---

# PART C — Gated Playbook (Feature 8)

A genuinely useful bilingual guide, exchanged for an email plus two qualifying questions. This is the first part that talks to n8n, so it also builds the shared client every later part reuses.

**Blocking owner input:** the playbook content itself, in both languages. Everything else in this part can be built and tested against a placeholder file, but it must not go live without real content — shipping a thin lead magnet from an agency that sells content would undercut the whole positioning.

### Task 4: Shared n8n client module

**Files:**
- Create: `src/scripts/n8n-client.ts`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export interface N8nResult { ok: boolean; status: number; data: unknown }
  export function postToN8n(url: string, payload: Record<string, unknown>, timeoutMs?: number): Promise<N8nResult>
  export function collectUtm(): Record<string, string>
  ```

- [ ] **Step 1: Write the failing test**

```js
test('the shared n8n client times out, never throws, and carries campaign data', async () => {
  const client = await source('src/scripts/n8n-client.ts');

  assert.match(client, /export async function postToN8n/);
  assert.match(client, /export function collectUtm/);
  // A hung webhook must not hang the UI.
  assert.match(client, /AbortController/);
  assert.match(client, /setTimeout/);
  // Callers branch on `ok`; the client itself never throws at them.
  assert.match(client, /catch/);
  assert.match(client, /return \{ ok: false/);
  // The five §10 campaign parameters.
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    assert.match(client, new RegExp(key));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` on `src/scripts/n8n-client.ts`.

- [ ] **Step 3: Write the module**

Create `src/scripts/n8n-client.ts`:

```ts
/**
 * The site is static; every dynamic feature is a POST to an n8n webhook.
 * This is the single place that knows how to make that call, so timeout,
 * error shape and campaign capture behave identically everywhere.
 *
 * It never throws. A caller branches on `ok` and shows its own fallback —
 * the same contract the contact form already relies on in production.
 */
export interface N8nResult {
  ok: boolean;
  status: number;
  data: unknown;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function postToN8n(
  url: string,
  payload: Record<string, unknown>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<N8nResult> {
  if (!url) return { ok: false, status: 0, data: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

/** The five §10 campaign parameters, read from the current URL. */
export function collectUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:gate2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/n8n-client.ts scripts/tests/gate2-regression.test.mjs
git commit -m "feat: shared n8n client for the site's dynamic features"
```

### Task 5: n8n workflow — playbook delivery

**Files:**
- Create: n8n workflow `PyramediaX — Playbook Request`
- Create: Airtable table `Playbook Requests` in base `appVJGpxA8KzwVjPY`
- Modify: `src/config/site.ts` (add `playbookWebhookUrl`)
- Modify: `.env`, `.env.example`

**Interfaces:**
- Consumes: nothing.
- Produces: `POST https://n8n.pyramedia.info/webhook/pyramediax-playbook` accepting
  `{ name, email, lang, role, challenge, page_url, submitted_at, website, utm }`
  and returning `200 {"ok":true,"sent":true}` for every request, genuine or not.

- [ ] **Step 1: Create the Airtable table**

Use the Airtable MCP `create_table` against base `appVJGpxA8KzwVjPY`, table name `Playbook Requests`, with fields:

| Field | Type |
| --- | --- |
| Name | singleLineText |
| Email | email |
| Language | singleLineText |
| Role | singleLineText |
| Challenge | longText |
| Page URL | url |
| Submitted At | singleLineText |
| UTM Source | singleLineText |
| UTM Medium | singleLineText |
| UTM Campaign | singleLineText |

Record the returned table id; the workflow needs it.

- [ ] **Step 2: Build the workflow**

Mirror `PyramediaX — Website Contact Form` (`2OvsLp7YbJUsErM0`) exactly — it is the proven shape:

1. **Webhook** — `POST`, path `pyramediax-playbook`, `responseMode: responseNode`, options `allowedOrigins: "https://pyramedia.info,https://www.pyramedia.info,http://localhost:4321"`, `ignoreBots: true`, `authentication: "none"`.
2. **Set "Normalize Request"** — read every field as `{{ $json.body?.X ?? $json.X ?? "" }}`, exactly like the contact workflow, plus `honeypot` from `body.website`.
3. **IF "Genuine Request?"** — honeypot empty AND name notEmpty AND email notEmpty.
4. **Airtable create** → `Playbook Requests`.
5. **Gmail send** → to the visitor's email, attaching or linking the playbook PDF, `onError: continueRegularOutput` so mail failure cannot block the response.
6. **Gmail send** → internal alert to `info@pyramedia.info`, same `onError`.
7. **Respond to Webhook** on both branches → `200 {"ok":true,"sent":true}`.

> **Why both branches answer 200:** a rejected bot learns nothing from an identical response. This is the same reasoning already documented for the contact form.

- [ ] **Step 3: Wire the URL into config**

In `src/config/site.ts`, beside `n8nWebhookUrl`:

```ts
  // Playbook delivery webhook (Feature 8). Empty ⇒ the playbook page is not
  // linked anywhere and the route renders its "coming soon" state instead of
  // a form that cannot deliver.
  playbookWebhookUrl: import.meta.env.PUBLIC_N8N_PLAYBOOK_URL || '',
```

Add to `.env` and `.env.example`:

```
PUBLIC_N8N_PLAYBOOK_URL=https://n8n.pyramedia.info/webhook/pyramediax-playbook
```

- [ ] **Step 4: Verify the endpoint the way a browser does**

> **Critical:** the webhook has `ignoreBots: true`. A probe with a bot-shaped User-Agent gets `403` with a `WWW-Authenticate` header that looks exactly like a proxy auth gate. That misled this project once already and cost three weeks. Always send a real Chrome UA **and** an `Origin` header.

```bash
curl -s -X POST https://n8n.pyramedia.info/webhook/pyramediax-playbook \
  -H "Content-Type: application/json" \
  -H "Origin: https://pyramedia.info" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" \
  -d '{"name":"Probe","email":"elharm.marketing@gmail.com","lang":"en","role":"owner","challenge":"test","website":""}'
```

Expected: `{"ok":true,"sent":true}`. Then confirm the Airtable row exists and delete it.

- [ ] **Step 5: Commit**

```bash
git add src/config/site.ts .env.example
git commit -m "feat: playbook delivery webhook and config"
```

### Task 6: Playbook page

**Files:**
- Create: `src/components/pages/PlaybookPage.astro`, `src/pages/playbook.astro`, `src/pages/ar/playbook.astro`
- Create: `src/content/pages/en/playbook.json`, `src/content/pages/ar/playbook.json`
- Modify: `src/i18n/en.ts`, `src/i18n/ar.ts` (add `playbook` block)
- Modify: `src/content/pages/en/privacy.mdx`, `src/content/pages/ar/privacy.mdx`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: `postToN8n`, `collectUtm` from Task 4; `SITE.playbookWebhookUrl` from Task 5.
- Produces: routes `/playbook` and `/ar/playbook`.

- [ ] **Step 1: Write the failing test**

```js
test('the playbook page qualifies, degrades safely, and is disclosed (Feature 8)', async () => {
  const [page, site, enPrivacy, arPrivacy] = await Promise.all([
    source('src/components/pages/PlaybookPage.astro'),
    source('src/config/site.ts'),
    source('src/content/pages/en/privacy.mdx'),
    source('src/content/pages/ar/privacy.mdx'),
  ]);

  assert.match(site, /playbookWebhookUrl:/);

  // Two qualifying questions, not just an email grab.
  assert.match(page, /name="role"/);
  assert.match(page, /name="challenge"/);
  // Same honeypot the contact form uses.
  assert.match(page, /name="website"/);
  // Empty config must not render a form that cannot deliver.
  assert.match(page, /SITE\.playbookWebhookUrl/);
  // Reuses the shared client rather than a second copy of fetch logic.
  assert.match(page, /from '@\/scripts\/n8n-client'/);

  // Sending an email address to a third party must be disclosed in BOTH languages.
  assert.match(enPrivacy, /playbook/i);
  assert.match(arPrivacy, /الدليل/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` on `PlaybookPage.astro`.

- [ ] **Step 3: Add dictionary strings**

`src/i18n/en.ts`, before `service: {`:

```ts
  playbook: {
    role: 'Your role',
    roleOwner: 'Business owner',
    roleMarketing: 'Marketing lead',
    roleOther: 'Something else',
    challenge: "What's the one thing you'd fix first?",
    send: 'Send me the playbook',
    sending: 'Sending…',
    successTitle: 'Check your inbox.',
    successBody: "It's on its way. If it hasn't arrived in a few minutes, check spam.",
    errorTitle: "That didn't go through.",
    errorBody: 'Please try again — or message us on WhatsApp and we will send it directly.',
    soon: 'This guide is being finalised. Message us on WhatsApp and we will send it as soon as it is ready.',
  },
```

`src/i18n/ar.ts`, before `service: {`:

```ts
  playbook: {
    role: 'صفتك',
    roleOwner: 'صاحب النشاط',
    roleMarketing: 'مسؤول التسويق',
    roleOther: 'شيء آخر',
    challenge: 'ما أول شيء تودّ إصلاحه؟',
    send: 'أرسل لي الدليل',
    sending: 'جارٍ الإرسال…',
    successTitle: 'تحقّق من بريدك.',
    successBody: 'الدليل في طريقه إليك. إن لم يصل خلال دقائق، راجع مجلد الرسائل غير المرغوبة.',
    errorTitle: 'لم يتم الإرسال.',
    errorBody: 'حاول مرة أخرى — أو راسلنا على واتساب ونرسله لك مباشرة.',
    soon: 'الدليل قيد الإعداد النهائي. راسلنا على واتساب ونرسله لك فور جاهزيته.',
  },
```

- [ ] **Step 4: Write the page copy files**

Create `src/content/pages/en/playbook.json`:

```json
{
  "meta": {
    "title": "How to Choose a Marketing Agency in Dubai — PyramediaX",
    "description": "A short, honest guide to picking a marketing agency in Dubai: what to ask, what to check, and the claims to walk away from."
  },
  "eyebrow": "Free guide",
  "title": "How to choose a marketing agency in Dubai without getting burned.",
  "intro": "The questions to ask, the numbers to ask for, and the claims that should end a meeting. Written from the buyer's side, not the seller's.",
  "bullets": [
    "The five questions that separate an operator from a reseller",
    "Which numbers an agency can actually prove — and which it cannot",
    "What a fair scope looks like before anyone signs",
    "The contract clauses that decide who owns your accounts"
  ]
}
```

Create `src/content/pages/ar/playbook.json` with the same keys, written natively in Arabic — do not translate the English above word for word.

> **Owner input required before launch:** the guide's actual content. This page can be built and tested now, but must not be linked from navigation until the real PDF exists.

- [ ] **Step 5: Build the page component**

Create `src/components/pages/PlaybookPage.astro` following the exact structure of `ContactPage.astro`: a `BaseLayout`, the copy from the content collection, and — only when `SITE.playbookWebhookUrl` is non-empty — a form with fields `name`, `email`, `role` (select), `challenge` (textarea), and the `website` honeypot. When the URL is empty, render `t.playbook.soon` and a WhatsApp button instead of a dead form.

The submit script imports the shared client:

```astro
<script>
  import { postToN8n, collectUtm } from '@/scripts/n8n-client';

  function initPlaybookForm() {
    const form = document.getElementById('playbook-form') as HTMLFormElement | null;
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    const config = JSON.parse(form.dataset.config || '{}');
    const successBox = document.getElementById('playbook-success')!;
    const errorBox = document.getElementById('playbook-error')!;
    const loadedAt = Date.now();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.busy === 'true') return;
      form.dataset.busy = 'true';

      const value = (name: string) =>
        ((form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '').trim();

      // Same two spam traps as the contact form: honeypot + minimum dwell.
      const isBot = value('website') !== '' || Date.now() - loadedAt < 4000;

      const result = isBot
        ? { ok: true, status: 200, data: null }
        : await postToN8n(config.webhook, {
            name: value('name'),
            email: value('email'),
            role: value('role'),
            challenge: value('challenge'),
            lang: config.lang,
            page_url: window.location.href,
            submitted_at: new Date().toISOString(),
            website: value('website'),
            utm: collectUtm(),
          });

      form.dataset.busy = 'false';
      (result.ok ? successBox : errorBox).classList.remove('hidden');
      if (result.ok) form.classList.add('hidden');
    });
  }

  initPlaybookForm();
  document.addEventListener('astro:page-load', initPlaybookForm);
</script>
```

- [ ] **Step 6: Add the routes**

Create `src/pages/playbook.astro`:

```astro
---
import PlaybookPage from '@/components/pages/PlaybookPage.astro';
---

<PlaybookPage lang="en" />
```

Create `src/pages/ar/playbook.astro`:

```astro
---
import PlaybookPage from '@/components/pages/PlaybookPage.astro';
---

<PlaybookPage lang="ar" />
```

- [ ] **Step 7: Disclose it in both privacy policies**

In `src/content/pages/en/privacy.mdx`, after the "Application forms" paragraph:

```mdx
**Playbook requests.** If you request the guide, we receive your name, email address, stated role and the challenge you describe. We use them to send you the guide and to follow up about it. The request is stored in our own customer-relationship system.
```

In `src/content/pages/ar/privacy.mdx`, after the «نماذج التقديم» paragraph:

```mdx
**طلبات الدليل.** عند طلب الدليل، يصلنا اسمك وبريدك الإلكتروني والصفة التي ذكرتها والتحدّي الذي وصفته. نستخدمها لإرسال الدليل إليك ولمتابعتك بشأنه. ويُحفظ الطلب في نظام إدارة العملاء الخاص بنا.
```

Bump `lastUpdated` to the implementation date in **both** files.

- [ ] **Step 8: Run the gates and verify**

Run: `npm.cmd run typecheck && npm.cmd run test:gate1 && npm.cmd run test:gate2 && npm.cmd run build`
Expected: all pass, **27** pages built (25 + 2 new routes).

- [ ] **Step 9: Commit**

```bash
git add src scripts/tests/gate2-regression.test.mjs
git commit -m "feat: gated bilingual playbook with qualifying questions"
```

---

# PART D — Instant Audit (Feature 2)

The strongest lead magnet available to a marketing agency: the visitor points at their own site and learns, in under a minute, that something is wrong with it.

**Owner decision, 2026-08-17 — the audit is the hook, not the product.** The visitor sees a *light* result: enough to be certain there is a real problem, not enough to fix it alone. The **full** breakdown goes to PyramediaX, so the team can reach out already knowing exactly what is broken on that prospect's site. A visitor who has just watched their own score come back low is the hottest lead this site can produce, and the team should be calling them with the answer in hand.

This changes the shape from "free report" to a two-step funnel:

| Step | Visitor gives | Visitor sees | Team receives |
| --- | --- | --- | --- |
| 1 — Scan | a URL or handle | four scores, an issue count, one example finding | the **complete** report, logged and emailed |
| 2 — Claim | name + WhatsApp | confirmation that the team will walk them through it | the same report, now attached to a named contact, flagged hot |

**Why the scan is ungated:** gating it kills the hook. Anyone can run PageSpeed themselves; the score is not the thing being sold. What is sold is *what to fix and in what order* — which is exactly what stays behind step 2. Step 1 converts strangers into people who know they have a problem; step 2 converts those into calls.

**Why the team gets the full report even at step 1:** an unclaimed scan is still intelligence. Knowing that someone scanned a Dubai clinic's site at 11pm is a lead signal, and it costs nothing to keep.

**Honesty constraint (§2.1).** The copy must never promise to email a report the team is not going to email. What actually happens is a conversation, so that is what the copy says. Every number shown is Google's measurement of the visitor's own property — nothing on this page is a claim about PyramediaX.

### Task 7: n8n workflow — split-audience audit

**Files:**
- Create: n8n workflow `PyramediaX — Instant Audit`
- Create: Airtable table `Audit Requests`
- Modify: `src/config/site.ts`, `.env`, `.env.example`

**Interfaces:**
- Consumes: nothing.
- Produces: `POST https://n8n.pyramedia.info/webhook/pyramediax-audit`, taking two actions on one endpoint.

**Action `scan`** — request:
```json
{ "action": "scan", "mode": "website", "target": "example.ae",
  "lang": "en", "page_url": "…", "website": "", "utm": {} }
```
response (LIGHT — this is all the browser ever receives):
```json
{ "ok": true, "scanId": "rec…", "mode": "website", "target": "example.ae",
  "scores": { "performance": 0, "seo": 0, "accessibility": 0, "bestPractices": 0 },
  "issueCount": 0,
  "teaser": { "severity": "high", "title": "…" } }
```

> **`teaser` carries a title and nothing else — no `detail`, no fix.** The full findings must never reach the browser, or the funnel has no second step. This is a hard requirement, not a preference.

**Action `claim`** — request:
```json
{ "action": "claim", "scanId": "rec…", "name": "…", "phone": "…",
  "email": "", "lang": "en", "website": "", "utm": {} }
```
response: `{ "ok": true, "claimed": true }`

- [ ] **Step 1: Create the Airtable table**

Base `appVJGpxA8KzwVjPY`, table `Audit Requests`, fields:

| Field | Type |
| --- | --- |
| Target | singleLineText |
| Mode | singleLineText |
| Performance | number |
| SEO | number |
| Accessibility | number |
| Best Practices | number |
| Issue Count | number |
| Full Findings | longText |
| Claimed | checkbox |
| Name | singleLineText |
| Phone | singleLineText |
| Email | email |
| Language | singleLineText |
| Page URL | url |
| Submitted At | singleLineText |
| UTM Source | singleLineText |
| UTM Medium | singleLineText |
| UTM Campaign | singleLineText |

Record the returned table id.

- [ ] **Step 2: Build the scan branch**

1. **Webhook** — `POST`, path `pyramediax-audit`, `responseMode: responseNode`, options `allowedOrigins: "https://pyramedia.info,https://www.pyramedia.info,http://localhost:4321"`, `ignoreBots: true`, `authentication: "none"`.
2. **Set "Normalize"** — read `action`, `mode`, `target`, `scanId`, `name`, `phone`, `email`, `lang`, `page_url`, `honeypot` (from `body.website`), each as `{{ $json.body?.X ?? $json.X ?? "" }}`.
3. **Switch on `action`** — `scan` / `claim`, with anything else falling to a rejection response.
4. **Code "Validate Target"** (scan branch):

```javascript
const raw = ($input.first().json.target || '').trim();
const mode = $input.first().json.mode === 'instagram' ? 'instagram' : 'website';

let target = '';
let valid = false;

if (mode === 'website') {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    // Public hosts only — no internal names, no ports, no credentials.
    valid = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) && !url.port && !url.username;
    target = valid ? `https://${url.hostname}${url.pathname === '/' ? '' : url.pathname}` : '';
  } catch {
    valid = false;
  }
} else {
  const handle = raw.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '');
  valid = /^[A-Za-z0-9._]{1,30}$/.test(handle);
  target = valid ? handle : '';
}

return [{ json: { ...$input.first().json, mode, target, valid } }];
```

5. **IF "Valid & Genuine?"** — `valid` is true AND honeypot is empty. The false branch answers `200 { "ok": false, "reason": "invalid_target" }`.
6. **HTTP Request "PageSpeed"** — `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed`, query `url={{ $json.target }}`, `strategy=mobile`, `category` repeated for `performance`, `seo`, `accessibility`, `best-practices`. Set `retryOnFail: true`, `maxTries: 2`, node timeout `60000` — PageSpeed is slow. `onError: continueErrorOutput`, with the error output answering `200 { "ok": false, "reason": "scan_failed" }`.
7. **Code "Split Light and Full"** — one node produces both payloads, so they can never disagree about what was measured:

```javascript
const lh = $input.first().json.lighthouseResult || {};
const cat = lh.categories || {};
const audits = lh.audits || {};

const score = (key) => Math.round(((cat[key] || {}).score || 0) * 100);

const scores = {
  performance: score('performance'),
  seo: score('seo'),
  accessibility: score('accessibility'),
  bestPractices: score('best-practices'),
};

// Only audits Lighthouse itself marked as failing. Nothing is invented (§2.1).
const WATCH = [
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'uses-responsive-images',
  'render-blocking-resources',
  'unminified-javascript',
  'uses-text-compression',
  'meta-description',
  'document-title',
  'image-alt',
  'is-crawlable',
  'viewport',
  'color-contrast',
];

const failing = WATCH
  .map((id) => (audits[id] ? { id, ...audits[id] } : null))
  .filter((a) => a && a.score !== null && a.score < 0.9)
  .sort((a, b) => a.score - b.score);

// FULL — team only. Never returned to the browser.
const full = failing.map((a) => ({
  severity: a.score < 0.5 ? 'high' : 'medium',
  title: a.title,
  detail: a.displayValue || a.description || '',
}));

// LIGHT — the browser gets counts and one headline, never the fixes.
const light = {
  scores,
  issueCount: full.length,
  teaser: full.length ? { severity: full[0].severity, title: full[0].title } : null,
};

return [{ json: { light, full, scores, issueCount: full.length } }];
```

8. **Airtable create** → `Audit Requests`, writing the scores, the issue count, and `Full Findings` as the JSON of `full`. `Claimed` stays unchecked. Keep the returned record id — it becomes `scanId`.
9. **Gmail** → internal only, to `info@pyramedia.info`, subject `New audit scan: {{ target }} — performance {{ scores.performance }}`, body listing **every** finding with its detail. `onError: continueRegularOutput` so mail failure cannot block the response.
10. **Respond to Webhook** → the LIGHT payload plus `scanId`. Build the response body explicitly from `light`; **do not** pass the whole item through, or `full` leaks to the browser.

- [ ] **Step 3: Build the claim branch**

1. **IF "Claimable?"** — `scanId` non-empty AND honeypot empty AND `name` non-empty AND `phone` non-empty. The false branch answers `200 { "ok": true, "claimed": true }` regardless, so a bot learns nothing.
2. **Airtable update** → the record identified by `scanId`: set `Claimed` true, `Name`, `Phone`, `Email`, and the UTM fields.
3. **Airtable get** → read that record back, so the alert carries the findings captured at scan time rather than re-running PageSpeed.
4. **Gmail** → to `info@pyramedia.info`, subject `🔥 HOT LEAD — {{ name }} claimed the audit for {{ target }}`, body carrying the contact details, all four scores, every finding with its detail, and a one-tap WhatsApp reply link built from the submitted phone:
   `https://wa.me/{{ $json.Phone.replace(/[^0-9]/g, '') }}`
   `onError: continueRegularOutput`.
5. **Respond to Webhook** → `200 { "ok": true, "claimed": true }`.

- [ ] **Step 4: Wire config**

In `src/config/site.ts`:

```ts
  // Instant audit webhook (Feature 2). Empty ⇒ the audit route renders its
  // WhatsApp fallback instead of a form that cannot run.
  auditWebhookUrl: import.meta.env.PUBLIC_N8N_AUDIT_URL || '',
  // Instagram mode costs an Apify run per audit; off until the owner approves
  // that budget. Website audits are free and always available.
  auditInstagramEnabled: import.meta.env.PUBLIC_AUDIT_INSTAGRAM === 'true',
```

Add `PUBLIC_N8N_AUDIT_URL` and `PUBLIC_AUDIT_INSTAGRAM` to `.env` and `.env.example`.

- [ ] **Step 5: Verify both actions the way a browser does**

> **Critical:** the webhook has `ignoreBots: true`. A probe with a bot-shaped User-Agent gets `403` with a `WWW-Authenticate` header that looks exactly like a proxy auth gate. That misled this project once and cost three weeks. Always send a real Chrome UA **and** an `Origin` header.

```bash
curl -s -X POST https://n8n.pyramedia.info/webhook/pyramediax-audit \
  -H "Content-Type: application/json" \
  -H "Origin: https://pyramedia.info" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" \
  -d '{"action":"scan","mode":"website","target":"example.com","lang":"en","website":""}'
```

Check, in order:
1. The response contains `scores`, `issueCount`, `teaser` and `scanId`.
2. **The response contains no `detail` field and no `full` key anywhere.** Grep the raw response for `"detail"` — a hit means the funnel is broken and must be fixed before the UI is built.
3. The Airtable row exists with `Full Findings` populated and `Claimed` unchecked.
4. The internal email arrived with every finding.

Then claim it with the `scanId` from step 1 and confirm the row flips to `Claimed`, and that the hot-lead email arrives with a working WhatsApp link.

Finally probe `"target":"localhost"` and expect `{"ok":false,"reason":"invalid_target"}`.

Delete the test rows when done.

- [ ] **Step 6: Commit**

```bash
git add src/config/site.ts .env.example
git commit -m "feat: split-audience audit webhook — light to the visitor, full to the team"
```

### Task 8: Audit page — two-step funnel

**Files:**
- Create: `src/components/pages/AuditPage.astro`, `src/components/AuditResult.astro`, `src/pages/audit.astro`, `src/pages/ar/audit.astro`
- Create: `src/content/pages/en/audit.json`, `src/content/pages/ar/audit.json`
- Modify: `src/i18n/en.ts`, `src/i18n/ar.ts` (add `audit` block)
- Modify: `src/content/pages/{en,ar}/privacy.mdx`
- Modify: `src/components/Nav.astro` (add the audit link)
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: `postToN8n`, `collectUtm` from Task 4; `SITE.auditWebhookUrl`, `SITE.auditInstagramEnabled` from Task 7.
- Produces: routes `/audit`, `/ar/audit`.

- [ ] **Step 1: Write the failing test**

```js
test('the audit is a two-step funnel that withholds the fixes (Feature 2)', async () => {
  const [page, result, site, enPrivacy, arPrivacy, en, ar] = await Promise.all([
    source('src/components/pages/AuditPage.astro'),
    source('src/components/AuditResult.astro'),
    source('src/config/site.ts'),
    source('src/content/pages/en/privacy.mdx'),
    source('src/content/pages/ar/privacy.mdx'),
    source('src/i18n/en.ts'),
    source('src/i18n/ar.ts'),
  ]);

  assert.match(site, /auditWebhookUrl:/);
  assert.match(site, /auditInstagramEnabled:/);

  // Step 1 scans, step 2 claims — two distinct actions on one endpoint.
  assert.match(page, /action: 'scan'/);
  assert.match(page, /action: 'claim'/);
  // The claim step carries the scanId from the scan, or the two cannot be joined.
  assert.match(page, /scanId/);
  // Contact capture is WhatsApp-first: the team calls, it does not email a report.
  assert.match(page, /name="phone"/);

  // Results land in a pre-sized container — no layout shift (§12).
  assert.match(result, /min-block-size:/);
  // Scores render from the response, never hardcoded (§2.1).
  assert.doesNotMatch(result, /performance"?\s*:\s*\d+/);
  // The result panel must not render per-finding detail — that is the hook.
  assert.doesNotMatch(result, /data-finding-detail/);

  // Empty config renders a fallback, not a dead form.
  assert.match(page, /SITE\.auditWebhookUrl/);
  assert.match(page, /SITE\.auditInstagramEnabled/);
  // Shared client, not a second fetch implementation.
  assert.match(page, /from '@\/scripts\/n8n-client'/);

  for (const dict of [en, ar]) {
    assert.match(dict, /audit: \{/);
    assert.match(dict, /claimCta:/);
  }

  assert.match(enPrivacy, /audit/i);
  assert.match(arPrivacy, /الفحص/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` on `AuditPage.astro`.

- [ ] **Step 3: Add dictionary strings**

`src/i18n/en.ts`:

```ts
  audit: {
    modeWebsite: 'My website',
    modeInstagram: 'My Instagram',
    targetWebsite: 'Your website address',
    targetInstagram: 'Your Instagram handle',
    run: 'Check my site',
    running: 'Checking…',
    runningNote: 'This takes up to a minute. Google is loading your site the way a phone would.',
    scores: 'Your scores',
    performance: 'Speed',
    seo: 'SEO',
    accessibility: 'Accessibility',
    bestPractices: 'Best practices',
    issuesFound: 'issues we can fix',
    teaserLead: 'The biggest one:',
    clean: 'Nothing significant came back. Your site is in good shape.',
    claimTitle: 'Want the rest, and what to fix first?',
    claimBody: "We have the full breakdown. Leave your WhatsApp number and we'll walk you through it — what is costing you the most, and what to do about it.",
    claimName: 'Your name',
    claimPhone: 'WhatsApp number',
    claimEmail: 'Email',
    claimCta: 'Send me the breakdown',
    claimSending: 'Sending…',
    claimedTitle: "Got it — we'll be in touch.",
    claimedBody: "We'll message you on WhatsApp with the full breakdown and what to fix first.",
    invalid: 'That address does not look right. Try it without https:// — for example, yourbusiness.ae',
    failed: 'The check could not finish. Try again in a moment, or message us on WhatsApp.',
    disclaimer: 'Scores come from Google PageSpeed Insights, measured live on your address. We do not adjust them.',
    unavailable: 'The instant check is being set up. Message us on WhatsApp and we will run it for you.',
  },
```

`src/i18n/ar.ts` — the same keys, written natively in Arabic. `claimBody` must promise a WhatsApp conversation, not an emailed report, because that is what actually happens.

- [ ] **Step 4: Build `AuditResult.astro`**

```astro
---
/**
 * Audit result panel (Feature 2, step 1). Deliberately LIGHT: four scores, a
 * count, and one headline title. No per-finding detail and no fixes — those
 * are what the visitor comes to us for, and they go to the team instead.
 *
 * Renders empty and hidden with its height reserved, so filling it from the
 * API cannot shift the page (§12). No score appears in this markup — every
 * number is Google's measurement of the visitor's own site (§2.1).
 */
import type { Lang } from '@/config/site';
import { useTranslations } from '@/i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const SCORES = [
  { key: 'performance', label: t.audit.performance },
  { key: 'seo', label: t.audit.seo },
  { key: 'accessibility', label: t.audit.accessibility },
  { key: 'bestPractices', label: t.audit.bestPractices },
] as const;
---

<section
  id="audit-result"
  class="mt-10 hidden rounded-2xl border border-line bg-surface/40 p-6 md:p-8"
  style="min-block-size: 18rem;"
  aria-live="polite"
>
  <h2 class="font-display text-xl font-bold text-text">{t.audit.scores}</h2>

  <ul class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    {
      SCORES.map((score) => (
        <li class="card p-5 text-center">
          <span
            class="font-display block text-3xl font-bold"
            style="min-block-size: 1.2em; min-inline-size: 3ch;"
            data-score={score.key}
            dir="ltr"
          >
            —
          </span>
          <span class="mt-2 block text-sm text-muted">{score.label}</span>
        </li>
      ))
    }
  </ul>

  <p class="mt-8 text-lg text-text/90">
    <span class="font-display font-bold text-orange" data-issue-count dir="ltr">—</span>
    <span>{t.audit.issuesFound}</span>
  </p>

  <p class="mt-3 hidden text-text/90" data-teaser>
    <span class="text-muted">{t.audit.teaserLead}</span>
    <span class="font-semibold" data-teaser-title></span>
  </p>

  <p class="mt-3 hidden text-text/90" data-clean>{t.audit.clean}</p>
  <p class="mt-6 text-sm text-muted">{t.audit.disclaimer}</p>
</section>
```

> The panel has slots for a count and one title. It has **no** slot for a finding's detail — the withholding is structural, not a matter of the script choosing not to render something.

- [ ] **Step 5: Build `AuditPage.astro`**

Two forms. `#audit-form` takes the target; `#audit-claim` takes the contact details and starts hidden, appearing only once a scan has produced a `scanId`. Both carry the `website` honeypot. When `SITE.auditWebhookUrl` is empty, render `t.audit.unavailable` plus a WhatsApp button and neither form.

```astro
<script>
  import { postToN8n, collectUtm } from '@/scripts/n8n-client';

  function initAudit() {
    const form = document.getElementById('audit-form') as HTMLFormElement | null;
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    const config = JSON.parse(form.dataset.config || '{}');
    const panel = document.getElementById('audit-result')!;
    const claim = document.getElementById('audit-claim') as HTMLFormElement;
    const claimed = document.getElementById('audit-claimed')!;
    const errorBox = document.getElementById('audit-error')!;
    const status = form.querySelector('[data-audit-status]')!;

    let scanId = '';

    const value = (f: HTMLFormElement, name: string) =>
      ((f.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '').trim();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.busy === 'true') return;
      form.dataset.busy = 'true';
      errorBox.classList.add('hidden');
      status.textContent = config.strings.running;

      // PageSpeed is slow by nature — allow 90s before giving up.
      const result = await postToN8n(
        config.webhook,
        {
          action: 'scan',
          mode: value(form, 'mode') || 'website',
          target: value(form, 'target'),
          lang: config.lang,
          page_url: window.location.href,
          website: value(form, 'website'),
          utm: collectUtm(),
        },
        90_000,
      );

      form.dataset.busy = 'false';
      status.textContent = '';

      const data = result.data as any;
      if (!result.ok || !data?.ok) {
        errorBox.textContent =
          data?.reason === 'invalid_target' ? config.strings.invalid : config.strings.failed;
        errorBox.classList.remove('hidden');
        return;
      }

      scanId = data.scanId ?? '';

      for (const [key, score] of Object.entries(data.scores ?? {})) {
        const slot = panel.querySelector(`[data-score="${key}"]`);
        if (!slot) continue;
        slot.textContent = String(score);
        // Colour carries the verdict faster than the number does.
        const n = Number(score);
        slot.classList.add(n < 50 ? 'text-red' : n < 90 ? 'text-orange' : 'text-green');
      }

      const count = Number(data.issueCount ?? 0);
      panel.querySelector('[data-issue-count]')!.textContent = String(count);

      const teaser = panel.querySelector('[data-teaser]')!;
      const clean = panel.querySelector('[data-clean]')!;
      if (count > 0 && data.teaser?.title) {
        panel.querySelector('[data-teaser-title]')!.textContent = data.teaser.title;
        teaser.classList.remove('hidden');
        clean.classList.add('hidden');
        claim.classList.remove('hidden');
      } else {
        teaser.classList.add('hidden');
        clean.classList.remove('hidden');
        // Nothing to sell a fix for — do not ask for a phone number.
        claim.classList.add('hidden');
      }

      panel.classList.remove('hidden');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    claim.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!scanId || claim.dataset.busy === 'true') return;
      claim.dataset.busy = 'true';

      const result = await postToN8n(config.webhook, {
        action: 'claim',
        scanId,
        name: value(claim, 'name'),
        phone: value(claim, 'phone'),
        email: value(claim, 'email'),
        lang: config.lang,
        website: value(claim, 'website'),
        utm: collectUtm(),
      });

      claim.dataset.busy = 'false';
      if (!result.ok) {
        errorBox.textContent = config.strings.failed;
        errorBox.classList.remove('hidden');
        return;
      }

      claim.classList.add('hidden');
      claimed.classList.remove('hidden');
    });
  }

  initAudit();
  document.addEventListener('astro:page-load', initAudit);
</script>
```

> **Why `textContent` and never `innerHTML` with response data:** the teaser title comes from an external API. Building text explicitly makes injection impossible regardless of what Google returns.

The score colour classes (`text-red`, `text-orange`, `text-green`) must exist as tokens in `src/styles/global.css`. Add any that are missing, following the existing `@theme` token pattern — do not introduce raw hex values in a component.

- [ ] **Step 6: Add the routes, nav link and privacy disclosure**

Create `src/pages/audit.astro` and `src/pages/ar/audit.astro` following the two-line pattern of the other route files. Add the audit link to `Nav.astro` using `localizePath('/audit', lang)`.

Disclose in `src/content/pages/en/privacy.mdx`:

```mdx
**Instant check.** When you run the instant check, the address you enter is sent to Google PageSpeed Insights, which loads that page and returns its own measurements. We keep the address and those measurements so we can follow up. If you then ask for the full breakdown, we also receive the name, WhatsApp number and email you enter, and we use them to contact you about it.
```

And the Arabic equivalent in `src/content/pages/ar/privacy.mdx`. Bump `lastUpdated` in **both** files.

- [ ] **Step 7: Run the gates and verify the funnel end to end**

Run: `npm.cmd run typecheck && npm.cmd run test:gate1 && npm.cmd run test:gate2 && npm.cmd run build`
Expected: all pass, **27** pages built.

Then in the browser, on a real target:
1. Submit a site that scores badly. Confirm four scores, an issue count, and one teaser title appear — and that the claim form appears with them.
2. **Open devtools and read the network response for the scan.** Confirm it carries no finding `detail` and no `full` array. This is the requirement the whole design rests on.
3. Submit the claim form and confirm the confirmation state replaces it.
4. Confirm the team email arrived with the complete findings and a working WhatsApp link.
5. Submit a site that scores well and confirm the claim form does **not** appear — there is nothing to sell.

- [ ] **Step 8: Commit**

```bash
git add src scripts/tests/gate2-regression.test.mjs
git commit -m "feat: two-step instant audit — light result to the visitor, full report to the team"
```

# PART E — Site Assistant (Feature 1)

The largest part, and the one that proves the most: the visitor talks to the same class of agent PyramediaX builds for clients. Conversational surfaces convert several times better than static forms, and this one is self-demonstrating — the product is the demo.

**The hard part is not the chat UI. It is §2.1.** A language model will happily invent a price, a client, or a result. The entire design below exists to make that impossible.

### Task 9: The fenced answer set

**Files:**
- Create: `src/content/assistant/en.json`, `src/content/assistant/ar.json`
- Create: `docs/assistant-system-prompt.md`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: two JSON files of approved question/answer pairs, and the system prompt text the n8n agent node uses verbatim.

- [ ] **Step 1: Write the failing test**

```js
test('the assistant can only speak from approved facts (Feature 1, §2.1)', async () => {
  const [en, ar, prompt] = await Promise.all([
    source('src/content/assistant/en.json'),
    source('src/content/assistant/ar.json'),
    source('docs/assistant-system-prompt.md'),
  ]);

  const enData = JSON.parse(en);
  const arData = JSON.parse(ar);
  assert.equal(enData.answers.length, arData.answers.length, 'both languages must cover the same ground');

  // No approved answer may contain a number that reads as a claim.
  for (const entry of [...enData.answers, ...arData.answers]) {
    assert.doesNotMatch(entry.answer, /\d+\s*%/, `percentage claim in "${entry.id}"`);
    assert.doesNotMatch(entry.answer, /\d+\+/, `count claim in "${entry.id}"`);
  }

  // The prompt must forbid invention and define the escape hatch.
  assert.match(prompt, /never invent/i);
  assert.match(prompt, /HANDOFF/);
  assert.doesNotMatch(prompt, /567249440/, '§2.3 banned number');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` on `src/content/assistant/en.json`.

- [ ] **Step 3: Write the approved answer set**

Create `src/content/assistant/en.json`. Every answer is drawn from SPEC §4 and the existing service content — nothing new is authored here:

```json
{
  "answers": [
    {
      "id": "services",
      "topic": "What PyramediaX does",
      "answer": "Six services: branding and identity, social media management and content, web design and development, performance advertising, SEO, and AI solutions and automation for business. Each has its own page with what is included and how it runs."
    },
    {
      "id": "location",
      "topic": "Where the company is",
      "answer": "Al Khabaisi, Deira — Dubai, UAE. The company serves the UAE and the GCC."
    },
    {
      "id": "contact",
      "topic": "How to get in touch",
      "answer": "WhatsApp is the fastest route, and there is a contact form on the contact page. Email is info@pyramedia.info."
    },
    {
      "id": "pricing",
      "topic": "Cost",
      "answer": "Pricing depends on scope, so it is quoted per project rather than listed. Tell me what you need and I will connect you with the team for a real number."
    },
    {
      "id": "work",
      "topic": "Examples of work",
      "answer": "There are two showcases: a website-design showcase with fully working demo sites you can open and click through, and a video-production showcase. Both are linked from the homepage."
    },
    {
      "id": "languages",
      "topic": "Languages",
      "answer": "The team works in Arabic and English, and content is written natively in both rather than translated."
    }
  ]
}
```

Create `src/content/assistant/ar.json` with the same six `id` values, written natively in Arabic.

- [ ] **Step 4: Write the system prompt**

Create `docs/assistant-system-prompt.md`:

```markdown
# PyramediaX site assistant — system prompt

You are the assistant on pyramedia.info, the website of PyramediaX, a
full-service digital marketing agency in Dubai.

## Absolute rules

1. Answer ONLY from the APPROVED ANSWERS supplied in this prompt. You may
   rephrase them and combine them. You may never add a fact that is not in
   them.
2. **Never invent** a price, a number, a percentage, a timeline, a client
   name, a result, a case study, a team size, or an award. If a visitor asks
   for one and it is not in the approved answers, say you do not have that
   detail and offer to connect them.
3. Never describe PyramediaX as an "AI agency" or "AI-powered agency". AI and
   automation is one of six services, not the company's identity.
4. Reply in the visitor's language. If they write Arabic, answer in Arabic.
5. Keep answers under 60 words. This is a chat, not a brochure.
6. Never ask for a password, a payment detail, or an ID number.

## When you cannot answer

Reply normally, then end your message with the exact token `HANDOFF` on its
own line. The website turns that into a WhatsApp button carrying the
conversation subject. Do not explain the token to the visitor.

## APPROVED ANSWERS

{{ the contents of src/content/assistant/<lang>.json }}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm.cmd run test:gate2`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/assistant docs/assistant-system-prompt.md scripts/tests/gate2-regression.test.mjs
git commit -m "feat: fenced approved answer set for the site assistant"
```

### Task 10: n8n workflow — assistant

**Files:**
- Create: n8n workflow `PyramediaX — Site Assistant`
- Create: Airtable table `Assistant Conversations`
- Modify: `src/config/site.ts`, `.env`, `.env.example`

**Interfaces:**
- Consumes: the system prompt from Task 9.
- Produces: `POST https://n8n.pyramedia.info/webhook/pyramediax-assistant` accepting
  `{ message, lang, sessionId, page_url }` and returning
  `{ "ok": true, "reply": "…", "handoff": false }`.

- [ ] **Step 1: Create the Airtable table**

Base `appVJGpxA8KzwVjPY`, table `Assistant Conversations`, fields: `Session` (singleLineText), `Language` (singleLineText), `Visitor Message` (longText), `Reply` (longText), `Handoff` (checkbox), `Page URL` (url), `At` (singleLineText).

- [ ] **Step 2: Build the workflow**

1. **Webhook** — `POST`, path `pyramediax-assistant`, `responseMode: responseNode`, same `allowedOrigins`, `ignoreBots: true`.
2. **Set "Normalize Turn"** — `message`, `lang`, `sessionId`, `page_url` via `body.X ?? X ?? ""`.
3. **IF "Sane Input?"** — message notEmpty AND message length under 500. Over-length or empty goes straight to a polite refusal response, so nothing reaches the model.
4. **AI Agent** (`@n8n/n8n-nodes-langchain.agent`) with:
   - **Chat model:** the same Gemini credential the existing `Insta_DM_Agent` uses.
   - **Memory:** Window Buffer Memory keyed on `{{ $json.sessionId }}`, window 8. Session memory is what makes it feel like a conversation rather than a search box.
   - **System message:** the contents of `docs/assistant-system-prompt.md`, with the approved answers for `{{ $json.lang }}` substituted in.
5. **Code "Detect Handoff"**:

```javascript
const raw = ($input.first().json.output || '').trim();
const handoff = /\bHANDOFF\b\s*$/.test(raw);
const reply = raw.replace(/\bHANDOFF\b\s*$/, '').trim();
return [{ json: { ok: true, reply, handoff } }];
```

6. **Airtable create** → `Assistant Conversations`, `onError: continueRegularOutput` — logging must never block a reply.
7. **Respond to Webhook** → the JSON shape above.

> **Rate limiting:** set the workflow's `executionTimeout` to 60 and add an IF that rejects a `sessionId` seen more than 30 times in an hour, using an n8n data table as the counter. An open AI endpoint on a public site is a billable target.

- [ ] **Step 3: Wire config**

```ts
  // Site assistant webhook (Feature 1). Empty ⇒ the launcher never renders
  // and the WhatsApp float remains the only conversational entry point.
  assistantWebhookUrl: import.meta.env.PUBLIC_N8N_ASSISTANT_URL || '',
```

- [ ] **Step 4: Verify the fence, not just the plumbing**

Send a browser-shaped POST for each of these and check the reply:

| Probe | Required behaviour |
| --- | --- |
| `"How much for social media?"` | No number. Offers to connect. |
| `"Who are your clients?"` | Names nobody beyond the approved answers. |
| `"Are you an AI agency?"` | Corrects the framing — six services, AI is one. |
| `"كام سعر السيو؟"` | Answers **in Arabic**, no number. |
| `"Give me a 50% discount code"` | Invents nothing, hands off. |

Any invented fact means the prompt is not tight enough — fix Task 9 before continuing. This gate matters more than the UI.

- [ ] **Step 5: Commit**

```bash
git add src/config/site.ts .env.example
git commit -m "feat: site assistant webhook, fenced to approved answers"
```

### Task 11: Assistant UI

**Files:**
- Create: `src/components/Assistant.astro`
- Modify: `src/layouts/BaseLayout.astro` (mount site-wide), `src/i18n/en.ts`, `src/i18n/ar.ts`, `src/content/pages/{en,ar}/privacy.mdx`
- Test: `scripts/tests/gate2-regression.test.mjs`

**Interfaces:**
- Consumes: `postToN8n` (Task 4); `SITE.assistantWebhookUrl` (Task 10); `waLink(lang, context)` (Task 2).
- Produces: nothing further.

- [ ] **Step 1: Write the failing test**

```js
test('the assistant panel is lazy, accessible, and injection-safe (Feature 1)', async () => {
  const [assistant, layout, site] = await Promise.all([
    source('src/components/Assistant.astro'),
    source('src/layouts/BaseLayout.astro'),
    source('src/config/site.ts'),
  ]);

  assert.match(site, /assistantWebhookUrl:/);
  assert.match(layout, /<Assistant/);
  // Never render model output as HTML.
  assert.doesNotMatch(assistant, /innerHTML\s*=/);
  assert.match(assistant, /textContent/);
  // Dialog semantics and a focus return path.
  assert.match(assistant, /role="dialog"/);
  assert.match(assistant, /aria-modal="true"/);
  assert.match(assistant, /Escape/);
  // The panel is off the critical path until the visitor asks for it.
  assert.match(assistant, /data-assistant-launcher/);
  // Handoff turns into a real WhatsApp link, not a dead end.
  assert.match(assistant, /handoff/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:gate2`
Expected: FAIL — `ENOENT` on `Assistant.astro`.

- [ ] **Step 3: Add dictionary strings**

`src/i18n/en.ts`:

```ts
  assistant: {
    launch: 'Ask us anything',
    title: 'PyramediaX assistant',
    intro: 'Ask about the services, the work, or how we run a project.',
    placeholder: 'Type your question…',
    send: 'Send',
    thinking: 'Thinking…',
    close: 'Close',
    handoff: 'Continue on WhatsApp',
    failed: 'That did not go through. Try again, or continue on WhatsApp.',
    disclaimer: 'Answers come from an assistant. For anything binding, talk to the team.',
  },
```

`src/i18n/ar.ts` — same keys, native Arabic.

- [ ] **Step 4: Build the component**

Create `src/components/Assistant.astro`. The frontmatter and markup:

```astro
---
/**
 * Site assistant (Feature 1). Renders nothing when the webhook is not
 * configured, so an unconfigured build never shows a control that cannot
 * answer. The transcript is a fixed-height scroller: a growing conversation
 * never reflows the page behind it (§12).
 */
import type { Lang } from '@/config/site';
import { SITE, WA_BASE } from '@/config/site';
import { useTranslations } from '@/i18n';
import Icon from '@/components/Icon.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const enabled = Boolean(SITE.assistantWebhookUrl);

// Built here rather than in the script so the approved phrasing lives with
// the rest of the copy and never drifts (§2.4).
const waPrefix =
  lang === 'ar' ? 'مرحباً بيراميديا إكس، حابب أستفسر عن: ' : "Hello PyramediaX, I'd like to discuss: ";

const config = JSON.stringify({
  webhook: SITE.assistantWebhookUrl,
  lang,
  waBase: WA_BASE,
  waPrefix,
  strings: {
    thinking: t.assistant.thinking,
    failed: t.assistant.failed,
    handoff: t.assistant.handoff,
  },
});
---

{
  enabled && (
    <div data-assistant data-config={config}>
      <button
        type="button"
        class="assistant-launcher"
        data-assistant-launcher
        aria-haspopup="dialog"
        aria-label={t.assistant.launch}
      >
        <Icon name="send" size={18} />
        <span class="assistant-launcher-label">{t.assistant.launch}</span>
      </button>

      <div
        class="assistant-panel hidden"
        data-assistant-panel
        role="dialog"
        aria-modal="true"
        aria-label={t.assistant.title}
      >
        <header class="assistant-head">
          <p class="font-display font-bold text-text">{t.assistant.title}</p>
          <button type="button" data-assistant-close aria-label={t.assistant.close}>
            <Icon name="x" size={18} />
          </button>
        </header>

        <p class="assistant-intro">{t.assistant.intro}</p>

        <ul class="assistant-log" data-assistant-log aria-live="polite" />

        <form class="assistant-form" data-assistant-form>
          <input
            type="text"
            data-assistant-input
            maxlength="500"
            autocomplete="off"
            placeholder={t.assistant.placeholder}
            aria-label={t.assistant.placeholder}
          />
          <button type="submit" aria-label={t.assistant.send}>
            <Icon name="arrow-right" size={17} dirAware />
          </button>
        </form>

        <p class="assistant-disclaimer">{t.assistant.disclaimer}</p>
      </div>
    </div>
  )
}
```

Then the styles. Every rule below exists for a stated reason — keep the comments:

```astro
<style>
  /* Sits above the WhatsApp float, never beside it, so the two cannot
     collide at any width or in either direction. */
  .assistant-launcher {
    position: fixed;
    inset-block-end: 5.75rem;
    inset-inline-end: 1.25rem;
    z-index: 40;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(255, 126, 51, 0.45);
    background-color: var(--color-surface);
    color: var(--color-text);
    border-radius: 999px;
    padding-block: 0.6rem;
    padding-inline: 0.9rem 1.1rem;
    font-weight: 600;
    transition: transform 0.25s ease;
  }
  .assistant-launcher:hover {
    transform: translateY(-2px);
  }

  .assistant-panel {
    position: fixed;
    inset-block-end: 5.75rem;
    inset-inline-end: 1.25rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    inline-size: min(23rem, calc(100vw - 2.5rem));
    /* Fixed height + internal scroll: the transcript grows inside the panel,
       never against the page (§12). */
    block-size: min(30rem, calc(100vh - 9rem));
    border: 1px solid var(--color-line);
    background-color: var(--color-bg);
    border-radius: 1.25rem;
    overflow: hidden;
  }
  .assistant-log {
    flex: 1;
    overflow-y: auto;
    padding-inline: 1rem;
    display: grid;
    gap: 0.6rem;
    align-content: start;
  }
  .assistant-msg {
    max-inline-size: 85%;
    border-radius: 1rem;
    padding: 0.6rem 0.9rem;
    background-color: var(--color-surface);
    color: var(--color-text);
    justify-self: start;
  }
  .assistant-msg.is-visitor {
    justify-self: end;
    background-color: rgba(255, 126, 51, 0.14);
  }

  /* Entrance is transform/opacity only and collapses entirely under
     reduced motion (§8). */
  .assistant-panel:not(.hidden) {
    animation: assistant-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes assistant-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .assistant-panel:not(.hidden),
    .assistant-launcher,
    .assistant-launcher:hover {
      animation: none;
      transform: none;
      transition: none;
    }
  }
</style>
```

Two behaviours the markup alone does not carry, both handled in the script in Step 4b:

- `sessionId` is a `crypto.randomUUID()` in `sessionStorage` — memory survives navigation but not the visit, so it is not a cookie and needs no consent gate.
- Every message is appended with `createElement` + `textContent`, **never** `innerHTML`, because the text is model output.

```astro
<script>
  import { postToN8n } from '@/scripts/n8n-client';

  function initAssistant() {
    const root = document.querySelector<HTMLElement>('[data-assistant]');
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const config = JSON.parse(root.dataset.config || '{}');
    const launcher = root.querySelector<HTMLButtonElement>('[data-assistant-launcher]')!;
    const panel = root.querySelector<HTMLElement>('[data-assistant-panel]')!;
    const log = root.querySelector<HTMLElement>('[data-assistant-log]')!;
    const form = root.querySelector<HTMLFormElement>('[data-assistant-form]')!;
    const input = root.querySelector<HTMLInputElement>('[data-assistant-input]')!;

    let sessionId = sessionStorage.getItem('pyx-assistant-session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('pyx-assistant-session', sessionId);
    }

    function bubble(role: 'visitor' | 'assistant', text: string) {
      const li = document.createElement('li');
      li.className = role === 'visitor' ? 'assistant-msg is-visitor' : 'assistant-msg';
      li.textContent = text; // never innerHTML — this is model output
      log.append(li);
      log.scrollTop = log.scrollHeight;
      return li;
    }

    function open() {
      panel.classList.remove('hidden');
      input.focus();
    }
    function close() {
      panel.classList.add('hidden');
      launcher.focus();
    }

    launcher.addEventListener('click', open);
    root.querySelector('[data-assistant-close]')!.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) close();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message || form.dataset.busy === 'true') return;

      form.dataset.busy = 'true';
      input.value = '';
      bubble('visitor', message);
      const pending = bubble('assistant', config.strings.thinking);

      const result = await postToN8n(
        config.webhook,
        { message, lang: config.lang, sessionId, page_url: window.location.href },
        45_000,
      );

      form.dataset.busy = 'false';
      const data = result.data as any;

      if (!result.ok || !data?.ok) {
        pending.textContent = config.strings.failed;
        return;
      }

      pending.textContent = data.reply;

      if (data.handoff) {
        const link = document.createElement('a');
        link.className = 'btn-showcase mt-3';
        link.href = `${config.waBase}?text=${encodeURIComponent(config.waPrefix + message)}`;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = config.strings.handoff;
        log.append(link);
        log.scrollTop = log.scrollHeight;
      }
    });
  }

  initAssistant();
  document.addEventListener('astro:page-load', initAssistant);
</script>
```

- [ ] **Step 5: Mount it site-wide and disclose it**

Add `<Assistant lang={lang} />` to `src/layouts/BaseLayout.astro` beside `<WhatsAppFloat />`.

Add to `src/content/pages/en/privacy.mdx`:

```mdx
**Site assistant.** If you open the assistant and send a message, that message, the page you sent it from and a temporary session identifier are sent to our own automation system, which uses an AI model to compose a reply. The identifier is held only for the length of your visit and is not a cookie. Conversations are stored so we can follow up and improve the answers. Do not send passwords, payment details or ID numbers.
```

And the Arabic equivalent to `src/content/pages/ar/privacy.mdx`. Bump `lastUpdated` in both.

- [ ] **Step 6: Run the gates**

Run: `npm.cmd run typecheck && npm.cmd run test:gate1 && npm.cmd run test:gate2 && npm.cmd run build`
Expected: all pass, 29 pages.

- [ ] **Step 7: Verify behaviour in a real browser**

On the live preview:

1. Open the launcher; check focus moved into the panel.
2. Press `Escape`; check focus returned to the launcher.
3. Ask "how much does SEO cost?" — the reply must contain no number and must offer a handoff.
4. Ask the same in Arabic — the reply must be in Arabic.
5. Confirm the WhatsApp float and the launcher do not overlap at 375px width, in both `dir=ltr` and `dir=rtl`.
6. Reload and confirm the transcript is gone but the site still works.

- [ ] **Step 8: Commit**

```bash
git add src scripts/tests/gate2-regression.test.mjs
git commit -m "feat: bilingual site assistant fenced to approved facts"
```

---

## Rollout Order and Rationale

| Order | Part | Ships alone? | Owner input |
| --- | --- | --- | --- |
| 1 | A — Speed proof | Yes | None |
| 2 | B — WhatsApp context | Yes | None |
| 3 | C — Playbook | Yes | **Content, both languages** |
| 4 | D — Audit | Yes | Apify budget (optional) |
| 5 | E — Assistant | Yes | Approved answers review |

A and B are same-day work with no dependencies and no owner input — ship them first for immediate wins. C builds the shared n8n client that D and E both consume, so it must precede them even though its content is owner-blocked; build and test C's machinery, hold only the launch.

## Deployment

This site deploys by FTPS to `box5557.bluehost.com` → `public_html`. Do **not** use `ftp.pyramedia.info` — its certificate does not match that name. Upload every file except `.htaccess` first, then `.htaccess` last, so the switch is atomic. Verify against the live host with a real Chrome User-Agent; a bare `Mozilla/5.0` is rejected by the host WAF with a `406` that looks like a site outage and is not one.

After each part ships, re-verify that all four working subdomains still serve — `card` (plus `/vp/`), `clinic`, `stock`, `aiagent` — since they inherit `public_html/.htaccess`.
