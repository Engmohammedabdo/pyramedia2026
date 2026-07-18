/**
 * Deferred creative motion runtime. It is only imported by motion-loader
 * after trusted visitor intent; GSAP contexts and all DOM ownership are
 * released before an Astro swap or a live reduced-motion preference change.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionPreference.matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;
const isRTL = () => document.documentElement.dir === 'rtl';

let lenis: Lenis | null = null;
let lenisTicker: ((time: number) => void) | null = null;
let cursorTicker: (() => void) | null = null;
let cursorListenersBound = false;
let cachedDot: HTMLElement | null = null;
let cachedRing: HTMLElement | null = null;

let ctx: gsap.Context | null = null;
let deferredCtx: gsap.Context | null = null;
let runtimeAbort: AbortController | null = null;
let booted = false;
let generation = 0;
let laterHandle: number | null = null;
let laterUsedIdle = false;

function initLenis() {
  if (lenis) return;
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  lenisTicker = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(lenisTicker);
  gsap.ticker.lagSmoothing(0);
}

function stopLenis() {
  if (lenisTicker) {
    gsap.ticker.remove(lenisTicker);
    lenisTicker = null;
  }
  lenis?.destroy();
  lenis = null;
}

/** Ambient shine and a soft breathing mark keep the brand alive post-idle. */
function heroAmbient() {
  document.querySelectorAll<SVGPathElement>('.hero-pyramid .pyramid-path').forEach((path, i) => {
    const svg = path.ownerSVGElement;
    if (!svg) return;
    const length = path.getTotalLength();
    const segment = length * 0.1;
    const shimmer = path.cloneNode() as SVGPathElement;
    shimmer.classList.remove('pyramid-path');
    shimmer.classList.add('pyramid-shimmer');
    shimmer.setAttribute('fill', 'none');
    shimmer.setAttribute('stroke', i === 0 ? 'var(--color-orange-hot)' : 'var(--color-text)');
    shimmer.setAttribute('stroke-width', '3');
    shimmer.setAttribute('aria-hidden', 'true');
    svg.appendChild(shimmer);
    gsap.fromTo(
      shimmer,
      { strokeDasharray: `${segment} ${length + segment}`, strokeDashoffset: length + segment, opacity: 0.55 },
      {
        strokeDashoffset: -segment,
        duration: 4.5,
        delay: 1.6 + i * 0.4,
        repeat: -1,
        repeatDelay: 3.5,
        ease: 'power1.inOut',
      },
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
  const skewFor = (element: Element) => (element.tagName === 'H2' ? 2 : 0);

  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.classList.add('reveal-clip');
    const items = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!items.length) return;
    items.forEach((item) => seen.add(item));
    gsap.from(items, {
      y: 32,
      opacity: 0,
      scale: (_i: number, element: Element) => (element.classList.contains('card') ? 0.97 : 1),
      skewY: (_i: number, element: Element) => skewFor(element),
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: group, start: 'top 82%' },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
    if (seen.has(element)) return;
    element.closest<HTMLElement>('section, footer, [data-reveal-group]')?.classList.add('reveal-clip');
    gsap.from(element, {
      y: 28,
      opacity: 0,
      skewY: skewFor(element),
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: element, start: 'top 85%' },
    });
  });
}

function cardTilt(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.classList.add('tilt-on');
    let rig: {
      rx: (value: number) => void;
      ry: (value: number) => void;
      gx: (value: number) => void;
      gy: (value: number) => void;
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
      const current = ensureRig();
      gsap.to(card, { y: -4, duration: 0.35, ease: 'power2.out' });
      gsap.to(current.glow, { opacity: 1, duration: 0.3 });
    }, { signal });
    card.addEventListener('mousemove', (event) => {
      if (!rig) return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rig.rx(gsap.utils.clamp(-5, 5, -py * 10));
      rig.ry(gsap.utils.clamp(-5, 5, px * 10));
      rig.gx(event.clientX - rect.left - 120);
      rig.gy(event.clientY - rect.top - 120);
    }, { signal });
    card.addEventListener('mouseleave', () => {
      if (!rig) return;
      rig.rx(0);
      rig.ry(0);
      gsap.to(card, { y: 0, duration: 0.45, ease: 'power2.out' });
      gsap.to(rig.glow, { opacity: 0, duration: 0.35 });
    }, { signal });
  });
}

