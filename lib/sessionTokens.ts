import { createHmac } from "crypto";

export const TOKEN_LIMIT = 100_000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SECRET = process.env.SESSION_SECRET ?? "tb-fallback-secret";

export const COOKIE_NAME = "tb_usage";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 24);
}

// Cookie format: base64(tokens|createdAt):hmac
export function parseTokenCookie(value: string | null | undefined): {
  tokens: number;
  createdAt: number;
} {
  const fresh = { tokens: 0, createdAt: Date.now() };
  if (!value) return fresh;
  try {
    const colonIdx = value.lastIndexOf(":");
    if (colonIdx === -1) return fresh;
    const encoded = value.slice(0, colonIdx);
    const sig = value.slice(colonIdx + 1);
    if (sign(encoded) !== sig) return fresh;
    const decoded = Buffer.from(encoded, "base64url").toString();
    const [tokensStr, tsStr] = decoded.split("|");
    const tokens = parseInt(tokensStr) || 0;
    const createdAt = parseInt(tsStr) || 0;
    if (Date.now() - createdAt > SESSION_TTL_MS) return fresh;
    return { tokens, createdAt };
  } catch {
    return fresh;
  }
}

export function makeTokenCookie(tokens: number, createdAt: number): string {
  const encoded = Buffer.from(`${tokens}|${createdAt}`).toString("base64url");
  return `${encoded}:${sign(encoded)}`;
}

export function isOverLimit(tokens: number): boolean {
  return tokens >= TOKEN_LIMIT;
}
