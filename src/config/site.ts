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

  legalNameEn: 'PYRAMEDIAX MARKETING MANAGEMENT L.L.C',
  // Arabic-script rendering (transliteration) of the registered English legal
  // name — see BUILD_NOTES.md; swap if the license shows a different Arabic name.
  legalNameAr: 'بيراميديا إكس ماركتينج مانجمنت ذ.م.م',
  license: '1485511',

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

/** License trust line (footer + about), SPEC §6.4. */
export function licenseLine(lang: Lang): string {
  return lang === 'ar'
    ? `${SITE.legalNameAr} — رخصة تجارية في دبي رقم ${SITE.license}`
    : `${SITE.legalNameEn} — Dubai Trade License No. ${SITE.license}`;
}
