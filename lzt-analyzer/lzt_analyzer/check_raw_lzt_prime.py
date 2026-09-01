import sqlite3
import json

conn = sqlite3.connect("market_cache.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT raw_json FROM accounts LIMIT 500")
rows = cursor.fetchall()

cs2_prime_examples = []
free_cs2_examples = []
other_cs2_examples = []

for r in rows:
    raw_str = r["raw_json"]
    if not raw_str: continue
    try:
        raw = json.loads(raw_str)
    except:
        continue
    
    # Check all fields related to cs2 or prime or bans
    bans_str = str(raw.get("steam_bans_string") or "")
    bans_arr = raw.get("steam_bans_array") or []
    bans_dict = raw.get("steam_bans") or {}
    cs2_prime_val = raw.get("cs2_prime")
    has_cs2 = raw.get("hasCs2") or raw.get("has_cs2")
    
    title = raw.get("title", "")
    
    item_info = {
        "item_id": raw.get("item_id"),
        "title": title,
        "cs2_prime": cs2_prime_val,
        "hasCs2": has_cs2,
        "steam_bans_string": bans_str,
        "steam_bans_array": bans_arr,
        "steam_bans": bans_dict,
        "keys": [k for k in raw.keys() if "cs" in k.lower() or "prime" in k.lower() or "game" in k.lower()]
    }
    
    if "CS2 Prime" in bans_str or cs2_prime_val or 730 in bans_arr:
        if len(cs2_prime_examples) < 5: cs2_prime_examples.append(item_info)
    elif "No Prime" in bans_str or 7301 in bans_arr:
        if len(free_cs2_examples) < 5: free_cs2_examples.append(item_info)
    elif "cs" in title.lower() or "strike" in title.lower() or has_cs2:
        if len(other_cs2_examples) < 5: other_cs2_examples.append(item_info)

print("=== CS2 PRIME EXAMPLES ===")
print(json.dumps(cs2_prime_examples, indent=2, ensure_ascii=False))

print("\n=== FREE CS2 EXAMPLES ===")
print(json.dumps(free_cs2_examples, indent=2, ensure_ascii=False))

print("\n=== OTHER CS2 EXAMPLES ===")
print(json.dumps(other_cs2_examples, indent=2, ensure_ascii=False))
