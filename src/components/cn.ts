/** Tiny class joiner. Drops falsy values; flat. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    out = out ? out + " " + part : part;
  }
  return out;
}
