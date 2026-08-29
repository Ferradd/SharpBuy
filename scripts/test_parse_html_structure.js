import fs from 'fs';

const profileHtml = fs.readFileSync('scripts/sample_profile_76561199188317738.html', 'utf8');
const gamesHtml = fs.readFileSync('scripts/sample_games_76561199188317738.html', 'utf8');

console.log('=== Profile HTML Analysis ===');
// 1. Total games count
const totalGamesMatch = profileHtml.match(/href="https:\/\/steamcommunity\.com\/profiles\/\d+\/games\/\?tab=all">\s*Games\s*<span class="profile_count_link_total">\s*(\d+)\s*<\/span>/i) ||
                        profileHtml.match(/class="profile_count_link_total">\s*(\d+)\s*<\/span>/i);
console.log('Total Games Count:', totalGamesMatch ? totalGamesMatch[1] : 'None');

// 2. Recent games blocks: <div class="recent_game"> ...
const recentGameBlocks = profileHtml.split('<div class="recent_game">').slice(1);
console.log('Recent Game Blocks Count:', recentGameBlocks.length);

for (let i = 0; i < recentGameBlocks.length; i++) {
  const block = recentGameBlocks[i].split('<div class="recent_game">')[0];
  const nameMatch = block.match(/class="game_name">\s*<a[^>]*>([^<]+)<\/a>/i);
  const appidMatch = block.match(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/i) || block.match(/app\/(\d+)/i);
  const hoursMatch = block.match(/([0-9.,]+)\s*hrs on record/i);

  console.log(`Game #${i + 1}:`, {
    name: nameMatch ? nameMatch[1].trim() : 'Unknown',
    appid: appidMatch ? appidMatch[1] : null,
    hours: hoursMatch ? parseFloat(hoursMatch[1].replace(/,/g, '')) : 0
  });
}

console.log('\n=== Games HTML Analysis ===');
const appLinks = [...gamesHtml.matchAll(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/g)].map(m => m[1]);
console.log('App links in games HTML:', [...new Set(appLinks)]);

// Let's check any game name classes or rows
const gameRows = [...gamesHtml.matchAll(/class="gameListRowItemName[^>]*>([^<]+)</g)].map(m => m[1].trim());
console.log('gameListRowItemName:', gameRows);
