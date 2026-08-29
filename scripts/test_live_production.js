async function verifyLiveProduction() {
  console.log('Testing live production at https://sharpbuy.org/api/create-order...\n');
  const res = await fetch('https://sharpbuy.org/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: '1776000000006',
      productName: 'CS2 PREMIER 15,000+ RATING (HVH / HIGH RANK)',
      email: 'iliykuzin2@gmail.com',
      currency: 'BNB_BSC',
      quantity: 1,
      unitPrice: 179
    })
  });

  console.log('Production Status:', res.status);
  const data = await res.json();
  console.log('Production Order response:', data.order);
}

verifyLiveProduction();
