import { ethers } from 'ethers';

async function testPublicEndpoints() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const usdtContract = '0x55d398326f99059fF775485246999027B3197955';

  // Test with small block range (last 50 blocks ~ 2.5 minutes)
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.bnbchain.org');
  const currentBlock = await provider.getBlockNumber();
  console.log('Current block:', currentBlock);

  try {
    const logs = await provider.getLogs({
      address: usdtContract,
      topics: [
        ethers.id('Transfer(address,address,uint256)'),
        null,
        ethers.zeroPadValue(addr.toLowerCase(), 32)
      ],
      fromBlock: currentBlock - 50,
      toBlock: 'latest'
    });
    console.log('Logs in last 50 blocks:', logs.length);
  } catch (e) {
    console.log('50 block getLogs result:', e.message);
  }

  // Also test OKLink / Blockscout / Explorer APIs
  try {
    const oklinkRes = await fetch(`https://api.blockscout.com/api?module=account&action=tokentx&address=${addr}`);
    console.log('Blockscout status:', oklinkRes.status);
    if (oklinkRes.ok) {
      const d = await oklinkRes.json();
      console.log('Blockscout txs:', d);
    }
  } catch (e) {}
}

testPublicEndpoints();
