async function testCheckPaymentLive() {
  const payload = {
    orderId: 'SHARP-MT7FUQE5-326',
    address: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1',
    expectedAmount: '0.9721',
    symbol: 'USDT',
    currency: 'USDT_BEP20',
    email: 'iliykuzin2@gmail.com',
    productId: 'nfa_cs2_premier',
    productName: 'CS2 Premier Ready (Открыт Премьер)',
    quantity: 1,
    priceRub: 89
  };

  console.log('Sending test check-payment to https://sharpbuy.org/api/check-payment...');
  const res = await fetch('https://sharpbuy.org/api/check-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Response from sharpbuy.org/api/check-payment:', data);
}

testCheckPaymentLive();
