import { ethers } from 'ethers';

async function testRpcCall() {
  const BSC_RPC = 'https://bsc-dataseed1.binance.org';
  const cleanAddr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
  const balanceData = '0x70a08231' + cleanAddr.toLowerCase().replace('0x', '').padStart(64, '0');

  const res = await fetch(BSC_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: USDT_BSC_CONTRACT, data: balanceData }, 'latest']
    })
  });

  const json = await res.json();
  console.log('eth_call result:', json);
  const bal = Number(BigInt(json.result)) / 1e18;
  console.log('Current USDT balance:', bal);
}

testRpcCall();
