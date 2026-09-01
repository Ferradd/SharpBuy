#!/usr/bin/env python3
"""
LZT Smart Analyzer — SQLite Database Manager
Handles fast caching, batch insertion, updating, and instant searching across 500,000+ market listings.
"""

import sqlite3
import json
import os
import time
import datetime
from typing import List, Dict, Any, Tuple, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "market_cache.db")

def format_timestamp_ru(ts: Optional[float]) -> str:
    if not ts or ts <= 0:
        return "Неизвестно"
    try:
        dt = datetime.datetime.fromtimestamp(float(ts), tz=datetime.timezone.utc)
        months_ru = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        return f"{dt.day} {months_ru[dt.month - 1]} {dt.year} г."
    except Exception:
        return ""

def calculate_potential_level_int(current_level: Any, points: Any) -> int:
    try:
        cur_lvl = int(current_level or 0)
        pts = int(points or 0)
        if pts <= 0:
            return cur_lvl
        tens = cur_lvl // 10
        rem = cur_lvl % 10
        cur_xp = 500 * tens * (tens + 1) + rem * 100 * (tens + 1)
        points_xp = (pts // 1000) * 100
        total_xp = cur_xp + points_xp
        lvl = 0
        while True:
            t = lvl // 10
            c = 100 * (t + 1)
            if total_xp >= c:
                total_xp -= c
                lvl += 1
            else:
                break
        return lvl
    except Exception:
        return 0

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.execute("PRAGMA busy_timeout=30000;")
    conn.create_function("calc_potential_level", 2, calculate_potential_level_int)
    conn.row_factory = sqlite3.Row
    return conn

GAME_VALUE_MAP = {
    "counter-strike 2": 1400, "cs2": 1400, "csgo": 1400, "cs 2": 1400,
    "rust": 1100, "раст": 1100,
    "dayz": 1500, "дейз": 1500,
    "grand theft auto v": 1200, "gta v": 1200, "gta 5": 1200, "гта": 1200,
    "red dead redemption 2": 2000, "rdr 2": 2000, "rdr2": 2000,
    "cyberpunk 2077": 2000,
    "forza horizon 5": 2000, "forza": 2000,
    "arma 3": 1200, "арма": 1200,
    "dying light": 700,
    "project zomboid": 600,
    "terraria": 385,
    "phasmophobia": 500,
    "the witcher 3: wild hunt": 1200, "witcher 3": 1200, "ведьмак 3": 1200,
    "garry's mod": 450,
    "dead by daylight": 800
}

FREE_GAMES_SET = {
    "dota 2", "дота", "team fortress 2", "tf2", "pubg", "пабг", "apex legends", "apex",
    "warframe", "destiny 2", "unturned", "brawlhalla", "lost ark", "roblox",
    "counter-strike 2", "cs2"
}

def calculate_estimated_value(cs2_prime: int, games_list: List[str], steam_level: int, steam_points: int) -> float:
    total_val = 0.0
    if cs2_prime:
        total_val += 1400.0
    
    processed = set()
    if cs2_prime:
        processed.update(["cs2", "csgo", "counter-strike 2", "cs 2"])
        
    for g in games_list:
        norm = g.lower().strip()
        if norm in processed or "counter-strike" in norm or norm in FREE_GAMES_SET:
            continue
        processed.add(norm)
        if norm in GAME_VALUE_MAP:
            total_val += GAME_VALUE_MAP[norm]
        else:
            total_val += 400.0  # default fallback value for paid game
            
    total_val += (steam_points * 0.05)
    total_val += (steam_level * 15.0)
    return round(total_val, 2)

def init_db():
    """Initializes the database schema, WAL mode, and indexes."""
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                item_id INTEGER PRIMARY KEY,
                title TEXT,
                price REAL DEFAULT 0,
                seller_name TEXT DEFAULT '',
                seller_id INTEGER DEFAULT 0,
                cs2_prime INTEGER DEFAULT 0,
                steam_level INTEGER DEFAULT 0,
                steam_points INTEGER DEFAULT 0,
                daybreak INTEGER DEFAULT 0,
                hours_2weeks REAL DEFAULT 0,
                total_cs2_hours REAL DEFAULT 0,
                extra_games_json TEXT DEFAULT '[]',
                guarantee_hours INTEGER DEFAULT 0,
                deal_score INTEGER DEFAULT 0,
                estimated_value REAL DEFAULT 0,
                value_ratio REAL DEFAULT 0,
                email_type TEXT DEFAULT '',
                email_provider TEXT DEFAULT '',
                item_domain TEXT DEFAULT '',
                category TEXT DEFAULT 'steam',
                raw_json TEXT DEFAULT '{}',
                updated_at INTEGER DEFAULT 0
            )
        """)

        # Schema migrations check
        cursor.execute("PRAGMA table_info(accounts)")
        columns = [col[1] for col in cursor.fetchall()]
        if "estimated_value" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN estimated_value REAL DEFAULT 0")
        if "value_ratio" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN value_ratio REAL DEFAULT 0")
        if "email_type" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN email_type TEXT DEFAULT ''")
        if "email_provider" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN email_provider TEXT DEFAULT ''")
        if "item_domain" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN item_domain TEXT DEFAULT ''")
        if "item_origin" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN item_origin TEXT DEFAULT ''")
        if "item_origin_phrase" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN item_origin_phrase TEXT DEFAULT ''")
        if "resale_item_origin" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN resale_item_origin TEXT DEFAULT ''")
        if "is_origin_reliable" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN is_origin_reliable INTEGER DEFAULT 0")
        if "is_personal_account" not in columns:
            cursor.execute("ALTER TABLE accounts ADD COLUMN is_personal_account INTEGER DEFAULT 0")

        # Performance Indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_steam_level ON accounts (steam_level DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_steam_points ON accounts (steam_points DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_price ON accounts (price ASC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_deal_score ON accounts (deal_score DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_value_ratio ON accounts (value_ratio DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_estimated_value ON accounts (estimated_value DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_hours_2weeks ON accounts (hours_2weeks ASC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_daybreak ON accounts (daybreak DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_type ON accounts (email_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_provider ON accounts (email_provider)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_item_origin ON accounts (item_origin)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_resale_item_origin ON accounts (resale_item_origin)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_updated_at ON accounts (updated_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON accounts (category)")

        conn.commit()
    finally:
        conn.close()

# Auto initialize DB
try:
    init_db()
except Exception as e:
    print(f"[!] Warning: init_db notice: {e}")

def is_item_banned(raw: Dict[str, Any], title: str) -> bool:
    if raw.get("vac_ban") in (1, True) or raw.get("steam_vac_ban") in (1, True) or raw.get("has_vac") in (1, True) or raw.get("hasCs2VacBan") in (1, True):
        return True
    if raw.get("steam_community_ban") in (1, True) or raw.get("community_ban") in (1, True) or raw.get("has_community_ban") in (1, True):
        return True
    
    title_lower = (title or "").lower()
    ban_keywords = ["vac", "вак", "ban", "бан", "кт", "комьюнити бан", "community ban", "ножно", "блокировк"]
    for kw in ban_keywords:
        if kw in title_lower:
            return True
    return False

def calculate_deal_score(item: Dict[str, Any], raw: Optional[Dict[str, Any]] = None) -> int:
    """Calculates Deal Score (0-100) based on price, risk, origin, inactivity, points, value ratio and features."""
    title = item.get("title", "")
    raw_dict = raw or {}
    if is_item_banned(raw_dict, title):
        return 1

    score = 50
    price = item.get("price", 700)
    
    if price <= 500: score += 18
    elif price <= 750: score += 12
    elif price <= 1100: score += 5
    elif price > 2500: score -= 10

    daybreak = item.get("daybreak", 0)
    if daybreak >= 90: score += 25
    elif daybreak >= 30: score += 18
    elif daybreak >= 14: score += 10
    elif daybreak >= 7: score += 4
    else: score -= 12

    # Origin & Recovery Risk weighting
    origin = str(item.get("item_origin") or raw_dict.get("item_origin") or "").lower()
    resale_origin = str(item.get("resale_item_origin") or raw_dict.get("resale_item_origin") or "").lower()
    is_personal = bool(item.get("is_personal_account") or raw_dict.get("isPersonalAccount") or origin == "personal" or "личный" in title.lower())
    
    is_phishing = (origin == "fishing" or resale_origin == "fishing" or "фишинг" in title.lower() or "phishing" in str(raw_dict.get("itemOriginPhrase", "")).lower())
    is_stealer = (origin == "stealer" or resale_origin == "stealer" or "стиллер" in title.lower() or "stealer" in str(raw_dict.get("itemOriginPhrase", "")).lower())

    if is_personal:
        score += 15  # Personal accounts are lowest recovery risk
    elif is_phishing:
        # Phishing accounts have very fast recovery rate unless holding high daybreak
        if daybreak < 14:
            score -= 22
        elif daybreak < 30:
            score -= 14
        elif daybreak < 60:
            score -= 6
    elif is_stealer:
        if daybreak < 14:
            score -= 12
        elif daybreak < 30:
            score -= 6

    level = item.get("steam_level", 0)
    if level >= 100: score += 15
    elif level >= 50: score += 10
    elif level >= 20: score += 5

    points = item.get("steam_points", 0)
    if points >= 50000: score += 15
    elif points >= 10000: score += 8

    value_ratio = item.get("value_ratio", 1.0)
    if value_ratio >= 10.0: score += 25
    elif value_ratio >= 5.0: score += 15
    elif value_ratio >= 2.0: score += 8

    recent_hours = item.get("hours_2weeks", 0)
    if recent_hours == 0: score += 10
    elif recent_hours < 5: score += 5
    elif recent_hours > 20: score -= 15

    guarantee = item.get("guarantee_hours", 0)
    if guarantee >= 24: score += 10
    elif guarantee >= 12: score += 5

    return max(1, min(100, score))

def calculate_xp_for_level(level: int) -> int:
    """Returns total XP required to reach a specific Steam level."""
    if level <= 0:
        return 0
    tens = level // 10
    rem = level % 10
    base_xp = 500 * tens * (tens + 1)
    extra_xp = rem * 100 * (tens + 1)
    return base_xp + extra_xp

def calculate_level_from_xp(total_xp: int) -> int:
    """Calculates Steam level from total XP."""
    if total_xp <= 0:
        return 0
    lvl = 0
    while True:
        tens = lvl // 10
        cost_for_next = 100 * (tens + 1)
        if total_xp >= cost_for_next:
            total_xp -= cost_for_next
            lvl += 1
        else:
            break
    return lvl

def calculate_potential_level(current_level: int, points: int) -> Tuple[int, int]:
    """
    Returns (potential_level, added_levels) if all Steam Points are spent
    on Points Shop Seasonal Badges (1,000 pts = 100 XP = 1 badge level).
    """
    if points <= 0:
        return current_level, 0
    current_xp = calculate_xp_for_level(current_level)
    points_xp = (points // 1000) * 100
    total_xp = current_xp + points_xp
    pot_level = calculate_level_from_xp(total_xp)
    return pot_level, max(0, pot_level - current_level)

def check_is_cs2_prime(raw: Dict[str, Any], title: str = "") -> bool:
    title_lower = (title or raw.get("title") or "").lower()
    
    non_prime_keywords = ["no prime", "no-prime", "noprime", "non prime", "non-prime", "без прайм", "без prime", "no cs2 prime", "free cs2"]
    for kw in non_prime_keywords:
        if kw in title_lower:
            return False
            
    bans_str = str(raw.get("steam_bans_string") or "")
    if "Free CS2" in bans_str or "No Prime" in bans_str:
        return False

    bans_arr = raw.get("steam_bans_array") or []
    if isinstance(bans_arr, list) and 7301 in bans_arr:
        return False
        
    bans_dict = raw.get("steam_bans") or {}
    if isinstance(bans_dict, dict) and ("7301" in bans_dict or 7301 in bans_dict):
        return False

    if raw.get("cs2_prime") in (1, True): return True
    if "CS2 Prime" in bans_str or "CS:GO Prime" in bans_str: return True
    if isinstance(bans_arr, list) and 730 in bans_arr: return True
    if isinstance(bans_dict, dict) and ("730" in bans_dict or 730 in bans_dict): return True

    if "cs2 prime" in title_lower or "csgo prime" in title_lower or "cs:go prime" in title_lower or "cs prime" in title_lower or "кс2 прайм" in title_lower or "кс прайм" in title_lower:
        return True

    if "prime" in title_lower or "прайм" in title_lower:
        if "cs" in title_lower or "counter" in title_lower or "кс" in title_lower:
            return True

    return False

def parse_item_to_row(raw: Dict[str, Any], category: str = "steam") -> Tuple:
    """Parses raw API listing into database tuple."""
    item_id = raw.get("item_id")
    title = raw.get("title", "Steam Account")
    price = float(raw.get("rub_price") or raw.get("price") or 0)
    
    seller = raw.get("seller", {})
    seller_name = seller.get("username", "Seller") if isinstance(seller, dict) else "Seller"
    seller_id = seller.get("user_id", 0) if isinstance(seller, dict) else 0

    is_prime = check_is_cs2_prime(raw, title)
    cs2_prime = 1 if is_prime else 0
    
    steam_level = int(raw.get("steam_level") or raw.get("level") or raw.get("steamLevel") or 0)
    steam_points = int(raw.get("steam_points") or raw.get("points") or 0)
    
    daybreak = int(raw.get("daybreak") or 0)
    if not daybreak and raw.get("account_last_activity"):
        try:
            diff = time.time() - float(raw["account_last_activity"])
            daybreak = max(0, int(diff // 86400))
        except Exception:
            pass

def extract_games_from_raw(raw: Dict[str, Any]) -> List[str]:
    """Extracts all full games from raw LZT account dict (supports dict/list steam_full_games, steam_games, etc)."""
    games_list = []
    seen = set()

    def add_game(g_name):
        if not g_name: return
        cleaned = str(g_name).strip()
        if not cleaned: return
        norm = cleaned.lower()
        if norm not in seen:
            seen.add(norm)
            games_list.append(cleaned)

    # 1. steam_full_games (LZT Market format: {'list': {'<appid>': {'title': '...', 'name': '...'}}})
    sfg = raw.get("steam_full_games")
    if isinstance(sfg, dict):
        lst = sfg.get("list", {})
        if isinstance(lst, dict):
            for g_id, g_info in lst.items():
                if isinstance(g_info, dict):
                    add_game(g_info.get("title") or g_info.get("name") or g_info.get("abbr"))
                elif isinstance(g_info, str):
                    add_game(g_info)
        elif isinstance(lst, list):
            for g_info in lst:
                if isinstance(g_info, dict):
                    add_game(g_info.get("title") or g_info.get("name") or g_info.get("abbr"))
                elif isinstance(g_info, str):
                    add_game(g_info)
    elif isinstance(sfg, list):
        for g_info in sfg:
            if isinstance(g_info, dict):
                add_game(g_info.get("title") or g_info.get("name") or g_info.get("abbr"))
            elif isinstance(g_info, str):
                add_game(g_info)

    # 2. raw.get("games") or raw.get("steam_games")
    for key in ("games", "steam_games", "steam_all_games"):
        val = raw.get(key)
        if isinstance(val, list):
            for g in val:
                if isinstance(g, dict):
                    add_game(g.get("title") or g.get("name") or g.get("abbr"))
                elif isinstance(g, str):
                    add_game(g)
        elif isinstance(val, dict):
            for g in val.values():
                if isinstance(g, dict):
                    add_game(g.get("title") or g.get("name") or g.get("abbr"))
                elif isinstance(g, str):
                    add_game(g)

    # 3. Known flags
    if raw.get("hasRust"): add_game("Rust")
    if raw.get("hasDota2"): add_game("Dota 2")
    if raw.get("hasPubg"): add_game("PUBG")
    if raw.get("hasCs2Prime") or raw.get("cs2_prime"): add_game("Counter-Strike 2")

    return games_list

def parse_item_to_row(raw: Dict[str, Any], category: str = "steam") -> Tuple:
    """Parses raw API listing into database tuple."""
    item_id = raw.get("item_id")
    title = raw.get("title", "Steam Account")
    price = float(raw.get("rub_price") or raw.get("price") or 0)
    
    seller = raw.get("seller", {})
    seller_name = seller.get("username", "Seller") if isinstance(seller, dict) else "Seller"
    seller_id = seller.get("user_id", 0) if isinstance(seller, dict) else 0

    is_prime = check_is_cs2_prime(raw, title)
    cs2_prime = 1 if is_prime else 0
    
    steam_level = int(raw.get("steam_level") or raw.get("level") or raw.get("steamLevel") or 0)
    steam_points = int(raw.get("steam_points") or raw.get("points") or 0)
    
    daybreak = int(raw.get("daybreak") or 0)
    if not daybreak and raw.get("account_last_activity"):
        try:
            diff = time.time() - float(raw["account_last_activity"])
            daybreak = max(0, int(diff // 86400))
        except Exception:
            pass

    hours_2weeks = float(raw.get("steam_hours_played_recently") or raw.get("hours_2weeks") or 0)
    total_cs2_hours = float(raw.get("hours_cs2") or raw.get("cs2_hours") or 0)
    guarantee_hours = int(raw.get("guarantee_hours", 0))

    # Extract all games from full game libraries
    games_list = extract_games_from_raw(raw)
    games_json = json.dumps(games_list)

    # Extract Origin & Reliability
    item_origin = str(raw.get("item_origin") or "").strip().lower()
    item_origin_phrase = str(raw.get("itemOriginPhrase") or "").strip()
    resale_item_origin = str(raw.get("resale_item_origin") or "").strip().lower()
    is_origin_reliable = 1 if (raw.get("is_origin_reliable") in (1, True) or raw.get("isOriginReliable") in (1, True)) else 0
    is_personal_account = 1 if (raw.get("isPersonalAccount") in (1, True) or item_origin == "personal" or "личный" in title.lower()) else 0

    # Extract email characteristics accurately
    raw_et = str(raw.get("email_type") or "").strip().lower()
    raw_ep = str(raw.get("email_provider") or "").strip().lower()
    raw_dom = str(raw.get("item_domain") or "").strip().lower()
    title_lower = (title or "").lower()

    email_type = raw_et
    if not email_type:
        if raw.get("canViewTempEmail") or "temp" in item_origin or "времен" in title_lower:
            email_type = "temp"
        elif raw_ep in ("firstmail", "rambler", "notletters") or item_origin == "autoreg" or "авторег" in title_lower or "autoreg" in title_lower:
            email_type = "autoreg"
        elif "родн" in title_lower or "native" in title_lower or raw.get("is_native_email") in (1, True):
            email_type = "native"
        elif item_origin in ("fishing", "stealer", "brute", "resale"):
            email_type = "temp" if raw.get("canViewTempEmail", True) else "no"
        else:
            email_type = "no"

    email_provider = raw_ep
    item_domain = raw_dom

    estimated_val = calculate_estimated_value(cs2_prime, games_list, steam_level, steam_points)
    eff_price = max(price, 1.0)
    value_ratio = round(estimated_val / eff_price, 2)

    temp_dict = {
        "title": title,
        "price": price,
        "daybreak": daybreak,
        "steam_level": steam_level,
        "steam_points": steam_points,
        "hours_2weeks": hours_2weeks,
        "guarantee_hours": guarantee_hours,
        "value_ratio": value_ratio,
        "item_origin": item_origin,
        "resale_item_origin": resale_item_origin,
        "is_personal_account": is_personal_account
    }
    deal_score = calculate_deal_score(temp_dict, raw)
    updated_at = int(time.time())
    raw_json = json.dumps(raw)

    return (
        item_id, title, price, seller_name, seller_id, cs2_prime,
        steam_level, steam_points, daybreak, hours_2weeks, total_cs2_hours,
        games_json, guarantee_hours, deal_score, estimated_val, value_ratio,
        email_type, email_provider, item_domain, category, raw_json, updated_at,
        item_origin, item_origin_phrase, resale_item_origin, is_origin_reliable, is_personal_account
    )

def parse_raw_account(raw: Dict[str, Any], category: str = "steam") -> Dict[str, Any]:
    """Parses raw API listing into frontend format dictionary."""
    row = parse_item_to_row(raw, category)
    s_lvl = row[6]
    s_pts = row[7]
    pot_lvl, added_lvls = calculate_potential_level(s_lvl, s_pts)

    last_act_ts = raw.get("account_last_activity") or raw.get("last_activity")
    if not last_act_ts and row[8]:
        last_act_ts = time.time() - (row[8] * 86400)
    last_act_str = format_timestamp_ru(last_act_ts)

    reg_ts = raw.get("register_date") or raw.get("registration_date") or raw.get("steam_registration_date")
    reg_str = format_timestamp_ru(reg_ts)

    has_vac = is_item_banned(raw, row[1])
    has_trade_ban = bool(raw.get("steam_trade_ban") or raw.get("trade_ban") or 0)
    has_community_ban = bool(raw.get("steam_community_ban") or raw.get("community_ban") or 0)

    steam_country = str(raw.get("steam_country") or raw.get("country") or "").upper()
    steam_currency = str(raw.get("steam_currency") or raw.get("price_currency") or "RUB").upper()

    return {
        "item_id": row[0],
        "title": row[1],
        "price": row[2],
        "seller_name": row[3],
        "seller_id": row[4],
        "cs2_prime": bool(row[5]),
        "steam_level": s_lvl,
        "steam_points": s_pts,
        "potential_level": pot_lvl,
        "added_levels": added_lvls,
        "daybreak": row[8],
        "hours_2weeks": row[9],
        "total_cs2_hours": row[10],
        "extra_games": json.loads(row[11] or "[]"),
        "guarantee_hours": row[12],
        "deal_score": row[13],
        "estimated_value": row[14],
        "value_ratio": row[15],
        "email_type": row[16],
        "email_provider": row[17],
        "item_domain": row[18],
        "category": row[19],
        "item_origin": row[22] if len(row) > 22 else raw.get("item_origin", ""),
        "item_origin_phrase": row[23] if len(row) > 23 else raw.get("itemOriginPhrase", ""),
        "resale_item_origin": row[24] if len(row) > 24 else raw.get("resale_item_origin", ""),
        "is_origin_reliable": bool(row[25] if len(row) > 25 else raw.get("is_origin_reliable")),
        "is_personal_account": bool(row[26] if len(row) > 26 else raw.get("isPersonalAccount")),
        "updated_at": row[21],
        "last_activity_ts": int(last_act_ts) if last_act_ts else 0,
        "last_activity_str": last_act_str,
        "register_date_ts": int(reg_ts) if reg_ts else 0,
        "register_date_str": reg_str,
        "has_vac": has_vac,
        "has_trade_ban": has_trade_ban,
        "has_community_ban": has_community_ban,
        "steam_country": steam_country,
        "steam_currency": steam_currency
    }

def upsert_accounts_batch(items: List[Dict[str, Any]], category: str = "steam") -> int:
    """Inserts or updates a batch of market listings into SQLite."""
    if not items:
        return 0

    rows = []
    for item in items:
        if item.get("item_id"):
            rows.append(parse_item_to_row(item, category))

    if not rows:
        return 0

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.executemany("""
            INSERT INTO accounts (
                item_id, title, price, seller_name, seller_id, cs2_prime,
                steam_level, steam_points, daybreak, hours_2weeks, total_cs2_hours,
                extra_games_json, guarantee_hours, deal_score, estimated_value, value_ratio,
                email_type, email_provider, item_domain, category, raw_json, updated_at,
                item_origin, item_origin_phrase, resale_item_origin, is_origin_reliable, is_personal_account
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(item_id) DO UPDATE SET
                title=excluded.title,
                price=excluded.price,
                seller_name=excluded.seller_name,
                seller_id=excluded.seller_id,
                cs2_prime=excluded.cs2_prime,
                steam_level=excluded.steam_level,
                steam_points=excluded.steam_points,
                daybreak=excluded.daybreak,
                hours_2weeks=excluded.hours_2weeks,
                total_cs2_hours=excluded.total_cs2_hours,
                extra_games_json=excluded.extra_games_json,
                guarantee_hours=excluded.guarantee_hours,
                deal_score=excluded.deal_score,
                estimated_value=excluded.estimated_value,
                value_ratio=excluded.value_ratio,
                email_type=excluded.email_type,
                email_provider=excluded.email_provider,
                item_domain=excluded.item_domain,
                category=excluded.category,
                raw_json=excluded.raw_json,
                updated_at=excluded.updated_at,
                item_origin=excluded.item_origin,
                item_origin_phrase=excluded.item_origin_phrase,
                resale_item_origin=excluded.resale_item_origin,
                is_origin_reliable=excluded.is_origin_reliable,
                is_personal_account=excluded.is_personal_account
        """, rows)
        conn.commit()
    return len(rows)

def get_cached_count() -> int:
    """Returns total count of cached listings."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM accounts")
        row = cursor.fetchone()
        return row[0] if row else 0

