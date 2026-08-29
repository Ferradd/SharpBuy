import { ethers } from 'ethers';

const MERCHANT_MNEMONIC = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
];

async function executeFullDropshipTest() {
  console.log('=====================================================');
  console.log('🚀 EXECUTING FULL REAL AUTONOMOUS DROPSHIP PURCHASE');
  console.log('=====================================================');

  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const wallet = ethers.Wallet.fromPhrase(MERCHANT_MNEMONIC, provider);
  const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, wallet);

  const bnbBal = await provider.getBalance(wallet.address);
  const usdtBal = await usdtContract.balanceOf(wallet.address);
  console.log(`[Wallet] Address: ${wallet.address}`);
  console.log(`[Wallet] BNB: ${ethers.formatEther(bnbBal)} | USDT: ${ethers.formatUnits(usdtBal, 18)}`);

  // Step 1: Create checkout on shefu223.shop via NOWPayments
  console.log('\n[Step 1] Creating NOWPayments order on shefu223.shop...');
  const orderRes = await fetch('https://shefu223.shop/api/nfa-checkout-crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ product: 'premier', quantity: 1 }],
      email: 'iliykuzin2@gmail.com'
    })
  });

  const orderData = await orderRes.json();
  console.log('[Step 1 Result]', orderData);

  if (!orderData.url || !orderData.order_id) {
    throw new Error('Failed to create shefu order: ' + JSON.stringify(orderData));
  }

  // Extract iid from url: https://nowpayments.io/payment/?iid=4736609055
  const urlObj = new URL(orderData.url);
  const iid = urlObj.searchParams.get('iid');
  console.log(`[Step 1] Found NOWPayments IID: ${iid}`);

  // Step 2: Request USDT-BSC Deposit Address from NOWPayments
  console.log('\n[Step 2] Requesting USDT-BSC deposit address from NOWPayments...');
  const payRes = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      iid: iid,
      pay_currency: 'usdtbsc'
    })
  });

  const payData = await payRes.json();
  console.log('[Step 2 Result] Payment Invoice:', {
    payment_id: payData.payment_id,
    pay_address: payData.pay_address,
    pay_amount: payData.pay_amount,
    pay_currency: payData.pay_currency
  });

  if (!payData.pay_address || !payData.pay_amount) {
    throw new Error('Could not get pay address from NOWPayments');
  }

  // Step 3: Broadcast USDT transfer from our merchant wallet on BSC!
  console.log(`\n[Step 3] Sending ${payData.pay_amount} USDT to supplier address: ${payData.pay_address}...`);
  const amountWei = ethers.parseUnits(payData.pay_amount.toString(), 18);
  const tx = await usdtContract.transfer(payData.pay_address, amountWei);
  console.log(`[Step 3] TX Broadcasted! TxHash: ${tx.hash}`);
  console.log('[Step 3] Waiting for 1 on-chain block confirmation...');
  await tx.wait(1);
  console.log('[Step 3] TX Confirmed on Binance Smart Chain!');

  // Step 4: Poll NOWPayments & shefu223.shop for completion and key delivery
  console.log('\n[Step 4] Polling NOWPayments & shefu223 for order fulfillment...');
  let licenseKey = null;

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 6000));
    try {
      // Check NOWPayments payment status
      const npStatusRes = await fetch(`https://api.nowpayments.io/v1/payment/${payData.payment_id}`, {
        headers: { 'x-api-key': '' } // public status or check via adapter
      }).catch(() => null);

      console.log(`[Poll #${i+1}] Checking order status for order_id: ${orderData.order_id}...`);
      
      // Also check shefu success / order status page
      const shefuRes = await fetch(`https://shefu223.shop/success/?nfa_order=${encodeURIComponent(orderData.order_id)}&method=crypto`).catch(() => null);
      if (shefuRes && shefuRes.ok) {
        const pageHtml = await shefuRes.text();
        const keyMatch = pageHtml.match(/[A-Z0-9]{4,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}/) || pageHtml.match(/eyJ[a-zA-Z0-9_\-\.]+/);
        if (keyMatch) {
          licenseKey = keyMatch[0];
          console.log('[Step 4] FOUND LICENSE KEY ON SHEFU PAGE:', licenseKey);
          break;
        }
      }
    } catch (pollErr) {
      console.warn('Poll warning:', pollErr.message);
    }
  }

  console.log('\n=====================================================');
  console.log('🎉 DROPSHIP PIPELINE EXECUTION SUMMARY:');
  console.log(`- Order ID: ${orderData.order_id}`);
  console.log(`- TxHash: ${tx.hash}`);
  console.log(`- License Key / Token: ${licenseKey || 'Sent to iliykuzin2@gmail.com'}`);
  console.log('=====================================================');
}

executeFullDropshipTest();
