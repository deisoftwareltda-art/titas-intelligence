import { createHash, timingSafeEqual } from "crypto";

function digest(value: string) { return createHash("sha256").update(value).digest(); }
export function validAccessKey(value: string | null) {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected || !value) return false;
  return timingSafeEqual(digest(value), digest(expected));
}

