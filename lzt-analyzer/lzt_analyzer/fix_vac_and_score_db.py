import sqlite3
import json

conn = sqlite3.connect("market_cache.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def is_item_banned(raw: dict, title: str) -> bool:
    if raw.get("vac_ban") in (1, True) or raw.get("steam_vac_ban") in (1, True) or raw.get("has_vac") in (1, True) or raw.get("hasCs2VacBan") in (1, True):
        return True
    if raw.get("steam_community_ban") in (1, True) or raw.get("community_ban") in (1, True) or raw.get("has_community_ban") in (1, True):
        return True
    
    title_lower = title.lower()
    ban_keywords = ["vac", "вак", "ban", "бан", "кт", "комьюнити бан", "community ban", "ножно", "блокировк"]
    for kw in ban_keywords:
        if kw in title_lower:
            return True
    return False

cursor.execute("SELECT item_id, title, raw_json FROM accounts")
rows = cursor.fetchall()

updates = []

for r in rows:
    raw_str = r["raw_json"]
    title = r["title"]
    raw = {}
    if raw_str:
        try:
            raw = json.loads(raw_str)
        except Exception:
            pass
    
    if is_item_banned(raw, title):
        updates.append((1, r["item_id"]))

cursor.executemany("UPDATE accounts SET deal_score = ? WHERE item_id = ?", updates)
conn.commit()
print(f"[+] Successfully updated {len(updates)} banned accounts to deal_score = 1 in SQLite database!")
