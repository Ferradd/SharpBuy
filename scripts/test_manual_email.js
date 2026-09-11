import { sendOrderEmail } from '../api/_utils/email-sender.js';

async function testManualEmail() {
  try {
    console.log('Sending manual email with token...');
    
    const result = await sendOrderEmail(
      'MANUAL-TEST-001',
      'iliakuzin3@gmail.com',
      50, // priceRub
      0.54, // cryptoAmount
      'USDT (BEP-20)', // currency
      'CS2 Premier Ready Instant Competitive', // productName
      1, // quantity
      ['PRIME8UXV5LDP28J6VLBUNF3I'], // tokens
      { force: true }
    );
    
    console.log('Email result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Resend ID:', result.id);
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testManualEmail();