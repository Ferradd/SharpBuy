import nodemailer from 'nodemailer';

// ============================================================================
// SHARPBUY EMAIL DISPATCHER (Resend API + Nodemailer SMTP Dual Support)
// ============================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, orderId, productName, amountRub, cryptoAmount, currencyName, delivery } = req.body;

    if (!email || !delivery) {
      return res.status(400).json({ error: 'Email and delivery data are required' });
    }

    const tokensList = Array.isArray(delivery.tokens) && delivery.tokens.length > 0 
      ? delivery.tokens 
      : [delivery.tokenData || `${delivery.login || 'account'} : ${delivery.password || 'token'}`];

    const tokensHtml = tokensList.map((token, idx) => `
      <div style="background: #090a0d; border: 1px solid rgba(232, 88, 58, 0.35); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
        <div style="font-size: 11px; font-weight: 800; color: #e8583a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          🔑 ${tokensList.length > 1 ? `АККАУНТ / ТОКЕН #${idx + 1}` : 'ВАШ ТОКЕН ВХОДА (NFA STEAM)'}:
        </div>
        <div style="background: #14161d; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #34d399; word-break: break-all; line-height: 1.5;">
          ${token}
        </div>
      </div>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Чек заказа #${orderId} - SharpBuy</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #08090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f1ec;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #101216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #181b22, #0d0f13); padding: 30px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
              SHARP<span style="color: #e8583a;">BUY</span>.ORG
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #8a94a6; text-transform: uppercase; letter-spacing: 1px;">
              Премиум Маркетплейс Игровых Товаров
            </p>
          </div>

          <!-- Order Banner -->
          <div style="padding: 24px;">
            <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: 800; color: #34d399; margin-bottom: 4px;">
                ✅ Оплата подтверждена &middot; ${tokensList.length > 1 ? `Выдано ${tokensList.length} аккаунта(-ов)` : 'Товар выдан'}
              </div>
              <div style="font-size: 13px; color: #c4cdd5;">
                Заказ: <strong style="color: #ffffff;">#${orderId}</strong> &middot; Сумма: <strong style="color: #34d399;">${amountRub} ₽ (${cryptoAmount} ${currencyName})</strong>
              </div>
              <div style="font-size: 13px; color: #c4cdd5; margin-top: 4px;">
                Товар: <strong style="color: #ffffff;">${productName}</strong> ${tokensList.length > 1 ? `(x${tokensList.length})` : ''}
              </div>
            </div>

            <!-- NFA Token Boxes -->
            ${tokensHtml}

            <!-- Launcher & Instructions -->
            <div style="background: #14171f; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 13px; font-weight: 800; color: #ffffff;">
                  ИНСТРУКЦИЯ ПО ВХОДУ В STEAM:
                </div>
              </div>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #a4b1cd; line-height: 1.7;">
                <li>Скачайте лаунчер входа: <a href="https://sharpbuy.org/SharpBuy_Launcher.exe" style="color: #34d399; font-weight: bold; text-decoration: underline;">Скачать SharpBuy Launcher (прямая ссылка)</a></li>
                <li>Запустите файл <strong>SharpBuy_Launcher.exe</strong> на вашем ПК.</li>
                <li>Вставьте скопированный выше токен в программу.</li>
                <li>Нажмите «Войти» — Steam запустится автоматически с вашим CS2 Prime!</li>
              </ol>
            </div>

            <!-- Footer Note -->
            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">Гарантия: 3 часа на проверку и вход.</p>
              <p style="margin: 0;">Служба поддержки: <a href="https://sharpbuy.org" style="color: #e8583a; text-decoration: none;">sharpbuy.org</a></p>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    // 1. Priority 1: Resend HTTP API (Fastest serverless delivery via sharpbuy.org domain)
    const resendKey = process.env.RESEND_API_KEY || 're_KpbJCCGo_JHB2BrFReEGJaeZHhK3KFowd';
    if (resendKey) {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'SharpBuy Orders <orders@sharpbuy.org>',
          to: [email],
          subject: `Чек и токен заказа #${orderId} - SharpBuy`,
          html: htmlBody
        })
      });

      if (resendResp.ok) {
        return res.status(200).json({ success: true, provider: 'resend' });
      }
    }

    // 2. Priority 2: Standard SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE !== 'false',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"SharpBuy" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Чек и токен заказа #${orderId} - SharpBuy`,
        html: htmlBody
      });

      return res.status(200).json({ success: true, provider: 'smtp' });
    }

    return res.status(200).json({ success: true, note: 'Email simulated' });
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
