async function inspectNowpaymentsJs() {
  const iid = '4736609055';
  const pageRes = await fetch(`https://nowpayments.io/payment/?iid=${iid}`);
  const html = await pageRes.text();

  const scripts = html.match(/src="([^"]+)"/g);
  console.log('Scripts on nowpayments page:', scripts);

  // Look for api urls
  if (scripts) {
    for (const s of scripts) {
      const src = s.replace('src="', '').replace('"', '');
      const full = src.startsWith('http') ? src : 'https://nowpayments.io' + src;
      console.log('Fetching:', full);
      const res = await fetch(full);
      const js = await res.text();
      const apis = js.match(/https?:\/\/[a-zA-Z0-9_\-\.]+\/v1\/[a-zA-Z0-9_\-\/]+/g);
      console.log('APIs in JS:', [...new Set(apis)]);
    }
  }
}

inspectNowpaymentsJs();
