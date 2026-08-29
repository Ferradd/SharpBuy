// ============================================================================
// SHARPBUY WARRANTY VERIFIER & AUTO-REPLACEMENT HANDLER
// ============================================================================

import fs from 'fs';
import path from 'path';
import { checkShefuWarrantyEligibility, requestShefuReplacement } from './_utils/shefu-replacement.js';
import { getAllOrders, saveOrderToDb } from './_utils/orders-db.js';
import { sendOrderEmail } from './_utils/email-sender.js';

const ORDERS_DB_PATH = path.join(process.cwd(), 'src', 'data', 'orders_database.json');
const CLIENT_WARRANTY_MS = 3 * 60 * 60 * 1000; // 3 Hours

export default async function warrantyCheckHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, orderId, checkOnly = false } = req.body || {};

    if (!token && !orderId) {
      return res.status(400).json({ error: 'Укажите токен аккаунта или номер заказа' });
    }

    const cleanInput = (token || orderId || '').replace(/\s+/g, '');
    const steamIdFromToken = cleanInput.includes('----') ? cleanInput.split('----')[0] : null;

    // 1. Check local order DB
    const orders = getAllOrders();
    const matchingOrder = orders.find(o => {
      if (cleanInput.startsWith('SHARP-')) {
        return o.orderId === cleanInput;
      }
      if (!o.tokens || !Array.isArray(o.tokens)) return false;
      return o.tokens.some(t => {
        if (!t) return false;
        const tClean = String(t).replace(/\s+/g, '');
        if (tClean === cleanInput || cleanInput.includes(tClean) || tClean.includes(cleanInput)) return true;
        const tSid = tClean.split('----')[0];
        return Boolean(steamIdFromToken && tSid === steamIdFromToken);
      });
    });

    const tokenToProcess = matchingOrder && matchingOrder.tokens && matchingOrder.tokens[0] 
      ? matchingOrder.tokens[0] 
      : cleanInput;

    // 2. Fetch supplier warranty status (used for replacement eligibility & fallback timer)
    const supplierCheck = await checkShefuWarrantyEligibility(tokenToProcess);

    // 3. ✅ FIX: Calculate warranty time ONLY from our own DB — never from supplier.
    // The supplier resets their timer on every login, causing the "infinite warranty" bug.
    // Our DB sets warrantyExpiresAt ONCE at purchase time and it NEVER changes.
    const nowMs = Date.now();
    let secsRemaining = 0;
    let localEligible = false;

    if (matchingOrder?.warrantyExpiresAt) {
      // We have a local order — use our own immutable expiry time
      const expiresMs = new Date(matchingOrder.warrantyExpiresAt).getTime();
      secsRemaining = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
      localEligible = secsRemaining > 0;

      // Stamp firstActivatedAt the very first time the client checks warranty
      if (!matchingOrder.firstActivatedAt && localEligible) {
        matchingOrder.firstActivatedAt = new Date().toISOString();
        try { saveOrderToDb(matchingOrder); } catch(e) {}
      }
    } else {
      // No SharpBuy purchase record — client warranty is not active.
      // Never use supplier timer here (it can show 6h+ and resets on login).
      secsRemaining = 0;
      localEligible = false;
    }

    // If this is just a status check
    if (checkOnly) {
      if (localEligible) {
        const mins = Math.floor(secsRemaining / 60);
        const hrs = Math.floor(mins / 60);
        const timeStr = hrs > 0 ? `${hrs}ч ${mins % 60}м` : `${mins}м`;

        return res.status(200).json({
          success: true,
          eligible: true,
          orderId: matchingOrder?.orderId || 'DIRECT-NFA',
          remainingClientMinutes: mins,
          secondsRemaining: secsRemaining,
          warrantyExpiresAt: matchingOrder?.warrantyExpiresAt || null,
          resumable: supplierCheck.resumable,
          message: `Гарантия активна! До конца срока: ${timeStr}.`
        });
      } else {
        return res.status(200).json({
          success: false,
          eligible: false,
          orderId: matchingOrder?.orderId || null,
          remainingClientMinutes: 0,
          secondsRemaining: 0,
          warrantyExpiresAt: matchingOrder?.warrantyExpiresAt || null,
          reason: matchingOrder ? 'Срок гарантии истёк.' : 'Покупка не найдена в базе SharpBuy.',
          message: matchingOrder
            ? 'Срок гарантии истёк (3 часа с момента покупки).'
            : 'Гарантия доступна только для аккаунтов, купленных на sharpbuy.org.'
        });
      }
    }

    // 3. EXECUTE REPLACEMENT CLAIM (User clicked "Получить замену")
    console.log(`[Warranty] Executing replacement claim for: ${tokenToProcess.slice(0, 20)}...`);
    const replacementRes = await requestShefuReplacement(tokenToProcess);

    if (!replacementRes || !replacementRes.success || !replacementRes.newToken) {
      return res.status(200).json({
        success: false,
        eligible: supplierCheck.eligible,
        reason: 'REPLACEMENT_FAILED',
        error: replacementRes?.error || 'Поставщик отклонил замену.',
        message: replacementRes?.error || 'Проверка показала, что аккаунт рабочий, либо замена уже была произведена.'
      });
    }

    const newToken = replacementRes.newToken;
    const newSteamId = newToken.split('----')[0];
    console.log(`[Warranty] ✅ REPLACEMENT SUCCESSFUL! New SteamID: ${newSteamId}`);

    // 4. Update order in database if matched
    if (matchingOrder) {
      matchingOrder.oldTokens = matchingOrder.oldTokens || [];
      matchingOrder.oldTokens.push(tokenToProcess);
      matchingOrder.tokens = [newToken];
      matchingOrder.replacedAt = new Date().toISOString();
      matchingOrder.replacementCount = (matchingOrder.replacementCount || 0) + 1;

      try {
        saveOrderToDb(matchingOrder);
        if (matchingOrder.email) {
          sendOrderEmail(
            matchingOrder.orderId,
            matchingOrder.email,
            matchingOrder.amountRub || 89,
            matchingOrder.cryptoAmount || '1.00',
            matchingOrder.currency || 'USDT',
            `[ЗАМЕНА ПО ГАРАНТИИ] ${matchingOrder.productName || 'CS2 NFA Account'}`,
            1,
            [newToken]
          ).catch(e => console.error('[Warranty] Email error:', e));
        }
      } catch (dbErr) {}
    }

    return res.status(200).json({
      success: true,
      eligible: true,
      newToken,
      newSteamId,
      status: 'DELIVERED',
      message: 'Замена успешно выдана! Новый токен активирован.'
    });

  } catch (err) {
    console.error('Warranty check handler exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Ошибка обработки гарантии'
    });
  }
}
