import fs from 'fs';

const svgPath = 'C:\\Users\\iliyk\\Downloads\\Telegram Desktop\\karambit-doppler.svg';
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Copy SVG to public
fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\karambit-doppler.svg', svgContent);
console.log('Saved public/karambit-doppler.svg');

// Extract base64 PNG
const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (match) {
  const base64Str = match[1];
  const buffer = Buffer.from(base64Str, 'base64');
  fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\karambit-doppler.png', buffer);
  console.log('Saved public/karambit-doppler.png, size:', buffer.length, 'bytes');
}
