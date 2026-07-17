/**
 * One-off generator for the branded OG image (SPEC §11): dark, logo lockup +
 * tagline. Produces public/og-image.png (1200×630). Committed to the repo —
 * rerun only when the brand changes: node scripts/generate-og.mjs
 */
import sharp from 'sharp';

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#F26E24" stop-opacity="0.16"/>
      <stop offset="70%" stop-color="#F26E24" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0E0E0F"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- pyramid line-art, faint, end side -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
    <path d="M760 560 L950 240 L1095 480" stroke="#F26E24" stroke-width="5"/>
    <path d="M1050 560 L1145 400 L1245 560" stroke="#FF7E33" stroke-width="5" opacity="0.85"/>
    <path d="M760 560 L1245 560" stroke="#F4C430" stroke-width="2.5" opacity="0.6"/>
  </g>

  <!-- logo mark -->
  <g transform="translate(96 96)">
    <path d="M0 64 L36 4 L63.5 49 L55 64 Z" fill="#F26E24"/>
    <path d="M55 64 L74 32 L96 64 Z" fill="#FF7E33" opacity="0.85"/>
  </g>

  <text x="96" y="292" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="bold" letter-spacing="4" fill="#F7F5F2">PYRAMEDIA <tspan fill="#F26E24">X</tspan></text>
  <text x="96" y="392" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="bold" fill="#F26E24">Less Talk. More Performance.</text>
  <text x="96" y="470" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#A6A19B">Full-service digital marketing agency — Dubai</text>
  <text x="96" y="548" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="2" fill="#A6A19B" opacity="0.8">pyramedia.info</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-image.png');
console.log('public/og-image.png written');
