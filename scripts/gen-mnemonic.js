import { ethers } from 'ethers';
const wallet = ethers.Wallet.createRandom();
console.log("Mnemonic: ", wallet.mnemonic.phrase);
