async function testCheckPaymentLive() {
  const payload = {
    orderId: 'SHARP-MT7FUQE5-326',
    address: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
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
