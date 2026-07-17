/**
 * Post-build normalization: the Arabic homepage builds as /ar.html and its
 * canonical live URL is /ar/ (SPEC §5). @astrojs/sitemap emits it as /ar —
 * rewrite those entries so the sitemap matches the canonical URLs exactly.
 */
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../dist/sitemap-0.xml', import.meta.url);
let xml = await readFile(file, 'utf8');

xml = xml
  .replaceAll('<loc>https://pyramedia.info/ar</loc>', '<loc>https://pyramedia.info/ar/</loc>')
  .replaceAll('href="https://pyramedia.info/ar"', 'href="https://pyramedia.info/ar/"');

await writeFile(file, xml);
console.log('sitemap normalized (/ar → /ar/)');
