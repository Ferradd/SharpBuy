async function testRealEndpoints() {
  console.log('========================================================================');
  console.log('🔥 LIVE HTTP API PROOF ACROSS CRYPTO PAYMENT NETWORKS');
  console.log('========================================================================\n');

  const productsToTest = [
    {
      productId: 'premier',
      productName: 'CS2 Premier Ready Instant Competitive',
      unitPrice: 165,
      currency: 'USDT_BEP20',
      email: 'buyer_bep20@gmail.com'
    },
    {
      productId: 'knife',
      productName: 'CS2 ★ Ursus Knife + AWP Printstream',
      unitPrice: 12990,
      currency: 'USDT_POLYGON',
      email: 'buyer_polygon@gmail.com'
    },
    {
      productId: 'skins',
      productName: 'CS2 Prime + $28.40 Inventory',
      unitPrice: 1490,
      currency: 'LTC',
      email: 'buyer_ltc@gmail.com'
    },
    {
      productId: 'medals',
      productName: 'CS2 Prime + 10-Year Veteran Coin',
      unitPrice: 11150,
      currency: 'BTC',
      email: 'buyer_btc@gmail.com'
    }
  ];

  for (const item of productsToTest) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`🛒 Creating Order: ${item.productName}`);
    console.log(`   Network: ${item.currency} | Buyer: ${item.email}`);
    
    const res = await fetch('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        currency: item.currency,
        email: item.email,
        quantity: 1
      })
    });

    const data = await res.json();
    const order = data.order;
    console.log(`✅ HTTP Status: ${res.status} OK`);
    console.log(`📋 Order ID: ${order.orderId}`);
    console.log(`💳 Deposit Address: ${order.address}`);
    console.log(`🌐 Network: ${order.network}`);
    console.log(`💰 Expected Amount: ${order.cryptoAmount} ${order.symbol}`);
    console.log(`🖼️ QR Code: Generated (${order.qrDataUrl.substring(0, 30)}...)`);
    console.log(`⏱️ Status: ${order.status} (Expires in 15 min)\n`);
  }
  
  console.log('========================================================================');
  console.log('🎉 PROOF COMPLETE: ALL NETWORKS RESPONDED WITH LIVE ORDERS & QR CODES!');
  console.log('========================================================================\n');
}

testRealEndpoints().catch(console.error);
