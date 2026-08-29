import { Keypair } from '@solana/web3.js';

try {
  const kp = Keypair.generate();
  console.log('Valid Solana Address:', kp.publicKey.toBase58());
} catch (e) {
  console.log('Web3 js not installed or error:', e.message);
}
