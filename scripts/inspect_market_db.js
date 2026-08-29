import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/cs2_market_prices.json', 'utf8'));
console.log('Keys:', Object.keys(raw));
if (raw.items) {
  console.log(`Items count: ${raw.items.length}`);
  console.log('Sample item:', raw.items[0]);
  console.log('Sample item 2:', raw.items[1]);
}
