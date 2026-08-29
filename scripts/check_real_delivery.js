async function checkNowpaymentsPayment() {
  const paymentId = '5279126769';
  const orderId = 'nfa_crypto_1787578899662_abca01842e946a95';

  console.log(`Checking NOWPayments Payment #${paymentId}...`);
  try {
    const res = await fetch(`https://api-adapter.nowpayments.io/v1/payment/${paymentId}`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      console.log('Payment status:', data);
    }
  } catch (e) {}

  // Check shefu order status
  try {
    const sRes = await fetch(`https://shefu223.shop/store/nfa/order/?order=${orderId}`).catch(() => null);
    console.log('Shefu order page status:', sRes ? sRes.status : 'failed');
    if (sRes && sRes.ok) {
      const html = await sRes.text();
      console.log('Shefu order page text:', html.substring(0, 500));
    }
  } catch (e) {}
}

checkNowpaymentsPayment();
