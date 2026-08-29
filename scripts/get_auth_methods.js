import fs from 'fs';

async function getSupportedApiList() {
  const res = await fetch('https://api.steampowered.com/ISteamWebAPIUtil/GetSupportedAPIList/v1/');
  const data = await res.json();
  const authService = data.apilist.interfaces.find(i => i.name === 'IAuthenticationService');
  console.log('IAuthenticationService Methods:', JSON.stringify(authService, null, 2));
}

getSupportedApiList();
