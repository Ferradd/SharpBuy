import fs from 'fs';

const origHtml = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\SharpBuy_Frontend\\index.html', 'utf8');

// Extract .titlebar or .brand-group
const match = origHtml.match(/<div class="titlebar"[\s\S]*?<\/div>\s*<\/div>/);
if (match) {
  console.log('Found titlebar:\n', match[0]);
}

// Find all <img> tags in titlebar
const imgMatches = origHtml.match(/<img[^>]+class="brand-[^>]+>/g);
console.log('\nBrand images found:', imgMatches ? imgMatches.length : 0);
if (imgMatches) {
  imgMatches.forEach((img, i) => console.log(`Img #${i+1}:`, img.slice(0, 100) + '...'));
}
