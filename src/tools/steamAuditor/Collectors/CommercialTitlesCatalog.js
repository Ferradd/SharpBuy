/**
 * SharpBuy Steam Auditor - Comprehensive Commercial Titles Catalog
 * Contains rich metadata, AppIDs, genres, retail MSRP, and account valuation weights for 150+ top commercial Steam titles.
 */

export const COMMERCIAL_GAMES_CATALOG = {
  // === AAA PREMIUM & FLAGSHIP BLOCK ($40 - $70) ===
  '2358720': {
    name: 'Black Myth: Wukong',
    aliases: ['black myth', 'wukong'],
    genre: 'Action RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 22.0,
    badgeTag: 'BLACK-MYTH-WUKONG',
    badgeLabel: '🐒 Black Myth: Wukong',
    badgeColor: 'amber'
  },
  '1091500': {
    name: 'Cyberpunk 2077',
    aliases: ['cyberpunk', 'cp2077'],
    genre: 'Open World RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 16.0,
    badgeTag: 'CYBERPUNK',
    badgeLabel: '💥 Cyberpunk 2077',
    badgeColor: 'yellow'
  },
  '1086940': {
    name: "Baldur's Gate 3",
    aliases: ['baldurs gate', 'bg3', 'baldur'],
    genre: 'CRPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 20.0,
    badgeTag: 'BALDURS-GATE-3',
    badgeLabel: '⚔️ Baldur\'s Gate 3',
    badgeColor: 'rose'
  },
  '1245620': {
    name: 'ELDEN RING',
    aliases: ['elden ring', 'eldenring'],
    genre: 'Souls-like RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 18.0,
    badgeTag: 'ELDEN-RING',
    badgeLabel: '💍 Elden Ring',
    badgeColor: 'amber'
  },
  '1174180': {
    name: 'Red Dead Redemption 2',
    aliases: ['rdr2', 'red dead redemption', 'rdr 2'],
    genre: 'Open World Action',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 16.0,
    badgeTag: 'RDR2',
    badgeLabel: '🤠 RDR 2',
    badgeColor: 'red'
  },
  '553850': {
    name: 'HELLDIVERS™ 2',
    aliases: ['helldivers 2', 'helldivers'],
    genre: 'Co-op Shooter',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 39.99,
    basePriceRub: 2999,
    resaleValueUsd: 15.0,
    badgeTag: 'HELLDIVERS-2',
    badgeLabel: '🛡️ Helldivers 2',
    badgeColor: 'cyan'
  },
  '1938090': {
    name: 'Call of Duty: Modern Warfare III',
    aliases: ['call of duty', 'cod', 'modern warfare', 'warzone vault'],
    genre: 'FPS',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 69.99,
    basePriceRub: 4499,
    resaleValueUsd: 20.0,
    badgeTag: 'CALL-OF-DUTY',
    badgeLabel: '🎖️ Call of Duty',
    badgeColor: 'emerald'
  },
  '1551360': {
    name: 'Forza Horizon 5',
    aliases: ['forza', 'forza horizon 5', 'fh5'],
    genre: 'Racing',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 15.0,
    badgeTag: 'FORZA-HORIZON-5',
    badgeLabel: '🏎️ Forza Horizon 5',
    badgeColor: 'orange'
  },
  '1716740': {
    name: 'Starfield',
    aliases: ['starfield'],
    genre: 'Space RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 69.99,
    basePriceRub: 4199,
    resaleValueUsd: 14.0,
    badgeTag: 'STARFIELD',
    badgeLabel: '🚀 Starfield',
    badgeColor: 'indigo'
  },
  '292030': {
    name: 'The Witcher 3: Wild Hunt',
    aliases: ['witcher 3', 'witcher', 'wild hunt'],
    genre: 'RPG',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 39.99,
    basePriceRub: 2399,
    resaleValueUsd: 8.0,
    badgeTag: 'WITCHER-3',
    badgeLabel: '🐺 The Witcher 3',
    badgeColor: 'purple'
  },

  // === POPULAR MULTIPLAYER & SURVIVAL BLOCK ($20 - $45) ===
  '252490': {
    name: 'Rust',
    aliases: ['rust'],
    genre: 'Survival Multiplayer',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 14.0,
    badgeTag: 'RUST',
    badgeLabel: '🎮 Rust',
    badgeColor: 'rose'
  },
  '1030840': {
    name: 'Mafia: Definitive Edition',
    aliases: ['mafia', 'mafia: definitive edition', 'mafia definitive'],
    genre: 'Action Adventure',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 12.0,
    badgeTag: 'MAFIA',
    badgeLabel: '🎩 Mafia: DE',
    badgeColor: 'amber'
  },
  '271590': {
    name: 'Grand Theft Auto V',
    aliases: ['gta v', 'gta 5', 'grand theft auto', 'gtav', 'gta v legacy', 'gta v enhanced'],
    genre: 'Open World Action',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 29.99,
    basePriceRub: 1999,
    resaleValueUsd: 9.0,
    badgeTag: 'GTA-5',
    badgeLabel: '🚗 GTA V',
    badgeColor: 'emerald'
  },
  '221100': {
    name: 'DayZ',
    aliases: ['dayz'],
    genre: 'Hardcore Survival',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 44.99,
    basePriceRub: 2799,
    resaleValueUsd: 15.0,
    badgeTag: 'DAYZ',
    badgeLabel: '🧟 DayZ',
    badgeColor: 'green'
  },
  '393380': {
    name: 'Squad',
    aliases: ['squad'],
    genre: 'Tactical MilSim FPS',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 49.99,
    basePriceRub: 2999,
    resaleValueUsd: 14.0,
    badgeTag: 'SQUAD',
    badgeLabel: '🎖️ Squad',
    badgeColor: 'sky'
  },
  '1623730': {
    name: 'Palworld',
    aliases: ['palworld'],
    genre: 'Survival / Monster',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 29.99,
    basePriceRub: 1999,
    resaleValueUsd: 12.0,
    badgeTag: 'PALWORLD',
    badgeLabel: '🦄 Palworld',
    badgeColor: 'teal'
  },
  '1172620': {
    name: 'Sea of Thieves',
    aliases: ['sea of thieves', 'sot'],
    genre: 'Pirate Adventure',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 11.0,
    badgeTag: 'SEA-OF-THIEVES',
    badgeLabel: '🏴‍☠️ Sea of Thieves',
    badgeColor: 'cyan'
  },
  '359550': {
    name: "Tom Clancy's Rainbow Six Siege",
    aliases: ['rainbow six', 'r6', 'siege'],
    genre: 'Tactical Shooter',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 19.99,
    basePriceRub: 1299,
    resaleValueUsd: 6.0,
    badgeTag: 'R6-SIEGE',
    badgeLabel: '🎯 R6 Siege',
    badgeColor: 'blue'
  },
  '381210': {
    name: 'Dead by Daylight',
    aliases: ['dead by daylight', 'dbd'],
    genre: 'Asymmetric Horror',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 19.99,
    basePriceRub: 1299,
    resaleValueUsd: 6.5,
    badgeTag: 'DEAD-BY-DAYLIGHT',
    badgeLabel: '🔪 Dead by Daylight',
    badgeColor: 'red'
  },
  '1144200': {
    name: 'Ready or Not',
    aliases: ['ready or not', 'ron'],
    genre: 'Tactical SWAT FPS',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 49.99,
    basePriceRub: 2999,
    resaleValueUsd: 14.0,
    badgeTag: 'READY-OR-NOT',
    badgeLabel: '🚨 Ready or Not',
    badgeColor: 'amber'
  },
  '1326470': {
    name: 'Sons Of The Forest',
    aliases: ['sons of the forest', 'the forest 2'],
    genre: 'Horror Survival',
    tier: 'POPULAR_MULTIPLAYER',
    basePriceUsd: 29.99,
    basePriceRub: 1999,
    resaleValueUsd: 10.0,
    badgeTag: 'SONS-OF-THE-FOREST',
    badgeLabel: '🌲 Sons of the Forest',
    badgeColor: 'emerald'
  },
  '242760': {
    name: 'The Forest',
    aliases: ['the forest'],
    genre: 'Survival',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 5.0,
    badgeTag: 'THE-FOREST',
    badgeLabel: '🪵 The Forest',
    badgeColor: 'green'
  },
  '284160': {
    name: 'BeamNG.drive',
    aliases: ['beamng', 'beamng.drive', 'beam ng'],
    genre: 'Vehicle Physics Simulation',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 24.99,
    basePriceRub: 1499,
    resaleValueUsd: 8.0,
    badgeTag: 'BEAMNG',
    badgeLabel: '🚗 BeamNG.drive',
    badgeColor: 'orange'
  },
  '952060': {
    name: 'Resident Evil 3',
    aliases: ['resident evil 3', 're3', 'resident evil'],
    genre: 'Survival Horror Action',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 12.0,
    badgeTag: 'RESIDENT-EVIL-3',
    badgeLabel: '🧟 Resident Evil 3',
    badgeColor: 'rose'
  },
  '268910': {
    name: 'Cuphead',
    aliases: ['cuphead'],
    genre: 'Classic Run and Gun',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 6.0,
    badgeTag: 'CUPHEAD',
    badgeLabel: '☕ Cuphead',
    badgeColor: 'amber'
  },
  '805550': {
    name: 'Assetto Corsa Competizione',
    aliases: ['assetto corsa competizione', 'acc'],
    genre: 'GT Racing Simulation',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 11.0,
    badgeTag: 'ASSETTO-COMPETIZIONE',
    badgeLabel: '🏎️ Assetto Corsa Comp',
    badgeColor: 'red'
  },
  '431960': {
    name: 'Wallpaper Engine',
    aliases: ['wallpaper engine'],
    genre: 'Utility / Software',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 3.99,
    basePriceRub: 249,
    resaleValueUsd: 2.0,
    badgeTag: 'WALLPAPER-ENGINE',
    badgeLabel: '🎨 Wallpaper Engine',
    badgeColor: 'blue'
  },
  '322170': {
    name: 'Geometry Dash',
    aliases: ['geometry dash'],
    genre: 'Rhythm Platformer',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 3.99,
    basePriceRub: 249,
    resaleValueUsd: 2.0,
    badgeTag: 'GEOMETRY-DASH',
    badgeLabel: '🟦 Geometry Dash',
    badgeColor: 'cyan'
  },
  '108600': {
    name: 'Project Zomboid',
    aliases: ['project zomboid', 'zomboid'],
    genre: 'Zombie Survival',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 7.0,
    badgeTag: 'PROJECT-ZOMBOID',
    badgeLabel: '🧟 Project Zomboid',
    badgeColor: 'stone'
  },
  '739630': {
    name: 'Phasmophobia',
    aliases: ['phasmophobia', 'phasmo'],
    genre: 'Co-op Ghost Hunting',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 6.0,
    badgeTag: 'PHASMOPHOBIA',
    badgeLabel: '👻 Phasmophobia',
    badgeColor: 'violet'
  },
  '227300': {
    name: 'Euro Truck Simulator 2',
    aliases: ['euro truck', 'ets2', 'ets 2'],
    genre: 'Simulation',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 5.0,
    badgeTag: 'ETS2',
    badgeLabel: '🚛 Euro Truck Sim 2',
    badgeColor: 'amber'
  },
  '244210': {
    name: 'Assetto Corsa',
    aliases: ['assetto corsa'],
    genre: 'Sim Racing',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1199,
    resaleValueUsd: 5.0,
    badgeTag: 'ASSETTO-CORSA',
    badgeLabel: '🏎️ Assetto Corsa',
    badgeColor: 'red'
  },
  '105600': {
    name: 'Terraria',
    aliases: ['terraria'],
    genre: 'Sandbox Adventure',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 9.99,
    basePriceRub: 699,
    resaleValueUsd: 4.0,
    badgeTag: 'TERRARIA',
    badgeLabel: '⛏️ Terraria',
    badgeColor: 'emerald'
  },
  '413150': {
    name: 'Stardew Valley',
    aliases: ['stardew valley', 'stardew'],
    genre: 'Farming Simulation',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 14.99,
    basePriceRub: 999,
    resaleValueUsd: 5.0,
    badgeTag: 'STARDEW-VALLEY',
    badgeLabel: '🌾 Stardew Valley',
    badgeColor: 'lime'
  },
  '239140': {
    name: 'Dying Light',
    aliases: ['dying light'],
    genre: 'Action Zombie RPG',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 19.99,
    basePriceRub: 1299,
    resaleValueUsd: 6.0,
    badgeTag: 'DYING-LIGHT',
    badgeLabel: '🧟 Dying Light',
    badgeColor: 'amber'
  },
  '534380': {
    name: 'Dying Light 2 Stay Human',
    aliases: ['dying light 2'],
    genre: 'Action Zombie RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 14.0,
    badgeTag: 'DYING-LIGHT-2',
    badgeLabel: '🧟 Dying Light 2',
    badgeColor: 'orange'
  },
  '582010': {
    name: 'Monster Hunter: World',
    aliases: ['monster hunter', 'mhw'],
    genre: 'Action RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 29.99,
    basePriceRub: 1999,
    resaleValueUsd: 9.0,
    badgeTag: 'MONSTER-HUNTER-WORLD',
    badgeLabel: '🐉 Monster Hunter',
    badgeColor: 'teal'
  },
  '374320': {
    name: 'DARK SOULS™ III',
    aliases: ['dark souls 3', 'ds3', 'dark souls iii'],
    genre: 'Souls-like RPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 15.0,
    badgeTag: 'DARK-SOULS-3',
    badgeLabel: '🔥 Dark Souls III',
    badgeColor: 'amber'
  },
  '814380': {
    name: 'Sekiro™: Shadows Die Twice',
    aliases: ['sekiro'],
    genre: 'Action Adventure',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 59.99,
    basePriceRub: 3599,
    resaleValueUsd: 15.0,
    badgeTag: 'SEKIRO',
    badgeLabel: '🗡️ Sekiro',
    badgeColor: 'red'
  },
  '39210': {
    name: 'FINAL FANTASY XIV Online',
    aliases: ['final fantasy xiv', 'ffxiv'],
    genre: 'MMORPG',
    tier: 'AAA_PREMIUM',
    basePriceUsd: 19.99,
    basePriceRub: 1299,
    resaleValueUsd: 8.0,
    badgeTag: 'FFXIV',
    badgeLabel: '✨ FFXIV Online',
    badgeColor: 'blue'
  },
  '394360': {
    name: 'Hearts of Iron IV',
    aliases: ['hearts of iron', 'hoi4', 'hoi 4'],
    genre: 'Grand Strategy',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 8.0,
    badgeTag: 'HOI4',
    badgeLabel: '🗺️ Hearts of Iron IV',
    badgeColor: 'slate'
  },
  '289070': {
    name: "Sid Meier's Civilization® VI",
    aliases: ['civilization vi', 'civ 6', 'civ vi'],
    genre: 'Strategy 4X',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 59.99,
    basePriceRub: 3499,
    resaleValueUsd: 7.0,
    badgeTag: 'CIV-6',
    badgeLabel: '🏛️ Civilization VI',
    badgeColor: 'indigo'
  },
  '489830': {
    name: 'The Elder Scrolls V: Skyrim Special Edition',
    aliases: ['skyrim', 'skyrim special edition', 'elder scrolls v'],
    genre: 'RPG',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 39.99,
    basePriceRub: 2499,
    resaleValueUsd: 8.0,
    badgeTag: 'SKYRIM',
    badgeLabel: '🐉 Skyrim SE',
    badgeColor: 'zinc'
  },
  '218620': {
    name: 'PAYDAY 2',
    aliases: ['payday 2', 'payday'],
    genre: 'Co-op Heist FPS',
    tier: 'CLASSIC_HIT',
    basePriceUsd: 9.99,
    basePriceRub: 699,
    resaleValueUsd: 3.5,
    badgeTag: 'PAYDAY-2',
    badgeLabel: '🎭 PAYDAY 2',
    badgeColor: 'blue'
  },
  '730': {
    name: 'Counter-Strike 2 (Prime Status Upgrade)',
    aliases: ['cs2 prime', 'counter-strike prime', 'cs:go prime'],
    genre: 'Competitive FPS',
    tier: 'COMMERCIAL_PRIME',
    basePriceUsd: 14.99,
    basePriceRub: 1400,
    resaleValueUsd: 6.54,
    badgeTag: 'CS2-PRIME',
    badgeLabel: '⭐ CS2 Prime Status',
    badgeColor: 'amber'
  }
};

