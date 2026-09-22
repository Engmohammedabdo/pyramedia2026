/**
 * src/config/site.ts — SINGLE SOURCE OF TRUTH (SPEC §9).
 * Every component imports contact data, socials, legal identity and env
 * reads from here. Nothing below may be hardcoded anywhere else.
 */

export type Lang = 'en' | 'ar';

export const SITE = {
  brand: 'PyramediaX',
  wordmark: 'PYRAMEDIA X',
  tagline: 'Less Talk. More Performance.', // brand mark — stays English on both languages (SPEC §2.4)

  legalName: 'PYRAMEDIAX MARKETING MANAGEMENT L.L.C',
  // The registered Arabic legal name is NOT published: SPEC §4 approves only
  // the exact English legal name, and no license-verified Arabic rendering
  // exists yet (G2-RR-002). Arabic pages render the English name LTR-isolated.
  // When the owner supplies the Arabic name from the trade license, add it
  // here and update licenseLine() below.
  license: '1485511',
  // Brand name as it appears in approved Arabic copy (a brand rendering,
  // not the legal identity) — used for the Arabic copyright line.
  brandAr: 'بيراميديا إكس',

  url: import.meta.env.PUBLIC_SITE_URL || 'https://pyramedia.info',
  domain: 'pyramedia.info',

  phoneDisplay: '+971 56 579 9505',
  phoneE164: '+971565799505',
  whatsappNumber: '971565799505',
  email: 'info@pyramedia.info',

  // District corrected from Port Saeed to Al Khabaisi by the owner on
  // 2026-08-17 (SPEC Addendum A.8), matching the Google Business listing the
  // map pin is built from. Consumed by the footer, contact card, About copy
  // and the JSON-LD streetAddress — change it here only.
  addressEn: 'Al Khabaisi, Deira — Dubai, UAE',
  addressAr: 'الخبيصي، ديرة — دبي، الإمارات',
  addressLocality: { en: 'Dubai', ar: 'دبي' },
  addressCountry: 'AE',
  // SPEC §4 approved service area — consumed by all JSON-LD emitters
  areaServed: { en: 'United Arab Emirates & GCC', ar: 'الإمارات ودول الخليج' },

  // Built from the owner's Google Business location (share link resolved to
  // 25.2666595, 55.3306708 on 2026-08-17). The classic `output=embed` form is
  // used deliberately: it needs no Maps API key and its host is already in the
  // §13.2 CSP frame-src allowlist. Emptying it hides the map block again.
  mapsEmbedUrl: 'https://maps.google.com/maps?q=25.2666595,55.3306708&z=16&output=embed',

  // Founder section (§7.1 section 6 + the About page block). Hidden at the
  // owner's request on 2026-08-17 while the real photo is outstanding. Setting
  // this to true restores both sections AND the Person node in the JSON-LD
  // graph — they are deliberately tied so the graph never describes someone
  // the site does not show. The §6.4 licence trust line is NOT gated by it.
  showFounder: false,

  // Careers application form (SPEC Addendum A.2) — owner-supplied Airtable
  // form. Swap this one value to change where every "apply" link points.
  careersUrl: 'https://airtable.com/appeclwXGsdT1l4jO/pagBjv8uJDJqShsji/form',

  // Client-intake Airtable form (SPEC Addendum A.3) — owner-supplied, backed
  // by the "PyramediaX Clients" base. If this is ever emptied, the "become
  // our client" gateway falls back to /contact, the §7.4 intake path.
  clientFormUrl: 'https://airtable.com/appVJGpxA8KzwVjPY/paghHJDi2GVpoTZB0/form',

  socials: {
    instagram: 'https://instagram.com/pyramedia.dxb',
    facebook: 'https://facebook.com/pyramedia.official',
    linkedin: 'https://linkedin.com/company/pyramedia-dxb',
    // Added on owner instruction, 2026-08-17 (SPEC Addendum A.9)
    tiktok: 'https://www.tiktok.com/@pyramedia.dxb',
  },

  // Analytics / integrations — injected only when present (SPEC §10, §14)
  ga4Id: import.meta.env.PUBLIC_GA4_ID || '',
  metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID || '',
  tiktokPixelId: import.meta.env.PUBLIC_TIKTOK_PIXEL_ID || '',
  // OpenAI Ads (ChatGPT) Measurement Pixel — fourth analytics provider,
  // SPEC Addendum A.10.
  openaiPixelId: import.meta.env.PUBLIC_OPENAI_PIXEL_ID || '',
  n8nWebhookUrl: import.meta.env.PUBLIC_N8N_WEBHOOK_URL || '',
  // Instant audit webhook (Feature 2). Empty ⇒ the audit route renders its
  // WhatsApp fallback instead of a form that cannot run.
  auditWebhookUrl: import.meta.env.PUBLIC_N8N_AUDIT_URL || '',
  // Instagram mode costs an Apify run per audit; off until the owner approves
  // that budget. Website audits are free and always available.
  auditInstagramEnabled: import.meta.env.PUBLIC_AUDIT_INSTAGRAM === 'true',
} as const;

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

