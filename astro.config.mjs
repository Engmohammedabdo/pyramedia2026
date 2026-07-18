// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), 'PUBLIC_');
const partytownForwards = [
  ...(env.PUBLIC_GA4_ID ? ['dataLayer.push'] : []),
  ...(env.PUBLIC_META_PIXEL_ID ? ['fbq'] : []),
];

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://pyramedia.info',
  output: 'static',
  // File output keeps extensionless Apache URLs. Preview accepts both forms so
  // the canonical Arabic root /ar/ can be exercised before deployment.
  build: { format: 'file' },
  trailingSlash: 'ignore',
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ar: 'ar' },
      },
    }),
    ...(partytownForwards.length ? [partytown({ config: { forward: partytownForwards } })] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
