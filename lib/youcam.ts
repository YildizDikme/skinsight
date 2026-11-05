import "server-only";

const BASE = "https://yce-api-01.makeupar.com/s2s";

export async function youcam<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {},
) {
  const key = process.env.YOUCAM_API_KEY;
  if (!key) throw new Error("YOUCAM_API_KEY is not set");

  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as T;
  return { ok: res.ok, status: res.status, json };
}
