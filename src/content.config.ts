import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections (SPEC §9). Copy lives here, never in components.
 * Blog-ready, not blog-built: adding a `blog` collection later requires
 * zero refactor — define it below and add routes.
 */

const services = defineCollection({
  // generateId: keep folder-based ids (en/seo, ar/seo) — otherwise the glob
  // loader would use the `slug` frontmatter field as the id and the EN/AR
  // pairs would collide on identical slugs.
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/services',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: z.object({
    lang: z.enum(['en', 'ar']),
    slug: z.string(),
    name: z.string(),
    oneLiner: z.string(),
    icon: z.string(),
    order: z.number().int().min(1).max(6),
    heroPromise: z.string(),
    deliverables: z.array(z.string()).min(3),
    processSteps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .min(3)
      .max(5),
    tools: z.array(z.string()).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).length(3),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: z
    .object({
      meta: z.object({
        title: z.string().max(60),
        description: z.string().max(155),
      }),
    })
    .passthrough(),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    lang: z.enum(['en', 'ar']),
    title: z.string(),
    lastUpdated: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
  }),
});

export const collections = { services, pages, legal };
