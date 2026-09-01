import QRCode from 'qrcode';
import path from 'path';

async function generateBnbQr() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const artifactPath = 'C:\\Users\\iliyk\\.gemini\\antigravity-ide\\brain\\ebe2a0ac-444e-4855-8ff0-b99ba0ffc4a4\\bsc_bnb_qr.png';
  const desktopPath = 'C:\\Users\\iliyk\\Desktop\\bsc_bnb_qr.png';

  await QRCode.toFile(artifactPath, addr, {
    margin: 2,
    scale: 10,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  await QRCode.toFile(desktopPath, addr, {
    margin: 2,
    scale: 10,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  console.log('QR codes generated successfully!');
}

generateBnbQr();
