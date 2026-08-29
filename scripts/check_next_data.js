async function checkNextData() {
  const url = 'https://www.skinpock.com/inventory/76561199222229128';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (nextDataMatch) {
    const data = JSON.parse(nextDataMatch[1]);
    console.log('NextData keys:', Object.keys(data.props?.pageProps || {}));
    console.log('PageProps:', JSON.stringify(data.props?.pageProps, null, 2).slice(0, 1500));
  } else {
    console.log('No __NEXT_DATA__ found');
    // Check if there are other scripts or meta tags
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
  }
}

checkNextData();