function glowBreathe() {
  document.querySelectorAll('[data-glow-breathe]').forEach((element) => {
    gsap.to(element, { opacity: 0.6, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  });
}

function parallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
    const speed = parseFloat(element.dataset.parallax || '0.1');
    gsap.to(element, {
      y: () => -(window.innerHeight * speed),
      ease: 'none',
      scrollTrigger: {
        trigger: element.closest('section') || element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

/** The only pinned section: the home methodology strip. */
function methodologyPin() {
  const section = document.querySelector<HTMLElement>('[data-methodology]');
  if (!section) return;
  const viewport = section.querySelector<HTMLElement>('.method-viewport');
  const track = section.querySelector<HTMLElement>('.method-track');
  if (!viewport || !track) return;

  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  if (distance() < 48) return;

  viewport.style.overflowX = 'hidden';
  const stages = Array.from(section.querySelectorAll<HTMLElement>('.method-stage'));
  const railDot = section.querySelector<HTMLElement>('.method-rail-dot');
  const railFill = section.querySelector<HTMLElement>('.method-rail-fill');
  const rail = section.querySelector<HTMLElement>('.method-rail');
  const direction = isRTL() ? -1 : 1;
  let railTravel = 0;
  let activeIndex = -1;
  const dotSet = railDot ? gsap.quickSetter(railDot, 'x', 'px') : null;
  const fillSet = railFill ? gsap.quickSetter(railFill, 'scaleX') : null;

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
        dotSet?.(direction * self.progress * railTravel);
        fillSet?.(self.progress);
        const index = Math.round(self.progress * (stages.length - 1));
        if (index === activeIndex) return;
        activeIndex = index;
        stages.forEach((stage, stageIndex) => stage.classList.toggle('is-active', stageIndex === index));
      },
    },
  });

  const bars = section.querySelectorAll('.method-progress');
  if (bars.length) {
    gsap.set(bars, { scaleX: 0 });
    gsap.to(bars, {
      scaleX: 1,
      ease: 'none',
      stagger: 0.9 / bars.length,
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6 },
    });
  }

  const numbers = section.querySelectorAll('.stage-num');
  if (numbers.length) {
    gsap.to(numbers, {
      xPercent: direction * -30,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6 },
    });
  }
}

function magneticButtons(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((button) => {
    const xTo = gsap.quickTo(button, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(button, 'y', { duration: 0.4, ease: 'power3' });
    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      xTo(gsap.utils.clamp(-8, 8, (event.clientX - (rect.left + rect.width / 2)) * 0.2));
      yTo(gsap.utils.clamp(-6, 6, (event.clientY - (rect.top + rect.height / 2)) * 0.25));
    }, { signal });
    button.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    }, { signal });
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
      scrollTrigger: { trigger: wordmark, start: 'top bottom', end: 'bottom bottom-=100', scrub: 1 },
    },
  );
}

function removeCursor() {
  if (cursorTicker) {
    gsap.ticker.remove(cursorTicker);
    cursorTicker = null;
  }
  cachedDot = null;
  cachedRing = null;
  cursorListenersBound = false;
  document.querySelectorAll('.cursor-dot, .cursor-ring').forEach((node) => node.remove());
}

