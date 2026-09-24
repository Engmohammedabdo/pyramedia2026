/**
 * Conversion-event wiring (SPEC §10). Exact event names — Meta campaigns
 * optimize on these: whatsapp_click {placement}, form_submit, form_success,
 * call_click, email_click.
 *
 * Plus three engagement events from SPEC Addendum A.3 and A.5, same
 * {placement} payload, NOT used for campaign optimisation:
 * client_apply_click, careers_click, work_click.
 *
 * Sources:
 *  - Delegated clicks on [data-event] elements (links/buttons).
 *  - `pyx:track` CustomEvents (contact form lifecycle).
 * Events are dropped unless the visitor accepted the consent banner.
 *
 * OpenAI Ads Pixel (SPEC Addendum A.10) maps the confirmed-contact subset of
 * the five §10 conversion events to OpenAI's standard `lead_created` event —
 * NOT `form_submit`, because ContactPage.astro fires `form_submit` on click
 * and `form_success` moments later on the same successful send; mapping both
 * to one standard event would double-count every real lead. Every other
 * event (the unconfirmed `form_submit` attempt plus the three engagement
 * events) goes through as an OpenAI custom event, same as GA4/Meta/TikTok.
 */
import { SITE } from '@/config/site';

const OPENAI_LEAD_EVENTS = new Set(['whatsapp_click', 'form_success', 'call_click', 'email_click']);

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ttq?: { track?: (...args: unknown[]) => void };
    oaiq?: (...args: unknown[]) => void;
    partytown?: unknown;
    __pyxAnalyticsBound?: boolean;
  }
}

function consented(): boolean {
  try {
    return localStorage.getItem('pyx-consent') === 'accepted';
  } catch {
    return false;
  }
}

// Each vendor is isolated: a throwing stub (content blocker, half-loaded SDK)
// must not drop the event for the vendors after it — OpenAI runs last.
function send(event: string, params: Record<string, string> = {}) {
  if (!consented()) return;

  if (SITE.ga4Id) {
    try {
      // gtag semantics: dataLayer receives an arguments object, not an array.
      (function gtag(..._args: unknown[]) {
        (window.dataLayer = window.dataLayer || []).push(arguments);
      })('event', event, params);
    } catch {}
  }
  if (SITE.metaPixelId && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', event, params);
    } catch {}
  }
  if (SITE.tiktokPixelId && typeof window.ttq?.track === 'function') {
    try {
      window.ttq.track(event, params);
    } catch {}
  }
  if (SITE.openaiPixelId && typeof window.oaiq === 'function') {
    try {
      if (OPENAI_LEAD_EVENTS.has(event)) {
        window.oaiq('measure', 'lead_created', { type: 'customer_action' });
      } else {
        window.oaiq('measure', 'custom', { type: 'custom', ...params }, { custom_event_name: event });
      }
    } catch {}
  }
}

function bind() {
  // Once per window, across deploys: a tab opened before a deploy loads the
  // new bundle on its next in-site navigation, and a second listener would
  // double every event. Pre-A.12 tabs never set the flag; Partytown's config
  // object marks them instead.
  if (window.__pyxAnalyticsBound || window.partytown) return;
  window.__pyxAnalyticsBound = true;

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
// (the initial astro:page-load has already fired; the window flag guards doubles).
bind();
