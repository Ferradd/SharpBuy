import { ethers } from 'ethers';

async function testTransferEventCheck() {
  const BSC_RPC = 'https://bsc-dataseed1.binance.org';
  const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
  const MERCHANT_ADDR = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const provider = new ethers.JsonRpcProvider(BSC_RPC);

  const currentBlock = await provider.getBlockNumber();
  console.log('Current BSC Block:', currentBlock);

  // Check last 200 blocks (~10 mins)
  const filter = {
    address: USDT_CONTRACT,
    topics: [
      ethers.id('Transfer(address,address,uint256)'),
      null,
      ethers.zeroPadValue(MERCHANT_ADDR, 32)
    ],
    fromBlock: currentBlock - 200,
    toBlock: 'latest'
  };

  const logs = await provider.getLogs(filter);
  console.log(`Found ${logs.length} incoming USDT transfers in last 200 blocks:`);
  for (let l of logs) {
    const from = ethers.stripZerosLeft(l.topics[1]);
    const amount = Number(ethers.formatUnits(l.data, 18));
    console.log(`- Tx: ${l.transactionHash}, From: ${from}, Amount: ${amount} USDT, Block: ${l.blockNumber}`);
  }
}

testTransferEventCheck();
