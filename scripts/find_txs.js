import { ethers } from 'ethers';

async function findRecentUsdtTransfers() {
  const BSC_RPC = 'https://bsc-dataseed1.binance.org';
  const MERCHANT_ADDR = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

  const filter = {
    address: USDT_BSC_CONTRACT,
    topics: [
      ethers.id('Transfer(address,address,uint256)'),
      ethers.zeroPadValue(MERCHANT_ADDR, 32)
    ],
    fromBlock: -1000,
    toBlock: 'latest'
  };

  const logs = await provider.getLogs(filter);
  console.log(`Found ${logs.length} USDT transfer logs:`);
  for (let log of logs) {
    const to = ethers.stripZerosLeft(log.topics[2]);
    const amount = ethers.formatUnits(log.data, 18);
    console.log(`- Tx: ${log.transactionHash}, To: ${to}, Amount: ${amount} USDT, Block: ${log.blockNumber}`);
  }
}

findRecentUsdtTransfers();
