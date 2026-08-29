import xlsx from 'xlsx';
import { ethers } from 'ethers';

const filePath = 'c:\\Users\\iliyk\\Downloads\\Withdrawal History-20260822-20260823_1787603312032.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const provider = new ethers.JsonRpcProvider(BSC_RPC);
const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, provider);

const cutoffTime = new Date('2026-08-21T10:11:12').getTime();

async function run() {
  let totalAmount = 0;
  const addresses = new Set();

  for (const row of data) {
    const timeStr = row['Time'] || row['Date'] || Object.values(row)[0];
    if (!timeStr) continue;
    const time = new Date(timeStr).getTime();
    if (time > cutoffTime) {
      const amount = parseFloat(row['Amount'] || Object.values(row)[3]);
      const address = row['Address'] || Object.values(row)[4];
      if (amount && address) {
        totalAmount += amount;
        addresses.add(address);
      }
    }
  }

  console.log('Total sent (based on Excel):', totalAmount, 'USDT');
  console.log('Checking balances for', addresses.size, 'addresses on BSC...');
  
  let recoveredAmount = 0;
  for (const addr of addresses) {
     try {
       const cleanAddr = addr.toString().trim();
       if (cleanAddr.length >= 42) {
         const bal = await usdtContract.balanceOf(cleanAddr);
         const numBal = Number(bal) / 1e18;
         if (numBal > 0) {
           console.log(`Address ${cleanAddr} has ${numBal} USDT`);
           recoveredAmount += numBal;
         }
       }
     } catch (e) {}
  }
  console.log('Total USDT sitting in these addresses:', recoveredAmount);
}

run();
