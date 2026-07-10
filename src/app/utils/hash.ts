// ============================================================================
// hash.ts — deterministic content hashing for cache keys.
// Stands in for the `object-hash` package; no dependency needed for our shapes.
// ============================================================================

/** FNV-1a 32-bit. Fast, stable across sessions, good enough for cache keys. */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619, kept in 32-bit space without overflowing to float.
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** JSON.stringify with object keys sorted, so key order never changes the hash. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
  return `{${entries.join(",")}}`;
}

/** Stable content hash of any JSON-serialisable value. */
export function hashValue(value: unknown): string {
  return fnv1a(stableStringify(value));
}
