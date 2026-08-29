import fs from 'fs';

async function searchNowpaymentsApi() {
  const res = await fetch('https://nowpayments.io/js/payment-page.js');
  const js = await res.text();

  // search for api endpoints
  const apiUrls = js.match(/['"`](https:\/\/api[a-zA-Z0-9_\-\.]*\/[^'"`]+)['"`]/g);
  console.log('API URLs:', [...new Set(apiUrls)]);

  // search for iid usage
  const iidMatches = js.match(/iid[^a-zA-Z0-9_]{1,30}/g);
  console.log('Sample iid usages:', (iidMatches || []).slice(0, 10));

  // search for /v1/ or /payment
  const v1 = js.match(/\/v1\/[a-zA-Z0-9_\-\/]+/g);
  console.log('/v1/ matches:', [...new Set(v1)]);
}

searchNowpaymentsApi();
