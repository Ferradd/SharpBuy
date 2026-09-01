import { ethers } from 'ethers';

const mnemonic = process.env.MERCHANT_MNEMONIC;
if (!mnemonic) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}

function deriveWallet() {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  console.log('Derived Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey.substring(0, 10) + '...');
  return wallet;
}

deriveWallet();
