import urllib.request
import json
import os
import ssl

ctx = ssl._create_unverified_context()
token_path = "token.txt"
token = ""
if os.path.exists(token_path):
    token = open(token_path).read().strip()

url = "https://prod-api.lzt.market/steam?game[]=730&count=100"
req = urllib.request.Request(url)
req.add_header('User-Agent', 'Mozilla/5.0')
if token: req.add_header('Authorization', f'Bearer {token}')

def is_cs2_prime_js_logic(raw):
    title = raw.get("title", "")
    bans_str = str(raw.get("steam_bans_string") or "")
    bans_arr = raw.get("steam_bans_array") or []
    bans_dict = raw.get("steam_bans") or {}
    if not isinstance(bans_dict, dict): bans_dict = {}
    
    is_prime = False
    if "No Prime" in bans_str or 7301 in bans_arr or "7301" in bans_dict:
        is_prime = False
    elif raw.get("cs2_prime") in (1, True):
        is_prime = True
    elif "CS2 Prime" in bans_str:
        is_prime = True
    elif 730 in bans_arr or "730" in bans_dict:
        is_prime = True
    elif "prime" in title.lower() or "прайм" in title.lower():
        if "no prime" not in title.lower() and "без прайм" not in title.lower() and "без prime" not in title.lower():
            is_prime = True

    return is_prime

with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    items = data.get("items", [])

print(f"Total API items returned: {len(items)}")

prime_items = []
non_prime_items = []

for item in items:
    is_prime = is_cs2_prime_js_logic(item)
    title = item.get("title", "")
    bans_str = str(item.get("steam_bans_string") or "")
    bans_arr = item.get("steam_bans_array") or []
    
    if is_prime:
        prime_items.append((item.get("item_id"), title, bans_str, bans_arr))
    else:
        non_prime_items.append((item.get("item_id"), title, bans_str, bans_arr))

print(f"\nPrime accounts detected: {len(prime_items)}")
for p in prime_items:
    print(f"  [PRIME] ID {p[0]}: {p[1]} | bans: '{p[2]}' | arr: {p[3]}")

print(f"\nNon-Prime accounts detected: {len(non_prime_items)}")
for np in non_prime_items[:10]:
    print(f"  [NON-PRIME] ID {np[0]}: {np[1]} | bans: '{np[2]}' | arr: {np[3]}")
