/**
 * Conversion-event wiring (SPEC §10). Exact event names — Meta campaigns
 * optimize on these: whatsapp_click {placement}, form_submit, form_success,
 * call_click, email_click.
 *
 * Sources:
 *  - Delegated clicks on [data-event] elements (links/buttons).
 *  - `pyx:track` CustomEvents (contact form lifecycle).
 * Events are dropped unless the visitor accepted the consent banner.
 */
import { SITE } from '@/config/site';

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

function consented(): boolean {
  try {
    return localStorage.getItem('pyx-consent') === 'accepted';
  } catch {
    return false;
  }
}

function send(event: string, params: Record<string, string> = {}) {
  if (!consented()) return;

  if (SITE.ga4Id) {
    // gtag semantics: dataLayer receives an arguments object (Partytown
    // forwards dataLayer.push into the worker).
    (function gtag(..._args: unknown[]) {
      (window.dataLayer = window.dataLayer || []).push(arguments);
    })('event', event, params);
  }
  if (SITE.metaPixelId && typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params);
  }
}

let bound = false;

function bind() {
  if (bound) return;
  bound = true;

  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.('[data-event]') as HTMLElement | null;
    if (!el?.dataset.event) return;
    const params: Record<string, string> = {};
    if (el.dataset.placement) params.placement = el.dataset.placement;
    send(el.dataset.event, params);
  });

  window.addEventListener('pyx:track', (e) => {
    const detail = (e as CustomEvent).detail as
      | { event?: string; params?: Record<string, string> }
      | undefined;
    if (detail?.event) send(detail.event, detail.params ?? {});
  });
}

document.addEventListener('astro:page-load', bind);

// Dynamically imported after the load event — bind immediately as well
// (the initial astro:page-load has already fired; `bound` guards doubles).
bind();
