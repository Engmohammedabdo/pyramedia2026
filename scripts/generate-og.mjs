/**
 * One-off generator for the branded OG image (SPEC §11): dark, official
 * mark + wordmark + tagline. Produces public/og-image.png (1200×630).
 * Committed to the repo — rerun only when the brand changes:
 *   node scripts/generate-og.mjs
 * Mark paths are the authentic brand geometry from logo/svg (variant 06),
 * colors mapped to the SPEC §6.1 tokens.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

// Authentic mark paths, extracted from logo/svg (viewBox space 1920×1080,
// mark occupies 728–1158 × 211–573).
const PEAKS_D =
  'M1146.552,555.151c-5.47,3.502-12.743,1.908-16.246-3.562l-94.681-147.866c-.087-.133-.207-.307-.608-.326-.398.007-.518.213-.599.349l-72.083,122.09c-4.38,7.418-12.137,11.869-20.748,11.911h-.123c-8.563,0-16.307-4.368-20.737-11.706l-73.683-122.025c-.082-.136-.206-.341-.605-.342h0c-.398,0-.522.205-.604.34l-89.391,147.191c-3.371,5.551-10.605,7.319-16.156,3.947h-.001c-5.551-3.372-7.319-10.606-3.947-16.157l89.391-147.191c4.432-7.298,12.172-11.652,20.708-11.652h.032c8.468,0,16.319,4.43,20.696,11.679l73.698,122.052c.087.146.28.384.609.342.402-.002.521-.202.608-.349l72.083-122.09c4.313-7.304,11.95-11.755,20.43-11.907,8.545-.191,16.27,4.019,20.841,11.161l94.68,147.865c3.502,5.47,1.907,12.743-3.562,16.245h0Z';
const DIAMOND_D =
  'M1021.903,565.537c-5.607,3.278-12.81,1.389-16.088-4.218l-130.215-222.763c-4.264-7.295-4.447-16.107-.491-23.573l45.4-85.652c4.152-7.834,12.239-12.769,21.104-12.881,8.925-.085,17.074,4.619,21.421,12.346l48.245,85.731c4.269,7.59,4.129,16.936-.368,24.394l-54.762,90.824,69.973,119.705c3.278,5.607,1.389,12.81-4.218,16.088h0ZM941.924,239.969h-.016c-.42.005-.529.211-.617.376l-45.399,85.651c-.115.217-.11.475.015.688l46.721,79.928,48.138-79.84c.131-.217.136-.49.011-.712l-48.244-85.731c-.091-.162-.203-.361-.61-.361Z';

// Places the mark (source box 728,211 430×362) at x,y with target width w.
const mark = (x, y, w, opacity = 1) => {
  const s = w / 430;
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(5)}) translate(-728 -211)" opacity="${opacity}">
    <path d="${PEAKS_D}" fill="#F26E24"/>
    <path d="${DIAMOND_D}" fill="#F7F5F2"/>
  </g>`;
};

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#F26E24" stop-opacity="0.16"/>
      <stop offset="70%" stop-color="#F26E24" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0E0E0F"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- official mark, faint, end side -->
  ${mark(790, 160, 400, 0.3)}

  <!-- official mark, lockup scale -->
  ${mark(96, 84, 128)}

  <text x="96" y="292" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="bold" letter-spacing="4" fill="#F7F5F2">PYRAMEDIA <tspan fill="#F26E24">X</tspan></text>
  <text x="96" y="392" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="bold" fill="#F26E24">Less Talk. More Performance.</text>
  <text x="96" y="470" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#A6A19B">Full-service digital marketing agency — Dubai</text>
  <text x="96" y="548" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="2" fill="#A6A19B" opacity="0.8">pyramedia.info</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-image.png');
console.log('public/og-image.png written');
