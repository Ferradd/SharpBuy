async function checkCors() {
  console.log('Checking headers of https://shefu223.shop/api/nfa-stock...');
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-stock', {
      headers: {
        'Origin': 'https://sharpbuy.vercel.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    console.log('Status:', res.status);
    console.log('CORS Header Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('All Headers:');
    for (const [k, v] of res.headers.entries()) {
      console.log(`  ${k}: ${v}`);
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

checkCors();
