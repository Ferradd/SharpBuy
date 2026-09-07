import { getOrderById, markOrderEmailSent } from './orders-db.js';

const sentEmailOrders = new Set();

// ============================================================================
// ENHANCED EMAIL SENDER WITH DETAILED LOGGING AND RETRY
// ============================================================================

function logEmailEvent(level, orderId, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    orderId,
    message,
    ...data
  };
  
  const logString = `[Email] [${level}] [${orderId}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}`;
  
  switch (level) {
    case 'error':
      console.error(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'info':
      console.log(logString);
      break;
    default:
      console.log(logString);
  }
}

async function sendWithRetry(apiCall, orderId, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logEmailEvent('info', orderId, `Attempt ${attempt}/${maxRetries} to send email`);
      
      const result = await apiCall();
      
      if (result.success) {
        logEmailEvent('info', orderId, `Email sent successfully on attempt ${attempt}`, {
          resendId: result.id,
          attempt
        });
        return result;
      }
      
      lastError = result.error;
      logEmailEvent('warn', orderId, `Attempt ${attempt} failed: ${result.error}`);
      
      // Don't retry on certain errors
      if (result.error === 'invalid_email' || result.error === 'missing_resend_key') {
        break;
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logEmailEvent('info', orderId, `Waiting ${backoffMs}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
      
    } catch (error) {
      lastError = error.message;
      logEmailEvent('error', orderId, `Attempt ${attempt} threw exception: ${error.message}`);
      
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  return { success: false, error: lastError || 'Max retries exceeded' };
}

export async function sendOrderEmail(orderId, userEmail, priceRub, cryptoAmount, currency, productName, neededQty, tokens, options = {}) {
  const startTime = Date.now();
  const force = options.force === true;

  logEmailEvent('info', orderId, 'Starting email send process', {
    userEmail,
    productName,
    priceRub,
    force,
    tokensCount: Array.isArray(tokens) ? tokens.length : 1
  });

  if (!userEmail || !userEmail.includes('@')) {
    logEmailEvent('error', orderId, 'Invalid recipient email', { userEmail });
    return { success: false, error: 'invalid_email' };
  }

  if (!force && sentEmailOrders.has(orderId)) {
    logEmailEvent('info', orderId, 'Skipping duplicate send (already in memory cache)');
    return { success: true, skipped: true };
  }

  const existingOrder = getOrderById(orderId);
  if (!force && existingOrder?.emailSentAt) {
    sentEmailOrders.add(orderId);
    logEmailEvent('info', orderId, 'Skipping duplicate send (already sent at)', {
      emailSentAt: existingOrder.emailSentAt
    });
    return { success: true, skipped: true };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    logEmailEvent('error', orderId, 'RESEND_API_KEY not configured');
    return { success: false, error: 'missing_resend_key' };
  }

  logEmailEvent('info', orderId, 'RESEND_API_KEY configured', {
    keyLength: resendKey.length,
    keyPrefix: resendKey.substring(0, 8) + '...'
  });

  const tokensList = Array.isArray(tokens) ? tokens : [tokens];
  const tokensHtml = tokensList.map((t, idx) => `
    <div style="background: #090a0d; border: 1px solid rgba(232, 88, 58, 0.35); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
      <div style="font-size: 11px; font-weight: 800; color: #e8583a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        🔑 ${tokensList.length > 1 ? `АККАУНТ / ТОКЕН #${idx + 1}` : 'ВАШ ТОКЕН ВХОДА (NFA STEAM)'}:
      </div>
      <div style="background: #14161d; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #34d399; word-break: break-all; line-height: 1.5;">
        ${t}
      </div>
    </div>
  `).join('');

  const apiCall = async () => {
    const apiStartTime = Date.now();
    
    try {
      logEmailEvent('info', orderId, 'Sending request to Resend API');
      
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'SharpBuy Orders <orders@sharpbuy.org>',
          to: [userEmail],
          subject: `Чек и токен заказа #${orderId} - SharpBuy`,
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 20px; background-color: #08090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f1ec;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #101216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
              
              <div style="background: linear-gradient(135deg, #181b22, #0d0f13); padding: 30px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
                  SHARP<span style="color: #e8583a;">BUY</span>.ORG
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #8a94a6; text-transform: uppercase; letter-spacing: 1px;">
                  Премиум Маркетплейс Игровых Товаров
                </p>
              </div>

              <div style="padding: 24px;">
                <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                  <div style="font-size: 16px; font-weight: 800; color: #34d399; margin-bottom: 4px;">
                    ✅ Оплата подтверждена &middot; Товар выдан
                  </div>
                  <div style="font-size: 13px; color: #c4cdd5;">
                    Заказ: <strong style="color: #ffffff;">#${orderId}</strong> &middot; Сумма: <strong style="color: #34d399;">${priceRub} ₽ (${cryptoAmount} ${currency})</strong>
                  </div>
                  <div style="font-size: 13px; color: #c4cdd5; margin-top: 4px;">
                    Товар: <strong style="color: #ffffff;">${productName}</strong> (x${neededQty})
                  </div>
                </div>

                ${tokensHtml}

                <div style="background: #14171f; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">
                    ИНСТРУКЦИЯ ПО ВХОДУ В STEAM:
                  </div>
                  <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #a4b1cd; line-height: 1.7;">
                    <li>Скачайте лаунчер входа: <a href="https://sharpbuy.org/SharpBuy_Launcher.exe" style="color: #34d399; font-weight: bold; text-decoration: underline;">Скачать SharpBuy Launcher (прямая ссылка)</a></li>
                    <li>Запустите файл <strong>SharpBuy_Launcher.exe</strong> на вашем ПК.</li>
                    <li>Вставьте скопированный выше токен в программу.</li>
                    <li>Нажмите «Войти» — Steam запустится автоматически с вашим CS2 Prime!</li>
                  </ol>
                </div>

                <div style="background: rgba(232, 88, 58, 0.08); border: 1px solid rgba(232, 88, 58, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 14px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                    🛡️ ГАРАНТИЯ SHARPBUY CARE (3 ЧАСА)
                  </div>
                  <div style="font-size: 12px; color: #a4b1cd; line-height: 1.5; margin-bottom: 16px;">
                    Если с аккаунтом возникла проблема в течение 3 часов — наш робот мгновенно проверит доступ и выдаст вам автоматическую замену в 1 клик:
                  </div>
                  <a href="https://sharpbuy.org/#nfa-warranty?token=${encodeURIComponent(tokensList[0] || '')}" style="display: inline-block; background: #e8583a; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 12px 26px; border-radius: 8px; box-shadow: 0 4px 20px rgba(232, 88, 58, 0.4);">
                    ЗАПРОСИТЬ ЗАМЕНУ ПО ГАРАНТИИ &rarr;
                  </a>
                </div>

                <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 4px 0;">Гарантия: 3 часа на проверку и вход.</p>
                  <p style="margin: 0;">Служба поддержки: <a href="https://sharpbuy.org" style="color: #e8583a; text-decoration: none;">sharpbuy.org</a></p>
                </div>
              </div>

            </div>
          </body>
          </html>
        `
        })
      });

      const apiDuration = Date.now() - apiStartTime;
      const data = await res.json().catch(() => ({}));

      logEmailEvent('info', orderId, 'Resend API response received', {
        status: res.status,
        apiDuration,
        hasData: Object.keys(data).length > 0
      });

      if (!res.ok) {
        logEmailEvent('error', orderId, 'Resend API error', {
          status: res.status,
          responseData: data
        });
        return { success: false, error: data?.message || `http_${res.status}` };
      }

      logEmailEvent('info', orderId, 'Email sent successfully via Resend', {
        resendId: data.id,
        apiDuration
      });

      return { success: true, id: data.id };
      
    } catch (error) {
      const apiDuration = Date.now() - apiStartTime;
      logEmailEvent('error', orderId, 'Network/exception error during API call', {
        error: error.message,
        apiDuration
      });
      throw error;
    }
  };

  // Use retry mechanism
  const result = await sendWithRetry(apiCall, orderId);

  if (result.success) {
    sentEmailOrders.add(orderId);
    markOrderEmailSent(orderId);
    
    const totalDuration = Date.now() - startTime;
    logEmailEvent('info', orderId, 'Email process completed successfully', {
      totalDuration,
      resendId: result.id
    });
  } else {
    const totalDuration = Date.now() - startTime;
    logEmailEvent('error', orderId, 'Email process failed after retries', {
      totalDuration,
      finalError: result.error
    });
  }

  return result;
}

export async function ensureOrderEmailSent(orderId, options = {}) {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, error: 'order_not_found' };
  }

  if (!order.tokens || order.tokens.length === 0) {
    return { success: false, error: 'no_tokens' };
  }

  if (order.tokens[0] === 'PROCURING') {
    return { success: false, error: 'order_not_delivered' };
  }

  const userEmail = options.email || order.email;
  if (!userEmail) {
    return { success: false, error: 'no_email' };
  }

  return await sendOrderEmail(
    orderId,
    userEmail,
    order.amountRub,
    order.cryptoAmount,
    order.currency,
    order.productName,
    order.quantity || 1,
    order.tokens,
    { force: options.force === true }
  );
}