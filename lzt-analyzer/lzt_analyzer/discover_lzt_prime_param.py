import urllib.request
import json
import os
import ssl

ctx = ssl._create_unverified_context()
token_path = "token.txt"
token = ""
if os.path.exists(token_path):
    token = open(token_path).read().strip()

params_to_test = [
    "cs2_prime=1",
    "cs2_prime=true",
    "csgo_prime=1",
    "prime=1",
    "cs2=1",
    "game[]=730",
    "game[]=730&cs2_prime=1",
    "game[]=730&csgo_prime=1",
    "steam_bans[]=730",
    "bans[]=730",
    "cs2_prime=yes"
]

for p in params_to_test:
    url = f"https://prod-api.lzt.market/steam?{p}&count=20"
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0')
    if token: req.add_header('Authorization', f'Bearer {token}')
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get("items", [])
            
            prime_count = 0
            free_count = 0
            unknown_count = 0
            
            for item in items:
                b_str = str(item.get("steam_bans_string") or "")
                b_arr = item.get("steam_bans_array") or []
                if "CS2 Prime" in b_str or 730 in b_arr:
                    prime_count += 1
                elif "Free CS2" in b_str or 7301 in b_arr:
                    free_count += 1
                else:
                    unknown_count += 1
            
            print(f"Param: {p:30s} -> Total: {len(items):2d} | Prime: {prime_count:2d} | Free CS2: {free_count:2d} | Unknown: {unknown_count:2d}")
    except Exception as e:
        print(f"Param: {p:30s} -> Error: {e}")
