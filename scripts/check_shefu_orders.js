async function checkShefuOrders() {
  const orders = ['SHF-DF8AE966', 'SHF-68034297', 'SHF-B7CBAB9D', 'SHF-911BB54A', 'SHF-B6711B8E', 'SHF-8CFC400F', 'SHF-0D68B564', 'SHF-4FC4E403'];

  for (const ord of orders) {
    console.log(`\n--- Checking Shefu Order: ${ord} ---`);
    
    // Check nfa-downloads
    try {
      const res = await fetch('https://shefu223.shop/api/nfa-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfa_order: ord })
      });
      const data = await res.json();
      console.log('nfa-downloads response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error on nfa-downloads:', e.message);
    }

    // Check if order details exist
    try {
      const res2 = await fetch(`https://shefu223.shop/api/order/${ord}`);
      if (res2.ok) {
        const data2 = await res2.json();
        console.log(`order/${ord} response:`, JSON.stringify(data2, null, 2));
      }
    } catch (e) {}
  }
}

checkShefuOrders().catch(console.error);
