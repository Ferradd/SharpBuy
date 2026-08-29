import fs from 'fs';

async function checkLiveSupplier() {
  console.log('--- Fetching Live Stock from https://shefu223.shop/api/nfa-stock ---');
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-stock');
    console.log('Stock API Status:', res.status);
    const stock = await res.json();
    console.log('Live Stock Response:', JSON.stringify(stock, null, 2));
  } catch (e) {
    console.error('Stock Error:', e.message);
  }

  console.log('\n--- Fetching Live Products from https://shefu223.shop/api/products ---');
  try {
    const res = await fetch('https://shefu223.shop/api/products');
    console.log('Products API Status:', res.status);
    const prods = await res.json();
    console.log('Live Products Response:', JSON.stringify(prods, null, 2));
  } catch (e) {
    console.error('Products Error:', e.message);
  }

  console.log('\n--- Fetching Shefu Store HTML or Catalog ---');
  try {
    const res = await fetch('https://shefu223.shop/nfa');
    console.log('/nfa Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);
    const stockMatches = html.match(/in stock|stock|quantity|left/gi);
    console.log('Found occurrences in HTML:', stockMatches?.length);
  } catch (e) {
    console.error('/nfa Error:', e.message);
  }
}

checkLiveSupplier();
