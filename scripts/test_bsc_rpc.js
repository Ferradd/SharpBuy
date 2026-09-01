async function testBscRpc() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const usdtContract = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
  const paddedAddr = '0x000000000000000000000000' + addr.slice(2).toLowerCase();

  const rpcUrls = [
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed.bnbchain.org',
    'https://1rpc.io/bnb',
    'https://rpc.ankr.com/bsc'
  ];

  // 1. Test balanceOf
  // balanceOf selector is 0x70a08231 + padded address
  const data = '0x70a08231' + addr.slice(2).padStart(64, '0');

  for (const rpc of rpcUrls) {
    try {
      console.log('Testing RPC:', rpc);
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: usdtContract, data }, 'latest']
        })
      });
      const json = await res.json();
      console.log('balanceOf result from', rpc, ':', json);
      if (json.result) {
        const balanceBigInt = BigInt(json.result);
        const usdtVal = Number(balanceBigInt) / 1e18;
        console.log('Parsed USDT balance:', usdtVal);
        break;
      }
    } catch (e) {
      console.warn('RPC failed:', rpc, e.message);
    }
  }

  // 2. Test Transfer logs to wallet
  for (const rpc of rpcUrls) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_getLogs',
          params: [{
            fromBlock: 'latest', // or recent block
            to: usdtContract,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
              null,
              paddedAddr
            ]
          }]
        })
      });
      const logs = await res.json();
      console.log('Transfer logs:', logs);
      break;
    } catch (e) {}
  }
}

testBscRpc();
