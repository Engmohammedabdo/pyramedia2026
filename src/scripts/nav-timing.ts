/**
 * Site-wide soft-navigation start capture (feeds SpeedProof on
 * /services/web-development).
 *
 * A page-scoped script cannot observe astro:before-preparation for the
 * navigation that first mounts it: Astro dispatches that event before the
 * destination page's own markup (and script) has been swapped into the
 * document, so by the time SpeedProof's script exists to listen, the event
 * it needs has already passed. Registering the listener here instead —
 * imported unconditionally from BaseLayout.astro, present from the very
 * first page of the session — means the listener is already attached no
 * matter which page a visitor lands on first, so it is guaranteed to catch
 * every later navigation, including a page's first-ever soft-nav arrival.
 *
 * This file does exactly one thing: record when a navigation started. It
 * does not measure, format, or render anything, and it costs nothing on
 * pages that never read the value it stores.
 */
const timingWindow = window as typeof window & {
  __pyxNavPrepStart?: number;
  __pyxNavTimingBound?: boolean;
};

if (!timingWindow.__pyxNavTimingBound) {
  timingWindow.__pyxNavTimingBound = true;
  document.addEventListener('astro:before-preparation', () => {
    timingWindow.__pyxNavPrepStart = performance.now();
  });
}
