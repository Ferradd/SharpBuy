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

// Letter bounding boxes horizontally:
// S: 0 - 68
// H: 68 - 145
// A: 145 - 220
// R: 220 - 295
// P: 295 - 370
// B: 390 - 468
// U: 468 - 548
// Y: 548 - 622

const letterBounds = [
  { char: 'S', minX: 0, maxX: 70 },
  { char: 'H', minX: 70, maxX: 146 },
  { char: 'A', minX: 146, maxX: 222 },
  { char: 'R', minX: 222, maxX: 296 },
  { char: 'P', minX: 296, maxX: 375 },
  { char: 'B', minX: 388, maxX: 468 },
  { char: 'U', minX: 468, maxX: 548 },
  { char: 'Y', minX: 548, maxX: 622 },
];

const paths = [];

letterBounds.forEach((lb) => {
  const leftPoints = [];
  const rightPoints = [];

  for (let y = 0; y < height; y += 2) {
    let minX = -1;
    let maxX = -1;
    for (let x = lb.minX; x < lb.maxX && x < width; x++) {
      const a = rawPixels[(y * width + x) * 4 + 3];
      if (a > 60) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1 && maxX !== -1) {
      leftPoints.push({ x: minX, y });
      rightPoints.push({ x: maxX, y });
    }
  }

  if (leftPoints.length > 0) {
    const contour = [...rightPoints, ...leftPoints.reverse()];
    let d = `M ${contour[0].x} ${contour[0].y}`;
    for (let i = 1; i < contour.length; i++) {
      d += ` L ${contour[i].x} ${contour[i].y}`;
    }
    d += ' Z';
    paths.push({ char: lb.char, d, count: contour.length });
  }
});

console.log('Extracted paths for letters:', paths.map(p => p.char).join(', '));

const outContent = `export const WORDMARK_VIEWBOX = '0 0 ${width} ${height}';
export const LETTER_PATHS = ${JSON.stringify(paths, null, 2)};
`;

fs.writeFileSync('c:/Users/iliyk/Desktop/hackershop-web/src/data/wordmarkVectorPaths.js', outContent);
console.log('Successfully written src/data/wordmarkVectorPaths.js!');
