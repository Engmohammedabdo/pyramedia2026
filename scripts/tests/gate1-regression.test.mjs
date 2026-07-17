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
