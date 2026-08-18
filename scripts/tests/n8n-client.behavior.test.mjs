/**
 * Behavioural tests for src/scripts/n8n-client.ts.
 *
 * gate2-regression.test.mjs checks this module by scanning its source text —
 * cheap, but it cannot tell a real `finally { clearTimeout(timer) }` from a
 * deleted one, or a swallowed `catch` from one that rethrows, as long as the
 * right substrings still appear somewhere in the file (including a comment).
 *
 * This file instead imports the module and drives it with a monkey-patched
 * `global.fetch`, asserting on the real return values of `postToN8n` and
 * `collectUtm`. It is a sibling of gate2-regression.test.mjs rather than an
 * addition to it: that file is a big, homogeneous scan over many source
 * files by regex, and this one is a small, heterogeneous set of runtime
 * behavioural cases over a single module. Mixing the two styles in one file
 * would make both harder to scan. Node needs `--experimental-strip-types` to
 * import a .ts file directly, so `npm run test:gate2` passes that flag when
 * it runs this file alongside gate2-regression.test.mjs (see package.json).
 *
 * No test framework or dependency is added — node:test and
 * node:assert/strict only, matching the rest of scripts/tests/.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { postToN8n, collectUtm } from '../../src/scripts/n8n-client.ts';

// --- fetch/timer harness -------------------------------------------------
//
// Each test installs its own global.fetch (and, where it matters, spies on
// global.setTimeout/clearTimeout) and restores the originals afterwards via
// t.after(), so tests stay independent even though node:test runs the
// test()s in this file sequentially.

function installFetch(t, impl) {
  const original = global.fetch;
  global.fetch = impl;
  t.after(() => {
    global.fetch = original;
  });
}

function installTimerSpy(t) {
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  const createdTimers = [];
  const clearedTimers = [];

  global.setTimeout = (...args) => {
    const id = originalSetTimeout(...args);
    createdTimers.push(id);
    return id;
  };
  global.clearTimeout = (id) => {
    clearedTimers.push(id);
    return originalClearTimeout(id);
  };

  t.after(() => {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });

  return { createdTimers, clearedTimers };
}

// --- postToN8n: network failure ------------------------------------------

test('a rejecting fetch resolves to the documented failure shape and does not throw', async (t) => {
  installFetch(t, async () => {
    throw new TypeError('network failure');
  });

  const result = await postToN8n('https://example.com/webhook', { a: 1 });
  assert.deepEqual(result, { ok: false, status: 0, data: null });
});

// --- postToN8n: timeout / abort ------------------------------------------

test('a timeout actually aborts the request and the call resolves instead of hanging', async (t) => {
  let capturedSignal;

  installFetch(t, (_url, init) => {
    capturedSignal = init.signal;
    // A real fetch rejects with an AbortError once its signal fires. This
    // promise only ever settles that way, so the test can only pass if the
    // module's own setTimeout(() => controller.abort(), timeoutMs) actually
    // fires — there is no other path to resolution.
    return new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });
  });

  const result = await postToN8n('https://example.com/webhook', {}, 10);

  assert.ok(capturedSignal, 'fetch must have been called with a signal');
  assert.equal(capturedSignal.aborted, true, 'the signal passed to fetch must report aborted after timeout');
  assert.deepEqual(result, { ok: false, status: 0, data: null });
});

// --- postToN8n: non-2xx response ------------------------------------------

test('a non-2xx response with a parseable JSON body keeps ok false but preserves the real status and data', async (t) => {
  installFetch(t, async () => ({
    ok: false,
    status: 422,
    json: async () => ({ error: 'validation failed' }),
  }));

  const result = await postToN8n('https://example.com/webhook', {});
  assert.equal(result.ok, false);
  assert.equal(result.status, 422);
  assert.deepEqual(result.data, { error: 'validation failed' });
});

// --- postToN8n: 200 with no usable JSON body ------------------------------

test('a 200 with an empty body resolves with data null and does not throw', async (t) => {
  installFetch(t, async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  }));

  const result = await postToN8n('https://example.com/webhook', {});
  assert.deepEqual(result, { ok: true, status: 200, data: null });
});

test('a 200 with a non-JSON body resolves with data null and does not throw', async (t) => {
  installFetch(t, async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    },
  }));

  const result = await postToN8n('https://example.com/webhook', {});
  assert.deepEqual(result, { ok: true, status: 200, data: null });
});

// --- postToN8n: empty url --------------------------------------------------

test('an empty url resolves to the failure shape without calling fetch at all', async (t) => {
  let called = false;
  installFetch(t, async () => {
    called = true;
    return { ok: true, status: 200, json: async () => ({}) };
  });

  const result = await postToN8n('', { a: 1 });
  assert.equal(called, false, 'fetch must not be called when the url is empty');
  assert.deepEqual(result, { ok: false, status: 0, data: null });
});

// --- postToN8n: timer cleanup ----------------------------------------------

test('the timer is cleared on the success path', async (t) => {
  const { createdTimers, clearedTimers } = installTimerSpy(t);
  installFetch(t, async () => ({
    ok: true,
    status: 200,
    json: async () => ({ ok: true }),
  }));

  await postToN8n('https://example.com/webhook', {});

  assert.equal(createdTimers.length, 1, 'exactly one timer must be created per call');
  assert.deepEqual(clearedTimers, createdTimers, 'the created timer must be cleared on the success path');
});

test('the timer is cleared on the network-failure path', async (t) => {
  const { createdTimers, clearedTimers } = installTimerSpy(t);
  installFetch(t, async () => {
    throw new TypeError('network failure');
  });

  await postToN8n('https://example.com/webhook', {});

  assert.equal(createdTimers.length, 1);
  assert.deepEqual(clearedTimers, createdTimers, 'the created timer must be cleared on the network-failure path');
});

test('the timer is cleared on the timeout/abort path', async (t) => {
  const { createdTimers, clearedTimers } = installTimerSpy(t);
  installFetch(t, (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      reject(error);
    });
  }));

  await postToN8n('https://example.com/webhook', {}, 10);

  assert.equal(createdTimers.length, 1);
  assert.deepEqual(clearedTimers, createdTimers, 'the created timer must be cleared on the timeout/abort path');
});

// --- collectUtm --------------------------------------------------------

function withWindowSearch(t, search) {
  const original = globalThis.window;
  globalThis.window = { location: { search } };
  t.after(() => {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  });
}

test('collectUtm returns an empty object when no query parameters are present', (t) => {
  withWindowSearch(t, '');
  assert.deepEqual(collectUtm(), {});
});

test('collectUtm keeps only the first value of a repeated parameter (intentional)', (t) => {
  withWindowSearch(t, '?utm_source=first&utm_source=second');
  assert.deepEqual(collectUtm(), { utm_source: 'first' });
});

test('collectUtm treats a present-but-empty parameter as absent', (t) => {
  withWindowSearch(t, '?utm_source=&utm_medium=email');
  assert.deepEqual(collectUtm(), { utm_medium: 'email' });
});

test('collectUtm decodes a percent-encoded value', (t) => {
  withWindowSearch(t, '?utm_campaign=spring%20sale%20%26%20more');
  assert.deepEqual(collectUtm(), { utm_campaign: 'spring sale & more' });
});
