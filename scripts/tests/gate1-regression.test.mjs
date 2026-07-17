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
