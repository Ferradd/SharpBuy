async function checkInventoryJs() {
  const url = 'https://www.skinpock.com/_next/static/chunks/pages/inventory/%5BsteamId%5D-72b6121b5b777fd9.js';
  const res = await fetch(url);
  const text = await res.text();
  console.log('Length:', text.length);
  // Match any api strings or fetch endpoints
  const apiMatches = text.match(/["'`](\/api\/[^"'`]+|https?:\/\/[^"'`]+)["'`]/g) || [];
  console.log('API matches:', [...new Set(apiMatches)]);
}

checkInventoryJs();
