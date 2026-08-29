import fs from 'fs';
import https from 'https';

const steamIds = [
  '76561199222229128',
  '76561198308872864',
  '76561199250626158',
  '76561197994572241',
  '76561199188317738',
  '76561199773433845',
  '76561198077834073',
  '76561199151675753',
  '76561199241484983',
  '76561199231692149',
  '76561199230983883',
  '76561199492828421',
  '76561199216635588',
  '76561199787712068',
  '76561199697754827',
  '76561199166963438',
  '76561199489633318',
  '76561199501030638',
  '76561199168590117',
  '76561198001838422',
  '76561199388981206'
];

async function checkPrice(id) {
  // Check skinpock page or csgobackpack or steamcommunity
  try {
    const res = await fetch(`https://www.skinpock.com/inventory/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();
    // Look for dollar values in HTML like "$165.20" or total worth
    const matches = html.match(/\$[\d,]+\.\d{2}/g) || [];
    console.log(`[${id}] Dollar matches:`, matches.slice(0, 10));
  } catch (e) {
    console.log(`[${id}] Error:`, e.message);
  }
}

async function main() {
  for (const id of steamIds.slice(0, 5)) {
    await checkPrice(id);
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
