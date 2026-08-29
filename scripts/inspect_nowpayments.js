async function inspectNowpaymentsIid() {
  const iid = '4736609055';
  console.log('Inspecting NOWPayments iid:', iid);

  const urls = [
    `https://api-adapter.nowpayments.io/v1/invoice?iid=${iid}`,
    `https://api.nowpayments.io/v1/invoice?iid=${iid}`,
    `https://api-adapter.nowpayments.io/v1/payment-estimate?iid=${iid}&pay_currency=usdtbsc`,
    `https://nowpayments.io/payment/?iid=${iid}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log('URL:', u, 'Status:', res.status);
      const text = await res.text();
      console.log('Sample:', text.substring(0, 300));
    } catch (e) {
      console.error('Error for', u, e.message);
    }
  }
}

inspectNowpaymentsIid();
