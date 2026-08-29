async function checkOrderDetails() {
  const orderId = 'nfa_dc_1787577149511_c893c55c3353d115';
  
  // Try fetching order info endpoint
  const urls = [
    `https://shefu223.shop/api/nfa-order?id=${orderId}`,
    `https://shefu223.shop/api/nfa-pay-info?order=${orderId}`,
    `https://shefu223.shop/api/order-status?id=${orderId}`,
    `https://shefu223.shop/store/nfa/pay/?order=${orderId}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log('URL:', u, 'Status:', res.status);
      const text = await res.text();
      console.log('Sample content (first 300 chars):', text.substring(0, 300));
    } catch (e) {
      console.error('Error for', u, e.message);
    }
  }
}

checkOrderDetails();
