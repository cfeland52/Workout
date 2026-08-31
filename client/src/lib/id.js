// Same format as the server's uid() (server/src/lib/ids.js) and the original
// app's client-side uid(). Generating IDs here — not on the server — means a
// workout logged offline already has its permanent ID before it's ever sent,
// so replaying it later (once back online) is a safe, idempotent upsert.
export function uid(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 10);
}
