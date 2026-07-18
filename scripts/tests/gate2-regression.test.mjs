import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

async function source(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), 'utf8');
}

async function sourceFiles(relativeDirectory) {
  const absoluteDirectory = path.join(repositoryRoot, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const child = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return sourceFiles(child);
    return ['.astro', '.ts', '.tsx', '.js', '.mjs'].includes(path.extname(entry.name)) ? [child] : [];
  }));
  return nested.flat();
}

const contentPaths = [
  'src/content/pages/en/about.json',
  'src/content/pages/en/contact.json',
  'src/content/pages/en/home.json',
  'src/content/pages/en/privacy.mdx',
  'src/content/pages/en/services.json',
  'src/content/pages/en/terms.mdx',
  'src/content/pages/ar/about.json',
  'src/content/pages/ar/contact.json',
  'src/content/pages/ar/home.json',
  'src/content/pages/ar/privacy.mdx',
  'src/content/pages/ar/services.json',
  'src/content/pages/ar/terms.mdx',
  'src/content/services/en/ai-solutions.mdx',
  'src/content/services/en/branding.mdx',
  'src/content/services/en/performance-ads.mdx',
  'src/content/services/en/seo.mdx',
  'src/content/services/en/social-media.mdx',
  'src/content/services/en/web-development.mdx',
  'src/content/services/ar/ai-solutions.mdx',
  'src/content/services/ar/branding.mdx',
  'src/content/services/ar/performance-ads.mdx',
  'src/content/services/ar/seo.mdx',
  'src/content/services/ar/social-media.mdx',
  'src/content/services/ar/web-development.mdx',
];

const arabicContentPaths = contentPaths.filter((contentPath) => contentPath.includes('/ar/'));
const pageJsonPaths = contentPaths.filter((contentPath) => contentPath.includes('/pages/') && contentPath.endsWith('.json'));

const forbiddenPromises = [
  /get back to you quickly/i,
  /get back to you shortly/i,
  /reply fast/i,
  /fastest way/i,
  /respond to every request/i,
  /full access[\s\S]{0,100}at all times/i,
  /everything we produce[\s\S]{0,100}remain yours/i,
  /team is trained[\s\S]{0,100}refine/i,
  /client[- ]CRM connection[\s\S]{0,100}standard scope/i,
];

const colloquialisms = ['اللي', 'مو', 'وش', 'وين', 'تبغى', 'تبغاه', 'عشان', 'بنرد', 'بنرجع', 'خلنا'];

