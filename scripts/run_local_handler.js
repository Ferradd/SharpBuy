import handler from '../api/check-payment.js';

async function runLocalHandler() {
  const req = {
    method: 'POST',
    body: {
      orderId: 'SHARP-MT7JPK3J-668',
      address: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1',
      expectedAmount: 0.9766,
      symbol: 'USDT',
      currency: 'USDT_BEP20',
      quantity: 1,
      email: 'iliykuzin2@gmail.com',
      productId: 'premier',
      productName: 'CS2 Premier Ready (Открыт Премьер)'
    }
  };

  const res = {
    setHeader: () => {},
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log(`[HTTP ${this.statusCode || 200}]:`, data);
      return this;
    },
    end: () => {}
  };

  try {
    await handler(req, res);
  } catch (e) {
    console.error('CRASH IN HANDLER:', e);
  }
}

runLocalHandler();
