import { ethers } from 'ethers';

const mnemonic = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';

function deriveWallet() {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  console.log('Derived Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey.substring(0, 10) + '...');
  return wallet;
}

deriveWallet();
