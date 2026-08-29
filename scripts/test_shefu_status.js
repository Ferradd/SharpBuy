async function testShefuOrderStatus() {
  console.log('Testing shefu order status endpoints...');
  // Check the HTML / API of shefu order status
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-crypto-status?order=nfa_crypto_1787578899662_abca01842e946a95');
    console.log('crypto-status status:', res.status);
    const data = await res.text();
    console.log('crypto-status response:', data.substring(0, 300));
  } catch (e) {
    console.error('crypto-status error:', e.message);
  }

  // Check success page
  try {
    const res2 = await fetch('https://shefu223.shop/success/?nfa_order=nfa_crypto_1787578899662_abca01842e946a95&method=crypto');
    console.log('success page status:', res2.status);
    const data2 = await res2.text();
    console.log('success page snippet:', data2.substring(0, 500));
  } catch (e) {
    console.error('success page error:', e.message);
  }
}

testShefuOrderStatus();