def build_game_sql_clause(game_name: str) -> Tuple[str, List[Any]]:
    """Builds robust SQL conditions for matching games."""
    if not game_name or not game_name.strip():
        return ("1=1", [])

    gf_lower = game_name.strip().lower()

    if gf_lower in ("any", "*", "все", "все игры", "all"):
        return ("1=1", [])

    if "cs" in gf_lower or "counter" in gf_lower or "strike" in gf_lower:
        return ("(cs2_prime = 1 OR total_cs2_hours > 0 OR extra_games_json LIKE '%cs%' OR extra_games_json LIKE '%counter-strike%' OR title LIKE '%cs%' OR title LIKE '%counter-strike%')", [])
    elif "gta" in gf_lower or "grand theft auto" in gf_lower:
        return ("(extra_games_json LIKE '%gta%' OR extra_games_json LIKE '%grand theft auto%' OR title LIKE '%gta%' OR title LIKE '%гта%')", [])
    elif "rust" in gf_lower or "раст" in gf_lower:
        return ("(extra_games_json LIKE '%rust%' OR title LIKE '%rust%' OR title LIKE '%раст%')", [])
    elif "dota" in gf_lower or "дота" in gf_lower:
        return ("(extra_games_json LIKE '%dota%' OR title LIKE '%dota%' OR title LIKE '%дота%')", [])
    elif "pubg" in gf_lower or "пабг" in gf_lower:
        return ("(extra_games_json LIKE '%pubg%' OR title LIKE '%pubg%' OR title LIKE '%пабг%')", [])
    elif "dayz" in gf_lower or "дейз" in gf_lower:
        return ("(extra_games_json LIKE '%dayz%' OR title LIKE '%dayz%' OR title LIKE '%дейз%')", [])
    elif "rdr" in gf_lower or "red dead" in gf_lower:
        return ("(extra_games_json LIKE '%rdr%' OR extra_games_json LIKE '%red dead%' OR title LIKE '%rdr%' OR title LIKE '%red dead%')", [])
    elif "witcher" in gf_lower or "ведьмак" in gf_lower:
        return ("(extra_games_json LIKE '%witcher%' OR extra_games_json LIKE '%ведьмак%' OR title LIKE '%witcher%' OR title LIKE '%ведьмак%')", [])
    else:
        return ("(extra_games_json LIKE ? OR title LIKE ?)", [f"%{game_name}%", f"%{game_name}%"])

