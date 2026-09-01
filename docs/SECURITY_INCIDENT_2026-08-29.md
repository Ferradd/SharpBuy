# Security incident — exposed secrets on GitHub (Aug 29, 2026)

GitGuardian and Resend reported leaks in public repo **Ferradd/SharpBuy**.

## What was exposed (in git history + code)

| Secret | Where | Status |
|--------|-------|--------|
| **Resend API key** `re_KpbJCCGo...` | `api/`, `scripts/` | Resend **revoked** it automatically |
| **NOWPayments X-API-Key** | `api/_utils/shefu-dropship.js` | GitGuardian alert — **rotate in NOWPayments dashboard** |
| **TOKEN_INGEST_SECRET** default | `api/token-ingest.js` | **Generate new secret**, update Render + bat |
| **JWT_SECRET** default | `api/_utils/jwt-auth.js` | **Set strong JWT_SECRET** on Render (users re-login) |
| **MERCHANT_MNEMONIC** (12 words) | `shefu-dropship.js`, many `scripts/`, `wallet/` | **CRITICAL** — treat wallet as compromised |
| **Private key** in `wallet/sharpbuy_merchant_wallets.txt` | local file | Move funds to new wallet |

## What we fixed in code (this session)

- Removed all hardcoded secret **fallbacks** from `api/` and `scripts/`
- Secrets only via `process.env` / Render env vars
- Added `.env.example`
- Redacted passwords from `docs/cursor_steam_account_game_list.md`

## What YOU must do now

### 1. Resend (emails)
1. [resend.com/api-keys](https://resend.com/api-keys) → create **new** API key
2. Render → Environment → `RESEND_API_KEY` = new key
3. Redeploy

### 2. NOWPayments
1. Dashboard → revoke old key, create new
2. Render → `NOWPAYMENTS_API_KEY` = new key

### 3. TOKEN_INGEST_SECRET
1. Generate random string (e.g. `openssl rand -hex 24`)
2. Render → `TOKEN_INGEST_SECRET`
3. Update desktop `EXTRACT_STEAM_TOKEN` / bat if it embeds the old key

### 4. JWT_SECRET
1. Render → set new strong `JWT_SECRET` (or use generateValue)
2. All users must log in again (old tokens invalid)

### 5. Crypto wallet (URGENT)
The **seed phrase and private key** were in the repo. Anyone with git history could drain funds.

1. **Create a new wallet** (new mnemonic)
2. **Move all USDT/crypto** from `0x7d46F8e...` to the new address
3. Render → `MERCHANT_MNEMONIC` = new seed (only in env, never in code)
4. Never commit `wallet/sharpbuy_merchant_wallets.txt` with real keys

### 6. GitHub history
Deleting secrets from current files is **not enough** — they remain in old commits on GitHub.

Options:
- **Minimum:** rotate all secrets above (assume leaked)
- **Thorough:** use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo` to purge history, then force-push (coordinate carefully)

### 7. Admin password
If `IlyaAdmin#2026xK7` was only in docs/chat — change admin password on sharpbuy.org anyway.

## Local files — keep private

- `wallet/sharpbuy_merchant_wallets.txt` — local only, added to `.gitignore`
- `.env.local` — never commit
- `account/credentials.txt` — never commit

## Prevention

- No secrets in code, docs, or scripts
- Only Render / `.env.local` / password manager
- Use `ggshield` or GitHub secret scanning before push
