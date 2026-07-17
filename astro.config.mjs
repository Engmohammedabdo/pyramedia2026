// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://pyramedia.info',
  output: 'static',
  // 'file' format => /about builds to /about.html; .htaccess serves it
  // extensionless so live URLs match SPEC §5 exactly (no trailing slash).
  build: { format: 'file' },
  trailingSlash: 'never',
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
    partytown({
      config: { forward: ['dataLayer.push', 'fbq'] },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
