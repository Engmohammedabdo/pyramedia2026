import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const projectRoot = new URL('../../', import.meta.url);

async function source(relativePath) {
  return readFile(new URL(relativePath, projectRoot), 'utf8');
}

test('Astro preview accepts the canonical Arabic homepage trailing slash', async () => {
  const config = await source('astro.config.mjs');

  assert.match(config, /build:\s*\{\s*format:\s*'file'\s*\}/);
  assert.match(config, /trailingSlash:\s*'ignore'/);
});

test('desktop nav CTA is hidden by a responsive wrapper on mobile', async () => {
  const nav = await source('src/components/Nav.astro');

  assert.match(
    nav,
    /<div class="hidden sm:block">\s*<a[\s\S]*?data-placement="nav"[\s\S]*?<\/a>\s*<\/div>/
  );
  assert.doesNotMatch(nav, /class="btn-primary hidden/);
});

test('skip-link target is programmatically focusable', async () => {
  const layout = await source('src/layouts/BaseLayout.astro');

  assert.match(layout, /<main\s+id="main"\s+tabindex="-1"/);
});

test('route-aware font preloads match Arabic home branding, Arabic interiors, and English display/body roles', async () => {
  const [layout, home] = await Promise.all([
    source('src/layouts/BaseLayout.astro'),
    source('src/components/pages/HomePage.astro'),
  ]);

  assert.match(layout, /import cairo400Url from '@fontsource\/cairo\/files\/cairo-arabic-400-normal\.woff2\?url';/);
  assert.match(layout, /import cairo800Url from '@fontsource\/cairo\/files\/cairo-arabic-800-normal\.woff2\?url';/);
  assert.doesNotMatch(layout, /@fontsource\/cairo\/latin-/);
  assert.match(layout, /brandDisplay\?: boolean;/);
  assert.match(layout, /brandDisplay\s*\?\s*\[spaceGrotesk700Url,\s*cairo400Url\]\s*:\s*\[cairo800Url,\s*cairo400Url\]/);
  assert.match(layout, /:\s*\[spaceGrotesk700Url,\s*inter400Url\]/);
  assert.match(home, /<BaseLayout\s+lang=\{lang\}\s+title=\{c\.meta\.title\}\s+description=\{c\.meta\.description\}\s+brandDisplay/);
});

test('component alpha colors come from the token file', async () => {
  const [css, footer, whatsapp] = await Promise.all([
    source('src/styles/global.css'),
    source('src/components/Footer.astro'),
    source('src/components/WhatsAppFloat.astro'),
  ]);

  assert.match(css, /--color-text-faint:\s*rgb\(247 245 242 \/ 0\.08\);/);
  assert.match(css, /--color-orange-pulse-50:\s*rgb\(242 110 36 \/ 0\.5\);/);
  assert.match(css, /--color-orange-pulse-45:\s*rgb\(242 110 36 \/ 0\.45\);/);
  assert.doesNotMatch(css, /--color-orange-clear:/);
  assert.doesNotMatch(footer, /rgba\(247, 245, 242/);
  assert.doesNotMatch(whatsapp, /rgba\(242, 110, 36/);
});

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

test('BUILD_NOTES labels historical Arabic evidence and current remediation accurately', async () => {
  const notes = await source('BUILD_NOTES.md');

  assert.match(notes, /Historical Lighthouse 12[\s\S]*`\/ar` was measured; this did not verify canonical `\/ar\/`/);
  assert.match(notes, /GATE 1 remediation verification \(2026-07-17\)/);
  assert.doesNotMatch(notes, /verified in built HTML on 8 sampled pages \u2014 always/);
});
