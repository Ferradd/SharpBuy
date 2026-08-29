async function testCryptoCheckoutFlow() {
  const currencies = ['USDT_BEP20', 'BNB_BSC', 'USDT_POLYGON', 'USDT_ARBITRUM', 'USDT_BASE', 'SOL', 'LTC'];
  
  console.log('Testing create-order for all currencies on http://localhost:3000...\n');
  for (const curr of currencies) {
    try {
      const res = await fetch('http://localhost:3000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: '1776000000006',
          productName: 'CS2 PREMIER 15,000+ RATING (HVH / HIGH RANK)',
          email: 'iliykuzin2@gmail.com',
          currency: curr,
          quantity: 1,
          unitPrice: 179
        })
      });

      const data = await res.json();
      console.log(`[${curr}] Status: ${res.status}`);
      if (data.order) {
        console.log(`   • Network: ${data.order.network}`);
        console.log(`   • Address: ${data.order.address}`);
        console.log(`   • Amount:  ${data.order.cryptoAmount} ${data.order.symbol}`);
        console.log(`   • Price:   ${data.order.priceRub} ₽`);
        console.log(`   • InitialBal: ${data.order.initialBalance}`);
      } else {
        console.log('   • Error:', data);
      }
    } catch (e) {
      console.log(`[${curr}] Fetch error:`, e.message);
    }
  }
}

testCryptoCheckoutFlow();
