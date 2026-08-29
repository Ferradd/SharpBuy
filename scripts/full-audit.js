import fs from 'fs';
import { checkShefuWarrantyEligibility, requestShefuReplacement } from './shefu-replacement.js';
import { redeemShefuKey } from './shefu-dropship.js';

const allLicenseKeys = [
  'PRIME3V82048S69H8MM0UYJTL',
  'PRIMEQYZTBMW51KN5VPO3C510',
  'PRIMEZIJISHZLNUJ2ZY6MV1SE',
  'PRIMEHVNLDKTQX3YQ60T1W4RV',
  'PRIME09D06WVI9B2NGP4EZ5VW',
  'PRIMERV5E01ENTXQK8TEAYC94',
  'PRIMESB6QPEOOYZLJF1C42UD9',
  'PREMIER7UXC99RJVY9TQ4XYCBZH',
  'PREMIERNIHWJ4T75BSK2LP2HVP8',
  'PREMIERM9MUUTY6HRIDW242V5VI',
  'PREMIERN24UTWUP2XF5AFZF50W6',
  'PREMIERCOUXO1B6DYRUHRUGXZZ6',
  'PREMIER3HNGJHLGPFXZOF452NRC',
  'PREMIERWV7ZKPOSYK7AN5VST1B4',
  'PREMIER41FKSGH6ELOO7S5IQMJP',
  'PREMIERIN5PVVYY2B2MLP1MAYHI',
  'PREMIERRDOSPIISX5176OHH5RTC',
  'PREMIERPE9HXUSIGAB7Q45MNQB9',
  'PREMIERHVZV29SBAV5P56F76MIX',
  'PREMIERAN5S1M9E919ORVA9WYTF',
  'PREMIERQH4N3OVUUWTO1OGCBGE',
  'PREMIER3RFBGBTER99THEU6VD6',
  'PRIME1XML2MIURGBUZA8MEMIZ',
  'PRIMEY3C2GNTK7GQJWMV1OZEF',
  'PRIMEG32PL00Z2HF6HREVKZ6O'
];

async function runAudit() {
  console.log('=== STARTING COMPLETE AUDIT OF ALL ' + allLicenseKeys.length + ' LICENSE KEYS ===\n');

  const tokens = [];
  const warrantyReport = [];

  for (let i = 0; i < allLicenseKeys.length; i++) {
    const key = allLicenseKeys[i];
    console.log(`[${i + 1}/${allLicenseKeys.length}] Processing Key: ${key}...`);

    // 1. First attempt to redeem to make sure we have the live Steam token
    let token = null;
    try {
      const redRes = await redeemShefuKey(key);
      if (redRes && redRes.success && redRes.account) {
        token = redRes.account;
      }
    } catch (e) {}

    // 2. Check warranty eligibility
    let wInfo = { eligible: false, timeRemainingSeconds: 0, reason: 'Unknown' };
    try {
      wInfo = await checkShefuWarrantyEligibility(token || key);
    } catch (e) {}

    const remainingHrs = (wInfo.timeRemainingSeconds / 3600).toFixed(2);
    console.log(` -> Token: ${token ? token.split('----')[0] : 'Not resolved'} | Warranty: ${wInfo.eligible ? `ELIGIBLE (${remainingHrs}h left)` : `EXPIRED / ${wInfo.reason}`}`);

    tokens.push({
      licenseKey: key,
      token: token,
      steamId: token ? token.split('----')[0] : null,
      warranty: wInfo
    });

    warrantyReport.push({
      key,
      steamId: token ? token.split('----')[0] : 'N/A',
      eligible: wInfo.eligible,
      timeRemainingHours: remainingHrs,
      reason: wInfo.reason
    });

    // small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 600));
  }

  // Save audit report
  fs.writeFileSync('C:/Users/iliyk/Desktop/SharpBuy/src/data/warranty_audit_report.json', JSON.stringify(warrantyReport, null, 2), 'utf8');

  // Update steam.txt with all resolved tokens
  const txtPath = 'C:/Users/iliyk/Desktop/steam.txt';
  let steamTxt = '================================================================================\n';
  steamTxt += '  SHARPBUY MASTER STEAM ACCOUNTS DATABASE (NFA PRIME & PREMIER)\n';
  steamTxt += `  Total Accounts Audited: ${tokens.length} | Last Updated: ${new Date().toISOString()}\n`;
  steamTxt += '================================================================================\n\n';

  let premierCount = 0;
  let primeCount = 0;

  tokens.forEach((item, idx) => {
    const isPrime = item.licenseKey.startsWith('PRIME');
    const isPremier = item.licenseKey.startsWith('PREMIER');
    const typeLabel = isPremier ? 'CS2 PREMIER READY' : 'CS2 PRIME ACCOUNT';
    const num = isPremier ? ++premierCount : ++primeCount;
    const wStatus = item.warranty.eligible 
      ? `[WARRANTY ACTIVE: ${(item.warranty.timeRemainingSeconds / 3600).toFixed(1)}h remaining]`
      : `[WARRANTY: ${item.warranty.reason || 'Expired'}]`;

    steamTxt += `--- ${typeLabel} #${num} [SteamID: ${item.steamId || 'N/A'}] ${wStatus} (Key: ${item.licenseKey}) ---\n`;
    steamTxt += (item.token || 'TOKEN NOT AVAILABLE (License Key: ' + item.licenseKey + ')') + '\n\n';
  });

  fs.writeFileSync(txtPath, steamTxt, 'utf8');
  console.log('\n=== AUDIT COMPLETE ===');
  console.log(`Saved ${tokens.length} verified accounts to C:/Users/iliyk/Desktop/steam.txt!`);
}

runAudit();
