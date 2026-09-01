import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { sendOrderEmail } from './email-sender.js';
import { updateOrderDeliveryInDb } from './orders-db.js';

// ============================================================================
// SHARPBUY AUTONOMOUS DROPSHIP & REDEEM ENGINE (SHEFU223.SHOP)
// ============================================================================

const MERCHANT_MNEMONIC = process.env.MERCHANT_MNEMONIC;
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
];

/**
 * 1. Redeems a license key into a fresh Steam NFA token via nfa.shefu223.shop
 */
export async function redeemShefuKey(licenseKey) {
  if (!licenseKey) return null;
  const cleanKey = licenseKey.trim();
  console.log(`[Redeem] Redeeming key: ${cleanKey} on nfa.shefu223.shop...`);

  try {
    const res = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license: cleanKey })
    });

    const data = await res.json();
    console.log('[Redeem] Initial response:', data);

    if (data.success && data.account) {
      return {
        success: true,
        account: data.account,
        loader_token: data.loader_token || null
      };
    }

    if (data.success && data.claim_id) {
      const claimId = data.claim_id;
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        try {
          const statusRes = await fetch('https://nfa.shefu223.shop/api/nfa-redeem-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claim_id: claimId })
          });
          const statusData = await statusRes.json();
          if (statusData.status === 'approved' && statusData.account) {
            return {
              success: true,
              account: statusData.account,
              loader_token: statusData.loader_token || null
            };
          }
        } catch (pollErr) {}
      }
    }

    return {
      success: false,
      error: data.error || 'Failed to redeem key'
    };
  } catch (err) {
    console.error('Shefu redeem exception:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * 2. Fully autonomous purchase on shefu223.shop via NOWPayments & BSC USDT
 */
export async function initiateDropshipPurchase(productSlug = 'premier', buyerEmail = 'iliykuzin2@gmail.com') {
  try {
    console.log(`[AutoDropship] Starting purchase for ${productSlug}...`);

    const orderRes = await fetch('https://shefu223.shop/api/nfa-checkout-crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product: productSlug, quantity: 1 }],
        email: 'iliykuzin2@gmail.com'
      })
    });

    const orderData = await orderRes.json();
    if (!orderData.url || !orderData.order_id) {
      console.warn('[AutoDropship] Failed to create shefu order:', orderData);
      return null;
    }

    const supplierOrderId = orderData.order_id;
    console.log(`[AutoDropship] Created supplier order: ${supplierOrderId}`);

    const urlObj = new URL(orderData.url);
    const iid = urlObj.searchParams.get('iid');
    if (!iid) return null;

    if (!NOWPAYMENTS_API_KEY) {
      console.warn('[AutoDropship] NOWPAYMENTS_API_KEY not set');
      return null;
    }
    const payRes = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        iid: iid,
        pay_currency: 'usdtbsc'
      })
    });

    const payData = await payRes.json();
    if (!payData.pay_address) {
      console.warn('[AutoDropship] No pay address from NOWPayments');
      return null;
    }

    if (!MERCHANT_MNEMONIC) {
      console.warn('[AutoDropship] MERCHANT_MNEMONIC not set');
      return null;
    }

    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const wallet = ethers.Wallet.fromPhrase(MERCHANT_MNEMONIC, provider);
    const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, wallet);

    const amountWei = ethers.parseUnits(payData.pay_amount.toString(), 18);
    const tx = await usdtContract.transfer(payData.pay_address, amountWei);
    console.log(`[AutoDropship] USDT Sent to supplier! TxHash: ${tx.hash}`);
    
    await tx.wait(1);

    return {
      success: true,
      supplierOrderId
    };
  } catch (err) {
    console.error('[AutoDropship] Purchase exception:', err);
    return null;
  }
}

/**
 * 3. Checks supplier order for delivered key and redeems + sends email synchronously on each polling tick
 */
export async function checkAndFulfillSupplierOrder(supplierOrderId, orderId, userEmail, priceRub, cryptoAmount, currency, productName, neededQty) {
  if (!supplierOrderId) return null;

  try {
    const dlRes = await fetch('https://shefu223.shop/api/nfa-downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfa_order: supplierOrderId })
    });

    if (!dlRes.ok) return null;

    const dlData = await dlRes.json();
    if (dlData.status === 'fulfilled' && dlData.keysByProduct && dlData.keysByProduct.length > 0) {
      const group = dlData.keysByProduct[0];
      if (group.keys && group.keys.length > 0) {
        const deliveredKey = group.keys[0];
        console.log(`[AutoDropship] Found key: ${deliveredKey} for supplier order ${supplierOrderId}`);

        const redeemRes = await redeemShefuKey(deliveredKey);
        let finalToken = deliveredKey;
        if (redeemRes && redeemRes.success && redeemRes.account) {
          finalToken = redeemRes.account;
          console.log(`[AutoDropship] Successfully redeemed into Steam token for ${orderId}`);
        }

        try {
          await updateOrderDeliveryInDb(orderId, finalToken);
          await sendOrderEmail(orderId, userEmail, priceRub, cryptoAmount, currency, productName, neededQty, [finalToken]);
          console.log(`[AutoDropship] Sent email for ${orderId}!`);
        } catch (e) {
          console.error(`[AutoDropship] Email dispatch error:`, e);
        }

        return {
          delivered: true,
          token: finalToken,
          licenseKey: deliveredKey
        };
      }
    }
  } catch (err) {
    console.error(`[AutoDropship] Check supplier error:`, err.message);
  }

  return { delivered: false };
}
