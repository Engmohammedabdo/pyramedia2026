/**
 * Motion engine (SPEC §8). Laws enforced here:
 *  1. Only transform/opacity (+ SVG stroke) are animated.
 *  2. The hero H1 is SSR-visible; entrances start from ≥0.4 opacity / small
 *     translate — first paint is never gated.
 *  3. Exactly ONE pinned section site-wide: the homepage methodology strip.
 *  4. prefers-reduced-motion disables all non-essential motion (CSS handles
 *     marquee/hover; this module simply never boots).
 *  5. GSAP + ScrollTrigger + Lenis stay inside the §12 JS budget.
 *  6. Transforms only ⇒ no layout shift from animation.
 *
 * View Transitions: everything is created inside a gsap.context that is
 * reverted on astro:before-swap, so ScrollTriggers never duplicate.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;
const isRTL = () => document.documentElement.dir === 'rtl';

/* ------------------------------------------------------------------ */
/* Lenis smooth scroll — one instance for the whole session            */
/* ------------------------------------------------------------------ */
let lenis: Lenis | null = null;

function initLenis() {
  if (lenis) return;
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------------ */
/* Page animations                                                     */
/* ------------------------------------------------------------------ */
function heroIntro() {
  const lines = document.querySelectorAll('.hero-line-inner');
  if (lines.length) {
    gsap.from(lines, {
      yPercent: 45,
      opacity: 0.4,
      duration: 1,
      stagger: 0.14,
      ease: 'power4.out',
    });
  }

  const fades = document.querySelectorAll('[data-hero-fade]');
  if (fades.length) {
    gsap.from(fades, {
      y: 18,
      opacity: 0.4,
      duration: 0.8,
      stagger: 0.12,
      delay: 0.25,
      ease: 'power3.out',
    });
  }

  // Pyramid line-draw (~1.2s) in the hero only. The brand mark's paths are
  // outlines of its thick line-art, so the outline draws in via
  // stroke-dashoffset while the fill fades up to complete the mark.
  document.querySelectorAll<SVGPathElement>('.hero-pyramid .pyramid-path').forEach((path, i) => {
    const length = path.getTotalLength();
    const delay = 0.15 + i * 0.18;
    gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 },
      { strokeDashoffset: 0, duration: 1.2, delay, ease: 'power2.inOut' }
    );
    gsap.to(path, { fillOpacity: 1, duration: 0.7, delay: delay + 0.75, ease: 'power2.out' });
  });

  // Slow orange glow pulse behind the hero
  const glow = document.querySelector('main section:first-of-type .glow-orange');
  if (glow) {
    gsap.to(glow, { opacity: 0.65, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
}

function scrollReveals() {
  const seen = new Set<Element>();

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = Array.from(group.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    items.forEach((el) => seen.add(el));
    gsap.from(items, {
      y: 32,
      opacity: 0,
      scale: (_i: number, el: Element) => (el.classList.contains('card') ? 0.97 : 1),
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: group, start: 'top 82%' },
    });
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (seen.has(el)) return;
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

function parallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.1');
    gsap.to(el, {
      y: () => -(window.innerHeight * speed),
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

/** The ONE pinned section (SPEC §8 law 3): homepage methodology strip. */
function methodologyPin() {
  const section = document.querySelector<HTMLElement>('[data-methodology]');
  if (!section) return;
  const viewport = section.querySelector<HTMLElement>('.method-viewport');
  const track = section.querySelector<HTMLElement>('.method-track');
  if (!viewport || !track) return;

  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  if (distance() < 48) return; // everything fits — nothing to pin

  viewport.style.overflowX = 'hidden'; // JS takes over from the CSS scroll fallback

  gsap.to(track, {
    x: () => (isRTL() ? distance() : -distance()),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Progress lines draw in orange as the strip advances
  const bars = section.querySelectorAll('.method-progress');
  if (bars.length) {
    gsap.set(bars, { scaleX: 0 });
    gsap.to(bars, {
      scaleX: 1,
      ease: 'none',
      stagger: 0.9 / bars.length,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.6,
      },
    });
  }
}

function magneticButtons() {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.2));
      yTo(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.25));
    });
    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

function footerSkew() {
  const wordmark = document.querySelector('.footer-wordmark');
  if (!wordmark) return;
  gsap.fromTo(
    wordmark,
    { skewX: 0 },
    {
      skewX: isRTL() ? 4 : -4,
      ease: 'none',
      scrollTrigger: {
        trigger: wordmark,
        start: 'top bottom',
        end: 'bottom bottom-=100',
        scrub: 1,
      },
    }
  );
}

/* ------------------------------------------------------------------ */
/* Custom cursor dot — desktop pointer devices only (SPEC §8)          */
/* ------------------------------------------------------------------ */
let cursorListenersBound = false;

function initCursor() {
  if (!finePointer()) return;
  let dot = document.querySelector<HTMLElement>('.cursor-dot');
  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
  }
  if (cursorListenersBound) return;
  cursorListenersBound = true;

  const pos = { x: -100, y: -100 };
  const move = () => {
    const el = document.querySelector<HTMLElement>('.cursor-dot');
    if (el) gsap.set(el, { x: pos.x, y: pos.y });
  };
  document.addEventListener('mousemove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    move();
  });
  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, label';
  document.addEventListener('mouseover', (e) => {
    const el = document.querySelector<HTMLElement>('.cursor-dot');
    if (!el) return;
    const hot = (e.target as Element | null)?.closest?.(INTERACTIVE);
    gsap.to(el, { scale: hot ? 2.6 : 1, opacity: hot ? 0.35 : 0.9, duration: 0.25 });
  });
  document.addEventListener('mouseleave', () => {
    const el = document.querySelector<HTMLElement>('.cursor-dot');
    if (el) gsap.to(el, { opacity: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    const el = document.querySelector<HTMLElement>('.cursor-dot');
    if (el) gsap.to(el, { opacity: 0.9, duration: 0.2 });
  });
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */
let ctx: gsap.Context | null = null;
let deferredCtx: gsap.Context | null = null;
let booted = false;
let generation = 0;
let laterHandle: number | null = null;
let laterUsedIdle = false;

function cancelDeferredBoot() {
  if (laterHandle !== null) {
    if (laterUsedIdle) window.cancelIdleCallback(laterHandle);
    else clearTimeout(laterHandle);
    laterHandle = null;
  }
}

function boot() {
  if (booted) return;
  booted = true;
  if (reduced()) return; // SPEC §8 law 4 — CSS media query handles the rest

  // Visible-immediately work only; everything scroll-dependent is deferred
  // past first paint so the LCP render is never contended.
  ctx = gsap.context(() => {
    heroIntro();
  });

  const myGeneration = generation;
  const later = () => {
    laterHandle = null;
    // A View Transition swap may have happened while this sat in the idle
    // queue — building triggers against the new page here would leak them.
    if (myGeneration !== generation) return;
    initLenis();
    initCursor();
    deferredCtx = gsap.context(() => {
      scrollReveals();
      parallax();
      methodologyPin();
      magneticButtons();
      footerSkew();
    });
    // Recalculate trigger positions once fonts have settled
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  };
  if ('requestIdleCallback' in window) {
    laterUsedIdle = true;
    laterHandle = window.requestIdleCallback(later, { timeout: 1000 });
  } else {
    laterUsedIdle = false;
    laterHandle = window.setTimeout(later, 250);
  }
}

document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', () => {
  generation++;
  cancelDeferredBoot();
  booted = false;
  ctx?.revert();
  ctx = null;
  deferredCtx?.revert();
  deferredCtx = null;
});

// This bundled module evaluates before the ClientRouter dispatches the
// initial astro:page-load (which fires on window load) — boot directly so
// the hero intro starts at module eval; the later astro:page-load call is
// absorbed by the `booted` guard.
boot();
