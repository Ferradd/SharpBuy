import fs from 'fs';

const svgData = fs.readFileSync('C:\\Users\\iliyk\\Downloads\\Telegram Desktop\\knife (2).svg', 'utf8');

// Find base64 image data
const match = svgData.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (match) {
  const base64Str = match[1];
  const buffer = Buffer.from(base64Str, 'base64');
  fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\knife-user.png', buffer);
  console.log('Successfully saved knife-user.png, size:', buffer.length, 'bytes');
} else {
  console.log('No base64 match found');
}
