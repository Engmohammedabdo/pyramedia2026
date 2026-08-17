/**
 * The site is static; every dynamic feature is a POST to an n8n webhook.
 * This is the single place that knows how to make that call, so timeout,
 * error shape and campaign capture behave identically everywhere.
 *
 * It never throws. A caller branches on `ok` and shows its own fallback —
 * the same contract the contact form already relies on in production.
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

/** The five §10 campaign parameters, read from the current URL. */
export function collectUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}
