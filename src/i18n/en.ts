/** English UI strings — page copy lives in src/content (SPEC §9). */
export const en = {
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    contact: 'Contact',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    primaryLabel: 'Primary navigation',
    mobileLabel: 'Mobile navigation',
    langSwitch: 'التبديل إلى العربية',
    langLabel: 'ع',
  },
  cta: {
    whatsapp: 'Talk to us on WhatsApp',
    exploreServices: 'Explore services',
    contactUs: 'Contact us',
    aboutLink: 'More about us',
    careers: 'Apply to jobs & internships',
    becomeClient: 'Become our client',
    whatsappFloat: 'Chat with PyramediaX on WhatsApp',
  },
  ctaBand: {
    title: 'Ready when you are.',
  },
  footer: {
    navigate: 'Navigate',
    services: 'Services',
    contact: 'Contact',
    follow: 'Follow',
    rights: 'All rights reserved.',
  },
  form: {
    name: 'Name',
    phone: 'Phone',
    phoneHint: 'International format, e.g. +971 5X XXX XXXX',
    email: 'Email',
    company: 'Company',
    service: 'Service of interest',
    serviceGeneral: 'General inquiry',
    message: 'Message',
    optional: 'optional',
    send: 'Send message',
    sending: 'Sending…',
    errRequired: 'This field is required.',
    errPhone: 'Enter a valid phone number.',
    errEmail: 'Enter a valid email address.',
    hpLabel: 'Website',
    successTitle: 'Thank you — we received your message.',
    successBody: 'Thank you for reaching out. You can also message us on WhatsApp.',
    errorTitle: 'Something went wrong.',
    errorBody: 'Please try again — or message us directly on WhatsApp.',
    retry: 'Try again',
    disabledNotice: 'The form is being set up. Message us on WhatsApp.',
  },
  consent: {
    text: 'We use analytics cookies to understand how visitors use this site. Nothing is tracked unless you accept.',
    accept: 'Accept',
    decline: 'Decline',
  },
  service: {
    included: "What's included",
    process: 'How it runs',
    tools: 'Tools we work with',
    faq: 'Common questions',
    all: 'All services',
  },
  a11y: {
    skipLink: 'Skip to content',
    breadcrumb: 'Breadcrumb',
    privacyChoices: 'Privacy choices',
  },
  legal: {
    updated: 'Last updated',
    contactRequests: 'Contact for requests',
    operator: 'Site operator',
  },
  map: {
    load: 'Load the map',
    frameTitle: 'Location map',
  },
  instagram: {
    eyebrow: 'From our Instagram',
    title: 'Selected reels from our feed.',
    follow: 'Follow us on Instagram',
    card: 'Instagram reel',
    play: 'Play reel',
    player: 'Instagram player',
    hint: 'Playing a reel loads the official Instagram player.',
  },
  founder: {
    name: 'Mohamed Abdou',
    title: 'Founder & CEO',
  },
  notFound: {
    title: 'Page not found.',
    body: "The page you're looking for doesn't exist or has moved.",
    back: 'Back to homepage',
  },
} as const;

/**
 * Structural dictionary type: same shape as the English source, but every
 * leaf widens to `string` so native locales type-check (G2-RR2-005).
 */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };
export type Dictionary = DeepStrings<typeof en>;
