async function checkNowpaymentsInvoiceState() {
  const iid = '4378904848';
  const url = `https://nowpayments.io/payment/?iid=${iid}`;
  console.log('Checking invoice URL:', url);

  const res = await fetch(url);
  const html = await res.text();
  console.log('Invoice page length:', html.length);
  
  // Look for payment status or texts in HTML
  if (html.includes('success') || html.includes('Success') || html.includes('confirmed') || html.includes('processing')) {
    console.log('Detected status keywords in invoice page!');
  }
}

checkNowpaymentsInvoiceState();
