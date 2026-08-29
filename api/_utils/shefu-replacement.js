// ============================================================================
// SHARPBUY SHEFU WARRANTY & REPLACEMENT ADAPTER (100% NATIVE TO SHEFU223.SHOP)
// ============================================================================

const SHEFU_NFA_BASE = 'https://nfa.shefu223.shop';

/**
 * Checks if a token/account is eligible for replacement on Shefu.
 * @param {string} tokenInput The full username----token or license key line
 * @returns {Promise<{ eligible: boolean, timeRemainingSeconds: number, reason?: string, raw?: any, resumable?: boolean }>}
 */
export async function checkShefuWarrantyEligibility(tokenInput) {
  if (!tokenInput || typeof tokenInput !== 'string') {
    return { eligible: false, timeRemainingSeconds: 0, reason: 'Неверный формат токена' };
  }

  const cleanToken = tokenInput.replace(/\s+/g, '');
  if (!cleanToken.includes('----')) {
    return { eligible: false, timeRemainingSeconds: 0, reason: 'Вставьте полную строку: SteamID----токен' };
  }

  try {
    const res = await fetch(`${SHEFU_NFA_BASE}/api/nfa-warranty-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: cleanToken })
    });

    if (!res.ok) {
      return { eligible: false, timeRemainingSeconds: 0, reason: `Ошибка сервера поставщика (${res.status})` };
    }

    const data = await res.json();
    if (data.error) {
      return { eligible: false, timeRemainingSeconds: 0, reason: data.error, raw: data };
    }

    if (data.eligible) {
      const remainingSecs = data.warranty?.time_remaining_seconds || 10800;
      return {
        eligible: true,
        timeRemainingSeconds: remainingSecs,
        resumable: Boolean(data.resumable),
        raw: data
      };
    }

    let reason = data.reason || 'Замена недоступна для данного аккаунта';
    if (data.action === 'EXPIRED') reason = 'Срок гарантии на этот аккаунт истёк';
    else if (data.action === 'APPROVED') reason = 'Замена по этому аккаунту уже была выдана ранее';
    else if (data.action === 'IN_QUEUE') reason = 'Запрос на замену уже находится в очереди обработки';
    else if (data.paused && data.paused_note) reason = data.paused_note;

    return {
      eligible: false,
      timeRemainingSeconds: 0,
      reason,
      raw: data
    };
  } catch (err) {
    console.error('[ShefuWarranty] Eligibility check exception:', err);
    return { eligible: false, timeRemainingSeconds: 0, reason: err.message };
  }
}

/**
 * Claims a replacement for a dead/non-working account from Shefu.
 * @param {string} tokenInput The original full username----token line
 * @returns {Promise<{ success: boolean, newToken?: string, error?: string, status?: string }>}
 */
export async function requestShefuReplacement(tokenInput) {
  if (!tokenInput || typeof tokenInput !== 'string') {
    return { success: false, error: 'Токен не указан' };
  }

  const cleanToken = tokenInput.replace(/\s+/g, '');
  if (!cleanToken.includes('----')) {
    return { success: false, error: 'Вставьте полную строку: SteamID----токен' };
  }

  try {
    console.log(`[ShefuWarranty] Submitting claim for: ${cleanToken.slice(0, 20)}...`);
    const res = await fetch(`${SHEFU_NFA_BASE}/api/nfa-warranty-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: cleanToken })
    });

    const data = await res.json();
    console.log('[ShefuWarranty] Claim response:', data);

    // 1. Instant delivery
    if (data.success && data.download_token) {
      console.log(`[ShefuWarranty] Instant replacement download token received: ${data.download_token}`);
      const newToken = await fetchReplacementTokenFromDownload(data.download_token);
      if (newToken) {
        return { success: true, newToken, status: 'DELIVERED' };
      }
    }

    // 2. Failed / not broken / throttled / frozen
    if (!data.success) {
      console.warn(`[ShefuWarranty] Claim rejected or failed:`, data.error);
      return {
        success: false,
        error: data.error || data.message || 'Поставщик отклонил замену (аккаунт валиден или замена уже выдана).',
        frozen: Boolean(data.frozen)
      };
    }

    // 3. Queued status: poll until delivered
    console.log(`[ShefuWarranty] Claim queued on supplier side. Starting status polling...`);
    const polledResult = await pollWarrantyStatus(cleanToken);
    return polledResult;
  } catch (err) {
    console.error('[ShefuWarranty] Claim exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Polls Shefu warranty status until approved or rejected.
 */
async function pollWarrantyStatus(licenseKey) {
  const startedAt = Date.now();
  const deadline = startedAt + 5 * 60 * 1000; // 5 mins

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    try {
      const res = await fetch(`${SHEFU_NFA_BASE}/api/nfa-warranty-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey })
      });

      if (!res.ok) continue;
      const data = await res.json();

      if (data.status === 'approved' && data.download_token) {
        console.log(`[ShefuWarranty] Polled status APPROVED. Fetching download...`);
        const newToken = await fetchReplacementTokenFromDownload(data.download_token);
        if (newToken) {
          return { success: true, newToken, status: 'DELIVERED' };
        }
      }

      if (data.status === 'rejected') {
        return { success: false, error: data.message || 'Робот проверки признал аккаунт рабочим.' };
      }
    } catch (e) {
      console.warn('[ShefuWarranty] Polling status warning:', e.message);
    }
  }

  return { success: false, error: 'Таймаут проверки роботом' };
}

/**
 * Downloads the text file containing the new replacement token.
 */
async function fetchReplacementTokenFromDownload(downloadToken) {
  try {
    const dlRes = await fetch(`${SHEFU_NFA_BASE}/api/nfa-download/${downloadToken}`);
    if (!dlRes.ok) return null;
    const text = await dlRes.text();
    
    // Extract token match
    const tokenMatch = text.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/);
    if (tokenMatch) {
      return tokenMatch[0];
    }
    const clean = text.trim();
    if (clean && clean.includes('----')) {
      return clean;
    }
    return clean || null;
  } catch (e) {
    console.error('[ShefuWarranty] Failed to download token file:', e);
    return null;
  }
}
