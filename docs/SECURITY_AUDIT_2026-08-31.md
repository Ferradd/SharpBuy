# Security audit — 2026-08-31 (full repo scan)

## Summary

| Status | Item |
|--------|------|
| CRITICAL | **GitHub `HEAD` still contains old secrets** until you commit + push today's fixes |
| CRITICAL | **Seed phrase was in git** since initial commit (`6aa8072`) — wallet compromised |
| OK local | Private key `0x6689ff...` — **never found in git history** |
| OK | Public receive address `0x7d46F8e...` — not a secret (customers pay here) |
| OK local | `data/` with Steam tokens — **not tracked in git** |
| OK local | `.env.local` — **not in git** (but rotate all keys inside!) |

---

## What was exposed on GitHub (committed code)

These were in **public** repo `Ferradd/SharpBuy` before today's local fixes:

| Secret type | Files | Risk |
|-------------|-------|------|
| **Wallet seed (12 words)** | `shefu-dropship.js`, `check-payment.js`, many `scripts/` | Anyone can sign transactions |
| **Resend API key** | `api/`, `scripts/` | Email abuse (Resend revoked it) |
| **NOWPayments X-API-Key** | `shefu-dropship.js` | GitGuardian alert — payments API |
| **TOKEN_INGEST_SECRET** default | `token-ingest.js`, `extract_*.ps1` | Admin token ingest |
| **JWT_SECRET** default | `jwt-auth.js` | Forge admin sessions |
| **Render API key** | `docs/cursor_steam_account_game_list.md` | Redacted today |

**Not found in git history:** USDT private key `0x6689ff5888...`

---

## What we fixed locally (not on GitHub yet)

- Removed hardcoded secrets from `api/` and `scripts/`
- Bat/ps1 read ingest key from `data/.token_ingest_secret` (gitignored)
- `wallet/sharpbuy_merchant_wallets.txt` wiped + gitignored
- `.gitignore` expanded for `data/`, credentials, env files
- Faceit API key removed from collector (use `FACEIT_API_KEY` env)

**You must `git commit` and `git push` these fixes.**

---

## Local-only files (keep private, rotate contents)

| File | Contains |
|------|----------|
| `.env.local` | RESEND, BLOB, RENDER, VERCEL tokens |
| `.env.vercel.prod` | RESend, BLOB, OIDC |
| `data/steam.txt`, `data/*.json` | Real Steam tokens |
| `data/sharpbuy_orders_log.json` | Order tokens |
| `account/credentials.txt` | Account notes |

---

## Public wallet address (NOT a leak)

`0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1` appears in site + scripts — this is your **deposit address**. Safe to be public. **Private key** must never be in repo.

---

## Action checklist

1. **Move crypto** to new wallet (seed was on GitHub)
2. **Rotate:** Resend, NOWPayments, TOKEN_INGEST, JWT, Render, Vercel, Blob
3. **Create** `data/.token_ingest_secret` with new ingest secret (see `.example`)
4. **Commit + push** security fixes
5. **Optional:** purge git history with BFG / `git filter-repo` (secrets stay in old commits until then)
6. **Change** admin password on sharpbuy.org

See also: `docs/SECURITY_INCIDENT_2026-08-29.md`
