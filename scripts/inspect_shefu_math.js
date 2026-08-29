async function inspectShefuCheckoutMath() {
  console.log('--- INSPECTING SHEFU CHECKOUT INVOICE MATH ---');

  // 1. Send checkout request for 'premier' (displayed as €0.49 / £0.42)
  const res = await fetch('https://shefu223.shop/api/nfa-checkout-crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ product: 'premier', quantity: 1 }],
      email: 'iliykuzin2@gmail.com'
    })
  });

  const data = await res.json();
  console.log('Shefu Checkout Response:', data);

  const urlObj = new URL(data.url);
  const iid = urlObj.searchParams.get('iid');
  console.log('NOWPayments Invoice ID:', iid);

  // 2. Request NOWPayments payment info
  const payRes = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      iid: iid,
      pay_currency: 'usdtbsc'
    })
  });

  const payData = await payRes.json();
  console.log('\nNOWPayments Exact Output:', payData);
  console.log(`\nPrice on Shefu: £0.42 GBP`);
  console.log(`Price requested by NOWPayments in USDT: ${payData.pay_amount} USDT`);
  console.log(`Address: ${payData.pay_address}`);
}

inspectShefuCheckoutMath();
