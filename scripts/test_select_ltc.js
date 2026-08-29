async function testSelectLtc() {
  const orderId = 'nfa_dc_1787577149511_c893c55c3353d115';
  
  const coinRes = await fetch('https://shefu223.shop/api/nfa-crypto-coin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order: orderId,
      coin: 'ltc'
    })
  });
  const coinData = await coinRes.json();
  console.log('nfa-crypto-coin Data for ltc:', JSON.stringify(coinData, null, 2));

  // Also check NOWPayments option on shefu223.shop
  const nowRes = await fetch('https://shefu223.shop/api/checkout-nowpayments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ product: 'premier', quantity: 1 }],
      email: 'iliykuzin2@gmail.com'
    })
  });
  console.log('NOWPayments checkout status:', nowRes.status);
  try {
    const nowData = await nowRes.json();
    console.log('NOWPayments checkout data:', nowData);
  } catch (e) {}
}

testSelectLtc();
