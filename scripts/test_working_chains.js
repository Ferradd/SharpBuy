import { ethers } from 'ethers';

const MERCHANT_EVM = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';

const POLYGON_RPCS = [
  'https://polygon-bor-rpc.publicnode.com',
  'https://rpc.ankr.com/polygon',
  'https://1rpc.io/matic'
];

const ARBITRUM_RPCS = [
  'https://arbitrum-one-rpc.publicnode.com',
  'https://arb1.arbitrum.io/rpc',
  'https://rpc.ankr.com/arbitrum'
];

const BASE_RPCS = [
  'https://mainnet.base.org',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base'
];

const BSC_RPCS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://1rpc.io/bnb'
];

async function rpcFetch(rpcs, method, params) {
  for (const url of rpcs) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
      });
      const data = await res.json();
      if (data && data.result !== undefined) return data.result;
    } catch (e) {}
  }
  return null;
}

async function testWorkingChains() {
  console.log('--- 1. BSC USDT (BEP-20) ---');
  const bscData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const bscUsdtHex = await rpcFetch(BSC_RPCS, 'eth_call', [{ to: '0x55d398326f99059fF775485246999027B3197955', data: bscData }, 'latest']);
  console.log('BSC USDT:', bscUsdtHex ? Number(BigInt(bscUsdtHex)) / 1e18 : 'error', 'USDT');

  console.log('\n--- 2. BSC BNB (Native) ---');
  const bnbHex = await rpcFetch(BSC_RPCS, 'eth_getBalance', [MERCHANT_EVM, 'latest']);
  console.log('BNB:', bnbHex ? Number(BigInt(bnbHex)) / 1e18 : 'error', 'BNB');

  console.log('\n--- 3. Polygon USDT ---');
  const polyData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const polyHex = await rpcFetch(POLYGON_RPCS, 'eth_call', [{ to: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', data: polyData }, 'latest']);
  console.log('Polygon USDT:', polyHex ? Number(BigInt(polyHex)) / 1e6 : 'error', 'USDT');

  console.log('\n--- 4. Arbitrum USDT ---');
  const arbData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const arbHex = await rpcFetch(ARBITRUM_RPCS, 'eth_call', [{ to: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', data: arbData }, 'latest']);
  console.log('Arbitrum USDT:', arbHex ? Number(BigInt(arbHex)) / 1e6 : 'error', 'USDT');

  console.log('\n--- 5. Base USDT/USDC ---');
  const baseData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
  const baseHex = await rpcFetch(BASE_RPCS, 'eth_call', [{ to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', data: baseData }, 'latest']);
  console.log('Base USDC/USDT:', baseHex ? Number(BigInt(baseHex)) / 1e6 : 'error', 'USD');
}

testWorkingChains();
