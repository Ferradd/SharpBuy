import fs from 'fs';

// Read PNG and parse raw pixel alpha channel using standard PNG structure or basic decoder
// Since standard PNG has IDAT zlib chunks, let's use node's built-in zlib module to decompress PNG IDAT!
import zlib from 'zlib';

const pngBuffer = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\knife-user.png');

// Find IHDR
const width = pngBuffer.readUInt32BE(16);
const height = pngBuffer.readUInt32BE(20);
const bitDepth = pngBuffer[24];
const colorType = pngBuffer[25]; // 6 for RGBA

console.log('PNG Info:', width, 'x', height, 'depth:', bitDepth, 'colorType:', colorType);

// Extract all IDAT chunks
const idatChunks = [];
let offset = 8;
while (offset < pngBuffer.length) {
  const length = pngBuffer.readUInt32BE(offset);
  const type = pngBuffer.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') {
    idatChunks.push(pngBuffer.subarray(offset + 8, offset + 8 + length));
  }
  offset += 12 + length;
}

const idatCombined = Buffer.concat(idatChunks);
const uncompressed = zlib.inflateSync(idatCombined);

// Unfilter PNG scanlines (RGBA 8-bit, 4 bytes per pixel + 1 filter byte per line)
const stride = width * 4;
const rawPixels = Buffer.alloc(width * height * 4);

let srcOffset = 0;
let dstOffset = 0;

for (let y = 0; y < height; y++) {
  const filterType = uncompressed[srcOffset++];
  for (let x = 0; x < width; x++) {
    const rIdx = srcOffset++;
    const gIdx = srcOffset++;
    const bIdx = srcOffset++;
    const aIdx = srcOffset++;

    let r = uncompressed[rIdx];
    let g = uncompressed[gIdx];
    let b = uncompressed[bIdx];
    let a = uncompressed[aIdx];

    // Simple unfilter reconstruction
    if (filterType === 1) { // Sub
      if (x > 0) {
        const leftDst = dstOffset - 4;
        r = (r + rawPixels[leftDst]) & 0xFF;
        g = (g + rawPixels[leftDst + 1]) & 0xFF;
        b = (b + rawPixels[leftDst + 2]) & 0xFF;
        a = (a + rawPixels[leftDst + 3]) & 0xFF;
      }
    } else if (filterType === 2) { // Up
      if (y > 0) {
        const upDst = dstOffset - stride;
        r = (r + rawPixels[upDst]) & 0xFF;
        g = (g + rawPixels[upDst + 1]) & 0xFF;
        b = (b + rawPixels[upDst + 2]) & 0xFF;
        a = (a + rawPixels[upDst + 3]) & 0xFF;
      }
    } else if (filterType === 3) { // Average
      const leftDst = x > 0 ? dstOffset - 4 : -1;
      const upDst = y > 0 ? dstOffset - stride : -1;
      const leftA = leftDst >= 0 ? rawPixels[leftDst + 3] : 0;
      const upA = upDst >= 0 ? rawPixels[upDst + 3] : 0;
      a = (a + Math.floor((leftA + upA) / 2)) & 0xFF;
    } else if (filterType === 4) { // Paeth
      const leftDst = x > 0 ? dstOffset - 4 : -1;
      const upDst = y > 0 ? dstOffset - stride : -1;
      const upLeftDst = (x > 0 && y > 0) ? dstOffset - stride - 4 : -1;
      const aVal = leftDst >= 0 ? rawPixels[leftDst + 3] : 0;
      const bVal = upDst >= 0 ? rawPixels[upDst + 3] : 0;
      const cVal = upLeftDst >= 0 ? rawPixels[upLeftDst + 3] : 0;
      const p = aVal + bVal - cVal;
      const pa = Math.abs(p - aVal);
      const pb = Math.abs(p - bVal);
      const pc = Math.abs(p - cVal);
      let pr = cVal;
      if (pa <= pb && pa <= pc) pr = aVal;
      else if (pb <= pc) pr = bVal;
      a = (a + pr) & 0xFF;
    }

    rawPixels[dstOffset++] = r;
    rawPixels[dstOffset++] = g;
    rawPixels[dstOffset++] = b;
    rawPixels[dstOffset++] = a;
  }
}

// Find outer boundary points for each row
const topRow = 0;
const bottomRow = height - 1;
const leftPoints = [];
const rightPoints = [];

for (let y = 0; y < height; y += 3) {
  let minX = -1;
  let maxX = -1;
  for (let x = 0; x < width; x++) {
    const alpha = rawPixels[(y * width + x) * 4 + 3];
    if (alpha > 40) {
      if (minX === -1) minX = x;
      maxX = x;
    }
  }
  if (minX !== -1 && maxX !== -1) {
    leftPoints.push({ x: minX, y });
    rightPoints.push({ x: maxX, y });
  }
}

// Combine into single closed clockwise polygon: top-to-bottom on right, then bottom-to-top on left
const contour = [...rightPoints, ...leftPoints.reverse()];

// Generate smooth SVG path
let d = `M ${contour[0].x} ${contour[0].y}`;
for (let i = 1; i < contour.length; i++) {
  d += ` L ${contour[i].x} ${contour[i].y}`;
}
d += ' Z';

fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\src\\data\\knifePath.js', `export const KNIFE_VIEWBOX = "0 0 ${width} ${height}";\nexport const KNIFE_CONTOUR_PATH = "${d}";\n`);
console.log('Successfully generated knifePath.js with', contour.length, 'exact outline points!');
