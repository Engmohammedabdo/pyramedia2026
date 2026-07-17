import type { Lang } from '@/config/site';
import { en, type Dictionary } from './en';
import { ar } from './ar';

export const LANGS: Lang[] = ['en', 'ar'];
export const DEFAULT_LANG: Lang = 'en';

const dictionaries: Record<Lang, Dictionary> = { en, ar };

/** Returns the UI-string dictionary for a language. */
export function useTranslations(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export function dirFor(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ar' ? 'en' : 'ar';
}

/**
 * Localizes a root-relative EN path for the given language.
 * localizePath('/services/seo', 'ar') → '/ar/services/seo'
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return lang === 'ar' ? (clean ? `/ar${clean}` : '/ar/') : clean || '/';
}

/**
 * Normalizes a pathname to its canonical extensionless form. Build-time
 * pathnames look like /about.html (build.format 'file') — live URLs don't.
 */
export function normalizePathname(pathname: string): string {
  let p = pathname.replace(/\.html$/, '');
  if (p === '' || p === '/index') return '/';
  if (p !== '/' && p !== '/ar/') p = p.replace(/\/$/, '');
  return p;
}

/**
 * Maps the current pathname to the equivalent page in the other language
 * (SPEC §6.4 — the switcher lands on the same page, never the homepage).
 */
export function switchLangPath(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === '/ar' || normalized === '/ar/') return '/';
  if (normalized.startsWith('/ar/')) return normalized.slice(3) || '/';
  return normalized === '/' ? '/ar/' : `/ar${normalized}`;
}

/** Language of the current pathname. */
export function langFromPath(pathname: string): Lang {
  const p = normalizePathname(pathname);
  return p === '/ar' || p === '/ar/' || p.startsWith('/ar/') ? 'ar' : 'en';
}