/** tel: and mailto: links, built once here. */
export const TEL_LINK = `tel:${SITE.phoneE164}`;
export const MAILTO_LINK = `mailto:${SITE.email}`;

/** Instagram handle, derived from the single social URL source. */
export const IG_HANDLE = SITE.socials.instagram.split('/').filter(Boolean).pop() ?? '';

/**
 * Social links with their platform display labels (proper nouns, identical
 * in both languages) — the single source for social navigation (G2-008).
 */
/**
 * Work showcases (SPEC Addendum A.5) — owner-built portfolio pages already
 * live on the `card` subdomain. The site LINKS to them; it does not host a
 * portfolio section (the §7 no-portfolio scope rule still stands).
 * Source pages are Arabic-only, so every link carries hreflang="ar".
 * Emptying a value removes that button everywhere, with no other edit.
 */
export const SHOWCASE_URLS: Record<string, string> = {
  'web-development': 'https://card.pyramedia.info/',
  'social-media': 'https://card.pyramedia.info/vp/',
};

/**
 * Mark shown in the showcase pill's badge. Websites get the gallery grid,
 * video gets the play triangle, so the two are told apart before the label
 * is read. Anything unlisted falls back to the grid.
 */
export const SHOWCASE_ICONS: Record<string, string> = {
  'web-development': 'layout-grid',
  'social-media': 'play',
};

/** Showcase URL for a service slug — '' when that service has none. */
export function showcaseUrl(slug: string): string {
  return SHOWCASE_URLS[slug] ?? '';
}

/** Badge icon for a service slug's showcase. */
export function showcaseIcon(slug: string): string {
  return SHOWCASE_ICONS[slug] ?? 'layout-grid';
}

export const SOCIAL_LINKS = [
  { href: SITE.socials.instagram, icon: 'instagram', label: 'Instagram' },
  { href: SITE.socials.facebook, icon: 'facebook', label: 'Facebook' },
  { href: SITE.socials.linkedin, icon: 'linkedin', label: 'LinkedIn' },
  { href: SITE.socials.tiktok, icon: 'tiktok', label: 'TikTok' },
] as const;

/**
 * License trust line (footer + about + legal), SPEC §6.4. On Arabic pages the
 * approved ENGLISH legal name is rendered inside Unicode LTR-isolate marks
 * (LRI…PDI) — publishing an unverified Arabic transliteration as the licensed
 * operator would violate §2.1 (G2-RR-002).
 */
export function licenseLine(lang: Lang): string {
  return lang === 'ar'
    ? `⁦${SITE.legalName}⁩ — رخصة تجارية في دبي رقم ${SITE.license}`
    : `${SITE.legalName} — Dubai Trade License No. ${SITE.license}`;
}