def search_cached_accounts(
    sort_by: str = "deal_score",
    order: str = "desc",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_daybreak: Optional[int] = None,
    max_hours_2w: Optional[float] = None,
    min_level: Optional[int] = None,
    max_level: Optional[int] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    min_potential_level: Optional[int] = None,
    max_potential_level: Optional[int] = None,
    min_score: Optional[int] = None,
    cs2_prime_only: bool = False,
    no_vac_only: bool = False,
    game_filter: Optional[Any] = None,
    game_match_mode: str = "all",
    email_type: Optional[str] = None,
    item_origin: Optional[str] = None,
    hide_phishing: bool = False,
    guarantee: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[Dict[str, Any]], int]:
    """Fast SQL search & multi-field sorting across cached database."""

    where_clauses = ["1=1"]
    params = []

    if min_price is not None and min_price > 0:
        where_clauses.append("price >= ?")
        params.append(min_price)
    if max_price is not None and max_price > 0:
        where_clauses.append("price <= ?")
        params.append(max_price)
    if min_daybreak is not None and min_daybreak > 0:
        where_clauses.append("daybreak >= ?")
        params.append(min_daybreak)
    if max_hours_2w is not None and float(max_hours_2w) < 100:
        where_clauses.append("COALESCE(hours_2weeks, 0) <= ?")
        params.append(float(max_hours_2w))
    if min_level is not None and min_level > 0:
        where_clauses.append("steam_level >= ?")
        params.append(min_level)
    if max_level is not None and max_level > 0:
        where_clauses.append("steam_level <= ?")
        params.append(max_level)
    if min_points is not None and min_points > 0:
        where_clauses.append("steam_points >= ?")
        params.append(min_points)
    if max_points is not None and max_points > 0:
        where_clauses.append("steam_points <= ?")
        params.append(max_points)
    if min_potential_level is not None and min_potential_level > 0:
        where_clauses.append("calc_potential_level(steam_level, steam_points) >= ?")
        params.append(min_potential_level)
    if max_potential_level is not None and max_potential_level > 0:
        where_clauses.append("calc_potential_level(steam_level, steam_points) <= ?")
        params.append(max_potential_level)
    if min_score is not None and min_score > 0:
        where_clauses.append("deal_score >= ?")
        params.append(min_score)
    if cs2_prime_only:
        where_clauses.append("cs2_prime = 1")
    if no_vac_only:
        where_clauses.append("deal_score > 1 AND title NOT LIKE '%vac%' AND title NOT LIKE '%вак%' AND title NOT LIKE '%бан%' AND title NOT LIKE '%кт%'")
    
    # Hide Phishing Filter
    if hide_phishing:
        where_clauses.append("(item_origin != 'fishing' AND resale_item_origin != 'fishing' AND item_origin_phrase NOT LIKE '%phishing%' AND item_origin_phrase NOT LIKE '%fishing%' AND title NOT LIKE '%фишинг%' AND raw_json NOT LIKE '%\"item_origin\":\"fishing\"%')")

    # Item Origin Filter
    if item_origin and item_origin.lower() not in ("any", "all", "", "none"):
        orig_norm = item_origin.lower().strip()
        if orig_norm == "personal":
            where_clauses.append("(item_origin = 'personal' OR is_personal_account = 1 OR item_origin_phrase LIKE '%personal%' OR item_origin_phrase LIKE '%личн%' OR title LIKE '%личн%')")
        elif orig_norm == "stealer":
            where_clauses.append("(item_origin = 'stealer' OR resale_item_origin = 'stealer' OR item_origin_phrase LIKE '%stealer%' OR item_origin_phrase LIKE '%стиллер%' OR title LIKE '%стиллер%')")
        elif orig_norm == "fishing":
            where_clauses.append("(item_origin = 'fishing' OR resale_item_origin = 'fishing' OR item_origin_phrase LIKE '%phishing%' OR item_origin_phrase LIKE '%fishing%' OR title LIKE '%фишинг%')")
        elif orig_norm == "autoreg":
            where_clauses.append("(item_origin = 'autoreg' OR item_origin_phrase LIKE '%autoreg%' OR item_origin_phrase LIKE '%авторег%' OR title LIKE '%авторег%')")
        elif orig_norm == "resale":
            where_clauses.append("(item_origin = 'resale' OR item_origin_phrase LIKE '%resale%' OR item_origin_phrase LIKE '%перепродажа%' OR title LIKE '%перепродажа%')")
        elif orig_norm == "brute":
            where_clauses.append("(item_origin = 'brute' OR item_origin_phrase LIKE '%brute%' OR item_origin_phrase LIKE '%брут%' OR title LIKE '%брут%')")

    if guarantee and guarantee.lower() not in ("any", "all", "", "none"):
        g_lower = guarantee.lower().strip()
        if g_lower == "24":
            where_clauses.append("guarantee_hours >= 24")
        elif g_lower == "12":
            where_clauses.append("guarantee_hours >= 12")
        elif g_lower == "72":
            where_clauses.append("guarantee_hours >= 72")
        elif g_lower in ("safest", "personal", "личный"):
            where_clauses.append("(guarantee_hours >= 72 OR is_personal_account = 1 OR title LIKE '%личн%' OR raw_json LIKE '%personal%')")
    if query and query.strip():
        q_str = query.strip()
        where_clauses.append("(title LIKE ? OR extra_games_json LIKE ? OR seller_name LIKE ?)")
        params.extend([f"%{q_str}%", f"%{q_str}%", f"%{q_str}%"])

    # Email Type filtering (native, autoreg, temp/market, no mail)
    if email_type and email_type.lower() not in ("any", "all", "", "none"):
        et_norm = email_type.lower().strip()
        if et_norm == "native":
            where_clauses.append("(email_type = 'native' OR raw_json LIKE '%\"email_type\":\"native\"%' OR title LIKE '%родная%' OR title LIKE '%родной%' OR title LIKE '%родная почта%' OR title LIKE '%native%')")
        elif et_norm == "autoreg":
            where_clauses.append("(email_type = 'autoreg' OR raw_json LIKE '%\"email_type\":\"autoreg\"%' OR email_provider IN ('firstmail', 'rambler', 'notletters') OR raw_json LIKE '%\"email_provider\":\"firstmail\"%' OR raw_json LIKE '%\"email_provider\":\"rambler\"%' OR title LIKE '%авторег%' OR title LIKE '%autoreg%')")
        elif et_norm in ("temp", "market", "temporary"):
            where_clauses.append("(email_type IN ('temp', 'market', 'temporary') OR raw_json LIKE '%\"email_type\":\"market\"%' OR raw_json LIKE '%\"email_type\":\"temp\"%' OR raw_json LIKE '%\"canViewTempEmail\":true%' OR title LIKE '%временная%' OR title LIKE '%временка%')")
        elif et_norm == "no":
            where_clauses.append("(email_type = 'no' OR raw_json LIKE '%\"email_type\":\"no\"%' OR title LIKE '%без почты%')")

    # Multi-game filter handling
    games_list = []
    if isinstance(game_filter, list):
        games_list = [g for g in game_filter if str(g).strip()]
    elif isinstance(game_filter, str) and game_filter.strip():
        games_list = [g.strip() for g in game_filter.split(",") if g.strip()]

    if games_list:
        sub_clauses = []
        for g in games_list:
            sql_c, p_c = build_game_sql_clause(g)
            sub_clauses.append(sql_c)
            params.extend(p_c)

        if sub_clauses:
            join_op = " OR " if game_match_mode.lower() == "any" else " AND "
            where_clauses.append(f"({join_op.join(sub_clauses)})")

    where_str = " AND ".join(where_clauses)

    # Valid sort SQL expressions
    sort_expr = "deal_score DESC"
    
    if sort_by in ("potential_level_desc", "potential_level", "pot_level_desc", "pot_level"):
        sort_expr = "calc_potential_level(steam_level, steam_points) DESC"
    elif sort_by in ("potential_level_value_desc", "potential_level_ratio", "pot_level_ratio", "pot_level_value_desc", "pot_level_rub_desc"):
        sort_expr = "(CAST(calc_potential_level(steam_level, steam_points) AS REAL) / CASE WHEN price > 0 THEN price ELSE 1.0 END) DESC"
    elif sort_by in ("value_ratio_desc", "value_ratio", "ratio", "ratio_desc"):
        sort_expr = "value_ratio DESC"
    elif sort_by in ("value_ratio_asc", "ratio_asc"):
        sort_expr = "value_ratio ASC"
    elif sort_by in ("estimated_value_desc", "estimated_value", "total_value", "games_value"):
        sort_expr = "estimated_value DESC"
    elif sort_by in ("level_value_desc", "level_ratio", "level_rub_desc", "level_per_rub"):
        sort_expr = "(CAST(steam_level AS REAL) / CASE WHEN price > 0 THEN price ELSE 1.0 END) DESC"
    elif sort_by in ("points_value_desc", "points_ratio", "points_rub_desc", "points_per_rub"):
        sort_expr = "(CAST(steam_points AS REAL) / CASE WHEN price > 0 THEN price ELSE 1.0 END) DESC"
    elif sort_by in ("level_desc", "steam_level_desc"):
        sort_expr = "steam_level DESC"
    elif sort_by in ("level_asc", "steam_level_asc"):
        sort_expr = "steam_level ASC"
    elif sort_by in ("points_desc", "steam_points_desc"):
        sort_expr = "steam_points DESC"
    elif sort_by in ("points_asc", "steam_points_asc"):
        sort_expr = "steam_points ASC"
    elif sort_by in ("price_asc", "price_to_up"):
        sort_expr = "price ASC"
    elif sort_by in ("price_desc", "price_to_down"):
        sort_expr = "price DESC"
    elif sort_by in ("daybreak_desc", "daybreak"):
        sort_expr = "daybreak DESC"
    elif sort_by in ("daybreak_asc",):
        sort_expr = "daybreak ASC"
    elif sort_by in ("recent", "updated_at", "newest"):
        sort_expr = "updated_at DESC"
    elif sort_by in ("score", "deal_score"):
        sort_expr = f"deal_score {order.upper()}"
    else:
        sort_expr = f"{sort_by} {order.upper()}"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Count total matching rows
        cursor.execute(f"SELECT COUNT(*) FROM accounts WHERE {where_str}", params)
        total_matched = cursor.fetchone()[0]

        # Query paginated rows
        query_sql = f"""
            SELECT * FROM accounts 
            WHERE {where_str} 
            ORDER BY {sort_expr} 
            LIMIT ? OFFSET ?
        """
        query_params = params + [limit, offset]
        cursor.execute(query_sql, query_params)

        results = []
        for row in cursor.fetchall():
            s_lvl = row["steam_level"]
            s_pts = row["steam_points"]
            pot_lvl, added_lvls = calculate_potential_level(s_lvl, s_pts)
            
            row_keys = row.keys() if hasattr(row, 'keys') else []
            e_type = row["email_type"] if "email_type" in row_keys else ""
            e_provider = row["email_provider"] if "email_provider" in row_keys else ""
            i_domain = row["item_domain"] if "item_domain" in row_keys else ""
            i_origin = row["item_origin"] if "item_origin" in row_keys else ""
            i_origin_phrase = row["item_origin_phrase"] if "item_origin_phrase" in row_keys else ""
            r_origin = row["resale_item_origin"] if "resale_item_origin" in row_keys else ""
            is_reliable = bool(row["is_origin_reliable"]) if "is_origin_reliable" in row_keys else False
            is_personal = bool(row["is_personal_account"]) if "is_personal_account" in row_keys else False

            # Telemetry and account metadata extraction from raw_json
            last_act_ts = 0
            last_act_str = ""
            reg_ts = 0
            reg_str = ""
            has_vac = False
            has_trade_ban = False
            has_community_ban = False
            steam_country = ""
            steam_currency = "RUB"

            if "raw_json" in row_keys and row["raw_json"]:
                try:
                    raw_dict = json.loads(row["raw_json"])
                    if not i_origin:
                        i_origin = str(raw_dict.get("item_origin", "")).strip().lower()
                    if not i_origin_phrase:
                        i_origin_phrase = str(raw_dict.get("itemOriginPhrase", "")).strip()
                    if not r_origin:
                        r_origin = str(raw_dict.get("resale_item_origin", "")).strip().lower()
                    if not is_reliable:
                        is_reliable = bool(raw_dict.get("is_origin_reliable") or raw_dict.get("isOriginReliable"))
                    if not is_personal:
                        is_personal = bool(raw_dict.get("isPersonalAccount") or i_origin == "personal" or "личный" in str(row["title"]).lower())

                    if not e_type:
                        e_type = str(raw_dict.get("email_type", "")).strip().lower()
                    if not e_provider:
                        e_provider = str(raw_dict.get("email_provider", "")).strip().lower()
                    if not i_domain:
                        i_domain = str(raw_dict.get("item_domain", "")).strip().lower()
                    if not e_type:
                        t_lower = (row["title"] or "").lower()
                        if raw_dict.get("canViewTempEmail") or "temp" in i_origin or "времен" in t_lower:
                            e_type = "temp"
                        elif e_provider in ("firstmail", "rambler", "notletters") or i_origin == "autoreg" or "авторег" in t_lower:
                            e_type = "autoreg"
                        elif "родн" in t_lower or "native" in t_lower or raw_dict.get("is_native_email"):
                            e_type = "native"
                        elif i_origin in ("fishing", "stealer", "brute", "resale"):
                            e_type = "temp" if raw_dict.get("canViewTempEmail", True) else "no"

                    last_act_ts = raw_dict.get("account_last_activity") or raw_dict.get("last_activity")
                    reg_ts = raw_dict.get("register_date") or raw_dict.get("registration_date") or raw_dict.get("steam_registration_date")
                    has_vac = is_item_banned(raw_dict, row["title"])
                    has_trade_ban = bool(raw_dict.get("steam_trade_ban") or raw_dict.get("trade_ban") or 0)
                    has_community_ban = bool(raw_dict.get("steam_community_ban") or raw_dict.get("community_ban") or 0)
                    steam_country = str(raw_dict.get("steam_country") or raw_dict.get("country") or "").upper()
                    steam_currency = str(raw_dict.get("steam_currency") or raw_dict.get("price_currency") or "RUB").upper()
                except Exception:
                    pass

            if not last_act_ts and row["daybreak"]:
                last_act_ts = time.time() - (row["daybreak"] * 86400)
            last_act_str = format_timestamp_ru(last_act_ts)
            reg_str = format_timestamp_ru(reg_ts)

            results.append({
                "item_id": row["item_id"],
                "title": row["title"],
                "price": row["price"],
                "seller_name": row["seller_name"],
                "seller_id": row["seller_id"],
                "cs2_prime": bool(row["cs2_prime"]),
                "steam_level": s_lvl,
                "steam_points": s_pts,
                "potential_level": pot_lvl,
                "added_levels": added_lvls,
                "daybreak": row["daybreak"],
                "hours_2weeks": row["hours_2weeks"],
                "total_cs2_hours": row["total_cs2_hours"],
                "extra_games": json.loads(row["extra_games_json"] or "[]"),
                "guarantee_hours": row["guarantee_hours"],
                "deal_score": row["deal_score"],
                "estimated_value": row["estimated_value"] or 0,
                "value_ratio": row["value_ratio"] or 0,
                "email_type": e_type,
                "email_provider": e_provider,
                "item_domain": i_domain,
                "item_origin": i_origin,
                "item_origin_phrase": i_origin_phrase,
                "resale_item_origin": r_origin,
                "is_origin_reliable": is_reliable,
                "is_personal_account": is_personal,
                "category": row["category"],
                "updated_at": row["updated_at"],
                "last_activity_ts": int(last_act_ts) if last_act_ts else 0,
                "last_activity_str": last_act_str,
                "register_date_ts": int(reg_ts) if reg_ts else 0,
                "register_date_str": reg_str,
                "has_vac": has_vac,
                "has_trade_ban": has_trade_ban,
                "has_community_ban": has_community_ban,
                "steam_country": steam_country,
                "steam_currency": steam_currency
            })

        return results, total_matched

def purge_stale_accounts(days_old: int = 14) -> int:
    """Deletes accounts not updated in the last N days to prevent showing sold items."""
    cutoff_ts = int(time.time()) - (days_old * 86400)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM accounts WHERE updated_at > 0 AND updated_at < ?", (cutoff_ts,))
        deleted = cursor.rowcount
        conn.commit()
    return deleted

def delete_account(item_id: int) -> bool:
    """Deletes a single account that was reported sold."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM accounts WHERE item_id = ?", (item_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
    return deleted

if __name__ == "__main__":
    init_db()
    print(f"[*] SQLite DB initialized at {DB_FILE}. Total cached items: {get_cached_count()}")