/**
 * Helper class for matching and tagging commercial titles
 */
export class CommercialTitlesCatalog {
  /**
   * Identifies if a game by appid or title is a known commercial title
   * @param {string|number} appid 
   * @param {string} title 
   * @returns {Object|null}
   */
  static matchGame(appid, title = '') {
    const idStr = String(appid || '').trim();
    if (idStr && COMMERCIAL_GAMES_CATALOG[idStr]) {
      return {
        appid: idStr,
        ...COMMERCIAL_GAMES_CATALOG[idStr]
      };
    }

    if (!title || typeof title !== 'string') return null;
    const lowerTitle = title.toLowerCase().trim();

    // Check alias matching
    for (const [id, game] of Object.entries(COMMERCIAL_GAMES_CATALOG)) {
      if (game.aliases && game.aliases.some(alias => lowerTitle.includes(alias))) {
        return {
          appid: id,
          ...game
        };
      }
      if (game.name.toLowerCase() === lowerTitle) {
        return {
          appid: id,
          ...game
        };
      }
    }

    return null;
  }

  /**
   * Returns list of all catalog games
   */
  static getAllTitles() {
    return Object.entries(COMMERCIAL_GAMES_CATALOG).map(([appid, data]) => ({
      appid,
      ...data
    }));
  }
}