function standalone(word) {
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${word}($|[^\\p{L}\\p{N}_])`, 'u');
}

function sentences(text) {
  return text
    .split(/[.!؟]+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function section(content, startMarker, endMarker) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start);
  return content.slice(start, end === -1 ? undefined : end);
}

function splitTopLevelCommas(value) {
  const parts = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '(') depth += 1;
    if (character === ')') depth = Math.max(0, depth - 1);
    if (character === ',' && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

function firstTopLevelToken(value) {
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '(') depth += 1;
    if (character === ')') depth = Math.max(0, depth - 1);
    if (/\s/.test(character) && depth === 0) return value.slice(0, index);
  }

  return value;
}

function transitionProperties(shorthand) {
  return splitTopLevelCommas(shorthand).map((transition) => {
    const property = firstTopLevelToken(transition);
    return ['transform', 'opacity', 'none'].includes(property) ? property : 'all';
  });
}

function transitionIsPermitted(shorthand) {
  const properties = transitionProperties(shorthand);
  return properties.length > 0 && properties.every((property) => ['transform', 'opacity', 'none'].includes(property));
}

function arbitraryTransitionIsPermitted(payload) {
  const properties = splitTopLevelCommas(payload);
  return properties.length > 0 && properties.every((property) => ['transform', 'opacity', 'none'].includes(property));
}

function staticClassTokens(markup) {
  const tokens = [];
  for (const match of markup.matchAll(/(?:^|[\s<{])(?:class|className)\s*=\s*(["'])([\s\S]*?)\1/g)) {
    tokens.push(...match[2].split(/\s+/).filter(Boolean));
  }
  return tokens;
}

function hasBareTailwindTransition(markup) {
  return staticClassTokens(markup).includes('transition');
}

test('page and service content omits unsupported response, access, ownership, training, and CRM-scope promises', async () => {
  for (const contentPath of contentPaths) {
    const content = await source(contentPath);
    for (const forbiddenPromise of forbiddenPromises) {
      assert.doesNotMatch(content, forbiddenPromise, `${contentPath} contains an unsupported promise`);
    }
  }
});

test('contact copy is a neutral invitation without a speed or response-time promise', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/pages/en/contact.json'),
    source('src/content/pages/ar/contact.json'),
  ]);

  assert.doesNotMatch(english, /\b(quickly|quickest|fastest|fast)\b/i);
  assert.doesNotMatch(arabic, /بسرعة|أسرع|الأسرع/u);
});

test('page JSON meta descriptions remain within the content collection limit', async () => {
  for (const contentPath of pageJsonPaths) {
    const page = JSON.parse(await source(contentPath));
    assert.ok(page.meta.description.length <= 155, `${contentPath} meta description exceeds 155 characters`);
  }
});

test('privacy request endings direct visitors to the email address without promising a response', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/pages/en/privacy.mdx'),
    source('src/content/pages/ar/privacy.mdx'),
  ]);

  assert.match(english, /contact us at the email address below\./i);
  assert.doesNotMatch(english, /respond to every request/i);
  assert.match(arabic, /راسلنا على البريد الإلكتروني أدناه\./u);
  assert.doesNotMatch(arabic, /نرد على كل طلب/u);
});

test('AI automation process keeps only the paired approved stages without handover documentation', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/services/en/ai-solutions.mdx'),
    source('src/content/services/ar/ai-solutions.mdx'),
  ]);

  const englishProcess = section(english, 'processSteps:', 'faq:');
  const arabicProcess = section(arabic, 'processSteps:', 'faq:');

  assert.equal((englishProcess.match(/^  - title:/gm) ?? []).length, 3);
  assert.equal((arabicProcess.match(/^  - title:/gm) ?? []).length, 3);
  assert.match(englishProcess, /title: 'Process mapping'/);
  assert.match(englishProcess, /title: 'Automation design'/);
  assert.match(englishProcess, /title: 'Build & integrate'/);
  assert.match(arabicProcess, /title: 'رسم العمليات'/u);
  assert.match(arabicProcess, /title: 'تصميم الأتمتة'/u);
  assert.match(arabicProcess, /title: 'البناء والربط'/u);
  assert.doesNotMatch(englishProcess, /\b(handover|document(?:s|ed|ation)?)\b/i);
  assert.doesNotMatch(arabicProcess, /التسليم|توثيق|نوثق/u);
});

test('AI chat-assistant FAQ has paired scope-safe initial-interaction wording without response-speed claims', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/services/en/ai-solutions.mdx'),
    source('src/content/services/ar/ai-solutions.mdx'),
  ]);

  const englishFaq = section(english, 'faq:', 'metaTitle:');
  const arabicFaq = section(arabic, 'faq:', 'metaTitle:');

  assert.match(englishFaq, /repetitive initial interactions/i);
  assert.match(englishFaq, /routing/i);
  assert.match(englishFaq, /data entry/i);
  assert.match(arabicFaq, /التفاعلات الأولية المتكررة/u);
  assert.match(arabicFaq, /التوجيه/u);
  assert.match(arabicFaq, /إدخال البيانات/u);
  assert.doesNotMatch(englishFaq, /\b(instant|immediate|fast)\s+(?:repl(?:y|ies)|responses?)\b/i);
  assert.doesNotMatch(arabicFaq, /رد فوري|استجابة فورية|رد سريع/u);
});

test('performance-ad FAQs state factual Google Ads and Meta Ads channel selection', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/services/en/performance-ads.mdx'),
    source('src/content/services/ar/performance-ads.mdx'),
  ]);

  assert.match(english, /q: 'What determines whether Google Ads, Meta Ads, or both are used\?'/);
  assert.doesNotMatch(english, /q: 'Whose ad accounts are used\?'/);
  assert.match(arabic, /q: 'ما الذي يحدد استخدام إعلانات جوجل أو إعلانات ميتا أو كليهما؟'/u);
  assert.doesNotMatch(arabic, /حسابات الإعلانات لمن تكون/u);
});

test('social-media FAQs state the factual monthly-reporting deliverable', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/services/en/social-media.mdx'),
    source('src/content/services/ar/social-media.mdx'),
  ]);

  assert.match(english, /q: 'What does the monthly report include\?'/);
  assert.match(english, /a: "It covers the month's published content, community activity, and platform performance data\."/);
  assert.doesNotMatch(english, /q: 'Who owns the accounts and the content\?'/);
  assert.match(arabic, /q: 'ماذا يتضمن التقرير الشهري؟'/u);
  assert.doesNotMatch(arabic, /لمن تعود ملكية الحسابات والمحتوى/u);
});

test('web-development scope includes only analytics and lead-capture wiring', async () => {
  const [english, arabic] = await Promise.all([
    source('src/content/services/en/web-development.mdx'),
    source('src/content/services/ar/web-development.mdx'),
  ]);

  assert.match(english, /a: 'Analytics and lead-capture wiring are included in the scope\.'/);
  assert.doesNotMatch(english, /CRM[\s\S]{0,100}standard scope/i);
  assert.match(arabic, /a: 'يشمل النطاق ربط التحليلات ونماذج استقبال العملاء\.'/u);
  assert.doesNotMatch(arabic, /نظامكم جزء من نطاق العمل الأساسي/u);
});

test('Arabic content uses native MSA and Arabic legal-product references', async () => {
  for (const contentPath of arabicContentPaths) {
    const content = await source(contentPath);
    for (const colloquialism of colloquialisms) {
      assert.doesNotMatch(content, standalone(colloquialism), `${contentPath} contains ${colloquialism}`);
    }
  }

  const [privacy, terms] = await Promise.all([
    source('src/content/pages/ar/privacy.mdx'),
    source('src/content/pages/ar/terms.mdx'),
  ]);

  assert.doesNotMatch(privacy, /Google Analytics|Meta Pixel/u);
  assert.match(privacy, /إحصاءات جوجل 4/u);
  assert.match(privacy, /بكسل ميتا/u);
  assert.doesNotMatch(terms, /PYRAMEDIAX MARKETING MANAGEMENT L\.L\.C/u);
  assert.match(terms, /الشركة الموضحة أعلاه/u);
});

test('expanded About methodology stages contain two or three real sentences', async () => {
  for (const language of ['en', 'ar']) {
    const about = JSON.parse(await source(`src/content/pages/${language}/about.json`));
    for (const stage of about.methodology.stages) {
      const stageSentences = sentences(stage.body);
      assert.ok(
        stageSentences.length >= 2 && stageSentences.length <= 3,
        `${language} ${stage.name} must contain 2-3 sentences; received ${stageSentences.length}`,
      );
      for (const sentence of stageSentences) {
        assert.ok(sentence.split(/\s+/u).length >= 3, `${language} ${stage.name} contains an incomplete sentence`);
      }
    }
  }
});

test('typed UI dictionaries provide the required labels and affected components consume them', async () => {
  const [english, arabic, nav, consent, legal, contact] = await Promise.all([
    source('src/i18n/en.ts'),
    source('src/i18n/ar.ts'),
    source('src/components/Nav.astro'),
    source('src/components/ConsentBanner.astro'),
    source('src/components/pages/LegalPage.astro'),
    source('src/components/pages/ContactPage.astro'),
  ]);

  for (const dictionary of [english, arabic]) {
    for (const key of ['primaryLabel', 'mobileLabel', 'privacyChoices', 'updated', 'contactRequests', 'operator', 'load', 'frameTitle']) {
      assert.match(dictionary, new RegExp(`\\b${key}:\\s*['\"][^'\"]+['\"]`), `${key} is missing from a UI dictionary`);
    }
  }

  assert.match(nav, /aria-label=\{t\.nav\.primaryLabel\}/);
  assert.match(nav, /aria-label=\{t\.nav\.mobileLabel\}/);
  assert.match(consent, /aria-label=\{t\.a11y\.privacyChoices\}/);
  assert.match(legal, /t\.legal\.updated/);
  assert.match(legal, /t\.legal\.contactRequests/);
  assert.match(legal, /t\.legal\.operator/);
  assert.match(contact, /\{t\.map\.load\}/);
  assert.match(contact, /data-map-frame-title=\{t\.map\.frameTitle\}/);

  for (const [component, forbiddenCopy] of [
    [nav, /aria-label=\{lang\s*===\s*['"]ar['"]\s*\?/],
    [consent, /إعدادات الخصوصية|Privacy choices/],
    [legal, /Last updated|Contact for requests|آخر تحديث|للتواصل بخصوص هذه الصفحة/],
    [contact, /iframe\.title\s*=\s*['"]Google Maps['"]/],
  ]) {
    assert.doesNotMatch(component, forbiddenCopy);
  }
});

test('Arabic UI copy uses natural MSA instead of the reported colloquialisms', async () => {
  const arabic = await source('src/i18n/ar.ts');
  for (const colloquialism of ['كلمنا', 'اعرف', 'جاهزين', 'تبغى', 'صار', 'مرة ثانية', 'بنرد', 'اللي']) {
    assert.doesNotMatch(arabic, standalone(colloquialism), `Arabic UI copy contains ${colloquialism}`);
  }
});

test('Terms identifies the operator through one isolated SITE legal-name value above the MDX body', async () => {
  const [site, legal] = await Promise.all([
    source('src/config/site.ts'),
    source('src/components/pages/LegalPage.astro'),
  ]);

  assert.match(site, /\blegalName:\s*['"][^'"]+['"]/);
  assert.match(legal, /page\s*===\s*['"]terms['"]/);
  assert.equal((legal.match(/SITE\.legalName/g) ?? []).length, 1);
  assert.match(legal, /t\.legal\.operator/);
  assert.match(legal, /dir="ltr"/);
  assert.match(legal, /ltr-isolate/);
});

test('the mobile-menu control changes its accessible label with its open state', async () => {
  const nav = await source('src/components/Nav.astro');

  assert.match(nav, /data-label-open=\{t\.nav\.menuOpen\}/);
  assert.match(nav, /data-label-close=\{t\.nav\.menuClose\}/);
  assert.match(nav, /const label\s*=\s*open\s*\?\s*toggle\.dataset\.labelClose\s*:\s*toggle\.dataset\.labelOpen/);
  assert.match(nav, /toggle\.setAttribute\(['"]aria-label['"],\s*label\)/);
  assert.match(nav, /toggle\.setAttribute\(['"]aria-expanded['"],\s*String\(open\)\)/);
});

test('the nav is sticky while the main skip target has no fixed-header compensation', async () => {
  const [nav, layout] = await Promise.all([
    source('src/components/Nav.astro'),
    source('src/layouts/BaseLayout.astro'),
  ]);
  const header = nav.slice(nav.indexOf('<header'), nav.indexOf('</header>'));

  assert.match(header, /class="sticky\b/);
  assert.doesNotMatch(header, /\bfixed\b/);
  assert.match(layout, /<main\s+id="main"\s+tabindex="-1"\s*>/);
  assert.doesNotMatch(layout, /<main[^>]*\bpt-16\b/);
});

test('consent reserves float space with one observer and the float composes lift with hover scale', async () => {
  const [consent, float] = await Promise.all([
    source('src/components/ConsentBanner.astro'),
    source('src/components/WhatsAppFloat.astro'),
  ]);

  assert.match(consent, /new ResizeObserver/);
  assert.match(consent, /resizeObserver\.observe\(banner\)/);
  assert.match(consent, /resizeObserver\.disconnect\(\)/);
  assert.match(consent, /--consent-banner-offset/);
  assert.match(consent, /(?:Math\.ceil\()?height\)?\s*\+\s*16/);
  assert.match(consent, /data-consent-pending/);
  assert.match(consent, /env\(safe-area-inset-bottom\)/);
  assert.ok(
    consent.indexOf("banner.classList.add('hidden')") < consent.indexOf("root.style.removeProperty('--consent-banner-offset')"),
    'the consent offset must clear only after the banner is hidden',
  );

  assert.match(float, /inset-inline-end/);
  assert.match(float, /translateY\(var\(--wa-float-lift\)\)/);
  assert.match(float, /translateY\(var\(--wa-float-lift\)\)\s+scale\(1\.05\)/);
  assert.doesNotMatch(float, /hover:scale-/);
});

test('Astro object configuration and analytics dispatch honor every configured-provider combination', async () => {
  const [config, analytics, component] = await Promise.all([
    source('astro.config.mjs'),
    source('src/scripts/analytics.ts'),
    source('src/components/Analytics.astro'),
  ]);

  assert.match(config, /export\s+default\s+defineConfig\s*\(\s*\{/);
  assert.doesNotMatch(config, /defineConfig\s*\(\s*\(/);
  assert.match(config, /const\s+mode\s*=\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"]production['"]\s*:\s*['"]development['"]/);
  assert.match(config, /loadEnv\(\s*mode,\s*process\.cwd\(\),\s*['"]PUBLIC_['"]\s*\)/);
  assert.match(config, /env\.PUBLIC_GA4_ID\s*\?\s*\[\s*['"]dataLayer\.push['"]\s*\]\s*:\s*\[\s*\]/);
  assert.match(config, /env\.PUBLIC_META_PIXEL_ID\s*\?\s*\[\s*['"]fbq['"]\s*\]\s*:\s*\[\s*\]/);
  const integrations = section(config, 'integrations:', 'vite:');
  assert.equal((integrations.match(/\bpartytown\s*\(/g) ?? []).length, 1);
  assert.match(integrations, /\.\.\.\(\s*partytownForwards\.length\s*\?[\s\S]*:\s*\[\s*\]\s*\)/);
  assert.match(analytics, /import\s*\{\s*SITE\s*\}\s*from\s*['"]@\/config\/site['"]/);
  assert.match(analytics, /if\s*\(SITE\.ga4Id\)\s*\{/);
  assert.match(analytics, /if\s*\(SITE\.metaPixelId\s*&&\s*typeof window\.fbq\s*===\s*['"]function['"]\)\s*\{/);
  assert.ok(analytics.indexOf('if (SITE.ga4Id)') < analytics.indexOf('window.dataLayer'), 'GA dispatch must be gated by a configured ID');
  assert.ok(analytics.indexOf('if (SITE.metaPixelId') < analytics.indexOf("window.fbq('trackCustom'"), 'Meta dispatch must be gated by a configured ID');
  assert.match(component, /if \(GA4\) \{/);
  assert.match(component, /if \(PIXEL\) \{/);
});

test('contact placeholders use the compliant muted token without color-transition noise', async () => {
  const contact = await source('src/components/pages/ContactPage.astro');
  const inputClass = contact.match(/const inputClass\s*=\s*'([^']+)'/);

  assert.ok(inputClass, 'contact input class should remain a named shared value');
  assert.match(inputClass[1], /placeholder:text-muted(?!\/50)/);
  assert.doesNotMatch(inputClass[1], /transition-colors/);
});

test('structured data uses the centralized legal name without a stale legalNameEn consumer', async () => {
  const [seo, files] = await Promise.all([
    source('src/components/Seo.astro'),
    sourceFiles('src'),
  ]);

  assert.match(seo, /legalName:\s*SITE\.legalName\b/);
  for (const file of files) {
    const content = await source(file);
    assert.doesNotMatch(content, /SITE\.legalNameEn\b/, `${file} still uses the removed legal-name property`);
  }
});

test('motion loader waits for a trusted first intent and BaseLayout never statically imports the heavy runtime', async () => {
  const [loader, layout] = await Promise.all([
    source('src/scripts/motion-loader.ts'),
    source('src/layouts/BaseLayout.astro'),
  ]);

  for (const eventName of ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown']) {
    assert.match(loader, new RegExp(`['\"]${eventName}['\"]`));
  }
  assert.match(loader, /event\.isTrusted/);
  assert.match(loader, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(loader, /import\('\.\/motion'\)/);
  assert.match(loader, /motionImport\s*\?\?=/);
  assert.match(loader, /removeEventListener/);
  assert.match(layout, /import '@\/scripts\/motion-loader';/);
  assert.match(layout, /import '@\/scripts\/analytics';/);
  assert.doesNotMatch(layout, /import '@\/scripts\/motion';/);
});

test('motion loader silently re-arms trusted intent after a dynamic-import failure', async () => {
  const loader = await source('src/scripts/motion-loader.ts');

  assert.match(
    loader,
    /motionImport\s*\?\?=\s*import\('\.\/motion'\)\.catch\(\(\)\s*=>\s*\{[\s\S]*?motionImport\s*=\s*null;[\s\S]*?bindIntentListeners\(\);[\s\S]*?\}\)/,
  );
  assert.doesNotMatch(loader, /console\.(?:error|warn|log)/);
  assert.doesNotMatch(loader, /\bthrow\b/);
});

test('home hero entrance remains CSS-first, small, and SVG-normalized without a GSAP H1 tween', async () => {
  const [home, css, motion, mark] = await Promise.all([
    source('src/components/pages/HomePage.astro'),
    source('src/styles/global.css'),
    source('src/scripts/motion.ts'),
    source('src/components/PyramidMark.astro'),
  ]);

  assert.match(home, /hero-line-inner hero-entrance/);
  assert.match(home, /hero-cta hero-entrance/);
  assert.match(css, /\.hero-entrance\s*\{[\s\S]*?opacity:\s*0\.72;[\s\S]*?transform:\s*translateY\(10%\);[\s\S]*?animation:\s*hero-entrance/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero-entrance\s*\{[\s\S]*?animation:\s*none;[\s\S]*?opacity:\s*1;/);
  assert.doesNotMatch(motion, /hero-line-inner/);
  assert.doesNotMatch(motion, /yPercent:\s*55/);
  assert.equal((mark.match(/pathLength="1"/g) ?? []).length, 2);
  assert.match(css, /\.hero-pyramid \.pyramid-path\s*\{[\s\S]*?stroke-dasharray:\s*1;[\s\S]*?stroke-dashoffset:\s*1;[\s\S]*?fill-opacity:\s*0;/);
});

test('scroll reveals use static clip containers with transform/opacity stagger and card settle only', async () => {
  const [css, motion] = await Promise.all([
    source('src/styles/global.css'),
    source('src/scripts/motion.ts'),
  ]);

  assert.match(css, /\.reveal-clip\s*\{\s*overflow:\s*clip;\s*\}/);
  assert.match(motion, /classList\.add\('reveal-clip'\)/);
  assert.match(motion, /y:\s*32,[\s\S]*?opacity:\s*0,[\s\S]*?scale:[\s\S]*?stagger:\s*0\.08/);
  assert.doesNotMatch(motion, /clip(?:Path|-path)/);
});

test('source transition declarations and utilities remain transform/opacity-only', async () => {
  const [css, files] = await Promise.all([
    source('src/styles/global.css'),
    sourceFiles('src'),
  ]);
  const fileSources = await Promise.all(files.map(source));
  const transitionSources = `${css}\n${fileSources.join('\n')}`;

  assert.doesNotMatch(transitionSources, /\btransition-(?:colors|shadow|all)\b/);
  for (const match of transitionSources.matchAll(/\btransition-\[([^\]]*)\]/g)) {
    const payload = match[1];
    assert.equal(
      arbitraryTransitionIsPermitted(payload),
      true,
      `non-composited Tailwind transition payload: transition-[${payload}]`,
    );
  }
  for (const match of transitionSources.matchAll(/\btransition\s*:\s*([^;{}]+);/g)) {
    assert.ok(transitionIsPermitted(match[1]), `non-composited transition declaration: ${match[0]}`);
  }
  fileSources.forEach((fileSource, index) => {
    assert.equal(
      hasBareTailwindTransition(fileSource),
      false,
      `bare Tailwind transition utility in ${files[index]}`,
    );
  });
});

test('transition parser rejects implied and arbitrary paint/layout transitions', () => {
  assert.equal(
    transitionIsPermitted('transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease'),
    true,
  );
  assert.equal(transitionIsPermitted('none'), true);
  for (const shorthand of ['250ms ease', 'all 250ms ease', 'width 250ms ease', 'color 250ms ease']) {
    assert.equal(transitionIsPermitted(shorthand), false, `${shorthand} must be rejected`);
  }
  assert.equal(arbitraryTransitionIsPermitted('transform,opacity'), true);
  assert.equal(arbitraryTransitionIsPermitted('width'), false, 'transition-[width] must be rejected');
});

test('bare Tailwind transition utility is rejected from static class attributes', () => {
  const maliciousFixture = '<div class="card transition hover:scale-105">';
  const allowedFixtures = [
    '<div class="card transition-transform hover:scale-105">',
    '<div className="transition-opacity">',
    `<div\n  class="\n    transition-[transform,opacity]\n  ">`,
  ];

  assert.equal(hasBareTailwindTransition(maliciousFixture), true, 'bare transition must be rejected');
  allowedFixtures.forEach((fixture) => {
    assert.equal(hasBareTailwindTransition(fixture), false, `${fixture} must be permitted`);
  });
});

test('reduced-motion marquee has named lists and a wrapping, unclipped 320px structure', async () => {
  const [home, css] = await Promise.all([
    source('src/components/pages/HomePage.astro'),
    source('src/styles/global.css'),
  ]);

  assert.match(home, /class="marquee mt-6"/);
  assert.match(home, /class="marquee-list flex shrink-0 items-center"/);
  assert.doesNotMatch(home, /marquee-list[^\n]*whitespace-nowrap/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.marquee\s*\{[\s\S]*?overflow:\s*visible;[\s\S]*?inline-size:\s*100%;/);
  assert.match(css, /\.marquee-track\s*\{[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?inline-size:\s*100%;/);
  assert.match(css, /\.marquee-list\s*\{[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?flex:\s*0 1 100%;[\s\S]*?min-inline-size:\s*0;/);
  assert.match(css, /\.marquee-list\[data-dup\]\s*\{\s*display:\s*none;/);
});

test('font imports and preloads are route-aware without Cairo Latin subsets', async () => {
  const [layout, home] = await Promise.all([
    source('src/layouts/BaseLayout.astro'),
    source('src/components/pages/HomePage.astro'),
  ]);

  assert.match(layout, /cairo-arabic-800-normal\.woff2\?url/);
  assert.doesNotMatch(layout, /@fontsource\/cairo\/latin-/);
  assert.match(layout, /brandDisplay\?: boolean;/);
  assert.match(layout, /brandDisplay\s*\?\s*\[spaceGrotesk700Url,\s*cairo400Url\]\s*:\s*\[cairo800Url,\s*cairo400Url\]/);
  assert.match(layout, /:\s*\[spaceGrotesk700Url,\s*inter400Url\]/);
  assert.match(home, /brandDisplay/);
});

test('creative runtime retains its one-pin GSAP/ScrollTrigger/Lenis architecture and tears down live reduced-motion work', async () => {
  const motion = await source('src/scripts/motion.ts');

  assert.match(motion, /import gsap from 'gsap';/);
  assert.match(motion, /import \{ ScrollTrigger \} from 'gsap\/ScrollTrigger';/);
  assert.match(motion, /import Lenis from 'lenis';/);
  assert.equal((motion.match(/\bpin:\s*true\b/g) ?? []).length, 1);
  assert.match(motion, /let lenisTicker/);
  assert.match(motion, /let cursorTicker/);
  assert.match(motion, /gsap\.ticker\.remove\(lenisTicker\)/);
  assert.match(motion, /gsap\.ticker\.remove\(cursorTicker\)/);
  assert.match(motion, /lenis\?\.destroy\(\)/);
  assert.match(motion, /runtimeAbort\?\.abort\(\)/);
  assert.match(motion, /ctx\?\.revert\(\)/);
  assert.match(motion, /deferredCtx\?\.revert\(\)/);
  assert.match(motion, /\.pyramid-shimmer/);
  assert.match(motion, /motionPreference\.addEventListener\('change'/);
});

test('live reduced-motion teardown restores the methodology viewport fallback', async () => {
  const motion = await source('src/scripts/motion.ts');

  assert.match(motion, /document\.querySelectorAll<HTMLElement>\('\.method-viewport'\)[\s\S]*?removeProperty\('overflow-x'\)/);
});

test('reduced motion disables the hero SVG draw and exposes its finished mark', async () => {
  const css = await source('src/styles/global.css');

  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero-pyramid \.pyramid-path\s*\{[\s\S]*?animation:\s*none;[\s\S]*?stroke-dashoffset:\s*0;[\s\S]*?fill-opacity:\s*1;/,
  );
});

test('live reduced-motion teardown kills card-tilt effects and restores natural card state', async () => {
  const motion = await source('src/scripts/motion.ts');

  assert.match(motion, /document\.querySelectorAll<HTMLElement>\('\.card'\)[\s\S]*?gsap\.killTweensOf\(card\)[\s\S]*?removeProperty\('transform'\)[\s\S]*?classList\.remove\('tilt-on'\)/);
  assert.match(motion, /document\.querySelectorAll<HTMLElement>\('\.card-glow'\)[\s\S]*?gsap\.killTweensOf\(glow\)[\s\S]*?glow\.remove\(\)/);
  assert.match(motion, /document\.querySelectorAll<HTMLElement>\('\.method-stage\.is-active'\)[\s\S]*?classList\.remove\('is-active'\)/);
});

test('handoff records completed local Gate 2 remediation without claiming an independent PASS', async () => {
  const [notes, handoff, remediationReport] = await Promise.all([
    source('BUILD_NOTES.md'),
    source('docs/CLAUDE_CODE_HANDOFF.md'),
    source('docs/GATE2_REMEDIATION_REPORT.md'),
  ]);
  const positiveIndependentVerdict = /(?:independent|formal) GATE 2(?: re-review)?(?: verdict)?\s+(?:is|:)\s+\**PASS\b/i;

  assert.match(
    'The independent GATE 2 re-review verdict is PASS.',
    positiveIndependentVerdict,
    'the guard must detect an explicit positive independent verdict',
  );

  assert.match(notes, /All 18 GATE 2 findings have been remediated locally/i);
  assert.match(handoff, /All 18 GATE 2 findings have been remediated locally/i);
  assert.match(remediationReport, /All 18 GATE 2 findings have been remediated locally/i);
  assert.match(handoff, /formal independent GATE 2 re-review[^\n]*pending/i);
  assert.doesNotMatch(handoff, /GATE 2 future work/i);
  assert.doesNotMatch(handoff, /GATE 2 and GATE 3[\s\S]*The following are not completed merely because GATE 1 passed/i);
  [notes, handoff, remediationReport].forEach((document) => {
    assert.doesNotMatch(document, positiveIndependentVerdict);
  });
});
