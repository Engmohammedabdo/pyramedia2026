// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), 'PUBLIC_');

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
  // Instagram reel thumbnails (SPEC Addendum A.1) are fetched ONCE at build
  // time and optimized into local assets — no Instagram request at runtime.
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.instagram.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
