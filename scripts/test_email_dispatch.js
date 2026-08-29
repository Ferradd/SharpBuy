async function testResend() {
  const resendKey = 're_KpbJCCGo_JHB2BrFReEGJaeZHhK3KFowd';
  console.log('Testing Resend email dispatch...');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SharpBuy Orders <orders@sharpbuy.org>',
        to: ['iliykuzin2@gmail.com'],
        subject: 'Тестовая квитанция и токен - SharpBuy.org',
        html: `
          <div style="background:#0a0a09; color:#f3f1ec; padding:20px; font-family:sans-serif; border-radius:12px;">
            <h2 style="color:#e8583a;">SHARPBUY AUTOMATION CHECK</h2>
            <p>Уведомления и квитанции работают в штатном режиме!</p>
          </div>
        `
      })
    });

    const data = await res.json();
    console.log('Resend Response:', data);
  } catch (e) {
    console.error('Resend test error:', e);
  }
}

testResend();
