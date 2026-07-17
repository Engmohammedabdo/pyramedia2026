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
    // Mask reveal with a slight rotation settle (origin at the reading start
    // of the LTR brand mark). Starts ≥0.4 opacity — first paint is intact.
    gsap.from(lines, {
      yPercent: 55,
      rotate: 3,
      transformOrigin: '0% 100%',
      opacity: 0.4,
      duration: 1.05,
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

/**
 * Ambient hero life — runs from the DEFERRED boot (post-idle) so none of it
 * lands in the load-critical window: a highlight travels the mark's outline
 * on a slow loop (SVG stroke — sanctioned by §8) and the mark breathes.
 */
function heroAmbient() {
  document.querySelectorAll<SVGPathElement>('.hero-pyramid .pyramid-path').forEach((path, i) => {
    const svg = path.ownerSVGElement;
    if (!svg) return;
    const length = path.getTotalLength();
    const seg = length * 0.1;
    const shimmer = path.cloneNode() as SVGPathElement;
    shimmer.classList.remove('pyramid-path');
    shimmer.setAttribute('fill', 'none');
    shimmer.setAttribute('stroke', i === 0 ? 'var(--color-orange-hot)' : 'var(--color-text)');
    shimmer.setAttribute('stroke-width', '3');
    shimmer.setAttribute('aria-hidden', 'true');
    svg.appendChild(shimmer);
    gsap.fromTo(
      shimmer,
      { strokeDasharray: `${seg} ${length + seg}`, strokeDashoffset: length + seg, opacity: 0.55 },
      {
        strokeDashoffset: -seg,
        duration: 4.5,
        delay: 1.6 + i * 0.4,
        repeat: -1,
        repeatDelay: 3.5,
        ease: 'power1.inOut',
      }
    );
  });

  const heroMark = document.querySelector('.hero-pyramid');
  if (heroMark) {
    gsap.to(heroMark, {
      scale: 1.02,
      transformOrigin: '50% 60%',
      duration: 5,
      delay: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }
}

function scrollReveals() {
  const seen = new Set<Element>();
  // Section headings settle from a slight skew — everything else rises clean
  const skewFor = (el: Element) => (el.tagName === 'H2' ? 2 : 0);

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = Array.from(group.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    items.forEach((el) => seen.add(el));
    gsap.from(items, {
      y: 32,
      opacity: 0,
      scale: (_i: number, el: Element) => (el.classList.contains('card') ? 0.97 : 1),
      skewY: (_i: number, el: Element) => skewFor(el),
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
      skewY: skewFor(el),
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

/**
 * Pointer-tilt + tracking glow on every card — fine pointers only. The
 * per-card machinery (glow element, quickTo tweens, perspective) is built
 * lazily on FIRST hover so nothing runs in the load window.
 */
function cardTilt() {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.classList.add('tilt-on');
    let rig: {
      rx: (v: number) => void;
      ry: (v: number) => void;
      gx: (v: number) => void;
      gy: (v: number) => void;
      glow: HTMLElement;
    } | null = null;

    const ensureRig = () => {
      if (rig) return rig;
      const glow = document.createElement('span');
      glow.className = 'card-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);
      gsap.set(card, { transformPerspective: 900 });
      rig = {
        rx: gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' }),
        ry: gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' }),
        gx: gsap.quickTo(glow, 'x', { duration: 0.25, ease: 'power2.out' }),
        gy: gsap.quickTo(glow, 'y', { duration: 0.25, ease: 'power2.out' }),
        glow,
      };
      return rig;
    };

    card.addEventListener('mouseenter', () => {
      const r = ensureRig();
      gsap.to(card, { y: -4, duration: 0.35, ease: 'power2.out' });
      gsap.to(r.glow, { opacity: 1, duration: 0.3 });
    });
    card.addEventListener('mousemove', (e) => {
      if (!rig) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rig.rx(gsap.utils.clamp(-5, 5, -py * 10));
      rig.ry(gsap.utils.clamp(-5, 5, px * 10));
      rig.gx(e.clientX - r.left - 120);
      rig.gy(e.clientY - r.top - 120);
    });
    card.addEventListener('mouseleave', () => {
      if (!rig) return;
      rig.rx(0);
      rig.ry(0);
      gsap.to(card, { y: 0, duration: 0.45, ease: 'power2.out' });
      gsap.to(rig.glow, { opacity: 0, duration: 0.35 });
    });
  });
}

/** Decorative glows breathe slowly (CTA bands, page heroes). */
function glowBreathe() {
  document.querySelectorAll('[data-glow-breathe]').forEach((el) => {
    gsap.to(el, { opacity: 0.6, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
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

  const stages = Array.from(section.querySelectorAll<HTMLElement>('.method-stage'));
  const railDot = section.querySelector<HTMLElement>('.method-rail-dot');
  const railFill = section.querySelector<HTMLElement>('.method-rail-fill');
  const rail = section.querySelector<HTMLElement>('.method-rail');
  const dir = isRTL() ? -1 : 1;
  let railTravel = 0;

  const dotSet = railDot ? gsap.quickSetter(railDot, 'x', 'px') : null;
  const fillSet = railFill ? gsap.quickSetter(railFill, 'scaleX') : null;
  let activeIdx = -1;

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
      onRefresh: () => {
        railTravel = rail ? Math.max(0, rail.clientWidth - 10) : 0;
      },
      onUpdate: (self) => {
        // Rail: the dot travels the full width while the line fills behind it
        dotSet?.(dir * self.progress * railTravel);
        fillSet?.(self.progress);
        // Stage focus: the nearest stage's number pops to full strength
        const idx = Math.round(self.progress * (stages.length - 1));
        if (idx !== activeIdx) {
          activeIdx = idx;
          stages.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        }
      },
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

  // Stage numbers drift slower than their cards — a depth layer inside the pin
  const nums = section.querySelectorAll('.stage-num');
  if (nums.length) {
    gsap.to(nums, {
      xPercent: dir * -30,
      ease: 'none',
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
    { skewX: 0, yPercent: 24, opacity: 0.4 },
    {
      skewX: isRTL() ? 4 : -4,
      yPercent: 0,
      opacity: 1,
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
// Cursor element caches — refreshed after every View Transition swap
let cachedDot: HTMLElement | null = null;
let cachedRing: HTMLElement | null = null;

function initCursor() {
  if (!finePointer()) return;
  if (!document.querySelector('.cursor-dot')) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
  }
  if (!document.querySelector('.cursor-ring')) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
  }
  if (cursorListenersBound) return;
  cursorListenersBound = true;

  const pos = { x: -100, y: -100 };
  const ringPos = { x: -100, y: -100 };
  document.addEventListener('mousemove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    cachedDot ??= document.querySelector<HTMLElement>('.cursor-dot');
    if (cachedDot) gsap.set(cachedDot, { x: pos.x, y: pos.y });
  });
  // The ring chases the dot with a lerp — the classic trailing feel. The
  // element reference is cached and invalidated on swap (see before-swap).
  gsap.ticker.add(() => {
    if (ringPos.x === pos.x && ringPos.y === pos.y) return; // settled — skip
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    if (Math.abs(pos.x - ringPos.x) < 0.3 && Math.abs(pos.y - ringPos.y) < 0.3) {
      ringPos.x = pos.x;
      ringPos.y = pos.y;
    }
    cachedRing ??= document.querySelector<HTMLElement>('.cursor-ring');
    if (cachedRing) gsap.set(cachedRing, { x: ringPos.x, y: ringPos.y });
  });
  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, label';
  document.addEventListener('mouseover', (e) => {
    const dot = document.querySelector<HTMLElement>('.cursor-dot');
    const ring = document.querySelector<HTMLElement>('.cursor-ring');
    const hot = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
    if (dot) gsap.to(dot, { scale: hot ? 2.6 : 1, opacity: hot ? 0.35 : 0.9, duration: 0.25 });
    if (ring) gsap.to(ring, { scale: hot ? 1.7 : 1, opacity: hot ? 0.9 : 0.6, duration: 0.3 });
  });
  document.addEventListener('mouseleave', () => {
    document.querySelectorAll<HTMLElement>('.cursor-dot, .cursor-ring').forEach((el) => {
      gsap.to(el, { opacity: 0, duration: 0.2 });
    });
  });
  document.addEventListener('mouseenter', () => {
    const dot = document.querySelector<HTMLElement>('.cursor-dot');
    const ring = document.querySelector<HTMLElement>('.cursor-ring');
    if (dot) gsap.to(dot, { opacity: 0.9, duration: 0.2 });
    if (ring) gsap.to(ring, { opacity: 0.6, duration: 0.2 });
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
      heroAmbient();
      scrollReveals();
      parallax();
      methodologyPin();
      magneticButtons();
      cardTilt();
      glowBreathe();
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
  cachedDot = null;
  cachedRing = null;
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
