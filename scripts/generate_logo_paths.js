import fs from 'fs';
import zlib from 'zlib';

function getContourPath(pngPath, alphaThreshold = 50, step = 2) {
  const pngBuffer = fs.readFileSync(pngPath);
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

  // Row-by-row boundary tracing
  const leftPoints = [];
  const rightPoints = [];
  for (let y = 0; y < height; y += step) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      const alpha = rawPixels[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1 && maxX !== -1) {
      leftPoints.push({ x: minX, y });
      rightPoints.push({ x: maxX, y });
    }
  }

  if (leftPoints.length === 0) return { d: '', width, height, pointsCount: 0 };
  const contour = [...rightPoints, ...leftPoints.reverse()];
  let d = 'M ' + contour[0].x + ' ' + contour[0].y;
  for (let i = 1; i < contour.length; i++) {
    d += ' L ' + contour[i].x + ' ' + contour[i].y;
  }
  d += ' Z';
  return { d, width, height, pointsCount: contour.length };
}

const sSolid = getContourPath('c:/Users/iliyk/Desktop/hackershop-web/public/anim-s-solid.png');
const sLaser = getContourPath('c:/Users/iliyk/Desktop/hackershop-web/public/anim-laser.png');
const sFull = getContourPath('c:/Users/iliyk/Desktop/hackershop-web/public/anim-s-full.png');

console.log('Solid S points:', sSolid.pointsCount, 'size:', sSolid.width, 'x', sSolid.height);
console.log('Laser points:', sLaser.pointsCount, 'size:', sLaser.width, 'x', sLaser.height);
console.log('Full S points:', sFull.pointsCount, 'size:', sFull.width, 'x', sFull.height);

const outContent = `export const S_SOLID_VIEWBOX = '0 0 ${sSolid.width} ${sSolid.height}';
export const S_SOLID_PATH = '${sSolid.d}';

export const S_LASER_VIEWBOX = '0 0 ${sLaser.width} ${sLaser.height}';
export const S_LASER_PATH = '${sLaser.d}';

export const S_FULL_VIEWBOX = '0 0 ${sFull.width} ${sFull.height}';
export const S_FULL_PATH = '${sFull.d}';
`;

fs.writeFileSync('c:/Users/iliyk/Desktop/hackershop-web/src/data/logoPaths.js', outContent);
console.log('Successfully written logoPaths.js!');
