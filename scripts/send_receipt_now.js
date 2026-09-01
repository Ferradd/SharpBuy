async function sendCustomerOrderReceipt() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('Set RESEND_API_KEY in environment');
    process.exit(1);
  }
  const orderId = 'SHARP-' + Date.now().toString(36).toUpperCase();
  const userEmail = 'iliykuzin2@gmail.com';
  const token = '76561198985782230----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODk4NTc4MjIzMCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDM3MjQyNzQsICJuYmYiOiAxNzc2ODUzNzk4LCAiaWF0IjogMTc4NTQ5Mzc5OCwgImp0aSI6ICIwMDAyXzI4OTJDRjk0XzgxMTgwIiwgIm9hdCI6IDE3ODU0OTM3OTgsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxMjIuMjI2LjE0OC4xNzQiLCAiaXBfY29uZmlybWVyIjogIjIwNi4yMzcuMTE0LjEwMCIgfQ.NW4t61zSJK92lCn_JUkqMztNo5ksCcikk4iwcwW0AW6w5y3_aIl5594gD-S587wk-nPAL1amRj2ECSU2xw8HAQ';

  console.log(`Sending customer receipt to ${userEmail}...`);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SharpBuy Orders <orders@sharpbuy.org>',
        to: [userEmail],
        subject: `✓ Заказ #${orderId} успешно оплачен — Данные вашего Steam NFA аккаунта`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { margin:0; padding:20px; background-color:#08090b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#f3f1ec; }
              .card { max-width:580px; margin:0 auto; background-color:#101216; border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden; }
              .header { background: linear-gradient(135deg, #181b22, #0d0f13); padding:26px 20px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.08); }
              .logo { margin:0; font-size:24px; font-weight:900; letter-spacing:2px; color:#ffffff; }
              .logo span { color:#e8583a; }
              .status { margin:4px 0 0 0; font-size:12px; color:#34d399; font-weight:700; }
              .content { padding:24px; }
              .info-box { background:#15181f; border-left:4px solid #34d399; padding:14px; border-radius:8px; margin-bottom:20px; font-size:13px; }
              .token-box { background:#0d0f13; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; margin-bottom:16px; }
              .token-title { font-size:11px; font-weight:800; color:#34d399; margin-bottom:6px; font-family:monospace; }
              .token-data { font-family:monospace; font-size:11px; color:#ffffff; word-break:break-all; background:#060709; padding:10px; border-radius:6px; user-select:all; }
              .btn { display:inline-block; background:#e8583a; color:#ffffff; text-decoration:none; font-weight:800; font-size:13px; padding:12px 24px; border-radius:10px; }
              .footer { border-top:1px solid rgba(255,255,255,0.06); padding-top:16px; margin-top:20px; font-size:11px; color:rgba(255,255,255,0.4); text-align:center; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 class="logo">SHARP<span>BUY</span>.ORG</h1>
                <p class="status">✓ ОПЛАТА УСПЕШНО ПОЛУЧЕНА • АВТОВЫДАЧА</p>
              </div>
              <div class="content">
                <div class="info-box">
                  <div style="margin-bottom:4px;">Номер заказа: <strong>#${orderId}</strong></div>
                  <div style="margin-bottom:4px;">Товар: <strong>CS2 Premier Ready • Instant Competitive (x1)</strong></div>
                  <div style="margin-bottom:4px;">Сумма оплаты: <strong style="color:#34d399;">0.97 USDT (BSC BEP-20) / 89 ₽</strong></div>
                  <div>Гарантия: <strong>3 часа с момента получения</strong></div>
                </div>

                <div style="margin-bottom:12px; font-size:12px; color:#8a94a6; text-transform:uppercase; font-weight:700;">Ваш Steam NFA Токен:</div>
                <div class="token-box">
                  <div class="token-title">🔑 ТОКЕН ДЛЯ ВХОДА (ЛОГИН ЧЕРЕЗ ЛАУНЧЕР):</div>
                  <div class="token-data">${token}</div>
                </div>

                <div style="background:rgba(232,88,58,0.1); border:1px solid rgba(232,88,58,0.2); border-radius:10px; padding:14px; margin-bottom:20px; font-size:12px; line-height:1.5;">
                  <strong style="color:#e8583a;">Инструкция по активации:</strong><br/>
                  1. Скачайте официальный лаунчер по кнопке ниже.<br/>
                  2. Запустите лаунчер и скопируйте токен выше в поле ввода.<br/>
                  3. Нажмите <b>«Войти в Steam»</b> — лаунчер автоматически авторизует вас в аккаунт с активным CS2 Prime!
                </div>

                <div style="text-align:center; margin:20px 0;">
                  <a href="https://sharpbuy.org/SharpBuy_Launcher.exe" class="btn">СКАЧАТЬ ЛАУНЧЕР (NFA.EXE) &rarr;</a>
                </div>

                <div class="footer">
                  Если у вас возникли вопросы, обратитесь в нашу поддержку на сайте или в Telegram.<br/>
                  SharpBuy.org &copy; 2026. Все права защищены.
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const data = await res.json();
    console.log('Customer Email Result:', data);
  } catch (e) {
    console.error('Error sending customer email:', e);
  }
}

sendCustomerOrderReceipt();
