import { ethers } from 'ethers';

const MERCHANT_MNEMONIC = process.env.MERCHANT_MNEMONIC;
if (!MERCHANT_MNEMONIC) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}
const MERCHANT_WALLET_ADDR = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
];

export async function sweepChildWallet(orderIndex, childAddress) {
  try {
    if (orderIndex === undefined || orderIndex === null) {
      console.error(`[Sweep] No orderIndex provided for ${childAddress}`);
      return;
    }

    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const mainWallet = ethers.Wallet.fromPhrase(MERCHANT_MNEMONIC, provider);
    const path = "m/44'/60'/0'/0/" + orderIndex;
    const childWallet = ethers.HDNodeWallet.fromPhrase(MERCHANT_MNEMONIC, "", path).connect(provider);

    if (childWallet.address.toLowerCase() !== childAddress.toLowerCase()) {
       console.error(`[Sweep] Address mismatch! Derived: ${childWallet.address} Expected: ${childAddress}`);
       return;
    }

    const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, childWallet);
    const balance = await usdtContract.balanceOf(childWallet.address);

    if (balance === 0n) {
      console.log(`[Sweep] Balance is 0 for ${childAddress}. Already swept or empty.`);
      return;
    }

    console.log(`[Sweep] Found ${ethers.formatUnits(balance, 18)} USDT on ${childAddress}. Sending gas...`);

    // We send a small amount of BNB for gas (0.0003 BNB ~ 0.17$)
    const gasTx = await mainWallet.sendTransaction({
      to: childWallet.address,
      value: ethers.parseEther("0.0003")
    });
    await gasTx.wait();

    console.log(`[Sweep] Gas sent! Sweeping USDT...`);
    const sweepTx = await usdtContract.transfer(MERCHANT_WALLET_ADDR, balance);
    await sweepTx.wait();

    console.log(`[Sweep] Success! Funds swept to main wallet. TxHash: ${sweepTx.hash}`);
  } catch (err) {
    console.error(`[Sweep] Error sweeping funds from ${childAddress}:`, err);
  }
}
