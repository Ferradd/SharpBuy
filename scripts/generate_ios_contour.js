import fs from 'fs';
import zlib from 'zlib';

const pngBuffer = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\public\\knife-user.png');
const width = pngBuffer.readUInt32BE(16);
const height = pngBuffer.readUInt32BE(20);

// Decompress IDAT
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

const rawPixels = Buffer.alloc(width * height * 4);
let srcOffset = 0;
let dstOffset = 0;
const stride = width * 4;

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

// Sample clean boundary with a step of 20px (giving ~36 ultra-clean anchor points)
const rightPts = [];
const leftPts = [];

for (let y = 14; y < height - 14; y += 22) {
  let minX = -1;
  let maxX = -1;
  for (let x = 6; x < width - 6; x++) {
    const a = rawPixels[(y * width + x) * 4 + 3];
    if (a > 60) {
      if (minX === -1) minX = x;
      maxX = x;
    }
  }
  if (minX !== -1 && maxX !== -1 && maxX > minX + 8) {
    rightPts.push({ x: maxX, y });
    leftPts.push({ x: minX, y });
  }
}

// Stitch clockwise polygon
const anchors = [...rightPts, ...leftPts.reverse()];

// Generate super-smooth cubic Bézier path (using Catmull-Rom to cubic Bézier conversion)
function catmullRomToCubic(pts) {
  const n = pts.length;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    // Catmull-Rom tangents with tension 0.5
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

const bezierPathD = catmullRomToCubic(anchors);

// Total approximate perimeter length
let totalLength = 0;
for (let i = 0; i < anchors.length; i++) {
  const p1 = anchors[i];
  const p2 = anchors[(i + 1) % anchors.length];
  totalLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
}
const pathLengthEst = Math.round(totalLength * 1.15);

const outContent = `export const KNIFE_VIEWBOX = "0 0 ${width} ${height}";\nexport const KNIFE_CONTOUR_PATH = "${bezierPathD}";\nexport const KNIFE_PATH_LENGTH = ${pathLengthEst};\n`;
fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\hackershop-web\\src\\data\\knifePath.js', outContent);
console.log(`Generated ultra-smooth iOS-style sticker outline: ${anchors.length} control points, path length ~${pathLengthEst}px`);
