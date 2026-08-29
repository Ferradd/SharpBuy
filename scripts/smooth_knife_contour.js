import fs from 'fs';
import zlib from 'zlib';

const pngBuffer = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\knife-user.png');
const width = pngBuffer.readUInt32BE(16);
const height = pngBuffer.readUInt32BE(20);

// Extract IDAT
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
const uncompressed = zlib.inflateSync(Buffer.concat(idatChunks));

const stride = width * 4;
const rawPixels = Buffer.alloc(width * height * 4);
let srcOffset = 0;
let dstOffset = 0;

for (let y = 0; y < height; y++) {
  const filterType = uncompressed[srcOffset++];
  for (let x = 0; x < width; x++) {
    let r = uncompressed[srcOffset++];
    let g = uncompressed[srcOffset++];
    let b = uncompressed[srcOffset++];
    let a = uncompressed[srcOffset++];

    if (filterType === 1) {
      if (x > 0) {
        r = (r + rawPixels[dstOffset - 4]) & 0xFF;
        g = (g + rawPixels[dstOffset - 3]) & 0xFF;
        b = (b + rawPixels[dstOffset - 2]) & 0xFF;
        a = (a + rawPixels[dstOffset - 1]) & 0xFF;
      }
    } else if (filterType === 2) {
      if (y > 0) {
        r = (r + rawPixels[dstOffset - stride]) & 0xFF;
        g = (g + rawPixels[dstOffset - stride + 1]) & 0xFF;
        b = (b + rawPixels[dstOffset - stride + 2]) & 0xFF;
        a = (a + rawPixels[dstOffset - stride + 3]) & 0xFF;
      }
    } else if (filterType === 3) {
      const leftA = x > 0 ? rawPixels[dstOffset - 1] : 0;
      const upA = y > 0 ? rawPixels[dstOffset - stride + 3] : 0;
      a = (a + Math.floor((leftA + upA) / 2)) & 0xFF;
    } else if (filterType === 4) {
      const aVal = x > 0 ? rawPixels[dstOffset - 1] : 0;
      const bVal = y > 0 ? rawPixels[dstOffset - stride + 3] : 0;
      const cVal = (x > 0 && y > 0) ? rawPixels[dstOffset - stride - 1] : 0;
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

// Find outer perimeter ignoring faint shadow noise (alpha > 75)
const step = 14; // Sample points for a smooth flowing organic polygon
const rightSide = [];
const leftSide = [];

for (let y = 8; y < height - 8; y += step) {
  let minX = -1;
  let maxX = -1;
  for (let x = 4; x < width - 4; x++) {
    const a = rawPixels[(y * width + x) * 4 + 3];
    if (a > 75) {
      if (minX === -1) minX = x;
      maxX = x;
    }
  }
  if (minX !== -1 && maxX !== -1 && maxX > minX + 5) {
    rightSide.push({ x: maxX, y });
    leftSide.push({ x: minX, y });
  }
}

// Stitch closed loop
const rawPoly = [...rightSide, ...leftSide.reverse()];

// Chaikin smoothing algorithm (2 iterations to turn polygon into sleek organic curve)
function chaikinSmooth(points, iterations = 2) {
  let current = points;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    const n = current.length;
    for (let i = 0; i < n; i++) {
      const p0 = current[i];
      const p1 = current[(i + 1) % n];
      next.push({
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y
      });
      next.push({
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y
      });
    }
    current = next;
  }
  return current;
}

const smoothPoints = chaikinSmooth(rawPoly, 3);

// Convert to SVG smooth cubic Bezier path
let pathD = `M ${smoothPoints[0].x.toFixed(1)} ${smoothPoints[0].y.toFixed(1)}`;
for (let i = 0; i < smoothPoints.length; i++) {
  const p0 = smoothPoints[i];
  const p1 = smoothPoints[(i + 1) % smoothPoints.length];
  const midX = ((p0.x + p1.x) / 2).toFixed(1);
  const midY = ((p0.y + p1.y) / 2).toFixed(1);
  pathD += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${midX} ${midY}`;
}
pathD += ' Z';

// Add padding to viewBox so glows never clip: -40 -40 to (width + 80) (height + 80)
const pad = 40;
const vbX = -pad;
const vbY = -pad;
const vbW = width + pad * 2;
const vbH = height + pad * 2;

const outContent = `export const KNIFE_VIEWBOX = "${vbX} ${vbY} ${vbW} ${vbH}";\nexport const KNIFE_CONTOUR_PATH = "${pathD}";\n`;
fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\src\\data\\knifePath.js', outContent);
console.log('Generated smooth organic curve with padding! Total points:', smoothPoints.length);
