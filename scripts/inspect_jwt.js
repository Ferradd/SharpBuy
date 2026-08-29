import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, jwt] = firstTokenRaw.split('----');

const [headerB64, payloadB64, sig] = jwt.split('.');

const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

console.log('JWT Header:', header);
console.log('JWT Payload:', payload);
console.log('Token Exp:', new Date(payload.exp * 1000).toISOString());
console.log('Token Iat:', new Date(payload.iat * 1000).toISOString());
