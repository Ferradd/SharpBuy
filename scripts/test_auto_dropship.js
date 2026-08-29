import { ethers } from 'ethers';

const MERCHANT_MNEMONIC = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
];

async function testAutomatedPurchase() {
  console.log('--- STARTING AUTONOMOUS DROPSHIP PURCHASE TEST ---');
  
  // 1. Check wallet balances
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const wallet = ethers.Wallet.fromPhrase(MERCHANT_MNEMONIC, provider);
  const bnb = await provider.getBalance(wallet.address);
  const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, wallet);
  const usdt = await usdtContract.balanceOf(wallet.address);

  console.log(`Wallet Address: ${wallet.address}`);
  console.log(`BNB (Gas): ${ethers.formatEther(bnb)} BNB`);
  console.log(`USDT: ${ethers.formatUnits(usdt, 18)} USDT`);

  // 2. Create supplier checkout order for CS2 Premier Ready
  console.log('\nCreating checkout order on shefu223.shop...');
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-checkout-crypto-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ slug: 'premier', quantity: 1 }],
        email: 'iliykuzin2@gmail.com',
        coin: 'USDTBSC'
      })
    });
    
    console.log('Supplier response status:', res.status);
    const orderData = await res.json();
    console.log('Supplier order data:', JSON.stringify(orderData, null, 2));

    if (orderData && orderData.pay_address && orderData.pay_amount) {
      console.log(`\nFound deposit address: ${orderData.pay_address}, Amount: ${orderData.pay_amount} USDT`);
      
      const amountWei = ethers.parseUnits(orderData.pay_amount.toString(), 18);
      console.log('Broadcasting USDT transfer on BSC...');
      const tx = await usdtContract.transfer(orderData.pay_address, amountWei);
      console.log('Tx sent! Hash:', tx.hash);
      console.log('Waiting for confirmation...');
      await tx.wait(1);
      console.log('Confirmed! Polling supplier for delivered license key...');

      // Poll supplier
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 4000));
        const statusRes = await fetch(`https://shefu223.shop/api/order-status?id=${orderData.order_id || orderData.id}`);
        const statusData = await statusRes.json();
        console.log(`[Poll #${i+1}] Status:`, statusData);
        if (statusData.status === 'completed' && statusData.key) {
          console.log('\nSUCCESS! Retrieved License Key:', statusData.key);
          
          // Redeem to Steam Token
          console.log('Redeeming key on nfa.shefu223.shop/api/nfa-redeem...');
          const redeemRes = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ license: statusData.key })
          });
          const redeemData = await redeemRes.json();
          console.log('REDEEMED STEAM NFA ACCOUNT:', JSON.stringify(redeemData, null, 2));
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testAutomatedPurchase();
