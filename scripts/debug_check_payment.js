async function debugCheckPayment() {
  const payload = {
    orderId: 'SHARP-MT7JPK3J-668',
    address: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1',
    expectedAmount: 0.9766,
    symbol: 'USDT',
    currency: 'USDT_BEP20',
    quantity: 1,
    email: 'iliykuzin2@gmail.com',
    productId: 'premier',
    productName: 'CS2 Premier Ready (Открыт Премьер)'
  };

  console.log('Sending check-payment debug query to https://sharpbuy.org/api/check-payment...');
  const res = await fetch('https://sharpbuy.org/api/check-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Status code:', res.status);
  console.log('Response body:', text);
}

debugCheckPayment();
