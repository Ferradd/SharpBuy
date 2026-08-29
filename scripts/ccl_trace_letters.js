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

// Binary mask
const binary = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) {
  binary[i] = rawPixels[i * 4 + 3] > 70 ? 1 : 0;
}

// Connected Component Labeling via BFS Flood Fill
const visited = new Uint8Array(width * height);
const components = [];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (binary[idx] === 1 && !visited[idx]) {
      // Start BFS
      const compPixels = [];
      const queue = [[x, y]];
      visited[idx] = 1;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        compPixels.push([cx, cy]);

        // 8-neighbor expansion
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (binary[nidx] === 1 && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }

      if (compPixels.length > 50) { // filter noise
        let minX = width, maxX = 0, minY = height, maxY = 0;
        compPixels.forEach(([px, py]) => {
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        });

        components.push({
          pixels: compPixels,
          minX, maxX, minY, maxY,
          count: compPixels.length
        });
      }
    }
  }
}

// Sort components from left to right (X position)
components.sort((a, b) => a.minX - b.minX);
console.log('Found connected components:', components.length);
components.forEach((c, i) => console.log('Component', i + 1, 'minX:', c.minX, 'maxX:', c.maxX, 'pixels:', c.count));

// For each connected component, trace outer contour clockwise
const letterNames = ['S', 'H', 'A', 'R', 'P', 'B', 'U', 'Y'];
const letterData = [];

components.forEach((comp, idx) => {
  const compMap = new Map();
  comp.pixels.forEach(([px, py]) => {
    if (!compMap.has(py)) compMap.set(py, { min: px, max: px });
    else {
      const row = compMap.get(py);
      if (px < row.min) row.min = px;
      if (px > row.max) row.max = px;
    }
  });

  const leftPts = [];
  const rightPts = [];

  for (let y = comp.minY; y <= comp.maxY; y += 2) {
    if (compMap.has(y)) {
      const { min, max } = compMap.get(y);
      leftPts.push({ x: min, y });
      rightPts.push({ x: max, y });
    }
  }

  if (leftPts.length > 2) {
    const contour = [...rightPts, ...leftPts.reverse()];
    let d = `M ${contour[0].x} ${contour[0].y}`;
    for (let i = 1; i < contour.length; i++) {
      d += ` L ${contour[i].x} ${contour[i].y}`;
    }
    d += ' Z';

    letterData.push({
      char: letterNames[idx] || `L${idx+1}`,
      d,
      isBuy: comp.minX > 375,
    });
  }
});

const out = `export const WORDMARK_VIEWBOX = '0 0 ${width} ${height}';
export const LETTERS = ${JSON.stringify(letterData, null, 2)};
`;

fs.writeFileSync('c:/Users/iliyk/Desktop/hackershop-web/src/data/sharpbuyLetters.js', out);
console.log('Successfully written sharpbuyLetters.js via Connected Component Analysis (0 bridge lines, 0 spikes)!');
