/**
 * The site is static; every dynamic feature is a POST to an n8n webhook.
 * This is the single place that knows how to make that call, so timeout,
 * error shape and campaign capture behave identically everywhere.
 *
 * It never throws. A caller branches on `ok` and shows its own fallback —
 * the same contract the contact form already relies on in production.
 */

/**
 * `status: 0` means no HTTP response was ever received (network failure,
 * timeout/abort, or a skipped call because `url` was empty) — it is not a
 * real HTTP status. Any other `status` is passed through unchanged from the
 * response, together with its parsed `data`, even when `ok` is false.
 */
export interface N8nResult {
  ok: boolean;
  status: number;
  data: unknown;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function postToN8n(
  url: string,
  payload: Record<string, unknown>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<N8nResult> {
  // An empty url (an unset feature config) resolves to the failure shape
  // without making a network call — the feature degrades instead of erroring.
  if (!url) return { ok: false, status: 0, data: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The five §10 campaign parameters, read from the current URL.
 * A repeated parameter keeps only its first value (intentional — the first
 * hit in a session is the attribution source of truth). A present-but-empty
 * parameter (e.g. `?utm_source=`) is treated as absent.
 */
export function collectUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}
