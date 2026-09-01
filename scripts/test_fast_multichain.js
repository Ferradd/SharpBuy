const MERCHANT_EVM = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';

async function rpcCall(url, method, params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: controller.signal
    });
    clearTimeout(timer);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    return { error: e.message };
  }
}

async function testFastMultiChain() {
  console.log('--- 1. BSC Native BNB Balance ---');
  const bnbRes = await rpcCall('https://bsc-dataseed1.binance.org', 'eth_getBalance', [MERCHANT_EVM, 'latest']);
  if (bnbRes.result) {
    console.log('BNB Balance:', Number(BigInt(bnbRes.result)) / 1e18, 'BNB');
  } else {
    console.log('BNB error:', bnbRes);
  }

  console.log('\n--- 2. BSC USDT (BEP-20) ---');
  const bscUsdtData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const bscUsdtRes = await rpcCall('https://bsc-dataseed1.binance.org', 'eth_call', [{ to: '0x55d398326f99059fF775485246999027B3197955', data: bscUsdtData }, 'latest']);
  if (bscUsdtRes.result) {
    console.log('BSC USDT Balance:', Number(BigInt(bscUsdtRes.result)) / 1e18, 'USDT');
  }

  console.log('\n--- 3. Polygon USDT ---');
  const polyUsdtData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const polyUsdtRes = await rpcCall('https://polygon.llamarpc.com', 'eth_call', [{ to: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', data: polyUsdtData }, 'latest']);
  if (polyUsdtRes.result) {
    console.log('Polygon USDT Balance:', Number(BigInt(polyUsdtRes.result)) / 1e6, 'USDT');
  } else {
    console.log('Poly result:', polyUsdtRes);
  }

  console.log('\n--- 4. Arbitrum USDT ---');
  const arbUsdtData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const arbUsdtRes = await rpcCall('https://arbitrum.llamarpc.com', 'eth_call', [{ to: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', data: arbUsdtData }, 'latest']);
  if (arbUsdtRes.result) {
    console.log('Arbitrum USDT Balance:', Number(BigInt(arbUsdtRes.result)) / 1e6, 'USDT');
  } else {
    console.log('Arb result:', arbUsdtRes);
  }

  console.log('\n--- 5. Base USDT ---');
  const baseUsdtData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const baseUsdtRes = await rpcCall('https://mainnet.base.org', 'eth_call', [{ to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', data: baseUsdtData }, 'latest']);
  if (baseUsdtRes.result) {
    console.log('Base USDC/USDT Balance:', Number(BigInt(baseUsdtRes.result)) / 1e6, 'USD');
  } else {
    console.log('Base result:', baseUsdtRes);
  }

  console.log('\n--- 6. Litecoin Explorer ---');
  try {
    const ltcRes = await fetch(`https://api.blockcypher.com/v1/ltc/main/addrs/Lg3tZk9Y7Fh8M2j1X4vBnKpQmRsTvW5xYa/balance`);
    const ltcJson = await ltcRes.json();
    console.log('LTC Balance response:', ltcJson);
  } catch (e) {
    console.log('LTC error:', e.message);
  }
}

testFastMultiChain();
