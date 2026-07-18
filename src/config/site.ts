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

  // TODO_OFFICE_ADDRESS_EN — exact office address line pending from owner (SPEC §14)
  addressEn: 'Deira, Port Saeed — Dubai, UAE',
  // TODO_OFFICE_ADDRESS_AR — exact office address line pending from owner (SPEC §14)
  addressAr: 'ديرة، بور سعيد — دبي، الإمارات',
  addressLocality: { en: 'Dubai', ar: 'دبي' },
  addressCountry: 'AE',
  // SPEC §4 approved service area — consumed by all JSON-LD emitters
  areaServed: { en: 'United Arab Emirates & GCC', ar: 'الإمارات ودول الخليج' },

  // TODO_MAPS_EMBED_URL — Google Maps embed/share URL pending from owner (SPEC §14).
  // While empty, the contact address card renders without the map block.
  mapsEmbedUrl: '',

  socials: {
    instagram: 'https://instagram.com/pyramedia.dxb',
    facebook: 'https://facebook.com/pyramedia.official',
    linkedin: 'https://linkedin.com/company/pyramedia-dxb',
  },

  // Analytics / integrations — injected only when present (SPEC §10, §14)
  ga4Id: import.meta.env.PUBLIC_GA4_ID || '',
  metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID || '',
  n8nWebhookUrl: import.meta.env.PUBLIC_N8N_WEBHOOK_URL || '',
} as const;

/** Prefilled WhatsApp messages per language (SPEC §7.4, verbatim). */
export const WA_MESSAGE: Record<Lang, string> = {
  en: "Hello PyramediaX, I'd like to discuss your services.",
  ar: 'مرحباً بيراميديا إكس، حابب أستفسر عن خدماتكم.',
};

/** wa.me deep-link builder — the only allowed WhatsApp URL constructor. */
export function waLink(lang: Lang = 'en'): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(WA_MESSAGE[lang])}`;
}

/** Plain wa.me link without a prefilled message. */
export const WA_BASE = `https://wa.me/${SITE.whatsappNumber}`;

/** tel: and mailto: links, built once here. */
export const TEL_LINK = `tel:${SITE.phoneE164}`;
export const MAILTO_LINK = `mailto:${SITE.email}`;

/** Instagram handle, derived from the single social URL source. */
export const IG_HANDLE = SITE.socials.instagram.split('/').filter(Boolean).pop() ?? '';

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
