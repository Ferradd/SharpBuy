async function inspectShefuPayPage() {
  const url = 'https://shefu223.shop/store/nfa/pay/?order=nfa_dc_1787577149511_c893c55c3353d115';
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length:', html.length);

  // find script tags
  const scripts = html.match(/src="([^"]+)"/g);
  console.log('Script sources:', scripts);

  // fetch main script
  if (scripts && scripts.length > 0) {
    for (const s of scripts) {
      const src = s.replace('src="', '').replace('"', '');
      const fullSrc = src.startsWith('http') ? src : 'https://shefu223.shop' + src;
      console.log('Fetching JS bundle:', fullSrc);
      const jsRes = await fetch(fullSrc);
      const jsCode = await jsRes.text();
      console.log('JS length:', jsCode.length);
      
      // Look for API endpoints in JS
      const apiMatches = jsCode.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
      console.log('API endpoints found in JS:', [...new Set(apiMatches)]);
    }
  }
}

inspectShefuPayPage();
