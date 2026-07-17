/**
 * One-off generator for the film-grain noise tile (SPEC §6.3).
 * Produces public/noise.png (128×128 grayscale). Committed to the repo —
 * run again only if the tile ever needs regenerating: node scripts/generate-noise.mjs
 */
import sharp from 'sharp';

const size = 128;
const raw = Buffer.alloc(size * size);
for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256);

await sharp(raw, { raw: { width: size, height: size, channels: 1 } })
  .png({ compressionLevel: 9 })
  .toFile('public/noise.png');

console.log('public/noise.png written');
