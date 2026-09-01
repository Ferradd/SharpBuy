import QRCode from 'qrcode';
import path from 'path';

async function generateDepositQr() {
  const address = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const artifactDir = 'C:\\Users\\iliyk\\.gemini\\antigravity-ide\\brain\\ebe2a0ac-444e-4855-8ff0-b99ba0ffc4a4';
  const outPath = path.join(artifactDir, 'merchant_deposit_usdt_bsc_qr.png');

  await QRCode.toFile(outPath, address, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    scale: 10,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  console.log('Generated QR at:', outPath);
}

generateDepositQr();
