import urllib.request
import json
import os
import ssl

ctx = ssl._create_unverified_context()
token_path = "token.txt"
token = ""
if os.path.exists(token_path):
    token = open(token_path).read().strip()

url = "https://prod-api.lzt.market/steam?cs2_prime=1&count=10"
req = urllib.request.Request(url)
req.add_header('User-Agent', 'Mozilla/5.0')
if token:
    req.add_header('Authorization', f'Bearer {token}')

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get("items", [])
        print(f"Fetched {len(items)} items with cs2_prime=1 from LZT API!")
        for item in items[:3]:
            print("ID:", item.get("item_id"), "Title:", item.get("title"))
            print("  cs2_prime:", item.get("cs2_prime"))
            print("  steam_bans_string:", item.get("steam_bans_string"))
            print("  steam_bans_array:", item.get("steam_bans_array"))
            print("  hasCs2:", item.get("hasCs2"))
            print("-" * 50)
except Exception as e:
    print("Error fetching from LZT API:", e)
