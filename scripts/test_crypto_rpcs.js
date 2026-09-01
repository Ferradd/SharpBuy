import { ethers } from 'ethers';

const MERCHANT_EVM = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';

async function testAllRpc() {
  console.log('--- 1. Testing BSC Native BNB Balance ---');
  try {
    const bscProvider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
    const bnbBal = await bscProvider.getBalance(MERCHANT_EVM);
    console.log('BNB Balance:', ethers.formatEther(bnbBal), 'BNB');
  } catch (e) {
    console.log('BSC BNB error:', e.message);
  }

  console.log('\n--- 2. Testing BSC USDT (BEP-20) ---');
  try {
    const bscProvider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
    const usdtContract = new ethers.Contract('0x55d398326f99059fF775485246999027B3197955', ['function balanceOf(address) view returns (uint256)'], bscProvider);
    const usdtBal = await usdtContract.balanceOf(MERCHANT_EVM);
    console.log('USDT BSC Balance:', ethers.formatUnits(usdtBal, 18), 'USDT');
  } catch (e) {
    console.log('BSC USDT error:', e.message);
  }

  console.log('\n--- 3. Testing Polygon USDT ---');
  try {
    const polyProvider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const polyUsdt = new ethers.Contract('0xc2132D05D31c914a87C6611C10748AEb04B58e8F', ['function balanceOf(address) view returns (uint256)'], polyProvider);
    const polyBal = await polyUsdt.balanceOf(MERCHANT_EVM);
    console.log('Polygon USDT Balance:', ethers.formatUnits(polyBal, 6), 'USDT');
  } catch (e) {
    console.log('Polygon USDT error:', e.message);
  }

  console.log('\n--- 4. Testing Arbitrum USDT ---');
  try {
    const arbProvider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    const arbUsdt = new ethers.Contract('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', ['function balanceOf(address) view returns (uint256)'], arbProvider);
    const arbBal = await arbUsdt.balanceOf(MERCHANT_EVM);
    console.log('Arbitrum USDT Balance:', ethers.formatUnits(arbBal, 6), 'USDT');
  } catch (e) {
    console.log('Arbitrum USDT error:', e.message);
  }

  console.log('\n--- 5. Testing Solana RPC ---');
  try {
    const solRes = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: ['82Kj9sM4v1x7F3J5n8P0w2Y4z6T9r1E3sSharpBuy1']
      })
    });
    const solJson = await solRes.json();
    console.log('Solana RPC response:', solJson);
  } catch (e) {
    console.log('Solana error:', e.message);
  }
}

testAllRpc();
