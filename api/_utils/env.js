/** Read required env var — no hardcoded fallbacks (secrets must not live in git). */
export function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

/** Optional env with no default secret. */
export function envOrNull(name) {
  const value = process.env[name];
  return value && String(value).trim() ? String(value).trim() : null;
}
