async function check() {
  const orderRes = await fetch('https://shefu223.shop/api/nfa-checkout-crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ product: 'premier', quantity: 1 }],
      email: 'noreply@sharpbuy.org'
    })
  });
  const data = await orderRes.json();
  console.log(data);
}
check();
