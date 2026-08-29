import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function hashPassword(password, salt = 'sharpbuy_salt_2026_') {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

const USERS_DB_API = path.join(process.cwd(), 'api', 'users_database.json');
const USERS_DB_SRC = path.join(process.cwd(), 'src', 'data', 'users_database.json');

const masterOwner = {
  id: 'usr_master_owner_001',
  email: 'iliykuzin2@gmail.com',
  // Master password hash
  passwordHash: hashPassword('SharpBuyAdmin2026!'),
  role: 'OWNER',
  isOwner: true,
  isVerified: true,
  balanceRub: 0,
  registeredAt: new Date().toISOString()
};

const users = {
  'iliykuzin2@gmail.com': masterOwner
};

fs.writeFileSync(USERS_DB_API, JSON.stringify(users, null, 2), 'utf8');
fs.writeFileSync(USERS_DB_SRC, JSON.stringify(users, null, 2), 'utf8');

console.log('✅ Master owner securely seeded in server database!');
console.log('   Email:', masterOwner.email);
console.log('   Role:', masterOwner.role);
