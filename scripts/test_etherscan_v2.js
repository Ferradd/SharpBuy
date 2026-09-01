async function testEtherscanV2() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  
  // Test Etherscan V2 for BSC (chainid 56)
  const v2Urls = [
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&address=${addr}&sort=desc`,
    `https://api.bscscan.com/v2/api?chainid=56&module=account&action=tokentx&address=${addr}&sort=desc`,
    `https://api.blockchair.com/binance-smart-chain/dashboards/address/${addr}`
  ];

  for (const u of v2Urls) {
    try {
      const res = await fetch(u);
      console.log('URL:', u, 'Status:', res.status);
      const data = await res.json();
      console.log('Data:', JSON.stringify(data, null, 2).substring(0, 500));
    } catch (e) {
      console.error('Err:', u, e.message);
    }
  }
}

testEtherscanV2();
