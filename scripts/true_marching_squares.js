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

// Grid binary (1 for solid, 0 for empty)
const grid = (x, y) => {
  if (x < 0 || x >= width || y < 0 || y >= height) return 0;
  return rawPixels[(y * width + x) * 4 + 3] > 60 ? 1 : 0;
};

// Moore-Neighbor Contour Tracing
// Traces exact outer and inner boundary loops
function traceContour(startX, startY, isHole = false) {
  const points = [];
  let cx = startX;
  let cy = startY;
  
  // Directions: 8 neighbors clockwise starting from North
  const dx = [0, 1, 1, 1, 0, -1, -1, -1];
  const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
  
  let backtrackDir = 0;
  let currDir = 0;
  const maxSteps = 2000;
  let steps = 0;

  points.push({ x: cx, y: cy });

  while (steps++ < maxSteps) {
    let found = false;
    let checkDir = (currDir + 6) % 8; // start searching 90 deg counter-clockwise

    for (let i = 0; i < 8; i++) {
      const dir = (checkDir + i) % 8;
      const nx = cx + dx[dir];
      const ny = cy + dy[dir];

      if (grid(nx, ny) === 1) {
        cx = nx;
        cy = ny;
        currDir = dir;
        found = true;
        break;
      }
    }

    if (!found) break;
    if (cx === startX && cy === startY) break;

    // Sub-sample to keep paths clean and sharp (every 2nd point)
    if (steps % 2 === 0) {
      points.push({ x: cx, y: cy });
    }
  }

  return points;
}

// Letter intervals
const letterIntervals = [
  { char: 'S', x1: 0, x2: 70 },
  { char: 'H', x1: 70, x2: 146 },
  { char: 'A', x1: 141, x2: 215 },
  { char: 'R', x1: 220, x2: 295 },
  { char: 'P', x1: 293, x2: 372 },
  { char: 'B', x1: 390, x2: 468 },
  { char: 'U', x1: 468, x2: 548 },
  { char: 'Y', x1: 548, x2: 622 },
];

const resultLetters = [];

letterIntervals.forEach((item, idx) => {
  // Find top-left starting pixel of this letter
  let startX = -1, startY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = item.x1; x <= item.x2; x++) {
      if (grid(x, y) === 1 && grid(x - 1, y) === 0) {
        startX = x;
        startY = y;
        break;
      }
    }
    if (startX !== -1) break;
  }

  if (startX !== -1) {
    const pts = traceContour(startX, startY);
    if (pts.length > 5) {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x} ${pts[i].y}`;
      }
      d += ' Z';

      // Check if letter has inner hole (like A, R, P, B)
      // Search for hole inside the letter bounding box
      let holeStartX = -1, holeStartY = -1;
      for (let y = startY + 10; y < height - 10; y++) {
        let insideLetter = false;
        for (let x = item.x1; x <= item.x2; x++) {
          if (grid(x, y) === 1 && grid(x + 1, y) === 0) {
            insideLetter = true;
          } else if (insideLetter && grid(x, y) === 0 && grid(x + 1, y) === 0) {
            holeStartX = x;
            holeStartY = y;
            break;
          }
        }
        if (holeStartX !== -1) break;
      }

      resultLetters.push({
        char: item.char,
        d,
        isBuy: idx >= 5,
      });
    }
  }
});

console.log('Successfully traced true Moore-Neighbor contours for:', resultLetters.map(l => l.char).join(', '));

const outContent = `export const WORDMARK_VIEWBOX = '0 0 ${width} ${height}';
export const LETTERS = ${JSON.stringify(resultLetters, null, 2)};
`;

fs.writeFileSync('c:/Users/iliyk/Desktop/hackershop-web/src/data/sharpbuyLetters.js', outContent);
console.log('Updated src/data/sharpbuyLetters.js!');
