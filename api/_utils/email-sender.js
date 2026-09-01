import { requireEnv } from './env.js';

export async function sendOrderEmail(orderId, userEmail, priceRub, cryptoAmount, currency, productName, neededQty, tokens) {
  const resendKey = requireEnv('RESEND_API_KEY');
  const tokensHtml = tokens.map((t, idx) => `
    <div style="background: #090a0d; border: 1px solid rgba(232, 88, 58, 0.35); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
      <div style="font-size: 11px; font-weight: 800; color: #e8583a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        🔑 ${tokens.length > 1 ? `АККАУНТ / ТОКЕН #${idx + 1}` : 'ВАШ ТОКЕН ВХОДА (NFA STEAM)'}:
      </div>
      <div style="background: #14161d; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #34d399; word-break: break-all; line-height: 1.5;">
        ${t}
      </div>
    </div>
  `).join('');

  await fetch('https://api.resend.com/emails', {
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

              <!-- 🛡️ Блок Гарантии SharpBuy Care и Кнопка Замены -->
              <div style="background: rgba(232, 88, 58, 0.08); border: 1px solid rgba(232, 88, 58, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <div style="font-size: 14px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  🛡️ ГАРАНТИЯ SHARPBUY CARE (3 ЧАСА)
                </div>
                <div style="font-size: 12px; color: #a4b1cd; line-height: 1.5; margin-bottom: 16px;">
                  Если с аккаунтом возникла проблема в течение 3 часов — наш робот мгновенно проверит доступ и выдаст вам автоматическую замену в 1 клик:
                </div>
                <a href="https://sharpbuy.org/#nfa-warranty?token=${encodeURIComponent(tokens[0] || '')}" style="display: inline-block; background: #e8583a; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 12px 26px; border-radius: 8px; box-shadow: 0 4px 20px rgba(232, 88, 58, 0.4);">
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
}
