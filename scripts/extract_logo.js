import fs from 'fs';

const svgPath = 'C:\\Users\\iliyk\\Downloads\\Telegram Desktop\\kqOO_coM_Ml4KQd87tpXuEfMhsaMKovDjTZ4DkdCkwYPFL_7mVnO1BS7zHZiFpmk.svg';
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Copy SVG to public
fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\logo.svg', svgContent);
console.log('Saved public/logo.svg');

// Extract base64
const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (match) {
  const base64Str = match[1];
  const buffer = Buffer.from(base64Str, 'base64');
  fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\logo.png', buffer);
  console.log('Saved public/logo.png, size:', buffer.length, 'bytes');
}
