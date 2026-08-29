import fs from 'fs';
import zlib from 'zlib';

function decodePng(pngBuffer) {
  const width = pngBuffer.readUInt32BE(16);
  const height = pngBuffer.readUInt32BE(20);

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
  const stride = width * 4;
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
          const leftDst = dstOffset - 4;
          r = (r + rawPixels[leftDst]) & 0xFF;
          g = (g + rawPixels[leftDst + 1]) & 0xFF;
          b = (b + rawPixels[leftDst + 2]) & 0xFF;
          a = (a + rawPixels[leftDst + 3]) & 0xFF;
        }
      } else if (filterType === 2) {
        if (y > 0) {
          const upDst = dstOffset - stride;
          r = (r + rawPixels[upDst]) & 0xFF;
          g = (g + rawPixels[upDst + 1]) & 0xFF;
          b = (b + rawPixels[upDst + 2]) & 0xFF;
          a = (a + rawPixels[upDst + 3]) & 0xFF;
        }
      } else if (filterType === 3) {
        const leftDst = x > 0 ? dstOffset - 4 : -1;
        const upDst = y > 0 ? dstOffset - stride : -1;
        const leftA = leftDst >= 0 ? rawPixels[leftDst + 3] : 0;
        const upA = upDst >= 0 ? rawPixels[upDst + 3] : 0;
        a = (a + Math.floor((leftA + upA) / 2)) & 0xFF;
      } else if (filterType === 4) {
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

  return { width, height, rawPixels };
}

const { width, height, rawPixels } = decodePng(fs.readFileSync('c:/Users/iliyk/Desktop/hackershop-web/public/sharpbuy-wordmark-raw.png'));

// Accurate letter bounding intervals
const letters = [
  { name: 'S', x1: 0, x2: 70 },
  { name: 'H', x1: 70, x2: 145 },
  { name: 'A', x1: 145, x2: 220 },
  { name: 'R', x1: 220, x2: 295 },
  { name: 'P', x1: 295, x2: 375 },
  { name: 'B', x1: 388, x2: 468 },
  { name: 'U', x1: 468, x2: 548 },
  { name: 'Y', x1: 548, x2: 622 },
];

// Marching squares or clockwise contour tracing for each letter
const letterData = [];

letters.forEach((item, index) => {
  const leftPts = [];
  const rightPts = [];

  for (let y = 1; y < height - 1; y += 2) {
    let minX = -1;
    let maxX = -1;
    for (let x = item.x1; x <= item.x2 && x < width; x++) {
      const alpha = rawPixels[(y * width + x) * 4 + 3];
      if (alpha > 70) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1 && maxX !== -1) {
      leftPts.push({ x: minX, y });
      rightPts.push({ x: maxX, y });
    }
  }

  if (leftPts.length > 2) {
    const rawContour = [...rightPts, ...leftPts.reverse()];
    
    // Smooth points
    let d = `M ${rawContour[0].x} ${rawContour[0].y}`;
    for (let i = 1; i < rawContour.length; i++) {
      d += ` L ${rawContour[i].x} ${rawContour[i].y}`;
    }
    d += ' Z';

    letterData.push({
      char: item.name,
      d,
      isBuy: index >= 5,
    });
  }
});

const fileContent = `export const WORDMARK_VIEWBOX = '0 0 ${width} ${height}';
export const LETTERS = ${JSON.stringify(letterData, null, 2)};
`;

fs.writeFileSync('c:/Users/iliyk/Desktop/hackershop-web/src/data/sharpbuyLetters.js', fileContent);
console.log('Successfully generated sharpbuyLetters.js with', letterData.length, 'letters!');
