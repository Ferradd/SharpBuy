async function testBsc() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  console.log('Testing BscScan for:', addr);
  
  try {
    const res1 = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${addr}&sort=desc`);
    const d1 = await res1.json();
    console.log('BscScan public result:', JSON.stringify(d1, null, 2));
  } catch (e) {
    console.error('BscScan error:', e);
  }

  // Also test direct BSC RPC
  try {
    const res2 = await fetch('https://binance.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [addr, 'latest']
      })
    });
    const d2 = await res2.json();
    console.log('BSC RPC tx count:', d2);
  } catch (e) {
    console.error('RPC error:', e);
  }
}

testBsc();
