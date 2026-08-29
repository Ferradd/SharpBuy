async function testResend() {
  const resendKey = 're_KpbJCCGo_JHB2BrFReEGJaeZHhK3KFowd';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'SharpBuy Orders <orders@sharpbuy.org>',
      to: ['iliykuzin2@gmail.com'],
      subject: 'Тест отправки чека SharpBuy',
      html: '<h1>Тестовый чек SharpBuy</h1><p>Система отправки писем работает исправно!</p>'
    })
  });

  console.log('Resend status:', res.status);
  const data = await res.json();
  console.log('Resend response:', data);
}

testResend();
