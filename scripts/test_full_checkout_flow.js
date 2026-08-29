import { initiateDropshipPurchase, checkAndFulfillSupplierOrder, redeemShefuKey } from '../api/_utils/shefu-dropship.js';
import { sendOrderEmail } from '../api/_utils/email-sender.js';

async function testFullSystemFlow(productSlug = 'premier', productName = 'CS2 Premier Ready Instant Competitive') {
  console.log(`========================================================================`);
  console.log(`🧪 SHARPBUY END-TO-END SYSTEM TEST & SIMULATION (PRODUCT: ${productSlug})`);
  console.log(`========================================================================\n`);

  const testOrderId = 'SHARP-TEST-' + Math.floor(100000 + Math.random() * 900000);
  const testEmail = 'iliykuzin2@gmail.com';
  const priceRub = 89;
  const expectedAmount = '1.00';
  const currency = 'USDT (BEP-20)';

  console.log(`1. Customer selected product: "${productName}"`);
  console.log(`2. Generated test order: #${testOrderId}`);
  console.log(`3. Target notification email: ${testEmail}`);
  console.log(`4. Initiating dropship purchase at supplier (shefu223.shop)...`);

  const dropshipRes = await initiateDropshipPurchase(productSlug, testEmail);
  console.log('   • Dropship Purchase Result:', dropshipRes);

  if (dropshipRes && dropshipRes.supplierOrderId) {
    console.log(`\n5. Supplier Order Created: ${dropshipRes.supplierOrderId}`);
    console.log(`6. Checking supplier fulfillment status & redeeming license key...`);

    // Poll up to 12 times (60 seconds)
    for (let attempt = 1; attempt <= 12; attempt++) {
      console.log(`   [Attempt ${attempt}/12] Polling supplier for delivered key...`);
      const checkRes = await checkAndFulfillSupplierOrder(
        dropshipRes.supplierOrderId,
        testOrderId,
        testEmail,
        priceRub,
        expectedAmount,
        currency,
        productName,
        1
      );

      if (checkRes && checkRes.delivered) {
        console.log(`\n========================================================================`);
        console.log(`✅ TEST SUCCESS! ORDER #${testOrderId} FULFILLED & DELIVERED!`);
        console.log(`========================================================================`);
        console.log(`• Delivered Token: ${checkRes.token}`);
        console.log(`• Email sent to:  ${testEmail}`);
        console.log(`• Supplier Order: ${dropshipRes.supplierOrderId}`);
        return;
      }

      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Fallback test email dispatch to verify email delivery format
  console.log(`\n7. Sending verification test email to ${testEmail}...`);
  const mockToken = '76561199388981206----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTM4ODk4MTIwNiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUyNTUxODgsICJuYmYiOiAxNzc4MzA4MDU0LCAiaWF0IjogMTc4Njk0ODA1NCwgImp0aSI6ICIwMDEzXzI4QTZCQTExXzU3NEFDIiwgIm9hdCI6IDE3ODY5NDgwNTQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4NS4xNzQuMTgwLjU2IiwgImlwX2NvbmZpcm1lciI6ICIxNjMuNTMuMjQ0LjIwMSIgfQ.Lg6nP1giDda2k6BfO34jIZow_MZ2s9kCnp0Ni6ZIIhMsok9c_mQIyDT0ZFOyKnUHq0JXXuxcNpCiP0ju9Le_Ag';
  await sendOrderEmail(testOrderId, testEmail, priceRub, expectedAmount, currency, productName, 1, [mockToken]);
  console.log(`✅ Test order email successfully sent to ${testEmail}!`);
}

testFullSystemFlow();
