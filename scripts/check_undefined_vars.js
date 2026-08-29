import fs from 'fs';
import path from 'path';

// Let's test build and render-level imports
console.log('Checking component syntax and undefined references...');

const files = [
  'src/components/CategoryPage.jsx',
  'src/components/ProductPage.jsx',
  'src/components/CryptoPayModal.jsx',
  'src/components/BuyModal.jsx',
  'src/components/home/MainShowcase.jsx',
  'src/App.jsx'
];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`Analyzing ${f} (${content.length} bytes)...`);
  
  // Check for selectedDrawerPayment
  if (content.includes('selectedDrawerPayment') && !content.includes('[selectedDrawerPayment,')) {
    console.error(`  ❌ MISSING DECLARATION: selectedDrawerPayment in ${f}`);
  }
  
  // Check for copiedId
  if (content.includes('copiedId') && !content.includes('[copiedId,')) {
    console.error(`  ❌ MISSING DECLARATION: copiedId in ${f}`);
  }

  // Check for stockTick / stockSyncTick
  if (content.includes('stockSyncTick') && !content.includes('[stockSyncTick,')) {
    console.error(`  ❌ MISSING DECLARATION: stockSyncTick in ${f}`);
  }
}
