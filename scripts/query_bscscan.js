async function getBscScanTxs() {
  const addr = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${addr}&sort=desc`;
  console.log('Querying BscScan...');

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === '1' && data.result) {
      console.log(`Found ${data.result.length} token transactions on BSC:`);
      data.result.slice(0, 5).forEach((tx, i) => {
        console.log(`[#${i+1}] Hash: ${tx.hash}, To: ${tx.to}, Value: ${tx.value / 1e18} USDT, Time: ${new Date(tx.timeStamp * 1000).toLocaleString('ru-RU')}`);
      });
    } else {
      console.log('BscScan message:', data.message);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

getBscScanTxs();
