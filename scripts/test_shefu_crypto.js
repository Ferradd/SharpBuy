async function testShefuCryptoEndpoints() {
  const orderId = 'nfa_dc_1787577149511_c893c55c3353d115';

  // 1. Test nfa-crypto-status
  try {
    const statusRes = await fetch(`https://shefu223.shop/api/nfa-crypto-status?order=${orderId}&with_qr=1`);
    console.log('Status Response Status:', statusRes.status);
    const statusData = await statusRes.json();
    console.log('nfa-crypto-status Data:', JSON.stringify(statusData, null, 2));
  } catch (e) {
    console.error('Status err:', e);
  }

  // 2. Test nfa-crypto-coin (e.g. choose LTC or USDT)
  try {
    const coinRes = await fetch('https://shefu223.shop/api/nfa-crypto-coin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: orderId,
        coin: 'LTC'
      })
    });
    console.log('\nCoin select Response Status:', coinRes.status);
    const coinData = await coinRes.json();
    console.log('nfa-crypto-coin Data:', JSON.stringify(coinData, null, 2));
  } catch (e) {
    console.error('Coin err:', e);
  }
}

testShefuCryptoEndpoints();
