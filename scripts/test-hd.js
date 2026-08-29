import { ethers } from 'ethers';
const mnemonic = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';
const orderIndex = Date.now() % 2147483647;
const childWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", "m/44'/60'/0'/0/" + orderIndex);
console.log("Unique Address:", childWallet.address);

