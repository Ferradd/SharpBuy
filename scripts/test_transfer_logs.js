import { ethers } from 'ethers';

async function testTransferLogs() {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
  const addr = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';
  const usdtContract = '0x55d398326f99059fF775485246999027B3197955';

  const currentBlock = await provider.getBlockNumber();
  console.log('Current BSC Block:', currentBlock);

  // Check last 500 blocks (~25 minutes)
  const fromBlock = currentBlock - 500;
  const filter = {
    address: usdtContract,
    topics: [
      ethers.id('Transfer(address,address,uint256)'),
      null,
      ethers.zeroPadValue(addr.toLowerCase(), 32)
    ],
    fromBlock: fromBlock,
    toBlock: 'latest'
  };

  try {
    const logs = await provider.getLogs(filter);
    console.log(`Found ${logs.length} incoming USDT Transfer logs in last 500 blocks:`);
    for (const log of logs) {
      const parsedAmount = Number(BigInt(log.data)) / 1e18;
      console.log(`- Tx: ${log.transactionHash}, Block: ${log.blockNumber}, Amount: ${parsedAmount} USDT`);
    }
  } catch (e) {
    console.error('getLogs error:', e.message);
  }
}

testTransferLogs();
