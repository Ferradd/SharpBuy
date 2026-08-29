import QRCode from 'qrcode';
import path from 'path';

async function generateBnbQr() {
  const addr = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';
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
