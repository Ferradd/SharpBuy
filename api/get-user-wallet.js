import { ethers } from 'ethers';

const MERCHANT_PUBLIC_ADDRESS = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const email = (req.query.email || (req.body && req.body.email) || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }

  const isOwner = email === 'iliykuzin2@gmail.com' || email === 'admin@sharpbuy.org';

  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC);

    // Only read public balances
    const bnbBalWei = await provider.getBalance(MERCHANT_PUBLIC_ADDRESS);
    const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, provider);
    const usdtBalWei = await usdtContract.balanceOf(MERCHANT_PUBLIC_ADDRESS);

    const bnbBal = Number(ethers.formatEther(bnbBalWei));
    const usdtBal = Number(ethers.formatUnits(usdtBalWei, 18));
    const rubBal = Math.round(usdtBal * 92);

    return res.status(200).json({
      success: true,
      email,
      address: MERCHANT_PUBLIC_ADDRESS,
      network: 'Binance Smart Chain (BSC / BEP-20)',
      supportedTokens: ['USDT (BEP-20)', 'BNB'],
      balances: {
        usdt: isOwner ? usdtBal : 0,
        bnb: isOwner ? bnbBal : 0,
        rub: isOwner ? rubBal : 0
      },
      isOwner
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
