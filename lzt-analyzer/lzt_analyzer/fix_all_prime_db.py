import sqlite3
import json

conn = sqlite3.connect("market_cache.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def check_is_cs2_prime(raw: dict, title: str = "") -> bool:
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

cursor.execute("SELECT item_id, title, raw_json FROM accounts")
rows = cursor.fetchall()

prime_updates = []

for r in rows:
    raw_str = r["raw_json"]
    title = r["title"]
    raw = {}
    if raw_str:
        try:
            raw = json.loads(raw_str)
        except:
            pass
    
    is_prime = check_is_cs2_prime(raw, title)
    prime_val = 1 if is_prime else 0
    prime_updates.append((prime_val, r["item_id"]))

cursor.executemany("UPDATE accounts SET cs2_prime = ? WHERE item_id = ?", prime_updates)
conn.commit()

cursor.execute("SELECT COUNT(*) FROM accounts WHERE cs2_prime = 1")
total_prime = cursor.fetchone()[0]
print(f"[+] Successfully re-processed {len(rows)} database accounts!")
print(f"[+] Total Verified CS2 Prime accounts in SQLite DB: {total_prime}")
