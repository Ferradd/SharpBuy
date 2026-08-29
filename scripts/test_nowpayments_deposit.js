async function testNowpaymentsInvoicePayment() {
  const iid = '4736609055';

  const testPayloads = [
    { url: 'https://api.nowpayments.io/v1/invoice-payment', body: { iid: iid, pay_currency: 'usdtbsc' } },
    { url: 'https://api.nowpayments.io/v1/payment', body: { iid: iid, pay_currency: 'usdtbsc' } },
    { url: `https://api.nowpayments.io/v1/invoice/${iid}`, method: 'GET' },
    { url: `https://api.nowpayments.io/v1/invoice?iid=${iid}`, method: 'GET' }
  ];

  for (const t of testPayloads) {
    try {
      const res = await fetch(t.url, {
        method: t.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: t.body ? JSON.stringify(t.body) : undefined
      });
      console.log('Testing:', t.url, 'Status:', res.status);
      const data = await res.json();
      console.log('Response:', data);
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

testNowpaymentsInvoicePayment();
