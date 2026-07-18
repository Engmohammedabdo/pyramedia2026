/**
 * Lightweight motion gateway. The GSAP/Lenis runtime stays out of the
 * load-critical module graph until a real visitor expresses intent.
 */
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const intentEvents = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

let motionImport: Promise<unknown> | null = null;
let intentListenersBound = false;

function removeIntentListeners() {
  if (!intentListenersBound) return;
  intentEvents.forEach((eventName) => document.removeEventListener(eventName, onIntent));
  intentListenersBound = false;
}

function onIntent(event: Event) {
  if (!event.isTrusted || motionPreference.matches || motionImport) return;
  removeIntentListeners();
  motionImport ??= import('./motion').catch(() => {
    motionImport = null;
    bindIntentListeners();
  });
}

function bindIntentListeners() {
  if (intentListenersBound || motionPreference.matches || motionImport) return;
  intentListenersBound = true;
  intentEvents.forEach((eventName) => document.addEventListener(eventName, onIntent, { passive: true }));
}

declare global {
  interface Window {
    __pyxMotionLoaderBound?: boolean;
  }
}

if (!window.__pyxMotionLoaderBound) {
  window.__pyxMotionLoaderBound = true;
  bindIntentListeners();
  document.addEventListener('astro:page-load', bindIntentListeners);
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) removeIntentListeners();
    else bindIntentListeners();
  });
}
