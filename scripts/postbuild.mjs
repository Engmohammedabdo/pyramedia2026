/**
 * Post-build normalization: the Arabic homepage builds as /ar.html and its
 * canonical live URL is /ar/ (SPEC §5). @astrojs/sitemap emits it as /ar —
 * rewrite those entries so the sitemap matches the canonical URLs exactly.
 * Also guards the built CSS against dead paint/layout transition utilities
 * leaking in from prose sources (G2-RR2-004) — fails the build if found.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const file = new URL('../dist/sitemap-0.xml', import.meta.url);
let xml = await readFile(file, 'utf8');

xml = xml
  .replaceAll('<loc>https://pyramedia.info/ar</loc>', '<loc>https://pyramedia.info/ar/</loc>')
  .replaceAll('href="https://pyramedia.info/ar"', 'href="https://pyramedia.info/ar/"');

await writeFile(file, xml);
console.log('sitemap normalized (/ar → /ar/)');

// Built-CSS guard: no Tailwind transition-* utility rule may reach dist
// (authored motion uses transform/opacity component styles only, SPEC §8).
const astroDir = new URL('../dist/_astro/', import.meta.url);
const banned = ['.transition{', '.transition-all{', '.transition-colors{', '.transition-shadow{', '.transition-\\[width\\]{'];
for (const entry of await readdir(astroDir)) {
  if (!entry.endsWith('.css')) continue;
  const css = await readFile(new URL(entry, astroDir), 'utf8');
  for (const rule of banned) {
    if (css.includes(rule)) {
      console.error(`FAIL: dead transition utility ${rule} found in dist/_astro/${entry} (G2-RR2-004)`);
      process.exit(1);
    }
  }
}
console.log('built CSS clean of transition utilities');
