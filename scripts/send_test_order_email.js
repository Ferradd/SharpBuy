import fs from 'fs';
import path from 'path';

const tokens = [
  '3044740344----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODk4NTc4MjIzMCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDM3MjQyNzQsICJuYmYiOiAxNzc2ODUzNzk4LCAiaWF0IjogMTc4NTQ5Mzc5OCwgImp0aSI6ICIwMDAyXzI4OTJDRjk0XzgxMTgwIiwgIm9hdCI6IDE3ODU0OTM3OTgsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxMjIuMjI2LjE0OC4xNzQiLCAiaXBfY29uZmlybWVyIjogIjIwNi4yMzcuMTE0LjEwMCIgfQ.NW4t61zSJK92lCn_JUkqMztNo5ksCcikk4iwcwW0AW6w5y3_aIl5594gD-S587wk-nPAL1amRj2ECSU2xw8HAQ',
  '76561197994572241----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5Nzk5NDU3MjI0MSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTQ2OTIxODgsICJuYmYiOiAxNzU0OTA0Mjg2LCAiaWF0IjogMTc2MzU0NDI4NiwgImp0aSI6ICIwMDE3XzI3NDZBMUY5XzRFQ0UwIiwgIm9hdCI6IDE3NjM1NDQyODYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiNzguMTU3LjIzMS4xNTMiLCAiaXBfY29uZmlybWVyIjogIjQ2LjQyLjE0OS4xODgiIH0.x6S82SI7D7skdQhQkkqPttbwKcmzC7aZgvZvp-JxcdbcLjwSw8m_6aqJCzKoUBBieaN_-QPTO7_oPjHPL82RCA',
  '76561198001838422----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODAwMTgzODQyMiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUyMTkzODEsICJuYmYiOiAxNzY1MjAzMjI2LCAiaWF0IjogMTc3Mzg0MzIyNiwgImp0aSI6ICIwMDEwXzI3RTM3NkQxXzY0REJBIiwgIm9hdCI6IDE3NzM4NDMyMjYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiNS4zNS4zNi4zNiIsICJpcF9jb25maXJtZXIiOiAiODIuMjcuMC4yMzgiIH0.Wt9wsDepcI8YiX-59T4uukKaAg963awi1k4TMKPoS8tpZDdMroJ9jIJpMJZd6d3MNd0_LfOSE0tig3Uyx9rIDA',
  '76561198077834073----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODA3NzgzNDA3MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTkwNTUzNjYsICJuYmYiOiAxNzcyMTAzODI0LCAiaWF0IjogMTc4MDc0MzgyNCwgImp0aSI6ICIwMDA0XzI4NDhGQkU1XzQyNENEIiwgIm9hdCI6IDE3ODA3NDM4MjQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODguMjQzLjE4My4yMTciLCAiaXBfY29uZmlybWVyIjogIjE4OC4yNDMuMTgzLjIxNyIgfQ.zSlLFM0hKi-O6R9IDuJwenHfZOzTRlaAZNYW4R1T6ZbWDkj5b-MHWrZoM3Q84Mwsc_i6-_rway4GfSQZfuGVBA'
];

const orderId = 'SHARP-8X94B2';
const amountRub = 200;
const cryptoAmount = '2.17';
const currencyName = 'USDT (BEP-20)';
const productName = 'CS2 PRIME ACCOUNT (PREMIER UNRANKED)';

const tokensHtml = tokens.map((token, idx) => `
  <div style="background: #090a0d; border: 1px solid rgba(232, 88, 58, 0.35); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
    <div style="font-size: 11px; font-weight: 800; color: #e8583a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
      🔑 АККАУНТ / ТОКЕН #${idx + 1}:
    </div>
    <div style="background: #14161d; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #34d399; word-break: break-all; line-height: 1.5; user-select: all;">
      ${token}
    </div>
  </div>
`).join('');

const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Чек заказа #${orderId} - SharpBuy</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #08090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f1ec;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #101216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
    
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
          ✅ Оплата подтверждена &middot; Выдано 4 аккаунта
        </div>
        <div style="font-size: 13px; color: #c4cdd5;">
          Заказ: <strong style="color: #ffffff;">#${orderId}</strong> &middot; Сумма: <strong style="color: #34d399;">${amountRub} ₽ (${cryptoAmount} ${currencyName})</strong>
        </div>
        <div style="font-size: 13px; color: #c4cdd5; margin-top: 4px;">
          Товар: <strong style="color: #ffffff;">${productName}</strong> (x4)
        </div>
      </div>

      <!-- NFA Tokens -->
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
          <li>Вставьте любой из 4 скопированных токенов в программу.</li>
          <li>Нажмите «Войти» — Steam запустится автоматически с вашим CS2 Prime!</li>
        </ol>
      </div>

      <!-- Warranty & Support -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0;">Гарантия: 3 часа на проверку и вход каждого аккаунта.</p>
        <p style="margin: 0;">Служба поддержки: <a href="https://sharpbuy.org" style="color: #e8583a; text-decoration: none;">sharpbuy.org</a></p>
      </div>
    </div>

  </div>
</body>
</html>
`;

async function main() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('Set RESEND_API_KEY in environment');
    process.exit(1);
  }
  console.log('Sending 4x account order email via Resend from orders@sharpbuy.org to iliykuzin2@gmail.com...');
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'SharpBuy Orders <orders@sharpbuy.org>',
      to: ['iliykuzin2@gmail.com'],
      subject: 'Чек и 4x токена заказа #SHARP-8X94B2 - SharpBuy',
      html: htmlBody
    })
  });

  const data = await resp.json();
  console.log('Resend Response:', data);
}

main();
