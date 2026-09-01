async function sendHighContrastReceipt() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('Set RESEND_API_KEY in environment');
    process.exit(1);
  }
  const orderId = 'SHARP-PREMIER-' + Math.floor(100000 + Math.random() * 900000);
  const userEmail = 'iliykuzin2@gmail.com';
  const token = '76561198985782230----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODk4NTc4MjIzMCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDM3MjQyNzQsICJuYmYiOiAxNzc2ODUzNzk4LCAiaWF0IjogMTc4NTQ5Mzc5OCwgImp0aSI6ICIwMDAyXzI4OTJDRjk0XzgxMTgwIiwgIm9hdCI6IDE3ODU0OTM3OTgsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxMjIuMjI2LjE0OC4xNzQiLCAiaXBfY29uZmlybWVyIjogIjIwNi4yMzcuMTE0LjEwMCIgfQ.NW4t61zSJK92lCn_JUkqMztNo5ksCcikk4iwcwW0AW6w5y3_aIl5594gD-S587wk-nPAL1amRj2ECSU2xw8HAQ';

  console.log(`Sending updated high-contrast email to ${userEmail}...`);

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
        subject: `✓ Заказ #${orderId} — Данные вашего Steam NFA аккаунта [Обновленный дизайн]`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="margin:0; padding:24px 10px; background-color:#07080a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#ffffff;">
            <div style="max-width:580px; margin:0 auto; background-color:#12141a; border:1px solid rgba(255,255,255,0.14); border-radius:16px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- HEADER -->
              <div style="background: linear-gradient(135deg, #1c202a, #0f1117); padding:28px 20px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.1);">
                <h1 style="margin:0; font-size:26px; font-weight:900; letter-spacing:2px; color:#ffffff;">SHARP<span style="color:#e8583a;">BUY</span>.ORG</h1>
                <p style="margin:6px 0 0 0; font-size:13px; color:#34d399; font-weight:800; letter-spacing:0.5px;">✓ ОПЛАТА УСПЕШНО ПОЛУЧЕНА • АВТОВЫДАЧА</p>
              </div>

              <!-- CONTENT -->
              <div style="padding:26px 24px;">
                
                <!-- ORDER INFO BOX -->
                <div style="background:#181b24; border-left:4px solid #34d399; border:1px solid rgba(255,255,255,0.08); border-left-width:4px; padding:16px; border-radius:10px; margin-bottom:22px; font-size:13px; line-height:1.6;">
                  <div style="color:#ffffff; margin-bottom:5px;">Номер заказа: <strong style="color:#ffffff;">#${orderId}</strong></div>
                  <div style="color:#ffffff; margin-bottom:5px;">Товар: <strong style="color:#ffffff;">CS2 Premier Ready • Instant Competitive (x1)</strong></div>
                  <div style="color:#ffffff; margin-bottom:5px;">Сумма оплаты: <strong style="color:#34d399; font-size:14px;">0.97 USDT (BSC BEP-20) / 89 ₽</strong></div>
                  <div style="color:#ffffff;">Гарантия магазина: <strong style="color:#38bdf8;">3 часа с момента получения</strong></div>
                </div>

                <!-- TOKEN HEADER -->
                <div style="margin-bottom:10px; font-size:12px; color:#94a3b8; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Ваш Steam NFA Токен для авторизации:</div>
                
                <!-- TOKEN BOX -->
                <div style="background:#090b0e; border:1px solid rgba(52,211,153,0.3); border-radius:12px; padding:16px; margin-bottom:20px;">
                  <div style="font-size:12px; font-weight:800; color:#34d399; margin-bottom:8px; font-family:monospace;">🔑 STEAM NFA TOKEN (ДЛЯ ЛАУНЧЕРА):</div>
                  <div style="font-family:Consolas,Monaco,monospace; font-size:11px; color:#ffffff; line-height:1.4; word-break:break-all; background:#000000; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); user-select:all;">${token}</div>
                </div>

                <!-- INSTRUCTIONS BOX -->
                <div style="background:#1c1716; border:1px solid rgba(232,88,58,0.35); border-radius:12px; padding:16px; margin-bottom:24px; font-size:13px; line-height:1.6;">
                  <div style="color:#e8583a; font-weight:800; font-size:14px; margin-bottom:8px;">📌 Пошаговая инструкция по входу:</div>
                  <div style="color:#ffffff; margin-bottom:4px;">1. Скачайте официальный лаунчер по кнопке ниже.</div>
                  <div style="color:#ffffff; margin-bottom:4px;">2. Запустите лаунчер и вставьте ваш <b>Steam NFA Токен</b>.</div>
                  <div style="color:#ffffff;">3. Нажмите кнопку <b>«Войти в Steam»</b> — лаунчер автоматически авторизует вас в аккаунт с Prime!</div>
                </div>

                <!-- DOWNLOAD BUTTON -->
                <div style="text-align:center; margin:28px 0 16px 0;">
                  <a href="https://sharpbuy.org/SharpBuy_Launcher.exe" style="display:inline-block; background:#e8583a; color:#ffffff; text-decoration:none; font-weight:900; font-size:14px; padding:14px 28px; border-radius:12px; letter-spacing:0.5px; box-shadow:0 4px 15px rgba(232,88,58,0.4);">СКАЧАТЬ ЛАУНЧЕР (NFA.EXE) &rarr;</a>
                </div>

                <!-- FOOTER -->
                <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:18px; margin-top:24px; font-size:12px; color:#94a3b8; text-align:center; line-height:1.5;">
                  Если у вас возникли вопросы, обратитесь в нашу поддержку на сайте или в Telegram.<br/>
                  <span style="color:#64748b;">SharpBuy.org &copy; 2026. Все права защищены.</span>
                </div>

              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const data = await res.json();
    console.log('High contrast email result:', data);
  } catch (e) {
    console.error('Email error:', e);
  }
}

sendHighContrastReceipt();
