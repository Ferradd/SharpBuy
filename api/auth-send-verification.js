// ============================================================================
// SHARPBUY USER EMAIL VERIFICATION DISPATCHER
// ============================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, verifyToken } = req.body;

    if (!email || !verifyToken) {
      return res.status(400).json({ error: 'Missing email or verifyToken' });
    }

    const verificationLink = `https://sharpbuy.org/?verify=${verifyToken}&email=${encodeURIComponent(email)}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Подтверждение аккаунта - SharpBuy</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #08090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f1ec;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #101216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #181b22, #0d0f13); padding: 30px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
              SHARP<span style="color: #e8583a;">BUY</span>.ORG
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #8a94a6; text-transform: uppercase; letter-spacing: 1px;">
              Подтверждение Email &middot; Личный кабинет
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 28px;">
            <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #ffffff;">
              Добро пожаловать в SharpBuy!
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #a4b1cd; line-height: 1.6;">
              Вы зарегистрировали аккаунт на почту <strong style="color: #ffffff;">${email}</strong>. Для активации всех функций личного кабинета, истории заказов и пополнения баланса нажмите на кнопку ниже:
            </p>

            <div style="text-align: center; margin: 26px 0;">
              <a href="${verificationLink}" style="display: inline-block; background: #e8583a; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 0 25px rgba(232,88,58,0.4);">
                ПОДТВЕРДИТЬ EMAIL &rarr;
              </a>
            </div>

            <div style="background: #0d0f13; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; margin-top: 20px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #34d399; text-align: center;">
              Код подтверждения: <strong style="color: #ffffff; letter-spacing: 2px;">${verifyToken}</strong>
            </div>

            <p style="margin: 20px 0 0 0; font-size: 11px; color: #64748b; line-height: 1.5;">
              Если вы не регистрировались на сайте SharpBuy, просто проигнорируйте это письмо.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(503).json({ error: 'Email service not configured' });
    }
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SharpBuy Security <orders@sharpbuy.org>',
        to: [email],
        subject: `Подтверждение почты ${email} - SharpBuy`,
        html: htmlBody
      })
    });

    const data = await resendResp.json();
    return res.status(200).json({ success: true, resendId: data.id });
  } catch (err) {
    console.error('Email verification send error:', err);
    return res.status(500).json({ error: err.message });
  }
}
