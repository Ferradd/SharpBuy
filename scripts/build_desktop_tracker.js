import QRCode from 'qrcode';
import fs from 'fs';

async function build() {
  const address = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const qrDataUrl = await QRCode.toDataURL(address, { width: 180, margin: 1 });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>SharpBuy · Live Store Tracker</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #08090d; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { width: 100%; max-width: 480px; background: #11141c; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .title { font-size: 17px; font-weight: 800; }
    .badge { display: flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-family: monospace; }
    .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .wallet-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 18px; text-align: center; margin-bottom: 16px; }
    .addr-tag { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
    .addr { font-family: monospace; font-size: 11.5px; color: #38bdf8; background: rgba(56,189,248,0.08); padding: 8px 10px; border-radius: 8px; word-break: break-all; cursor: pointer; border: 1px solid rgba(56,189,248,0.2); }
    .qr { margin: 14px auto 6px; display: inline-block; padding: 8px; background: #fff; border-radius: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .stat { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; }
    .stat-lbl { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    .stat-num { font-size: 24px; font-weight: 800; font-family: monospace; }
    .green { color: #10b981; }
    .yellow { color: #f59e0b; }
    .stat-hint { font-size: 11px; color: #64748b; margin-top: 4px; }
    .btn { display: block; text-align: center; background: #10b981; color: #000; font-weight: 800; font-size: 12px; padding: 12px; border-radius: 12px; text-decoration: none; transition: 0.2s; }
    .btn:hover { background: #34d399; }
    .foot { text-align: center; font-size: 11px; color: #475569; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div>
        <div class="title">⚡ SHARPBUY TRACKER</div>
        <div style="font-size: 11px; color: #64748b;">Чистый кошелёк (BSC Mainnet)</div>
      </div>
      <div class="badge">
        <div class="dot"></div>
        <span id="timer">LIVE (5s)</span>
      </div>
    </div>

    <div class="wallet-box">
      <div class="addr-tag">Адрес магазина для пополнений (BEP-20)</div>
      <div class="addr" id="addr" onclick="copyA()" title="Нажмите для копирования">${address}</div>
      <div class="qr">
        <img src="${qrDataUrl}" width="140" height="140" alt="QR" style="display:block;">
      </div>
    </div>

    <div class="grid">
      <div class="stat">
        <div class="stat-lbl">🪙 USDT (BEP-20)</div>
        <div class="stat-num green" id="usdt">0.99</div>
        <div class="stat-hint" id="usdtRub">≈ 91 ₽ (Баланс закупки)</div>
      </div>
      <div class="stat">
        <div class="stat-lbl">⛽ BNB (BSC Газ)</div>
        <div class="stat-num yellow" id="bnb">0.00139</div>
        <div class="stat-hint">Газ для 15+ транзакций</div>
      </div>
    </div>

    <a href="https://bscscan.com/address/${address}" target="_blank" class="btn">
      🔍 ОТКРЫТЬ В BSCSCAN (ИСТОРИЯ ТРАНЗАКЦИЙ) ↗
    </a>
    <div class="foot">Кошелёк защищен. Приватные ключи сохранены локально в папке wallet/</div>
  </div>

  <script>
    const ADDR = '${address}';
    const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
    const RPCS = [
      'https://bsc-dataseed1.binance.org',
      'https://1rpc.io/bnb',
      'https://binance.llamarpc.com'
    ];

    function copyA() {
      navigator.clipboard.writeText(ADDR);
      const el = document.getElementById('addr');
      const old = el.innerText;
      el.innerText = 'СКОПИРОВАНО!';
      setTimeout(() => el.innerText = old, 1200);
    }

    async function rpcCall(method, params) {
      for (const rpc of RPCS) {
        try {
          const res = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
          });
          const data = await res.json();
          if (data && data.result !== undefined) return data.result;
        } catch(e) {}
      }
      return null;
    }

    async function update() {
      // 1. BNB
      const bnbHex = await rpcCall('eth_getBalance', [ADDR, 'latest']);
      if (bnbHex) {
        const bnbWei = BigInt(bnbHex);
        const bnbVal = (Number(bnbWei) / 1e18).toFixed(5);
        document.getElementById('bnb').innerText = bnbVal;
      }

      // 2. USDT (balanceOf: 0x70a08231 + padded address)
      const dataHex = '0x70a08231000000000000000000000000' + ADDR.replace('0x', '').toLowerCase();
      const usdtHex = await rpcCall('eth_call', [{ to: USDT_CONTRACT, data: dataHex }, 'latest']);
      if (usdtHex) {
        const usdtWei = BigInt(usdtHex);
        const usdtVal = (Number(usdtWei) / 1e18).toFixed(2);
        document.getElementById('usdt').innerText = usdtVal;
        document.getElementById('usdtRub').innerText = '≈ ' + Math.round(usdtVal * 92) + ' ₽ (Баланс закупки)';
      }
    }

    update();
    setInterval(update, 5000);
  </script>
</body>
</html>`;

  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\SharpBuy_Wallet_Tracker.html', html, 'utf8');
  console.log('Successfully generated desktop tracker HTML at C:\\Users\\iliyk\\Desktop\\SharpBuy_Wallet_Tracker.html');
}

build();