function initCursor(signal: AbortSignal) {
  if (!finePointer() || cursorListenersBound) return;
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

  cursorListenersBound = true;
  const position = { x: -100, y: -100 };
  const ringPosition = { x: -100, y: -100 };
  const interactive = 'a, button, [role="button"], input, textarea, select, summary, label';

  document.addEventListener('mousemove', (event) => {
    position.x = event.clientX;
    position.y = event.clientY;
    cachedDot ??= document.querySelector<HTMLElement>('.cursor-dot');
    if (cachedDot) gsap.set(cachedDot, { x: position.x, y: position.y });
  }, { signal });
  document.addEventListener('mouseover', (event) => {
    const dot = document.querySelector<HTMLElement>('.cursor-dot');
    const ring = document.querySelector<HTMLElement>('.cursor-ring');
    const hot = !!(event.target as Element | null)?.closest?.(interactive);
    if (dot) gsap.to(dot, { scale: hot ? 2.6 : 1, opacity: hot ? 0.35 : 0.9, duration: 0.25 });
    if (ring) gsap.to(ring, { scale: hot ? 1.7 : 1, opacity: hot ? 0.9 : 0.6, duration: 0.3 });
  }, { signal });
  document.addEventListener('mouseleave', () => {
    document.querySelectorAll<HTMLElement>('.cursor-dot, .cursor-ring').forEach((node) => {
      gsap.to(node, { opacity: 0, duration: 0.2 });
    });
  }, { signal });
  document.addEventListener('mouseenter', () => {
    const dot = document.querySelector<HTMLElement>('.cursor-dot');
    const ring = document.querySelector<HTMLElement>('.cursor-ring');
    if (dot) gsap.to(dot, { opacity: 0.9, duration: 0.2 });
    if (ring) gsap.to(ring, { opacity: 0.6, duration: 0.2 });
  }, { signal });

  cursorTicker = () => {
    if (ringPosition.x === position.x && ringPosition.y === position.y) return;
    ringPosition.x += (position.x - ringPosition.x) * 0.16;
    ringPosition.y += (position.y - ringPosition.y) * 0.16;
    if (Math.abs(position.x - ringPosition.x) < 0.3 && Math.abs(position.y - ringPosition.y) < 0.3) {
      ringPosition.x = position.x;
      ringPosition.y = position.y;
    }
    cachedRing ??= document.querySelector<HTMLElement>('.cursor-ring');
    if (cachedRing) gsap.set(cachedRing, { x: ringPosition.x, y: ringPosition.y });
  };
  gsap.ticker.add(cursorTicker);
  signal.addEventListener('abort', () => {
    if (cursorTicker) {
      gsap.ticker.remove(cursorTicker);
      cursorTicker = null;
    }
    cursorListenersBound = false;
  }, { once: true });
}

function cancelDeferredBoot() {
  if (laterHandle === null) return;
  if (laterUsedIdle) window.cancelIdleCallback(laterHandle);
  else clearTimeout(laterHandle);
  laterHandle = null;
}

function teardownMotion() {
  generation++;
  cancelDeferredBoot();
  runtimeAbort?.abort();
  runtimeAbort = null;
  ctx?.revert();
  ctx = null;
  deferredCtx?.revert();
  deferredCtx = null;
  stopLenis();
  removeCursor();
  document.querySelectorAll<HTMLElement>('.method-viewport').forEach((viewport) => {
    viewport.style.removeProperty('overflow-x');
  });
  document.querySelectorAll('.pyramid-shimmer').forEach((node) => node.remove());
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    gsap.killTweensOf(card);
    card.style.removeProperty('transform');
    card.classList.remove('tilt-on');
  });
  document.querySelectorAll<HTMLElement>('.card-glow').forEach((glow) => {
    gsap.killTweensOf(glow);
    glow.remove();
  });
  document.querySelectorAll<HTMLElement>('.method-stage.is-active').forEach((stage) => {
    stage.classList.remove('is-active');
  });
  booted = false;
}

function boot() {
  if (booted || reduced()) return;
  booted = true;
  runtimeAbort = new AbortController();
  const { signal } = runtimeAbort;
  const bootGeneration = generation;

  // The hero is CSS-first. Keeping a context for future immediate motion also
  // gives every runtime generation an explicit revert boundary.
  ctx = gsap.context(() => {});
  const later = () => {
    laterHandle = null;
    if (signal.aborted || bootGeneration !== generation || reduced()) return;
    initLenis();
    initCursor(signal);
    deferredCtx = gsap.context(() => {
      heroAmbient();
      scrollReveals();
      parallax();
      methodologyPin();
      magneticButtons(signal);
      cardTilt(signal);
      glowBreathe();
      footerSkew();
    });
    document.fonts?.ready.then(() => {
      if (!signal.aborted && bootGeneration === generation && !reduced()) ScrollTrigger.refresh();
    });
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
document.addEventListener('astro:before-swap', teardownMotion);
motionPreference.addEventListener('change', (event) => {
  if (event.matches) teardownMotion();
  else boot();
});

boot();
