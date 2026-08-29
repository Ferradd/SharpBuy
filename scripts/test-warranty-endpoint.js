import fs from 'fs';

async function testWarrantyEndpoint() {
  console.log('=== TESTING /api/warranty-check ENDPOINT (PHASE 2) ===\n');

  const orders = JSON.parse(fs.readFileSync('C:/Users/iliyk/Desktop/SharpBuy/src/data/orders_database.json', 'utf8'));
  
  // 1. Test with a recent order (< 3h)
  const recentOrder = orders[0];
  console.log('Test 1: Checking status for recent order:', recentOrder.orderId);
  const res1 = await fetch('http://localhost:3000/api/warranty-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: recentOrder.orderId,
      checkOnly: true
    })
  });
  const data1 = await res1.json();
  console.log('Result 1 (Recent Order):', data1);

  // 2. Test with a simulated expired order (> 3h)
  const oldOrder = orders[orders.length - 1];
  console.log('\nTest 2: Checking simulated old order:', oldOrder.orderId);
  const res2 = await fetch('http://localhost:3000/api/warranty-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: oldOrder.orderId,
      checkOnly: true
    })
  });
  const data2 = await res2.json();
  console.log('Result 2 (Old Order):', data2);

  // 3. Test with a direct token
  if (recentOrder.tokens && recentOrder.tokens[0]) {
    console.log('\nTest 3: Checking by Token string directly');
    const res3 = await fetch('http://localhost:3000/api/warranty-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: recentOrder.tokens[0],
        checkOnly: true
      })
    });
    const data3 = await res3.json();
    console.log('Result 3 (By Token):', data3);
  }
}

testWarrantyEndpoint();
