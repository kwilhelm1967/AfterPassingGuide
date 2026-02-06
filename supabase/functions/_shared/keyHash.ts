/**
 * License: normalize, hash (SHA256 hex), last4.
 * Never store plaintext. Server only hashes.
 */

export function normalizeKey(key: string): string {
  return key.replace(/-/g, "").toUpperCase().trim();
}

export function last4(normalized: string): string {
  return normalized.slice(-4);
}

export async function keyHash(normalized: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalized);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function keyHashAndLast4(key: string): Promise<{ hash: string; last4: string }> {
  const norm = normalizeKey(key);
  const h = await keyHash(norm);
  return { hash: h, last4: last4(norm) };
}
